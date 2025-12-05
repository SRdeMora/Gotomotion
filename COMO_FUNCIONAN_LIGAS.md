# 🏆 Cómo Funcionan las Ligas Activas

## 📍 Dónde se Muestran las Ligas

### 1. **Panel de Administración** (`/admin`)

**Ubicación:** Panel Admin → Pestaña "Ligas"

**Cómo acceder:**
1. Inicia sesión como administrador
2. Ve a `/admin`
3. Haz clic en la pestaña **"Ligas"**

**Qué muestra:**
- Lista de todas las ligas (activas e inactivas)
- Información de cada liga:
  - Nombre: "Liga {round} - {nombre}"
  - Fechas: Inicio, Fin Público, Fin Jurado
  - Estadísticas: Videos, Votos, Participantes
  - Estado: Botón "Activa" (verde) o "Cerrada" (gris)

**Funcionalidades:**
- ✅ Crear nuevas ligas
- ✅ Ver todas las ligas
- ✅ Activar/Desactivar ligas (botón de estado)
- ✅ Ver estadísticas de cada liga

### 2. **Dashboard del Admin** (`/admin` → Dashboard)

**Ubicación:** Panel Admin → Pestaña "Dashboard"

**Qué muestra:**
- Resumen de ligas activas en las estadísticas generales
- Gráfico de "Videos por Liga" (round)

## 🔧 Endpoints del Backend

### Para Administradores

**Obtener todas las ligas:**
```
GET /api/admin/leagues
```
- Requiere autenticación de admin
- Devuelve todas las ligas con estadísticas

**Crear/Actualizar liga:**
```
POST /api/admin/leagues
Body: {
  round: 1-6,
  year: 2024,
  name: "Liga de Invierno",
  startDate: "2024-01-01T00:00:00Z",
  endDate: "2024-02-01T00:00:00Z",
  juryEndDate: "2024-02-15T00:00:00Z"
}
```

**Activar/Desactivar liga:**
```
PATCH /api/admin/leagues/:round/status?year=2024
Body: {
  isActive: true/false
}
```

### Para Usuarios Públicos

**Obtener liga actual activa:**
```
GET /api/leagues/current
```
- No requiere autenticación
- Devuelve la liga activa actual (si existe)
- Busca ligas con:
  - `isActive: true`
  - `startDate <= ahora`
  - `endDate >= ahora`

**Obtener todas las ligas (con filtros):**
```
GET /api/leagues?active=true&year=2024
```
- No requiere autenticación
- Puede filtrar por:
  - `active`: true/false (solo activas)
  - `year`: año específico

## 📊 Estructura de una Liga

```typescript
{
  id: string,
  round: number,        // 1-6
  year: number,         // 2024, 2025, etc.
  name: string,        // "Liga de Invierno"
  startDate: Date,      // Inicio de la liga
  endDate: Date,       // Fin de votación pública
  juryEndDate: Date,   // Fin de votación del jurado
  isActive: boolean,   // true = activa, false = cerrada
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Cómo Funciona el Sistema

### 1. **Crear una Liga (Admin)**

1. Ve a `/admin` → Pestaña "Ligas"
2. Haz clic en "Nueva Liga"
3. Completa el formulario:
   - Ronda: 1-6
   - Año: 2024, 2025, etc.
   - Nombre: "Liga de Invierno"
   - Fechas: Inicio, Fin Público, Fin Jurado
4. Haz clic en "Crear Liga"

### 2. **Activar una Liga**

1. En la lista de ligas, encuentra la liga que quieres activar
2. Haz clic en el botón "Cerrada" (gris)
3. Se cambiará a "Activa" (verde)
4. La liga ahora está disponible para usuarios

### 3. **Ver Liga Activa (Usuarios)**

Actualmente **NO está implementado** en las páginas públicas. Para implementarlo:

**En `pages/Home.tsx` o `pages/Contest.tsx`:**
```typescript
const [currentLeague, setCurrentLeague] = useState(null);

useEffect(() => {
  const loadCurrentLeague = async () => {
    try {
      const response = await api.getCurrentLeague();
      setCurrentLeague(response.league);
    } catch (error) {
      console.error('No hay liga activa');
    }
  };
  loadCurrentLeague();
}, []);
```

## ⚠️ Estado Actual

### ✅ Implementado:
- Panel de administración para gestionar ligas
- Endpoints del backend para ligas
- Crear, activar/desactivar ligas

### ❌ Falta Implementar:
- Mostrar liga activa en páginas públicas (Home, Contest)
- Indicador visual de liga activa para usuarios
- Filtrado de videos por liga activa

## 🚀 Próximos Pasos Recomendados

1. **Mostrar liga activa en Home:**
   - Banner con información de la liga actual
   - Contador regresivo hasta el fin de votación

2. **Filtrar videos por liga:**
   - En `/contest`, mostrar solo videos de la liga activa
   - Permitir ver videos de ligas anteriores

3. **Indicador de liga activa:**
   - Badge en el navbar
   - Información en cada página relevante

