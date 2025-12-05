# 🎛️ Panel de Administración - Go2Motion Awards

## 📊 Funcionalidades del Panel de Admin

### 1. Dashboard Principal
**Ruta:** `GET /api/admin/dashboard`

Muestra estadísticas generales:
- Total de usuarios (votantes, participantes individuales, equipos)
- Total de videos subidos
- Total de votos realizados
- Ingresos por pagos (completados, pendientes, total)
- Videos por categoría
- Videos por liga
- Ligas activas

**Filtros:**
- `startDate` - Fecha inicio del período
- `endDate` - Fecha fin del período

### 2. Gestión de Ligas
**Rutas:**
- `GET /api/admin/leagues` - Listar todas las ligas con estadísticas
- `POST /api/admin/leagues` - Crear/actualizar liga
- `PATCH /api/admin/leagues/:round/status` - Abrir/cerrar liga

**Ejemplo crear liga:**
```json
POST /api/admin/leagues
{
  "round": 1,
  "year": 2024,
  "name": "Liga de Invierno",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-02-01T00:00:00Z",
  "juryEndDate": "2024-02-15T00:00:00Z"
}
```

### 3. Rankings y Estadísticas
**Rutas:**
- `GET /api/admin/rankings` - Ranking completo por categoría/liga
- `GET /api/admin/users/stats` - Estadísticas de usuarios
- `GET /api/admin/videos/stats` - Estadísticas de videos por período

**Parámetros:**
- `category` - Filtrar por categoría
- `round` - Filtrar por liga
- `year` - Filtrar por año
- `startDate` / `endDate` - Filtrar por período

### 4. Gestión de Premios
**Rutas:**
- `GET /api/admin/awards` - Listar todos los premios
- `PUT /api/admin/awards/:id` - Modificar premio
- `POST /api/admin/awards/calculate` - Calcular premios anuales

**Ejemplo modificar premio:**
```json
PUT /api/admin/awards/:id
{
  "prize": "Alquiler de equipo valorado en 3500€ en VISUALRENT",
  "prizeValue": 3500
}
```

### 5. Gestión de Jurados
**Rutas:**
- `GET /api/admin/jury` - Listar miembros del jurado
- `POST /api/admin/jury` - Agregar miembro del jurado

### 6. Reportes de Ingresos
**Ruta:** `GET /api/admin/reports/revenue`

Muestra:
- Total de ingresos en período
- Ingresos por categoría
- Lista detallada de pagos

## 🔐 Configuración de Administrador

### Opción 1: Por Email (Actual)
En `server/.env`:
```env
ADMIN_EMAILS=admin@go2motion.com,otro@admin.com
```

### Opción 2: Por Rol (Recomendado)
Agregar rol `ADMIN` al enum `UserRole` en Prisma y actualizar middleware.

## 🎨 Panel Frontend

**Ruta:** `/admin`

El panel incluye:
- Dashboard con estadísticas visuales
- Gestión de ligas
- Consulta de rankings
- Gestión de premios
- Estadísticas de usuarios y videos
- Filtros por fecha

## 📈 Métricas Disponibles

### Por Usuario
- Total de puntos anuales
- Número de videos subidos
- Número de votos dados
- Fecha de registro

### Por Video
- Votos públicos recibidos
- Puntos del jurado
- Puntos totales
- Visualizaciones
- Categorías inscritas
- Liga y año

### Por Liga
- Número de videos
- Número de votos
- Número de participantes
- Fechas de inicio/fin
- Estado (activa/cerrada)

### Por Pago
- Monto pagado
- Categorías pagadas
- Estado (pendiente/completado)
- Usuario que pagó
- Fecha

## 🚀 Uso del Panel

1. **Acceder al panel:**
   - Ve a `/admin` en el frontend
   - Debes estar autenticado con email de admin

2. **Consultar estadísticas:**
   - Usa los filtros de fecha para períodos específicos
   - Navega entre las pestañas para diferentes vistas

3. **Gestionar ligas:**
   - Crea nuevas ligas con fechas específicas
   - Cierra/abre ligas según necesidad

4. **Monitorear actividad:**
   - Revisa usuarios nuevos
   - Revisa videos subidos
   - Revisa ingresos generados

5. **Calcular premios:**
   - Al final del año, usa "Calcular Premios"
   - Modifica premios si es necesario

## 📝 Ejemplos de Consultas

### Ver usuarios con más puntos
```bash
GET /api/admin/users/stats
```

### Ver videos de una liga específica
```bash
GET /api/admin/videos/stats?round=1&year=2024
```

### Ver ingresos del mes
```bash
GET /api/admin/reports/revenue?startDate=2024-01-01&endDate=2024-01-31
```

### Ver ranking de una categoría
```bash
GET /api/admin/rankings?category=BEST_DIRECTION&round=1
```

