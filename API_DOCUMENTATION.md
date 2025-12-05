# 📚 Documentación de la API - Go2Motion Awards

Base URL: `https://tu-backend.com/api`

## 🔐 Autenticación

La mayoría de los endpoints requieren autenticación mediante JWT. Incluye el token en el header:

```
Authorization: Bearer <token>
```

## 📋 Endpoints

### Autenticación

#### POST `/auth/register`
Registra un nuevo usuario.

**Body:**
```json
{
  "email": "usuario@example.com",
  "name": "Nombre Usuario",
  "password": "password123",
  "role": "VOTER" | "PARTICIPANT_INDIVIDUAL" | "PARTICIPANT_TEAM"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "usuario@example.com",
    "name": "Nombre Usuario",
    "role": "VOTER",
    "avatar": "url_avatar"
  },
  "token": "jwt_token"
}
```

#### POST `/auth/login`
Inicia sesión.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Response:** Igual que register

#### GET `/auth/me`
Obtiene el usuario actual (requiere autenticación).

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "usuario@example.com",
    "name": "Nombre Usuario",
    "role": "VOTER",
    "avatar": "url_avatar",
    "bio": "Biografía",
    "sector": "Sector"
  }
}
```

### Videos

#### GET `/videos`
Lista videos con filtros opcionales.

**Query Parameters:**
- `category` (string, opcional): Filtrar por categoría
- `search` (string, opcional): Buscar en título/autor
- `round` (number, opcional): Filtrar por ronda
- `year` (number, opcional): Filtrar por año
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Resultados por página (default: 20)

**Response:**
```json
{
  "videos": [
    {
      "id": "video_id",
      "title": "Título del Video",
      "thumbnail": "url_thumbnail",
      "videoUrl": "url_video",
      "description": "Descripción",
      "materialsUsed": "Materiales",
      "categories": ["BEST_VIDEO"],
      "round": 1,
      "year": 2024,
      "views": 100,
      "votes": 50,
      "author": {
        "id": "author_id",
        "name": "Nombre Autor",
        "avatar": "url_avatar"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### GET `/videos/:id`
Obtiene un video específico.

**Response:**
```json
{
  "video": {
    "id": "video_id",
    "title": "Título",
    "thumbnail": "url",
    "videoUrl": "url",
    "description": "Descripción",
    "materialsUsed": "Materiales",
    "categories": ["BEST_VIDEO"],
    "round": 1,
    "year": 2024,
    "views": 100,
    "votes": 50,
    "author": {
      "id": "author_id",
      "name": "Nombre",
      "avatar": "url",
      "bio": "Biografía"
    }
  }
}
```

#### POST `/videos`
Crea un nuevo video (requiere autenticación de participante).

**Content-Type:** `multipart/form-data`

**Body (FormData):**
- `title` (string): Título del video
- `description` (string, opcional): Descripción
- `materialsUsed` (string, opcional): Materiales utilizados
- `categories` (string): JSON array de categorías
- `round` (number, opcional): Ronda (default: 1)
- `year` (number, opcional): Año (default: año actual)
- `thumbnail` (file): Imagen thumbnail
- `video` (file): Archivo de video

**Response:**
```json
{
  "video": {
    "id": "video_id",
    "title": "Título",
    ...
  }
}
```

#### PUT `/videos/:id`
Actualiza un video (solo el autor).

**Body:**
```json
{
  "title": "Nuevo Título",
  "description": "Nueva Descripción"
}
```

#### DELETE `/videos/:id`
Elimina un video (solo el autor).

### Votos

#### POST `/votes/:videoId`
Vota por un video (requiere autenticación).

**Response:**
```json
{
  "vote": {
    "id": "vote_id",
    "userId": "user_id",
    "videoId": "video_id",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "Voto registrado correctamente"
}
```

#### DELETE `/votes/:videoId`
Elimina el voto de un video.

#### GET `/votes/:videoId/check`
Verifica si el usuario actual votó por el video.

**Response:**
```json
{
  "hasVoted": true
}
```

### Ranking

#### GET `/ranking`
Obtiene el ranking.

**Query Parameters:**
- `round` (number, opcional): Filtrar por ronda
- `year` (number, opcional): Filtrar por año
- `category` (string, opcional): Filtrar por categoría
- `limit` (number, opcional): Número de resultados (default: 50)

**Response:**
```json
{
  "ranking": [
    {
      "position": 1,
      "video": {
        "id": "video_id",
        "title": "Título",
        "votes": 100,
        "author": {
          "id": "author_id",
          "name": "Nombre"
        }
      }
    }
  ]
}
```

#### GET `/ranking/user/:userId`
Obtiene el ranking de un usuario específico.

**Response:**
```json
{
  "totalVotes": 500,
  "position": 12,
  "videos": 5
}
```

### Foro

#### GET `/forum/topics`
Lista temas del foro.

**Query Parameters:**
- `category` (string, opcional): Filtrar por categoría
- `page` (number, opcional): Página
- `limit` (number, opcional): Resultados por página

**Response:**
```json
{
  "topics": [
    {
      "id": "topic_id",
      "title": "Título del Tema",
      "category": "GENERAL",
      "content": "Contenido",
      "views": 100,
      "replies": 5,
      "author": {
        "id": "author_id",
        "name": "Nombre",
        "avatar": "url"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

#### GET `/forum/topics/:id`
Obtiene un tema con sus respuestas.

**Response:**
```json
{
  "topic": {
    "id": "topic_id",
    "title": "Título",
    "content": "Contenido",
    "category": "GENERAL",
    "views": 100,
    "author": {
      "id": "author_id",
      "name": "Nombre",
      "avatar": "url"
    },
    "replies": [
      {
        "id": "reply_id",
        "content": "Respuesta",
        "author": {
          "id": "author_id",
          "name": "Nombre",
          "avatar": "url"
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### POST `/forum/topics`
Crea un tema (requiere autenticación de participante).

**Body:**
```json
{
  "title": "Título del Tema",
  "content": "Contenido del tema",
  "category": "GENERAL" | "TECNICA" | "PROMOCION" | "NORMATIVA" | "SHOWCASE"
}
```

#### POST `/forum/topics/:topicId/replies`
Responde a un tema (requiere autenticación de participante).

**Body:**
```json
{
  "content": "Contenido de la respuesta"
}
```

### Usuarios

#### GET `/users/:id`
Obtiene el perfil de un usuario.

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "Nombre",
    "email": "email@example.com",
    "role": "VOTER",
    "avatar": "url",
    "bio": "Biografía",
    "sector": "Sector",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT `/users/:id`
Actualiza el perfil (solo el propio usuario).

**Body:**
```json
{
  "name": "Nuevo Nombre",
  "bio": "Nueva Biografía",
  "sector": "Nuevo Sector"
}
```

## 🚨 Códigos de Error

- `400` - Bad Request (datos inválidos)
- `401` - Unauthorized (no autenticado o token inválido)
- `403` - Forbidden (no autorizado para esta acción)
- `404` - Not Found (recurso no encontrado)
- `500` - Internal Server Error (error del servidor)

## 📝 Notas

- Todos los timestamps están en formato ISO 8601
- Las categorías de video son: `BEST_VIDEO`, `BEST_DIRECTION`, `BEST_PHOTOGRAPHY`, `BEST_ART`, `BEST_EDITING`, `BEST_COLOR`
- Las categorías del foro son: `GENERAL`, `TECNICA`, `PROMOCION`, `NORMATIVA`, `SHOWCASE`
- Los roles de usuario son: `VOTER`, `PARTICIPANT_INDIVIDUAL`, `PARTICIPANT_TEAM`

