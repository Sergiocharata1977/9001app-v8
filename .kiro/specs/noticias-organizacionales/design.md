# Documento de Diseño - Sistema de Noticias Organizacionales

## Overview

El Sistema de Noticias Organizacionales es una plataforma de comunicación interna tipo red social que permite a los usuarios crear publicaciones, compartir contenido multimedia y fomentar la interacción mediante comentarios y reacciones. El sistema se integra con la arquitectura existente basada en Firebase (Firestore + Storage) y Next.js 14 con App Router.

### Arquitectura Single-Tenant con Preparación para Multi-Tenancy

**Importante**: Actualmente el sistema está diseñado para **single-tenant** (una sola empresa por instancia). Sin embargo, todos los modelos de datos incluyen el campo `organizationId` para facilitar la migración futura a multi-tenancy sin necesidad de reestructurar la base de datos.

Por ahora:

- El campo `organizationId` siempre tendrá el mismo valor para todos los registros
- Las validaciones de seguridad no filtran por `organizationId` (están comentadas pero preparadas)
- Los queries no necesitan filtrar por organización

Cuando se implemente multi-tenancy en el futuro, solo será necesario:

- Descomentar las validaciones de `organizationId` en Firestore Security Rules
- Activar los filtros por organización en los queries
- Implementar lógica de asignación de organización al crear usuarios

### Objetivos Principales

- Facilitar la comunicación bidireccional entre miembros de la organización
- Promover el engagement y la colaboración
- Centralizar anuncios, logros y novedades organizacionales
- Proporcionar una experiencia similar a redes sociales conocidas (Facebook, LinkedIn)
- Mantener un ambiente profesional mediante moderación

### Alcance

El sistema incluye:

- Creación y gestión de publicaciones con texto, imágenes y archivos PDF
- Sistema de comentarios anidados
- Reacciones (likes) en publicaciones y comentarios
- Notificaciones de actividad
- Búsqueda y filtrado de contenido
- Moderación y permisos
- Feed cronológico con scroll infinito

## Architecture

### Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Base de Datos**: Firebase Firestore
- **Almacenamiento**: Firebase Storage
- **Autenticación**: Firebase Auth (existente)
- **UI Components**: shadcn/ui (existente en el proyecto)

### Estructura de Directorios

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── noticias/
│   │       ├── page.tsx                    # Feed principal
│   │       └── [id]/
│   │           └── page.tsx                # Vista detalle de publicación
│   └── api/
│       └── news/
│           ├── posts/
│           │   ├── route.ts                # GET (list), POST (create)
│           │   └── [id]/
│           │       ├── route.ts            # GET, PATCH, DELETE
│           │       ├── comments/
│           │       │   └── route.ts        # GET, POST
│           │       └── reactions/
│           │           └── route.ts        # POST, DELETE
│           ├── comments/
│           │   └── [id]/
│           │       ├── route.ts            # PATCH, DELETE
│           │       └── reactions/
│           │           └── route.ts        # POST, DELETE
│           ├── notifications/
│           │   └── route.ts                # GET, PATCH
│           └── search/
│               └── route.ts                # GET
├── components/
│   └── news/
│       ├── NewsFeed.tsx                    # Componente principal del feed
│       ├── PostCard.tsx                    # Tarjeta de publicación
│       ├── PostForm.tsx                    # Formulario crear/editar
│       ├── CommentList.tsx                 # Lista de comentarios
│       ├── CommentItem.tsx                 # Item individual de comentario
│       ├── CommentForm.tsx                 # Formulario de comentario
│       ├── ReactionButton.tsx              # Botón de reacción
│       ├── NotificationBell.tsx            # Campana de notificaciones
│       ├── SearchBar.tsx                   # Barra de búsqueda
│       └── ModerationPanel.tsx             # Panel de moderación
├── services/
│   └── news/
│       ├── PostService.ts                  # Lógica de negocio posts
│       ├── CommentService.ts               # Lógica de negocio comentarios
│       ├── ReactionService.ts              # Lógica de negocio reacciones
│       └── NotificationService.ts          # Lógica de notificaciones
├── types/
│   └── news.ts                             # Tipos TypeScript
└── lib/
    └── validations/
        └── news.ts                         # Esquemas de validación Zod
