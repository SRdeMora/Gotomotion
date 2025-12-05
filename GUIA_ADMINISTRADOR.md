# 👨‍💼 Guía del Administrador - Go2Motion Awards

## 🎯 Cómo Funciona el Sistema de Ligas

### Concepto
Una **Liga** es una ronda del concurso anual. Cada año hay **5-6 ligas** donde:
1. Los participantes suben videos (pagando según categorías)
2. El público vota (cada voto = 1 punto)
3. El jurado vota (top 2 = 3 puntos, top 5 = 2 puntos)
4. Los puntos se suman al contador anual del usuario

### Flujo Completo

```
Liga 1 (Enero-Febrero)
├── Participación: Usuarios suben videos pagando
├── Votación Pública: Público vota (1 punto por voto)
├── Votación Jurado: Jurado vota (3 pts top 2, 2 pts top 5)
└── Cierre: Puntos se suman al total anual

Liga 2 (Marzo-Abril)
├── (mismo proceso)
└── Puntos se suman al total anual

... (5-6 ligas al año)

Final del Año
└── Ganadores por categoría según puntos anuales totales
```

## 📊 Panel de Administración

### Acceso
1. Inicia sesión con un email configurado como admin
2. Ve a `/admin` en el navegador
3. Verás el dashboard con todas las estadísticas

### Configurar Email de Admin

En `server/.env`:
```env
ADMIN_EMAILS=tu-email@admin.com,otro-admin@email.com
```

## 🔍 Consultas Disponibles

### 1. Ver Estadísticas Generales
**Panel:** Dashboard principal
- Total usuarios
- Total videos
- Total votos
- Ingresos totales
- Videos por categoría
- Videos por liga

### 2. Ver Rankings
**Panel:** Pestaña "Rankings"
- Ranking por categoría
- Ranking por liga
- Ranking anual

**API:** `GET /api/admin/rankings?category=BEST_DIRECTION&round=1`

### 3. Ver Estadísticas de Usuarios
**Panel:** Pestaña "Usuarios"
- Lista de usuarios con puntos
- Videos subidos por usuario
- Votos dados por usuario

**API:** `GET /api/admin/users/stats`

### 4. Ver Videos Subidos
**Panel:** Dashboard → Videos por período
- Videos subidos en un período específico
- Videos por liga
- Videos por categoría

**API:** `GET /api/admin/videos/stats?startDate=2024-01-01&endDate=2024-01-31`

### 5. Ver Ingresos
**Panel:** Dashboard → Ingresos Totales
- Total de ingresos
- Pagos completados vs pendientes
- Ingresos por categoría

**API:** `GET /api/admin/reports/revenue?startDate=2024-01-01&endDate=2024-01-31`

## 🏆 Gestión de Ligas

### Crear Nueva Liga
```bash
POST /api/admin/leagues
{
  "round": 1,
  "year": 2024,
  "name": "Liga de Invierno 2024",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-02-01T00:00:00Z",
  "juryEndDate": "2024-02-15T00:00:00Z"
}
```

### Cerrar/Abrir Liga
```bash
PATCH /api/admin/leagues/1/status
{
  "isActive": false
}
```

### Ver Todas las Ligas
```bash
GET /api/admin/leagues
```

## 🎁 Gestión de Premios

### Calcular Premios Anuales
```bash
POST /api/admin/awards/calculate
{
  "year": 2024
}
```

Esto calcula automáticamente:
- Ganador de cada categoría según puntos anuales
- Asigna premios (3000€ equipo, 2000€ individual)

### Modificar Premio
```bash
PUT /api/admin/awards/:id
{
  "prize": "Nuevo premio personalizado",
  "prizeValue": 2500
}
```

### Ver Todos los Premios
```bash
GET /api/admin/awards?year=2024
```

## 👥 Gestión de Jurados

### Agregar Miembro del Jurado
```bash
POST /api/admin/jury
{
  "name": "Nombre del Jurado",
  "role": "Director de Cine",
  "image": "url_imagen",
  "bio": "Biografía del jurado",
  "userId": "user_id_opcional",
  "order": 1
}
```

### Ver Miembros del Jurado
```bash
GET /api/admin/jury
```

## 📈 Monitoreo de la Web

### Métricas Clave a Revisar

1. **Crecimiento de Usuarios**
   - Nuevos registros por día/semana/mes
   - Conversión de votantes a participantes

2. **Actividad de Videos**
   - Videos subidos por día
   - Videos por categoría más popular
   - Videos por liga

3. **Engagement**
   - Votos por día
   - Visualizaciones totales
   - Participación por liga

4. **Ingresos**
   - Ingresos por día/semana/mes
   - Categorías más rentables
   - Tasa de conversión de pagos

### Filtros Útiles

**Últimos 7 días:**
```
startDate: (hoy - 7 días)
endDate: (hoy)
```

**Mes actual:**
```
startDate: (primer día del mes)
endDate: (último día del mes)
```

**Liga específica:**
```
round: 1
year: 2024
```

## 🛠️ Tareas Administrativas Comunes

### Al Inicio de Cada Liga
1. Crear la liga con fechas
2. Verificar que esté activa
3. Monitorear primeros videos subidos

### Durante la Liga
1. Revisar estadísticas semanalmente
2. Verificar pagos pendientes
3. Monitorear actividad de votación

### Al Cerrar Votación Pública
1. Cerrar la liga (`isActive: false`)
2. Notificar al jurado para votar
3. Esperar votación del jurado

### Al Cerrar Votación del Jurado
1. Verificar puntos calculados
2. Actualizar puntos anuales de usuarios
3. Preparar siguiente liga

### Al Final del Año
1. Calcular premios anuales
2. Verificar ganadores
3. Modificar premios si es necesario
4. Preparar ligas del siguiente año

## 📱 Acceso Rápido

**Panel Web:** `http://localhost:3000/admin`

**API Base:** `http://localhost:5000/api/admin`

**Endpoints Principales:**
- Dashboard: `/api/admin/dashboard`
- Ligas: `/api/admin/leagues`
- Rankings: `/api/admin/rankings`
- Premios: `/api/admin/awards`
- Usuarios: `/api/admin/users/stats`
- Videos: `/api/admin/videos/stats`
- Ingresos: `/api/admin/reports/revenue`

## ✅ Checklist Diario/Semanal

- [ ] Revisar nuevos usuarios registrados
- [ ] Revisar videos subidos
- [ ] Verificar pagos pendientes
- [ ] Monitorear actividad de votación
- [ ] Revisar ingresos generados
- [ ] Verificar estado de ligas activas
- [ ] Revisar errores o problemas reportados

## 🎯 Recomendaciones

1. **Revisa el dashboard diariamente** para detectar problemas temprano
2. **Usa filtros de fecha** para análisis de períodos específicos
3. **Monitorea los pagos pendientes** para asegurar que los usuarios puedan subir videos
4. **Revisa los rankings regularmente** para entender las tendencias
5. **Mantén las ligas actualizadas** con fechas correctas

