# ✅ Checklist: Despliegue con SQLite en Render (Demo Rápida)

Usa esta lista para desplegar rápidamente con SQLite. **Recuerda: Los datos se borrarán cuando Render reinicie el servidor.**

## 📋 Antes de Desplegar

- [ ] Código subido a GitHub
- [ ] Cuenta de Render creada
- [ ] Cuenta de Cloudinary creada (para imágenes/videos)
- [ ] Variables de entorno preparadas

## 🔧 Backend

- [ ] Servicio Web creado en Render
- [ ] Repositorio conectado
- [ ] Build Command: `cd server && npm install && npm run db:switch-sqlite && npm run db:generate && npm run build`
- [ ] Start Command: `cd server && npm start`
- [ ] Variables de entorno configuradas:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000`
  - [ ] `JWT_SECRET` (generado aleatoriamente)
  - [ ] `FRONTEND_URL` (se actualizará después)
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
  - [ ] `ADMIN_EMAILS` (tu email)
- [ ] **NO necesitas `DATABASE_URL`** (SQLite usa archivo local)
- [ ] Backend desplegado correctamente
- [ ] Migraciones ejecutadas (`npm run db:push` desde la consola)

## 🎨 Frontend

- [ ] Servicio Static Site creado en Render
- [ ] Repositorio conectado
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`
- [ ] Variable de entorno:
  - [ ] `VITE_API_URL` (URL del backend + `/api`)
- [ ] Frontend desplegado correctamente

## 🔄 URLs Actualizadas

- [ ] `FRONTEND_URL` en backend apunta al frontend
- [ ] `VITE_API_URL` en frontend apunta al backend

## ✅ Verificación

- [ ] Backend responde en `/api/health`
- [ ] Frontend carga correctamente
- [ ] Puedes registrarte/iniciar sesión
- [ ] Panel de admin es accesible (con tu email)
- [ ] Puedes subir videos/imágenes
- [ ] Los videos se muestran correctamente
- [ ] El sistema de votación funciona

## ⚠️ Recordatorios Importantes

- [ ] **Advertir al cliente** que los datos son temporales
- [ ] **No hacer cambios** durante la demo para evitar pérdida de datos
- [ ] **Hacer la demo en una sesión continua** si es posible

## 🎯 Listo para Mostrar

- [ ] URL del frontend anotada: `https://go2motion-frontend-sqlite.onrender.com`
- [ ] Credenciales de admin preparadas
- [ ] Cliente advertido sobre datos temporales

---

**Nota**: Este setup es solo para demos rápidas. Para producción, usa PostgreSQL (ver `GUIA_DESPLIEGUE_RENDER.md`).

