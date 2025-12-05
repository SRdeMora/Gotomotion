# 🏆 Sistema de Ligas - Go2Motion Awards

## 📋 Cómo Funciona

### Concepto de Liga
Una **Liga** es una ronda del concurso anual. Cada año hay **5-6 ligas** donde los participantes pueden subir videos y competir.

### Flujo de una Liga

1. **Creación de Liga** (Admin)
   - Se crea una liga con número de ronda (1-6)
   - Se establecen fechas:
     - `startDate`: Inicio de la liga
     - `endDate`: Cierre de votación pública
     - `juryEndDate`: Cierre de votación del jurado

2. **Fase de Participación** (startDate → endDate)
   - Los participantes pueden subir videos
   - Deben pagar según categorías seleccionadas
   - Pueden subir el mismo video en múltiples ligas

3. **Fase de Votación Pública** (startDate → endDate)
   - Los votantes pueden votar por videos
   - Cada voto público = 1 punto
   - Un usuario puede votar el mismo video en diferentes categorías
   - No puede votar dos veces en la misma categoría

4. **Fase de Votación del Jurado** (endDate → juryEndDate)
   - El jurado profesional vota por los top videos
   - Top 2 reciben 3 puntos cada uno
   - Top 3-5 reciben 2 puntos cada uno
   - Los puntos del jurado se suman a los puntos públicos

5. **Cierre de Liga**
   - Se calculan los puntos totales (públicos + jurado)
   - Los puntos se suman al contador anual del usuario
   - La liga se marca como `isActive: false`

### Puntos y Ranking

- **Puntos por Liga:**
  - Voto público = 1 punto
  - Voto jurado top 2 = 3 puntos
  - Voto jurado top 3-5 = 2 puntos
  - Total = suma de todos los puntos

- **Puntos Anuales:**
  - Se suman los puntos de todas las ligas del año
  - Al final del año, el ganador de cada categoría recibe el premio

## 🎯 Ejemplo Práctico

**Liga 1 (Enero-Febrero):**
- Usuario A sube video en "Mejor Dirección"
- Recibe 50 votos públicos = 50 puntos
- Jurado le da 3 puntos (top 2) = 3 puntos
- **Total Liga 1: 53 puntos**

**Liga 2 (Marzo-Abril):**
- Usuario A sube el mismo video en "Mejor Dirección"
- Recibe 60 votos públicos = 60 puntos
- Jurado le da 2 puntos (top 5) = 2 puntos
- **Total Liga 2: 62 puntos**

**Puntos Anuales Usuario A:**
- Liga 1: 53 puntos
- Liga 2: 62 puntos
- **Total Anual: 115 puntos**

## 📊 Estructura de Datos

```typescript
League {
  round: 1-6          // Número de liga
  year: 2024          // Año
  startDate: Date     // Inicio
  endDate: Date       // Fin votación pública
  juryEndDate: Date   // Fin votación jurado
  isActive: boolean   // Si está abierta
}

Video {
  round: 1            // Liga a la que pertenece
  year: 2024
  publicVotes: 50     // Votos del público
  juryPoints: 3       // Puntos del jurado
  totalPoints: 53     // Total en esta liga
}
```

