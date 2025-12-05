# 💳 Modo de Prueba - Sistema de Pagos

## 🎯 Funcionamiento Flexible

El sistema está diseñado para funcionar **con o sin Stripe**:

### ✅ Con Stripe Configurado (Producción)
- Si `STRIPE_SECRET_KEY` está configurado en `server/.env`
- Y Stripe está instalado (`npm install stripe`)
- El sistema usa Stripe para pagos reales

### 🧪 Sin Stripe (Modo Prueba)
- Si Stripe NO está instalado o NO está configurado
- El sistema funciona en **modo de prueba**
- Los pagos se simulan automáticamente
- Perfecto para desarrollo y testing

## 📋 Configuración

### Modo Prueba (Sin Stripe)

**No necesitas hacer nada especial.** El sistema detectará automáticamente que Stripe no está disponible y funcionará en modo prueba.

**Ventajas:**
- ✅ Puedes probar todo el flujo de pagos
- ✅ Los pagos se crean en la base de datos
- ✅ Puedes marcar pagos como completados manualmente
- ✅ No necesitas cuenta de Stripe

### Modo Producción (Con Stripe)

**1. Instalar Stripe:**
```bash
cd server
npm install stripe
```

**2. Configurar en `server/.env`:**
```env
STRIPE_SECRET_KEY=sk_test_...  # Para pruebas
# o
STRIPE_SECRET_KEY=sk_live_...  # Para producción
STRIPE_WEBHOOK_SECRET=whsec_...
```

**3. Reiniciar el servidor:**
```bash
npm run dev
```

El sistema detectará automáticamente Stripe y cambiará a modo producción.

## 🔄 Cómo Funciona

### Crear Pago (Modo Prueba)

**Request:**
```json
POST /api/payments/create-checkout-session
{
  "categories": ["BEST_DIRECTION"],
  "videoId": "optional"
}
```

**Response (Modo Prueba):**
```json
{
  "sessionId": "mock_session_1234567890",
  "url": "http://localhost:3000/payment/success?session_id=mock_session_1234567890&mock=true",
  "paymentId": "payment_id",
  "mock": true,
  "message": "Modo de prueba: Pago simulado (Stripe no configurado)"
}
```

**Response (Modo Producción):**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/...",
  "paymentId": "payment_id",
  "mock": false
}
```

### Completar Pago (Solo Modo Prueba)

**Endpoint:** `POST /api/payments/:paymentId/complete`

**Request:**
```bash
POST /api/payments/payment_id/complete
Authorization: Bearer token
```

**Response:**
```json
{
  "payment": {
    "id": "payment_id",
    "status": "completed",
    "amount": 4.95,
    ...
  },
  "message": "Pago marcado como completado (modo prueba)"
}
```

⚠️ **Este endpoint solo funciona en modo prueba.** En producción, Stripe maneja los pagos automáticamente vía webhook.

### Verificar Estado de Pago

**Endpoint:** `GET /api/payments/:paymentId/status`

**Response:**
```json
{
  "status": "completed",
  "amount": 4.95,
  "categories": ["BEST_DIRECTION"],
  "videoId": "video_id",
  "mock": true,  // true en modo prueba
  "stripeEnabled": false  // false en modo prueba
}
```

## 🧪 Flujo de Prueba Completo

1. **Crear sesión de pago:**
   ```bash
   POST /api/payments/create-checkout-session
   ```
   Obtienes una URL de "éxito" simulada

2. **Simular redirección:**
   - El frontend redirige a la URL de éxito
   - O puedes marcar el pago como completado manualmente

3. **Completar pago (opcional):**
   ```bash
   POST /api/payments/:paymentId/complete
   ```
   Marca el pago como completado

4. **Subir video:**
   - Ahora puedes subir el video usando el `paymentId`

## 📊 Detección Automática

El sistema detecta automáticamente el modo:

**Al iniciar el servidor, verás:**

**Modo Prueba:**
```
ℹ️  Stripe no está configurado. Modo de prueba activado (sin pagos reales).
   Para habilitar Stripe, configura STRIPE_SECRET_KEY en server/.env
```

**Modo Producción:**
```
✅ Stripe configurado correctamente
```

## 🔒 Seguridad

- En modo prueba, los pagos NO son reales
- En modo producción, Stripe maneja la seguridad
- El endpoint `/complete` solo funciona en modo prueba
- Los pagos mock tienen `paymentId` que empieza con `mock_`

## 🚀 Migrar de Prueba a Producción

1. Instala Stripe: `npm install stripe`
2. Configura `STRIPE_SECRET_KEY` en `server/.env`
3. Reinicia el servidor
4. El sistema cambiará automáticamente a modo producción
5. Los pagos mock existentes seguirán funcionando
6. Los nuevos pagos usarán Stripe real

## 💡 Ventajas del Modo Prueba

- ✅ Desarrollo rápido sin configuración adicional
- ✅ Testing completo del flujo de pagos
- ✅ No necesitas cuenta de Stripe para empezar
- ✅ Fácil migración a producción cuando estés listo
- ✅ Mismo código funciona en ambos modos

