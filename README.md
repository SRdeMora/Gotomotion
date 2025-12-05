# Go2Motion Awards - Plataforma de Concurso de Videoclips

<div align="center">
  <h3>Plataforma definitiva para creadores de videoclips</h3>
  <p>Compite, vota y conecta con la industria audiovisual</p>
</div>

## 📋 Descripción

Go2Motion Awards es una plataforma web profesional diseñada para gestionar concursos de videoclips. La aplicación permite a los usuarios participar como votantes o participantes activos, subir videoclips, votar por sus favoritos, ver rankings en tiempo real y participar en una comunidad exclusiva.

## ✨ Características Principales

- 🎬 **Galería de Concurso**: Explora y filtra videoclips por categorías
- 🏆 **Sistema de Ranking**: Clasificación en tiempo real con visualizaciones gráficas
- 👤 **Perfiles de Usuario**: Gestión completa de perfiles para votantes y participantes
- 💬 **Foro de Comunidad**: Acceso exclusivo para participantes activos
- 🔐 **Autenticación**: Sistema de registro y login con persistencia de sesión
- 📊 **Estadísticas**: Visualización de datos con gráficos interactivos
- 🎨 **Diseño Moderno**: Interfaz profesional con Tailwind CSS
- ♿ **Accesible**: Cumple con estándares de accesibilidad web
- 🚀 **Optimizado**: Lazy loading y code splitting para mejor rendimiento

## 🛠️ Tecnologías Utilizadas

- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router DOM** - Enrutamiento
- **Tailwind CSS** - Estilos utilitarios
- **Lucide React** - Iconos
- **Recharts** - Gráficos y visualizaciones

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd Mayte
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` y configura:
   ```env
   GEMINI_API_KEY=tu_clave_api_aqui
   ```

4. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:3000`

## 🚀 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción

## 📁 Estructura del Proyecto

```
Mayte/
├── components/          # Componentes reutilizables
│   ├── Navbar.tsx
│   ├── ErrorBoundary.tsx
│   ├── LoadingSpinner.tsx
│   ├── NotFound.tsx
│   └── PageTitle.tsx
├── pages/               # Páginas de la aplicación
│   ├── Home.tsx
│   ├── Contest.tsx
│   ├── Ranking.tsx
│   ├── Profile.tsx
│   ├── Forum.tsx
│   ├── Auth.tsx
│   ├── VideoDetail.tsx
│   └── HowItWorks.tsx
├── types.ts             # Definiciones de TypeScript
├── constants.ts         # Datos mock y constantes
├── App.tsx              # Componente principal
├── index.tsx           # Punto de entrada
├── index.html           # HTML base
├── vite.config.ts       # Configuración de Vite
└── tsconfig.json        # Configuración de TypeScript
```

## 🎯 Funcionalidades por Rol

### Votante
- Registro gratuito
- Votar por videoclips favoritos
- Ver perfiles y rankings
- Explorar galería de concurso

### Participante Individual/Equipo
- Todas las funcionalidades de Votante
- Subir videoclips al concurso
- Acceso exclusivo al foro
- Gestión de participaciones activas
- Estadísticas de rendimiento

## 🔒 Seguridad y Mejores Prácticas

- ✅ Validación de formularios en cliente
- ✅ Manejo de errores con Error Boundaries
- ✅ Persistencia segura de sesión (localStorage)
- ✅ Protección de rutas según roles
- ✅ Sanitización de inputs
- ✅ Lazy loading para optimización

## ♿ Accesibilidad

- Etiquetas ARIA apropiadas
- Navegación por teclado
- Textos alternativos en imágenes
- Contraste adecuado de colores
- Estructura semántica HTML

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- 📱 Móviles
- 📱 Tablets
- 💻 Desktop

## 🐛 Manejo de Errores

- Error Boundary global para capturar errores de React
- Página 404 personalizada
- Estados de carga en todas las operaciones asíncronas
- Mensajes de error descriptivos

## 🚀 Despliegue

### Build para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`.

### Variables de Entorno en Producción

Asegúrate de configurar las variables de entorno en tu plataforma de despliegue:
- `GEMINI_API_KEY` (si es necesario)

## 📝 Notas de Desarrollo

- Los datos actuales son mock (simulados). Para producción, necesitarás integrar un backend real.
- La autenticación actual es simulada usando localStorage. En producción, implementa un sistema de autenticación real.
- Las imágenes utilizan servicios externos (Unsplash, Picsum). Considera usar un CDN propio en producción.

## 🤝 Contribución

Este es un proyecto profesional desarrollado para un cliente. Para mejoras o correcciones:

1. Crea una rama para tu feature
2. Realiza tus cambios
3. Asegúrate de que no haya errores de linting
4. Envía un pull request

## 📄 Licencia

© 2024 Go2Motion Awards. Todos los derechos reservados.

## 📞 Soporte

Para soporte técnico o consultas, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para Go2Motion Awards**
