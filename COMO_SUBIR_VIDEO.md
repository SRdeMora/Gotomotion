# 🎬 Cómo Subir un Video para Participar en el Concurso

## 📋 Flujo Completo de Participación

### Paso 1: Registrarse como Participante

1. **Registrarse en la plataforma**
   - Ve a `/auth` (página de registro/login)
   - Selecciona el tipo de cuenta:
     - **Participante Individual**: Para participar solo
     - **Participante Equipo**: Para participar como equipo
   - Completa el formulario de registro

2. **Verificar tu cuenta**
   - Debes tener el rol `PARTICIPANT_INDIVIDUAL` o `PARTICIPANT_TEAM`
   - Solo los participantes pueden subir videos

---

### Paso 2: Seleccionar Categorías y Pagar

**Precios:**
- **Categoría Individual**: 4,95€ (primera categoría)
- **Categoría Equipo** (Mejor Videoclip): 6,95€
- **Categorías Adicionales**: 2,00€ cada una

**Ejemplos:**
- 1 categoría individual = 4,95€
- 1 categoría equipo = 6,95€
- 2 categorías individuales = 4,95€ + 2,00€ = 6,95€
- 1 equipo + 1 individual = 6,95€ + 4,95€ = 11,90€

**Proceso:**

1. **Crear sesión de pago**
   ```
   POST /api/payments/create-checkout-session
   ```
   
   **Body:**
   ```json
   {
     "categories": ["Mejor Videoclip", "Mejor Dirección"]
   }
   ```

2. **Redirigir a pasarela de pago**
   - Si Stripe está configurado: Redirige a Stripe Checkout
   - Si Stripe NO está configurado: Modo prueba (pago simulado)

3. **Completar el pago**
   - En producción: Completar pago en Stripe
   - En modo prueba: Usar endpoint `/api/payments/:paymentId/complete`

4. **Obtener `paymentId`**
   - Guarda el `paymentId` que recibes después del pago
   - Lo necesitarás para subir el video

---

### Paso 3: Subir el Video

**Requisitos:**
- ✅ Pago completado (`paymentId` válido)
- ✅ Thumbnail (imagen de portada) - **OBLIGATORIO**
- ✅ Video (archivo O link externo)
- ✅ Título del video
- ✅ Categorías (deben coincidir con las pagadas)

**Opciones para el video:**

#### Opción A: Subir archivo de video
- Sube el archivo de video directamente
- Se almacenará en Cloudinary
- Formatos soportados: MP4, WebM, MOV

#### Opción B: Usar link externo (Recomendado)
- Proporciona un link de YouTube, Vimeo, etc.
- Más económico (no consume almacenamiento)
- Ya está optimizado por la plataforma externa

**Endpoint:**
```
POST /api/videos
Content-Type: multipart/form-data
```

**FormData:**
```
title: "Título del Videoclip"
description: "Descripción opcional"
materialsUsed: "Materiales y equipo utilizado"
categories: ["Mejor Videoclip", "Mejor Dirección"] (JSON array)
videoLink: "https://youtube.com/watch?v=..." (opcional)
paymentId: "id_del_pago_completado"
thumbnail: [archivo de imagen]
video: [archivo de video] (opcional si hay videoLink)
round: 1 (opcional, default: liga actual)
year: 2024 (opcional, default: año actual)
```

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:5000/api/videos \
  -H "Authorization: Bearer TU_TOKEN" \
  -F "title=Mi Videoclip" \
  -F "description=Descripción del video" \
  -F "materialsUsed=Cámara Canon, Lente 50mm" \
  -F "categories=[\"Mejor Videoclip\", \"Mejor Dirección\"]" \
  -F "paymentId=payment_id_aqui" \
  -F "videoLink=https://youtube.com/watch?v=..." \
  -F "thumbnail=@/ruta/a/thumbnail.jpg"
```

---

## 🔄 Flujo Completo Visual

```
1. Registro como Participante
   ↓
2. Seleccionar Categorías
   ↓
3. Crear Sesión de Pago
   ↓
4. Completar Pago (Stripe o Modo Prueba)
   ↓
5. Obtener paymentId
   ↓
6. Preparar Video:
   - Título
   - Descripción (opcional)
   - Thumbnail (imagen)
   - Video (archivo O link)
   - Materiales utilizados (opcional)
   ↓
