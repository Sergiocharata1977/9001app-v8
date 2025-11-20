# Implementation Plan - Sistema de Noticias Organizacionales

## MVP - Tareas Core (Fase 1)

- [x] 1. Configurar estructura base y tipos
  - Crear tipos TypeScript para Post, Comment, Reaction y Notification en src/types/news.ts
  - Crear esquemas de validación Zod en src/lib/validations/news.ts
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 5.1, 6.1_

- [x] 2. Implementar PostService básico
  - Crear src/services/news/PostService.ts con métodos create, getAll, getById, update, delete
  - Implementar paginación simple (10 posts por página)
  - Incluir campo organizationId hardcoded por ahora
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 2.1, 2.2, 2.3, 4.1, 4.4, 4.5_

- [x] 3. Implementar CommentService básico
  - Crear src/services/news/CommentService.ts con métodos create, getByPostId, update, delete
  - Actualizar contador commentCount en el post al crear/eliminar
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Implementar ReactionService básico
  - Crear src/services/news/ReactionService.ts con método toggleReaction
  - Actualizar contador reactionCount en post/comment
  - Verificar si usuario ya reaccionó antes de crear/eliminar
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5. Crear API route para posts
  - Crear src/app/api/news/posts/route.ts con GET (listar) y POST (crear)
  - Validar datos con Zod
  - Verificar autenticación del usuario
  - Manejar solo texto por ahora (sin imágenes/archivos)
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 2.1, 2.2, 2.3_

- [x] 6. Crear API route para post individual
  - Crear src/app/api/news/posts/[id]/route.ts con GET, PATCH, DELETE
  - Verificar permisos de autor para PATCH y DELETE
  - Permitir admin eliminar cualquier post
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [x] 7. Crear API route para comentarios
  - Crear src/app/api/news/posts/[id]/comments/route.ts con GET y POST
  - Validar contenido del comentario (1-1000 chars)
  - Crear notificación al autor del post
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.1_

- [ ] 8. Crear API route para reacciones en posts
  - Crear src/app/api/news/posts/[id]/reactions/route.ts con POST

  - Implementar toggle (agregar si no existe, quitar si existe)
  - Retornar estado actualizado (reacted: boolean, count: number)
  - Crear notificación al autor del post
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.2_

- [x] 9. Crear componente PostCard básico
  - Crear src/components/news/PostCard.tsx
  - Mostrar contenido, autor, timestamp
  - Mostrar contadores de comentarios y reacciones
  - Botones editar/eliminar solo para autor
  - Indicador "editado" si isEdited es true
  - _Requirements: 2.1, 2.2, 2.4, 2.5, 4.1, 4.3_

- [x] 10. Crear componente ReactionButton
  - Crear src/components/news/ReactionButton.tsx
  - Botón de like con ícono de corazón
  - Mostrar contador de reacciones
  - Cambiar estilo si usuario ya reaccionó
  - Actualización optimista de UI
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 11. Crear componente PostForm básico
  - Crear src/components/news/PostForm.tsx
  - Textarea con contador de caracteres (1-5000)
  - Botón de enviar con loading state
  - Validación en tiempo real
  - Solo texto por ahora (sin archivos)
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 12. Crear componente CommentItem
  - Crear src/components/news/CommentItem.tsx
  - Mostrar contenido, autor, timestamp
  - Botones editar/eliminar solo para autor
  - ReactionButton integrado
  - _Requirements: 3.4, 3.5, 4.1, 5.1_

- [x] 13. Crear componente CommentList
  - Crear src/components/news/CommentList.tsx
  - Listar comentarios ordenados cronológicamente
  - Formulario simple para nuevo comentario
  - _Requirements: 3.1, 3.3, 3.4, 3.5_

- [x] 14. Crear componente NewsFeed
  - Crear src/components/news/NewsFeed.tsx
  - PostForm en la parte superior
  - Lista de PostCard
  - Paginación simple con botón "Cargar más"
  - Estados de loading y empty
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 15. Crear página principal de noticias
  - Crear src/app/(dashboard)/noticias/page.tsx
  - Renderizar NewsFeed component
  - Obtener usuario actual de sesión
  - Pasar organizationId hardcoded
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 16. Crear página de detalle de post
  - Crear src/app/(dashboard)/noticias/[id]/page.tsx
  - Mostrar PostCard del post específico
  - Mostrar CommentList completo
  - Breadcrumb para volver al feed
  - _Requirements: 2.4, 3.1, 3.4, 3.5_