```

## Components and Interfaces

### Data Models

#### Post (Publicación)

```typescript
interface Post {
  id: string;

  // Contenido
  content: string; // Texto de la publicación (1-5000 chars)
  images: PostImage[]; // Hasta 5 imágenes
  attachments: PostAttachment[]; // Hasta 3 PDFs

  // Autor
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;

  // Organización (preparado para multi-tenancy futuro, por ahora single-tenant)
  organizationId: string; // Por ahora siempre el mismo valor

  // Metadata
  isEdited: boolean;
  editedAt: Timestamp | null;

  // Contadores
  commentCount: number;
  reactionCount: number;

  // Moderación
  isModerated: boolean;
  moderatedBy: string | null;
  moderatedAt: Timestamp | null;
  moderationReason: string | null;

  // Auditoría
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

interface PostImage {
  url: string; // URL de Firebase Storage
  storagePath: string; // Path en Storage
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number | null;
  height: number | null;
}

interface PostAttachment {
  url: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}
```

#### Comment (Comentario)

```typescript
interface Comment {
  id: string;

  // Relación
  postId: string;

  // Contenido
  content: string; // Texto del comentario (1-1000 chars)

  // Autor
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;

  // Metadata
  isEdited: boolean;
  editedAt: Timestamp | null;

  // Contadores
  reactionCount: number;

  // Moderación
  isModerated: boolean;
  moderatedBy: string | null;
  moderatedAt: Timestamp | null;
  moderationReason: string | null;

  // Auditoría
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}
```

#### Reaction (Reacción)

```typescript
interface Reaction {
  id: string;

  // Relación
  targetType: 'post' | 'comment';
  targetId: string; // ID del post o comentario

  // Usuario
  userId: string;
  userName: string;

  // Tipo de reacción (por ahora solo "like", extensible a futuro)
  type: 'like';

  // Auditoría
  createdAt: Timestamp;
}
```

#### Notification (Notificación)

```typescript
interface NewsNotification {
  id: string;

  // Destinatario
  userId: string;

  // Tipo de notificación
  type: 'comment' | 'reaction';

  // Relación
  postId: string;
  commentId: string | null; // Si es reacción a comentario

  // Actor (quien generó la notificación)
  actorId: string;
  actorName: string;
  actorPhotoURL: string | null;

  // Contenido
  message: string; // Mensaje descriptivo

  // Estado
  isRead: boolean;
  readAt: Timestamp | null;

