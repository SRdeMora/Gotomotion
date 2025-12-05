# ✅ Checklist de Despliegue en Render

Usa esta lista para asegurarte de que todo esté configurado correctamente antes de mostrar al cliente.

**💡 Tip:** Marca cada casilla conforme vayas completando los pasos.

## 📋 Antes de Desplegar

- [ ] Código subido a GitHub/GitLab/Bitbucket
- [ ] Cuenta de Render creada
- [ ] Cuenta de Cloudinary creada y configurada
- [ ] Variables de entorno preparadas (ver abajo)

## 🗄️ Base de Datos

- [ ] Base de datos PostgreSQL creada en Render
- [ ] **Internal Database URL** copiada
- [ ] Base de datos configurada con nombre `go2motion`

## 🔧 Backend

- [ ] Servicio Web creado en Render
- [ ] Repositorio conectado
- [ ] Build Command configurado: `npm install && npm run db:switch-postgresql && npm run db:generate && npm run build`
- [ ] Start Command configurado: `npm start`
- [ ] Variables de entorno configuradas:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000`
  - [ ] `DATABASE_URL` (Internal Database URL)
  - [ ] `JWT_SECRET` (generado aleatoriamente)
  - [ ] `FRONTEND_URL` (se actualizará después)
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
  - [ ] `ADMIN_EMAILS` (tu email)
- [ ] Backend desplegado correctamente
- [ ] Migraciones ejecutadas (`npm run db:push` desde la consola)

## 🎨 Frontend

- [ ] Servicio Static Site creado en Render
- [ ] Repositorio conectado
- [ ] Build Command configurado: `npm install && npm run build`
- [ ] Publish Directory: `dist`
- [ ] Variable de entorno configurada:
  - [ ] `VITE_API_URL` (URL del backend)
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

## 📝 Datos de Prueba

- [ ] Crear algunos usuarios de prueba
- [ ] Subir algunos videos de prueba
- [ ] Crear algunas ligas de prueba
- [ ] Verificar que todo se muestra correctamente

## 🎯 Listo para Mostrar

- [ ] URL del frontend anotada: `https://go2motion-frontend.onrender.com`
- [ ] Credenciales de admin preparadas
- [ ] Datos de demostración listos

---

**Nota**: El plan Free de Render hace que el backend se "duerma" después de 15 minutos de inactividad. La primera solicitud después de eso puede tardar ~30 segundos en responder mientras se despierta.