- [x] 17. Configurar índices de Firestore
  - Actualizar firestore.indexes.json con índices necesarios
  - Índice: news_posts (isActive ASC, createdAt DESC)
  - Índice: news_comments (postId ASC, isActive ASC, createdAt ASC)
  - Índice: news_reactions (targetType ASC, targetId ASC, userId ASC)
  - Desplegar índices con script
  - _Requirements: 10.1, 10.4_

- [x] 18. Agregar navegación al sidebar
  - Agregar link "Noticias" al sidebar principal

  - Usar ícono apropiado (MessageSquare o Newspaper)
  - Configurar ruta /noticias
  - _Requirements: 2.1_

## Tareas Adicionales (Fase 2 - Después del MVP)

- [ ] 19. Implementar upload de imágenes
- [ ] 19.1 Agregar soporte de imágenes en PostService
  - Implementar upload a Firebase Storage
  - Generar URLs de descarga
  - Actualizar modelo Post con array de imágenes
  - _Requirements: 1.3, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 19.2 Actualizar PostForm para imágenes
  - Input de archivos con drag & drop
  - Preview de imágenes antes de subir
  - Validación de tipo y tamaño (5MB máx)
  - Máximo 5 imágenes
  - _Requirements: 1.3, 9.1, 9.2_

- [ ] 19.3 Actualizar PostCard para mostrar imágenes
  - Grid responsive de imágenes
  - Lightbox para ver en grande
  - Lazy loading con Next.js Image
  - _Requirements: 2.4, 10.2_

- [ ] 20. Implementar upload de archivos PDF
- [ ] 20.1 Agregar soporte de PDFs en PostService
  - Upload a Firebase Storage
  - Validación de tipo y tamaño (10MB máx)
  - Máximo 3 PDFs
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 20.2 Actualizar PostForm para PDFs
  - Input de archivos PDF
  - Preview con nombre y tamaño
  - Botón para remover antes de subir
  - _Requirements: 9.1, 9.2_

- [ ] 20.3 Actualizar PostCard para mostrar PDFs
  - Lista de archivos adjuntos
  - Botón de descarga/visualizar
  - Ícono de PDF con nombre
  - _Requirements: 9.3, 9.4_

- [ ] 21. Implementar sistema de notificaciones
- [ ] 21.1 Crear NotificationService
  - Métodos para crear, obtener, marcar como leída
  - Filtrar por usuario
  - Ordenar por fecha descendente
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 21.2 Crear API route de notificaciones
  - GET /api/news/notifications
  - PATCH /api/news/notifications (marcar leídas)
  - _Requirements: 6.3, 6.4, 6.5_

- [ ] 21.3 Crear componente NotificationBell
  - Ícono de campana en header
  - Badge con contador de no leídas
  - Dropdown con lista de notificaciones
  - Click para navegar y marcar como leída
  - _Requirements: 6.3, 6.4, 6.5_

- [ ] 22. Implementar búsqueda
- [ ] 22.1 Crear API route de búsqueda
  - GET /api/news/search con query param
  - Buscar en contenido de posts
  - Buscar en comentarios
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 22.2 Crear componente SearchBar
  - Input con debounce (300ms)
  - Mostrar resultados en tiempo real
  - Mensaje cuando no hay resultados
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [ ] 22.3 Integrar SearchBar en NewsFeed
  - Posicionar en parte superior
  - Filtrar posts según búsqueda
  - _Requirements: 7.1, 7.4_

- [ ] 23. Implementar scroll infinito
- [ ] 23.1 Actualizar NewsFeed con IntersectionObserver
  - Detectar cuando llega al final
  - Cargar siguiente página automáticamente
  - Indicador de loading al cargar más
  - _Requirements: 2.3, 10.1, 10.2_

- [ ] 24. Implementar panel de moderación
- [ ] 24.1 Crear ModerationPanel component
  - Botón de eliminar visible solo para admin
  - Modal de confirmación con razón
  - Registrar acción en log
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 24.2 Implementar deshabilitación de usuarios
  - Campo canPost en perfil de usuario
  - Validar en API antes de crear post
  - Mostrar mensaje si usuario deshabilitado
  - _Requirements: 8.4, 8.5_

- [ ] 25. Implementar reacciones en comentarios
- [ ] 25.1 Crear API route para reacciones en comentarios
  - POST /api/news/comments/[id]/reactions
  - Toggle similar a posts
  - Crear notificación al autor del comentario
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 25.2 Actualizar CommentItem con ReactionButton
  - Integrar botón de reacción
  - Mostrar contador
  - _Requirements: 5.1, 5.5_