  // Auditoría
  createdAt: Timestamp;
}
```

### Firestore Collections

```
news_posts/                                 # Colección de publicaciones
  {postId}/
    - Post data

news_comments/                              # Colección de comentarios
  {commentId}/
    - Comment data

news_reactions/                             # Colección de reacciones
  {reactionId}/
    - Reaction data

news_notifications/                         # Colección de notificaciones
  {notificationId}/
    - Notification data
```

### Firestore Indexes

```json
{
  "indexes": [
    {
      "collectionGroup": "news_posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "news_comments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "postId", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "news_reactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "targetType", "order": "ASCENDING" },
        { "fieldPath": "targetId", "order": "ASCENDING" },
        { "fieldPath": "userId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "news_notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "isRead", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### Firebase Storage Structure

```
news/
  posts/
    {postId}/
      images/
        {timestamp}_{filename}.jpg
        {timestamp}_{filename}.png
      attachments/
        {timestamp}_{filename}.pdf
```

## Components Architecture

### NewsFeed Component

Componente principal que muestra el feed de publicaciones con scroll infinito.

**Props:**

```typescript
interface NewsFeedProps {
  organizationId: string;
  currentUserId: string;
  isAdmin: boolean;
}
```

**Funcionalidades:**

- Carga inicial de 10 publicaciones
- Scroll infinito (IntersectionObserver)
- Formulario de creación en la parte superior
- Búsqueda y filtrado
- Actualización optimista de UI

### PostCard Component

Tarjeta individual de publicación.

**Props:**

```typescript
interface PostCardProps {
  post: Post;
  currentUserId: string;
  isAdmin: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onModerate?: (postId: string) => void;
}
```

**Funcionalidades:**

- Muestra contenido, imágenes y adjuntos
- Botones de editar/eliminar (solo autor)
- Botón de moderar (solo admin)
- Contador de comentarios y reacciones
- Botón de reacción
- Link a vista detalle

### PostForm Component

Formulario para crear/editar publicaciones.

**Props:**

```typescript
interface PostFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Post>;
  onSubmit: (data: PostFormData) => Promise<void>;
  onCancel?: () => void;
}
```

**Funcionalidades:**

- Textarea con contador de caracteres
- Upload de imágenes (drag & drop + click)
- Upload de PDFs
- Preview de archivos
- Validación en tiempo real
- Loading states

### CommentList Component

Lista de comentarios de una publicación.

**Props:**

```typescript
interface CommentListProps {
  postId: string;
  currentUserId: string;
  isAdmin: boolean;
}
```

**Funcionalidades:**

- Carga de comentarios ordenados cronológicamente
- Formulario de nuevo comentario
- Scroll automático a nuevo comentario

### ReactionButton Component

Botón de reacción (like) reutilizable.

**Props:**

```typescript
interface ReactionButtonProps {
  targetType: 'post' | 'comment';
  targetId: string;
  currentUserId: string;
  initialCount: number;
  initialUserReacted: boolean;
}
```

**Funcionalidades:**

- Toggle de reacción
- Actualización optimista
- Animación de feedback

### NotificationBell Component

Campana de notificaciones en el header.

**Props:**

```typescript
interface NotificationBellProps {
  userId: string;
}
```

**Funcionalidades:**

- Badge con contador de no leídas
- Dropdown con últimas 10 notificaciones
- Marcar como leída al hacer click
- Link a publicación correspondiente

## API Routes

### POST /api/news/posts

Crear nueva publicación.

**Request Body:**

```typescript
{
  content: string;
  images?: File[];
  attachments?: File[];
  organizationId: string;
}
```

**Response:**

```typescript
{
  success: boolean;
  data: Post;
}
```

### GET /api/news/posts

Listar publicaciones con paginación.

**Query Params:**

```typescript
{
  organizationId: string;
  page?: number;              // Default: 1
  limit?: number;             // Default: 10
  authorId?: string;          // Filtro opcional
  search?: string;            // Búsqueda opcional
}
```

**Response:**

```typescript
{
  success: boolean;
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
```

### GET /api/news/posts/[id]

Obtener publicación por ID.

**Response:**

```typescript
{
  success: boolean;
  data: Post;
}
```

### PATCH /api/news/posts/[id]

Actualizar publicación (solo autor).

**Request Body:**

```typescript
{
  content: string;
}
```

**Response:**

```typescript
{
  success: boolean;
  data: Post;
}
```

### DELETE /api/news/posts/[id]

Eliminar publicación (autor o admin).

**Response:**

```typescript
{
  success: boolean;
}
```

### POST /api/news/posts/[id]/comments

Crear comentario en publicación.

**Request Body:**

```typescript
{
  content: string;
}
```

**Response:**

```typescript
{
  success: boolean;
  data: Comment;
}
```

### GET /api/news/posts/[id]/comments

Listar comentarios de publicación.

**Response:**

```typescript
{
  success: boolean;
  data: Comment[];
}
```

### POST /api/news/posts/[id]/reactions

Agregar/quitar reacción a publicación.

**Request Body:**

```typescript
{
  type: 'like';
}
```

**Response:**

```typescript
{
  success: boolean;
  data: {
    reacted: boolean; // true si agregó, false si quitó
    count: number; // Nuevo contador
  }
}
```

### PATCH /api/news/comments/[id]

Actualizar comentario (solo autor).

**Request Body:**

```typescript
{
  content: string;
}
```

**Response:**

```typescript
{
  success: boolean;
  data: Comment;
}
```

### DELETE /api/news/comments/[id]

Eliminar comentario (autor o admin).

**Response:**

```typescript
{
  success: boolean;
}
```

### POST /api/news/comments/[id]/reactions

Agregar/quitar reacción a comentario.

**Request Body:**

```typescript
{
  type: 'like';
}
```

**Response:**

```typescript
{
  success: boolean;
  data: {
    reacted: boolean;
    count: number;
  }
}
```

### GET /api/news/notifications

Obtener notificaciones del usuario.

**Query Params:**

```typescript
{
  limit?: number;             // Default: 50
  unreadOnly?: boolean;       // Default: false
}
```

**Response:**

```typescript
{
  success: boolean;
  data: NewsNotification[];
  unreadCount: number;
}
```

### PATCH /api/news/notifications

Marcar notificaciones como leídas.

**Request Body:**

```typescript
{
  notificationIds: string[];
}
```

**Response:**

```typescript
{
  success: boolean;
}
```

### GET /api/news/search

Buscar publicaciones.

**Query Params:**

```typescript
{
  q: string;                  // Query de búsqueda
  organizationId: string;
  limit?: number;             // Default: 20
}
```

**Response:**

```typescript
{
  success: boolean;
  data: Post[];
}
```

## Error Handling

### Error Codes

```typescript
enum NewsErrorCode {
  // Validación
  INVALID_POST_DATA = 'INVALID_POST_DATA',
  INVALID_COMMENT_DATA = 'INVALID_COMMENT_DATA',
  CONTENT_TOO_SHORT = 'CONTENT_TOO_SHORT',
  CONTENT_TOO_LONG = 'CONTENT_TOO_LONG',
  TOO_MANY_IMAGES = 'TOO_MANY_IMAGES',
  TOO_MANY_ATTACHMENTS = 'TOO_MANY_ATTACHMENTS',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',

  // Permisos
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  USER_DISABLED = 'USER_DISABLED',

  // Recursos
  POST_NOT_FOUND = 'POST_NOT_FOUND',
  COMMENT_NOT_FOUND = 'COMMENT_NOT_FOUND',

  // General
  DATABASE_ERROR = 'DATABASE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
```

### Error Response Format

```typescript
{
  success: false,
  error: {
    code: NewsErrorCode;
    message: string;
    details?: unknown;
  }
}
```

### Error Handling Strategy

1. **Validación**: Usar Zod para validar datos de entrada
2. **Try-Catch**: Envolver operaciones de DB y Storage
3. **Logging**: Console.error para debugging
4. **User Feedback**: Mensajes claros y accionables
5. **Rollback**: Limpiar archivos de Storage si falla la creación en Firestore

## Testing Strategy

### Unit Tests

- **Services**: Testear lógica de negocio con mocks de Firestore
- **Validations**: Testear esquemas Zod con casos válidos e inválidos
- **Utils**: Testear funciones auxiliares

### Integration Tests

- **API Routes**: Testear endpoints con datos reales
- **File Upload**: Testear upload a Storage y limpieza

### E2E Tests (Opcional)

- **User Flows**: Crear publicación → Comentar → Reaccionar
- **Moderación**: Admin elimina contenido inapropiado

### Testing Tools

- Jest para unit tests
- React Testing Library para componentes
- Supertest para API routes (opcional)

## Performance Considerations

### Optimizaciones

1. **Paginación**: Cargar 10 posts por página
2. **Lazy Loading**: Imágenes con loading="lazy"
3. **Image Optimization**: Next.js Image component
4. **Caching**: SWR o React Query para cache de datos
5. **Optimistic Updates**: Actualizar UI antes de confirmar con servidor
6. **Debouncing**: En búsqueda en tiempo real
7. **Indexes**: Firestore composite indexes para queries complejas
8. **Storage**: Comprimir imágenes antes de subir (client-side)

### Límites

- Máximo 10 publicaciones por carga
- Máximo 5 imágenes por publicación (5MB c/u)
- Máximo 3 PDFs por publicación (10MB c/u)
- Máximo 5000 caracteres por publicación
- Máximo 1000 caracteres por comentario
- Máximo 50 notificaciones por carga

## Security Considerations

### Autenticación y Autorización

1. **Verificar usuario autenticado** en todas las API routes
2. **Validar organizationId** (por ahora single-tenant, campo preparado para multi-tenancy futuro)
3. **Verificar permisos** de autor para editar/eliminar
4. **Verificar rol admin** para moderación

**Nota sobre organizationId**: Actualmente el sistema es single-tenant (una sola empresa), pero el campo `organizationId` está incluido en todos los modelos de datos para facilitar la migración futura a multi-tenancy. Por ahora, este campo siempre tendrá el mismo valor para todos los registros.

### Validación de Datos

1. **Server-side validation** con Zod en todas las API routes
2. **Sanitización** de contenido HTML (usar DOMPurify si se permite HTML)
3. **Validación de archivos**: tipo, tamaño, extensión
4. **Rate limiting**: Limitar creación de posts/comentarios por usuario

### Storage Security

1. **Firebase Storage Rules**: Solo usuarios autenticados pueden subir
2. **Path validation**: Validar que el path incluya el postId correcto
3. **File cleanup**: Eliminar archivos huérfanos si falla la transacción

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Posts
    // Nota: Por ahora single-tenant, validación de organizationId comentada pero preparada
    match /news_posts/{postId} {
      allow read: if request.auth != null;
      // Para multi-tenancy futuro: && resource.data.organizationId == request.auth.token.organizationId

      allow create: if request.auth != null
                    && request.resource.data.authorId == request.auth.uid;
      // Para multi-tenancy futuro: && request.resource.data.organizationId == request.auth.token.organizationId

      allow update: if request.auth != null
                    && (resource.data.authorId == request.auth.uid
                        || request.auth.token.role == 'admin');

      allow delete: if request.auth != null
                    && (resource.data.authorId == request.auth.uid
                        || request.auth.token.role == 'admin');
    }

    // Comments
    match /news_comments/{commentId} {
      allow read: if request.auth != null;

      allow create: if request.auth != null
                    && request.resource.data.authorId == request.auth.uid;

      allow update: if request.auth != null
                    && (resource.data.authorId == request.auth.uid
                        || request.auth.token.role == 'admin');

      allow delete: if request.auth != null
                    && (resource.data.authorId == request.auth.uid
                        || request.auth.token.role == 'admin');
    }

    // Reactions
    match /news_reactions/{reactionId} {
      allow read: if request.auth != null;

      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;

      allow delete: if request.auth != null
                    && resource.data.userId == request.auth.uid;
    }

    // Notifications
    match /news_notifications/{notificationId} {
      allow read: if request.auth != null
                  && resource.data.userId == request.auth.uid;

      allow update: if request.auth != null
                    && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Future Enhancements

### Fase 2 (Futuro)

- **Multi-tenancy**: Activar validación de organizationId para múltiples empresas
- **Menciones**: @usuario en comentarios
- **Hashtags**: #tema para categorización
- **Reacciones múltiples**: ❤️ 👍 😂 😮 😢 😡
- **Comentarios anidados**: Respuestas a comentarios
- **Edición de imágenes**: Crop, rotate antes de subir
- **Videos**: Soporte para videos cortos
- **Encuestas**: Crear polls en publicaciones
- **Publicaciones fijadas**: Pin posts importantes
- **Borradores**: Guardar publicaciones sin publicar
- **Programación**: Publicar en fecha/hora específica
- **Analytics**: Métricas de engagement
- **Exportación**: Descargar contenido en PDF/CSV
- **Modo oscuro**: Theme switcher
- **PWA**: Notificaciones push
- **Internacionalización**: Soporte multi-idioma

### Integraciones Futuras

- **Calendario**: Publicar eventos automáticamente
- **Documentos**: Compartir documentos aprobados
- **Auditorías**: Anunciar resultados de auditorías
- **Capacitaciones**: Notificar nuevas capacitaciones