7. Subir Video con paymentId
   ↓
8. ✅ Video publicado en la liga
```

---

## ⚠️ Validaciones Importantes

### Antes de Subir:

1. **Pago completado**
   - El `paymentId` debe existir
   - El pago debe estar en estado `completed`
   - El pago debe pertenecer a tu cuenta

2. **Categorías coinciden**
   - Las categorías del video deben coincidir exactamente con las pagadas
   - No puedes agregar categorías que no pagaste

3. **Liga activa**
   - La liga/ronda debe estar abierta (`isActive: true`)
   - No puedes subir videos a ligas cerradas

4. **Archivos válidos**
   - Thumbnail: Imagen (JPG, PNG, GIF)
   - Video: Archivo de video O link válido

---

## 🎯 Ejemplo Práctico Completo

### 1. Crear Pago

```javascript
// Frontend (ejemplo)
const response = await fetch('/api/payments/create-checkout-session', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    categories: ['Mejor Videoclip', 'Mejor Dirección']
  })
});

const { paymentId, url } = await response.json();
// Redirigir a url (Stripe Checkout) o completar pago en modo prueba
```

### 2. Completar Pago (Modo Prueba)

```javascript
// Si Stripe NO está configurado
await fetch(`/api/payments/${paymentId}/complete`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 3. Subir Video

```javascript
const formData = new FormData();
formData.append('title', 'Mi Videoclip Épico');
formData.append('description', 'Un videoclip increíble');
formData.append('materialsUsed', 'Cámara Canon, Lente 50mm, Estabilizador');
formData.append('categories', JSON.stringify(['Mejor Videoclip', 'Mejor Dirección']));
formData.append('paymentId', paymentId);
formData.append('videoLink', 'https://youtube.com/watch?v=...');
formData.append('thumbnail', thumbnailFile);

const response = await fetch('/api/videos', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { video } = await response.json();
console.log('Video subido:', video);
```

---

## 📝 Notas Importantes

1. **Mismo video en múltiples ligas**
   - Puedes presentar el mismo video en diferentes ligas del mismo año
   - Necesitas pagar por cada liga
   - Cada liga es independiente

2. **Múltiples categorías**
   - Puedes participar en varias categorías con el mismo video
   - El precio se calcula según las reglas:
     - Primera categoría individual: 4,95€
     - Categoría equipo: 6,95€
     - Categorías adicionales: 2,00€ cada una

3. **Links externos recomendados**
   - Usa YouTube o Vimeo para videos grandes
   - Ahorra almacenamiento y ancho de banda
   - Ya están optimizados

4. **Thumbnail obligatorio**
   - Siempre necesitas una imagen de portada
   - Se usa para mostrar el video en la galería
   - Formato recomendado: 16:9 (1920x1080)

---

## 🚨 Estado Actual de la Implementación

### ✅ Backend Completo:
- ✅ Endpoints de pago
- ✅ Endpoints de subida de video
- ✅ Validaciones
- ✅ Modo prueba (sin Stripe)

### ❌ Frontend Pendiente:
- ❌ Página para seleccionar categorías y pagar
- ❌ Formulario de subida de video
- ❌ Integración con Stripe Checkout (si se usa)

### 🔧 Para Usar Ahora:

Puedes usar los endpoints directamente con:
- Postman
- cURL
- Código JavaScript/TypeScript
- O crear la interfaz de usuario

---

## 📚 Endpoints Disponibles

### Pagos:
- `POST /api/payments/create-checkout-session` - Crear sesión de pago
- `GET /api/payments/:paymentId/status` - Verificar estado de pago
- `POST /api/payments/:paymentId/complete` - Completar pago (modo prueba)

### Videos:
- `POST /api/videos` - Subir video (requiere pago completado)
- `GET /api/videos` - Listar videos
- `GET /api/videos/:id` - Ver video específico

---

## 🎬 Próximos Pasos

1. **Si quieres probar ahora:**
   - Usa Postman o cURL con los endpoints
   - O crea una interfaz simple de prueba

2. **Para producción:**
   - Crear página de selección de categorías
   - Integrar Stripe Checkout (o pasarela de pago)
   - Crear formulario de subida de video
   - Agregar validaciones en frontend

¿Quieres que cree la interfaz de usuario para subir videos?