- [ ] 26. Implementar API route para comentarios individuales
- [ ] 26.1 Crear /api/news/comments/[id]/route.ts
  - PATCH para editar comentario
  - DELETE para eliminar comentario
  - Verificar permisos de autor
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [ ] 27. Optimizaciones de rendimiento
- [ ] 27.1 Implementar compresión de imágenes
  - Usar librería client-side (browser-image-compression)
  - Comprimir antes de upload
  - Mantener calidad aceptable
  - _Requirements: 10.3, 10.5_

- [ ] 27.2 Configurar cache con SWR
  - Instalar y configurar SWR
  - Cachear lista de posts
  - Revalidar en background
  - _Requirements: 10.3, 10.5_

- [ ] 27.3 Implementar rate limiting
  - Limitar creación de posts (10/hora)
  - Limitar creación de comentarios (30/hora)
  - Retornar error 429
  - _Requirements: 1.1, 3.1_

- [ ] 28. Seguridad adicional
- [ ] 28.1 Implementar sanitización de contenido
  - Instalar DOMPurify
  - Sanitizar contenido de posts
  - Sanitizar contenido de comentarios
  - _Requirements: 1.2, 3.2_

- [ ] 28.2 Configurar Firebase Storage rules
  - Permitir upload solo autenticados
  - Validar path con postId
  - Limitar tamaño de archivos
  - _Requirements: 9.1, 9.2, 9.5_

- [ ] 29. Testing (Opcional)
- [ ]\* 29.1 Tests unitarios de services
  - PostService con mocks
  - CommentService con mocks
  - ReactionService con mocks
  - _Requirements: Todos_

- [ ]\* 29.2 Tests de validación Zod
  - Casos válidos e inválidos
  - Verificar mensajes de error
  - _Requirements: 1.2, 1.3, 3.2, 9.1, 9.2_

- [ ]\* 29.3 Tests de componentes
  - PostCard con diferentes estados
  - PostForm con validaciones
  - CommentList
  - _Requirements: Todos_

- [ ] 30. Documentación
- [ ] 30.1 Crear README del módulo
  - Documentar estructura
  - Documentar API endpoints
  - Ejemplos de uso
  - _Requirements: Todos_

- [ ] 30.2 Agregar comentarios JSDoc
  - Documentar services
  - Documentar componentes principales
  - _Requirements: Todos_

## Notas de Implementación

### MVP (Fase 1) - Funcionalidad Core

El MVP incluye:

- ✅ Crear publicaciones (solo texto)
- ✅ Ver feed de publicaciones con paginación
- ✅ Comentar en publicaciones
- ✅ Reaccionar (like) a publicaciones
- ✅ Editar/eliminar propio contenido
- ✅ Vista detalle de publicación
- ✅ Navegación básica

**NO incluye en MVP:**

- ❌ Imágenes y archivos adjuntos
- ❌ Notificaciones
- ❌ Búsqueda
- ❌ Scroll infinito
- ❌ Moderación avanzada
- ❌ Reacciones en comentarios

### Fase 2 - Características Adicionales

Después de validar el MVP, agregar:

- Upload de imágenes y PDFs
- Sistema de notificaciones completo
- Búsqueda de contenido
- Scroll infinito
- Panel de moderación
- Optimizaciones de rendimiento

### Consideraciones Técnicas

- **organizationId**: Usar valor hardcoded "default-org" por ahora
- **Autenticación**: Obtener userId de Firebase Auth en cada request
- **Permisos**: Verificar autor === userId para editar/eliminar
- **Admin**: Verificar rol en custom claims de Firebase Auth
- **Contadores**: Usar transacciones de Firestore para actualizar commentCount y reactionCount
- **Paginación**: Usar cursor-based pagination con Firestore (startAfter)

### Orden de Implementación Recomendado (MVP)

1. Tareas 1-4: Base (tipos, services)
2. Tareas 5-8: API routes
3. Tareas 9-14: Componentes UI
4. Tareas 15-16: Páginas
5. Tareas 17-18: Configuración final

### Multi-tenancy Futuro

- Campo `organizationId` ya incluido en todos los modelos
- Cambiar hardcoded "default-org" por valor del usuario
- Descomentar validaciones en Firestore Security Rules
- Agregar filtros por organización en queries
