import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { CATEGORIES, isTeamCategory, getAllCategories } from '../utils/enums';

const router = express.Router();
const prisma = new PrismaClient();

// Stripe es opcional - solo se carga si está instalado Y configurado
let Stripe: any = null;
let stripe: any = null;
let stripeEnabled = false;

try {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  // Solo inicializar Stripe si está instalado Y configurado
  if (stripeSecretKey && stripeSecretKey.trim() !== '') {
    Stripe = require('stripe').default;
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    });
    stripeEnabled = true;
    console.log('✅ Stripe configurado correctamente');
  } else {
    console.log('ℹ️  Stripe no está configurado. Modo de prueba activado (sin pagos reales).');
    console.log('   Para habilitar Stripe, configura STRIPE_SECRET_KEY en server/.env');
  }
} catch (error: any) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('ℹ️  Stripe no está instalado. Modo de prueba activado (sin pagos reales).');
    console.log('   Para habilitar Stripe, ejecuta: npm install stripe');
  } else {
    console.warn('⚠️  Error al inicializar Stripe:', error.message);
    console.log('   Modo de prueba activado (sin pagos reales).');
  }
}

// Precios en céntimos de euro
const PRICING = {
  BEST_VIDEO: 695, // 6.95€ para equipo
  INDIVIDUAL: 495, // 4.95€ para categorías individuales
  ADDITIONAL: 200, // 2.00€ por categoría adicional
};

// Calcular precio total
const calculatePrice = (categories: string[], userRole: string): number => {
  if (categories.length === 0) return 0;
  
  const hasTeamCategory = categories.some(c => isTeamCategory(c));
  const individualCategories = categories.filter(c => !isTeamCategory(c));
  
  let total = 0;
  
  if (hasTeamCategory) {
    total += PRICING.BEST_VIDEO;
  }
  
  if (individualCategories.length > 0) {
    // Primera categoría individual
    total += PRICING.INDIVIDUAL;
    // Categorías adicionales
    if (individualCategories.length > 1) {
      total += PRICING.ADDITIONAL * (individualCategories.length - 1);
    }
  }
  
  return total;
};

// Crear sesión de pago
router.post(
  '/create-checkout-session',
  authenticate,
  authorize('PARTICIPANT_INDIVIDUAL', 'PARTICIPANT_TEAM'),
  [
    body('categories').isArray().notEmpty(),
    body('videoId').optional().isString(),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { categories, videoId } = req.body;
      const userId = req.user!.id;

      console.log('[PAYMENT] Categorías recibidas:', categories);
      console.log('[PAYMENT] Tipo de categorías:', typeof categories, Array.isArray(categories));
      console.log('[PAYMENT] Categorías válidas disponibles:', getAllCategories());

      // Validar que categories es un array
      if (!Array.isArray(categories)) {
        console.error('[PAYMENT] Error: categories no es un array:', categories);
        return res.status(400).json({ error: 'Las categorías deben ser un array' });
      }

      // Eliminar duplicados
      const uniqueCategories = [...new Set(categories)];

      // Validar categorías
      const validCategories = uniqueCategories.filter((c: string) => {
        const isValid = getAllCategories().includes(c);
        if (!isValid) {
          console.warn(`[PAYMENT] Categoría inválida: ${c}`);
        }
        return isValid;
      });

      console.log('[PAYMENT] Categorías válidas después de filtrar:', validCategories);

      if (validCategories.length === 0) {
        return res.status(400).json({ 
          error: 'Debes seleccionar al menos una categoría válida',
          received: categories,
          valid: getAllCategories(),
        });
      }

      // Calcular precio
      const amount = calculatePrice(validCategories, req.user!.role);
      console.log('[PAYMENT] Precio calculado:', amount, 'céntimos');
      
      if (amount === 0) {
        console.error('[PAYMENT] Error: Precio calculado es 0');
        return res.status(400).json({ error: 'Error al calcular el precio' });
      }

      // Crear o actualizar pago en la base de datos
      // En SQLite: categories es String (JSON), en PostgreSQL es array
      const categoriesForDb = typeof validCategories === 'string' 
        ? validCategories 
        : JSON.stringify(validCategories);

      console.log('[PAYMENT] Creando pago con categorías:', categoriesForDb);

      const payment = await prisma.payment.create({
        data: {
          userId,
          videoId: videoId || null,
          amount: amount / 100, // Convertir a euros
          status: 'pending',
          paymentMethod: 'stripe',
          categories: categoriesForDb,
        },
      });

      console.log('[PAYMENT] Pago creado exitosamente:', payment.id);

      // Modo de prueba: crear pago sin Stripe
      if (!stripeEnabled || !stripe) {
        // Simular creación de pago para pruebas
        const mockSessionId = `mock_session_${Date.now()}`;
        
        res.json({
          sessionId: mockSessionId,
          url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?session_id=${mockSessionId}&mock=true`,
          paymentId: payment.id,
          mock: true,
          message: 'Modo de prueba: Pago simulado (Stripe no configurado)',
        });
        return;
      }

      // Crear sesión de Stripe (modo producción)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Inscripción Go2Motion - ${validCategories.length} categoría(s)`,
                description: `Categorías: ${validCategories.join(', ')}`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        metadata: {
          paymentId: payment.id,
          userId,
          videoId: videoId || '',
          categories: JSON.stringify(validCategories),
        },
      });

      res.json({
        sessionId: session.id,
        url: session.url,
        paymentId: payment.id,
        mock: false,
      });
    } catch (error: any) {
      console.error('[PAYMENT] Error al crear sesión de pago:', error);
      console.error('[PAYMENT] Stack:', error.stack);
      console.error('[PAYMENT] Error completo:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      next(error);
    }
  }
);

// Webhook de Stripe (para confirmar pagos)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!stripeEnabled || !stripe) {
      // En modo prueba, aceptar webhooks simulados
      console.log('⚠️  Webhook recibido pero Stripe no está configurado (modo prueba)');
      return res.json({ received: true, mock: true });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(400).send('Webhook secret no configurado');
    }

    let event: any;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
    } catch (err: any) {
      console.error('Error en webhook:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const paymentId = session.metadata?.paymentId;

      if (paymentId) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'completed',
            paymentId: session.payment_intent as string,
          },
        });
      }
    }

    res.json({ received: true });
  }
);

// Verificar estado de pago
router.get('/:paymentId/status', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user!.id;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    if (payment.userId !== userId) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // En modo prueba, permitir marcar pagos como completados manualmente
    const isMock = payment.paymentId?.startsWith('mock_') || false;

    res.json({
      status: payment.status,
      amount: payment.amount,
      categories: payment.categories,
      videoId: payment.videoId,
      mock: isMock,
      stripeEnabled: stripeEnabled,
    });
  } catch (error) {
    next(error);
  }
});

// Endpoint para marcar pago como completado (solo en modo prueba)
router.post(
  '/:paymentId/complete',
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      if (stripeEnabled) {
        return res.status(403).json({ 
          error: 'Este endpoint solo está disponible en modo prueba. Usa el webhook de Stripe en producción.' 
        });
      }

      const { paymentId } = req.params;
      const userId = req.user!.id;

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        return res.status(404).json({ error: 'Pago no encontrado' });
      }

      if (payment.userId !== userId) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'completed',
          paymentId: `mock_${Date.now()}`,
        },
      });

      res.json({
        payment: updatedPayment,
        message: 'Pago marcado como completado (modo prueba)',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

