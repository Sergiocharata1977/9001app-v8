# Implementation Plan - SDK Unificado de Módulos

## Overview

Este plan de implementación detalla las tareas necesarias para construir el SDK unificado que consolida todos los módulos del sistema 9001app-firebase con Firebase Admin SDK real. Las tareas están organizadas en orden de dependencia, comenzando con la infraestructura base y progresando hacia la migración de módulos específicos.

## Task List

- [x] 1. Setup Firebase Admin SDK Infrastructure
  - Crear archivo de inicialización de Firebase Admin SDK
  - Configurar variables de entorno necesarias
  - Implementar singleton pattern para instancias
  - Validar credenciales y configuración
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_

- [x] 1.1 Create Firebase Admin initialization module
  - Crear `src/lib/firebase/admin.ts`
  - Implementar `initializeFirebaseAdmin()` con service account credentials
  - Implementar `getAdminAuth()` para Auth instance
  - Implementar `getAdminFirestore()` para Firestore instance
  - Implementar `getAdminStorage()` para Storage instance
  - Agregar manejo de errores y logging
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 1.2 Create configuration validation module
  - Crear `src/lib/firebase/config.ts`
  - Implementar función para validar variables de entorno requeridas
  - Agregar validación de formato de credenciales
  - Implementar función para detectar ambiente (dev/prod)
  - _Requirements: 1.6, 11.1, 11.2, 11.3, 11.6, 11.7, 11.8_

- [x] 1.3 Setup environment variables
  - Crear `.env.example` con todas las variables documentadas
  - Documentar cada variable de entorno
  - Agregar instrucciones para obtener credenciales de Firebase
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 2. Create Base Service and Error Classes
  - Implementar clases de error personalizadas
  - Crear clase abstracta BaseService con CRUD operations
  - Implementar validación y timestamps automáticos
  - Agregar soporte para soft delete y paginación
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 8.1, 8.2_

- [x] 2.1 Implement custom error classes
  - Crear `src/lib/sdk/base/BaseError.ts`
  - Implementar BaseError con statusCode y code
  - Implementar UnauthorizedError (401)
  - Implementar ForbiddenError (403)
  - Implementar NotFoundError (404)
  - Implementar ValidationError (400) con field errors
  - Implementar ConflictError (409)
  - Implementar RateLimitError (429)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 2.2 Create BaseService abstract class
  - Crear `src/lib/sdk/base/BaseService.ts`
  - Definir interface BaseDocument con campos comunes
  - Implementar método `create()` con validation y timestamps
  - Implementar método `getById()` con organization filtering
  - Implementar método `update()` con validation
  - Implementar método `delete()` con soft delete
  - Implementar método `list()` con filters y pagination
  - Agregar soporte para transacciones
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_

- [x] 2.3 Create shared types
  - Crear `src/lib/sdk/base/types.ts`
  - Definir UserContext interface
  - Definir PaginationOptions interface
  - Definir QueryFilters interface
  - Definir ListResponse interface
  - Definir ApiResponse interface
  - _Requirements: 5.1, 5.2_

- [x] 3. Implement Authentication Middleware
  - Crear middleware para verificar tokens de Firebase

  - Extraer información de usuario del token
  - Implementar manejo de errores de autenticación
  - Agregar logging de intentos de autenticación
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

- [x] 3.1 Create authentication middleware
  - Crear `src/lib/sdk/middleware/auth.ts`
  - Implementar `withAuth()` HOF para wrappear handlers
  - Implementar `verifyToken()` usando Firebase Admin Auth
  - Extraer uid, email, role, organizationId, permissions del token
  - Agregar AuthenticatedRequest interface con user context
  - Implementar manejo de errores (no token, token inválido, expirado)
  - Agregar logging de autenticación
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

- [x] 3.2 Create auth helper functions
  - Crear `src/lib/sdk/helpers/auth.ts`

  - Implementar `requireAuth()` helper
  - Implementar `getCurrentUser()` helper
  - Implementar `isAuthenticated()` helper
  - _Requirements: 4.1_

- [x] 4. Implement Permission and Authorization System
  - Crear middleware para verificar roles y permisos
  - Implementar helpers de autorización
  - Agregar funciones para gestionar custom claims
  - Implementar validación de ownership de recursos
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 4.1-4.10_

- [x] 4.1 Create permission middleware
  - Crear `src/lib/sdk/middleware/permissions.ts`
  - Implementar `requireRole()` middleware
  - Implementar `requirePermission()` middleware
  - Implementar `requireOrganization()` middleware
  - Agregar composición de múltiples checks
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 4.2 Create permission helper functions
  - Crear `src/lib/sdk/helpers/permissions.ts`
  - Implementar `hasRole()` helper
  - Implementar `hasPermission()` helper
  - Implementar `isResourceOwner()` helper
  - Implementar `canModifyResource()` helper
  - Implementar `canDeleteResource()` helper
  - Agregar soporte para AND/OR logic
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

- [x] 4.3 Implement custom claims management
  - Crear funciones para set/get custom claims
  - Implementar `setUserRole()` function
  - Implementar `setUserPermissions()` function
  - Implementar `getUserClaims()` function
  - Agregar validación de role transitions
  - Agregar logging de cambios de roles/permisos
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.10_

- [x] 5. Implement Error Handler Middleware
  - Crear middleware para manejo centralizado de errores
  - Formatear respuestas de error consistentemente
  - Implementar logging de errores
  - Sanitizar información sensible
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10_

- [x] 5.1 Create error handler middleware
  - Crear `src/lib/sdk/middleware/errorHandler.ts`
  - Implementar `errorHandler()` function
  - Implementar `withErrorHandler()` HOF
  - Manejar ZodError para validation errors
  - Manejar custom BaseError classes
  - Formatear respuestas con error, code, errors
  - Agregar logging con contexto completo
  - Sanitizar stack traces en producción
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10_

- [x] 6. Implement Validation System with Zod
  - Crear esquemas Zod centralizados
  - Implementar helpers de validación
  - Agregar validación de tipos comunes
  - Integrar con error handling
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_

- [x] 6.1 Create validation helpers
  - Crear `src/lib/sdk/helpers/validation.ts`
  - Implementar `validateCreate()` helper
  - Implementar `validateUpdate()` helper con partial
  - Implementar `validateQuery()` helper
  - Agregar schemas para tipos comunes (dates, emails, URLs)
  - Implementar validación de organizationId
  - Implementar validación de userId references
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_

- [x] 7. Implement Rate Limiting
  - Crear middleware de rate limiting
  - Implementar límites por usuario y por IP
  - Agregar límites específicos para auth endpoints
  - Implementar exponential backoff
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9, 17.10_

- [x] 7.1 Create rate limiting middleware
  - Crear `src/lib/sdk/middleware/rateLimit.ts`
  - Implementar rate limiting per user (100 req/min)
  - Implementar rate limiting per IP (200 req/min)
  - Implementar límites estrictos para auth (10 req/min)
  - Retornar 429 cuando se excede límite
  - Implementar exponential backoff
  - Agregar logging de violaciones
  - Implementar whitelist de IPs
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_

- [x] 8. Implement Logging and Audit System
  - Crear sistema de logging estructurado
  - Implementar logging de operaciones CRUD
  - Agregar logging de autenticación y autorización
  - Implementar audit trail completo
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10_

- [x] 8.1 Create logging utilities
  - Crear `src/lib/sdk/helpers/logging.ts`
  - Implementar structured logging con JSON
  - Implementar diferentes log levels (debug, info, warn, error)
  - Agregar request ID para tracing
  - Implementar sanitización de datos sensibles
  - Agregar logging de auth attempts
  - Agregar logging de authorization checks
  - Agregar logging de CRUD operations
  - Agregar logging de role/permission changes
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_

- [x] 9. Migrate Audit Module to SDK
  - Crear AuditService extendiendo BaseService
  - Implementar generación de números de auditoría
  - Migrar API routes a usar nuevo SDK
  - Actualizar validaciones con Zod
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13, 6.14, 6.15_

- [x] 9.1 Create AuditService
  - Crear `src/lib/sdk/modules/audits/AuditService.ts`
  - Definir Audit interface extendiendo BaseDocument
  - Crear Zod schema para validación
  - Extender BaseService<Audit>
  - Implementar `generateAuditNumber()` method
  - Implementar `updateStatus()` method
  - Implementar `getByNumber()` method
  - Implementar business logic específico
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [x] 9.2 Create Audit types and validations
  - Crear `src/lib/sdk/modules/audits/types.ts`
  - Definir interfaces para Audit, AuditTeamMember
  - Crear `src/lib/sdk/modules/audits/validations.ts`
  - Implementar schemas Zod para create/update
  - _Requirements: 9.1, 9.2_

- [x] 9.3 Migrate Audit API routes
  - Actualizar `src/app/api/audits/route.ts` (GET, POST)
  - Usar withAuth, requireRole, withErrorHandler
  - Reemplazar llamadas directas a Firestore con SDK.audits
  - Actualizar `src/app/api/audits/[id]/route.ts` (GET, PUT, DELETE)
  - Agregar validación de ownership
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ]\* 9.4 Write tests for AuditService
  - Crear tests unitarios para AuditService
  - Mockear Firebase Admin SDK
  - Testear CRUD operations
  - Testear generación de números
  - Testear validaciones
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 10. Migrate Finding Module to SDK
  - Crear FindingService extendiendo BaseService
  - Implementar generación de números de hallazgo
  - Migrar API routes a usar nuevo SDK
  - Implementar relaciones con auditorías
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13, 6.14, 6.15_

- [ ] 10.1 Create FindingService
  - Crear `src/lib/sdk/modules/findings/FindingService.ts`
  - Definir Finding interface extendiendo BaseDocument
  - Crear Zod schema para validación
  - Extender BaseService<Finding>
  - Implementar `generateFindingNumber()` method
  - Implementar `getByAudit()` method
  - Implementar `updateAnalysis()` method
  - Implementar business logic para fases (Detección, Tratamiento, Control)
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 10.2 Create Finding types and validations
  - Crear `src/lib/sdk/modules/findings/types.ts`
  - Definir interfaces para Finding, RootCauseAnalysis
  - Crear `src/lib/sdk/modules/findings/validations.ts`
  - Implementar schemas Zod para create/update
  - _Requirements: 9.1, 9.2_

- [ ] 10.3 Migrate Finding API routes
  - Actualizar `src/app/api/findings/route.ts` (GET, POST)
  - Usar withAuth, requireRole, withErrorHandler
  - Reemplazar llamadas con SDK.findings
  - Actualizar `src/app/api/findings/[id]/route.ts` (GET, PUT, DELETE)
  - Implementar validación de relación con auditoría
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ]\* 10.4 Write tests for FindingService
  - Crear tests unitarios para FindingService
  - Testear CRUD operations
  - Testear generación de números
  - Testear relaciones con auditorías
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 11. Migrate Action Module to SDK
  - Crear ActionService extendiendo BaseService
  - Implementar generación de números de acción
  - Migrar API routes a usar nuevo SDK
  - Implementar relaciones con hallazgos
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13, 6.14, 6.15_

- [ ] 11.1 Create ActionService
  - Crear `src/lib/sdk/modules/actions/ActionService.ts`
  - Definir Action interface extendiendo BaseDocument
  - Crear Zod schema para validación
  - Extender BaseService<Action>
  - Implementar `generateActionNumber()` method
  - Implementar `getByFinding()` method
  - Implementar `updateProgress()` method
  - Implementar `verifyEffectiveness()` method
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 11.2 Create Action types and validations
  - Crear `src/lib/sdk/modules/actions/types.ts`
  - Definir interfaces para Action, ActionPlan, EffectivenessVerification
  - Crear `src/lib/sdk/modules/actions/validations.ts`
  - Implementar schemas Zod para create/update
  - _Requirements: 9.1, 9.2_

- [ ] 11.3 Migrate Action API routes
  - Actualizar `src/app/api/actions/route.ts` (GET, POST)
  - Usar withAuth, requireRole, withErrorHandler
  - Reemplazar llamadas con SDK.actions
  - Actualizar `src/app/api/actions/[id]/route.ts` (GET, PUT, DELETE)
  - Implementar validación de relación con hallazgo
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ]\* 11.4 Write tests for ActionService
  - Crear tests unitarios para ActionService
  - Testear CRUD operations
  - Testear generación de números
  - Testear relaciones con hallazgos
  - Testear verificación de efectividad
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 12. Migrate Document Module to SDK
  - Crear DocumentService extendiendo BaseService
  - Implementar gestión de versiones
  - Migrar API routes a usar nuevo SDK
  - Implementar flujo de aprobación
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13, 6.14, 6.15_

- [ ] 12.1 Create DocumentService
  - Crear `src/lib/sdk/modules/documents/DocumentService.ts`
  - Definir Document interface extendiendo BaseDocument
  - Crear Zod schema para validación
  - Extender BaseService<Document>
  - Implementar `generateDocumentCode()` method
  - Implementar `createVersion()` method
  - Implementar `updateStatus()` method para flujo de aprobación
  - Implementar `getVersionHistory()` method
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 12.2 Create Document types and validations
  - Crear `src/lib/sdk/modules/documents/types.ts`
  - Definir interfaces para Document, DocumentVersion
  - Crear `src/lib/sdk/modules/documents/validations.ts`
  - Implementar schemas Zod para create/update
  - _Requirements: 9.1, 9.2_

- [ ] 12.3 Migrate Document API routes
  - Actualizar `src/app/api/documents/route.ts` (GET, POST)
  - Usar withAuth, requireRole, withErrorHandler
  - Reemplazar llamadas con SDK.documents
  - Actualizar `src/app/api/documents/[id]/route.ts` (GET, PUT, DELETE)
  - Implementar endpoints para versiones y aprobación
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ]\* 12.4 Write tests for DocumentService
  - Crear tests unitarios para DocumentService
  - Testear CRUD operations
  - Testear generación de códigos
  - Testear control de versiones
  - Testear flujo de aprobación
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 13. Migrate NormPoint Module to SDK
  - Crear NormPointService extendiendo BaseService
  - Implementar gestión de relaciones norma-proceso-documento
  - Migrar API routes a usar nuevo SDK
  - Implementar tracking de cumplimiento
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13, 6.14, 6.15_

- [ ] 13.1 Create NormPointService
  - Crear `src/lib/sdk/modules/normPoints/NormPointService.ts`
  - Definir NormPoint interface extendiendo BaseDocument
  - Crear Zod schema para validación
  - Extender BaseService<NormPoint>
  - Implementar `getByChapter()` method
  - Implementar `getByCategory()` method
  - Implementar `getMandatory()` method
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 13.2 Create NormPointRelationService
  - Crear `src/lib/sdk/modules/normPoints/NormPointRelationService.ts`
  - Definir NormPointRelation interface
  - Implementar gestión de relaciones norma-proceso-documento
  - Implementar `updateCompliance()` method
  - Implementar `getComplianceMatrix()` method
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 13.3 Create NormPoint types and validations
  - Crear `src/lib/sdk/modules/normPoints/types.ts`
  - Definir interfaces para NormPoint, NormPointRelation
  - Crear `src/lib/sdk/modules/normPoints/validations.ts`
  - Implementar schemas Zod para create/update
  - _Requirements: 9.1, 9.2_

- [ ] 13.4 Migrate NormPoint API routes
  - Actualizar `src/app/api/norm-points/route.ts` (GET, POST)
  - Usar withAuth, requireRole, withErrorHandler
  - Reemplazar llamadas con SDK.normPoints
  - Actualizar `src/app/api/norm-points/[id]/route.ts` (GET, PUT, DELETE)
  - Migrar endpoints de relaciones y compliance
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ]\* 13.5 Write tests for NormPoint services
  - Crear tests unitarios para NormPointService
  - Crear tests para NormPointRelationService
  - Testear CRUD operations
  - Testear compliance tracking
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 14. Migrate Calendar Module to SDK
  - Crear CalendarService extendiendo BaseService
  - Implementar EventPublisher para integración con módulos
  - Migrar API routes a usar nuevo SDK
  - Implementar exportación iCal
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13, 6.14, 6.15_

- [ ] 14.1 Create CalendarService
  - Crear `src/lib/sdk/modules/calendar/CalendarService.ts`
  - Definir CalendarEvent interface extendiendo BaseDocument
  - Crear Zod schema para validación
  - Extender BaseService<CalendarEvent>
  - Implementar `getByDateRange()` method
  - Implementar `getUpcoming()` method
  - Implementar `getByUser()` method
  - Implementar `getByModule()` method
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 14.2 Create EventPublisher
  - Crear `src/lib/sdk/modules/calendar/EventPublisher.ts`
  - Implementar `publishEvent()` method
  - Implementar `updateEvent()` method
  - Implementar `deleteEvent()` method
  - Agregar validación de source module
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 14.3 Create Calendar types and validations
  - Crear `src/lib/sdk/modules/calendar/types.ts`
  - Definir interfaces para CalendarEvent, EventMetadata
  - Crear `src/lib/sdk/modules/calendar/validations.ts`
  - Implementar schemas Zod para create/update
  - _Requirements: 9.1, 9.2_

- [ ] 14.4 Migrate Calendar API routes
  - Actualizar `src/app/api/calendar/events/route.ts` (GET, POST)
  - Usar withAuth, withErrorHandler
  - Reemplazar llamadas con SDK.calendar
  - Actualizar `src/app/api/calendar/events/[id]/route.ts` (GET, PUT, DELETE)
  - Migrar endpoint de exportación iCal
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ]\* 14.5 Write tests for Calendar services
  - Crear tests unitarios para CalendarService
  - Crear tests para EventPublisher
  - Testear CRUD operations
  - Testear queries por fecha y usuario
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 15. Migrate News Module to SDK
  - Crear PostService, CommentService, ReactionService extendiendo BaseService
  - Migrar API routes a usar nuevo SDK
  - Implementar sistema de notificaciones
  - Mantener funcionalidad de reacciones y comentarios
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13, 6.14, 6.15_

- [ ] 15.1 Create PostService
  - Crear `src/lib/sdk/modules/news/PostService.ts`
  - Definir Post interface extendiendo BaseDocument
  - Crear Zod schema para validación
  - Extender BaseService<Post>
  - Implementar `getFeed()` method con paginación
  - Implementar `getByAuthor()` method
  - Implementar `search()` method
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 15.2 Create CommentService
  - Crear `src/lib/sdk/modules/news/CommentService.ts`
  - Definir Comment interface extendiendo BaseDocument
  - Crear Zod schema para validación
  - Extender BaseService<Comment>
  - Implementar `getByPost()` method
  - Implementar incremento de contador en post
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 15.3 Create ReactionService
  - Crear `src/lib/sdk/modules/news/ReactionService.ts`
  - Definir Reaction interface extendiendo BaseDocument
  - Crear Zod schema para validación
  - Extender BaseService<Reaction>
  - Implementar `toggle()` method
  - Implementar `getByPost()` method
  - Implementar actualización de contadores
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 15.4 Create News types and validations
  - Crear `src/lib/sdk/modules/news/types.ts`
  - Definir interfaces para Post, Comment, Reaction
  - Crear `src/lib/sdk/modules/news/validations.ts`
  - Implementar schemas Zod para create/update
  - _Requirements: 9.1, 9.2_

- [ ] 15.5 Migrate News API routes
  - Actualizar `src/app/api/news/posts/route.ts` (GET, POST)
  - Usar withAuth, withErrorHandler
  - Reemplazar llamadas con SDK.news.posts
  - Actualizar `src/app/api/news/posts/[id]/route.ts` (GET, PUT, DELETE)
  - Migrar endpoints de comments y reactions
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ]\* 15.6 Write tests for News services
  - Crear tests unitarios para PostService
  - Crear tests para CommentService
  - Crear tests para ReactionService
  - Testear CRUD operations
  - Testear contadores y relaciones
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 16. Migrate RRHH Module to SDK
  - Crear PersonnelService, PositionService, TrainingService, EvaluationService
  - Implementar gestión de competencias y departamentos
  - Migrar API routes a usar nuevo SDK
  - Implementar asignación de contexto (procesos, objetivos, indicadores)
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13, 6.14, 6.15_

- [ ] 16.1 Create PersonnelService
  - Crear `src/lib/sdk/modules/rrhh/PersonnelService.ts`
  - Definir Personnel interface extendiendo BaseDocument
  - Crear Zod schema para validación
  - Extender BaseService<Personnel>
  - Implementar `getByPosition()` method
  - Implementar `getByDepartment()` method
  - Implementar `assignContext()` method para procesos/objetivos/indicadores
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 16.2 Create PositionService
  - Crear `src/lib/sdk/modules/rrhh/PositionService.ts`
  - Definir Position interface extendiendo BaseDocument
  - Crear Zod schema para validación
  - Extender BaseService<Position>
  - Implementar `assignContext()` method
  - Implementar `propagateToPersonnel()` method
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 16.3 Create TrainingService and EvaluationService
  - Crear `src/lib/sdk/modules/rrhh/TrainingService.ts`
  - Crear `src/lib/sdk/modules/rrhh/EvaluationService.ts`
  - Definir interfaces extendiendo BaseDocument
  - Crear Zod schemas para validación
  - Extender BaseService para cada uno
  - Implementar métodos específicos de negocio
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 16.4 Create DepartmentService and CompetenceService
  - Crear `src/lib/sdk/modules/rrhh/DepartmentService.ts`
  - Crear `src/lib/sdk/modules/rrhh/CompetenceService.ts`
  - Definir interfaces extendiendo BaseDocument
  - Crear Zod schemas para validación
  - Extender BaseService para cada uno
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 16.5 Create RRHH types and validations
  - Crear `src/lib/sdk/modules/rrhh/types.ts`
  - Definir todas las interfaces de RRHH
  - Crear `src/lib/sdk/modules/rrhh/validations.ts`
  - Implementar schemas Zod para todos los tipos
  - _Requirements: 9.1, 9.2_

- [ ] 16.6 Migrate RRHH API routes
  - Actualizar API routes de personnel, positions, trainings, evaluations
  - Usar withAuth, requireRole, withErrorHandler
  - Reemplazar llamadas con SDK.rrhh.\*
  - Implementar endpoints de asignación de contexto
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ]\* 16.7 Write tests for RRHH services
  - Crear tests unitarios para todos los servicios de RRHH
  - Testear CRUD operations
  - Testear asignación de contexto
  - Testear propagación de contexto
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 17. Migrate Quality Module to SDK
  - Crear QualityObjectiveService, QualityIndicatorService, MeasurementService
  - Implementar cálculo de indicadores
  - Migrar API routes a usar nuevo SDK
  - Implementar tracking de metas y valores actuales
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13, 6.14, 6.15_

- [ ] 17.1 Create QualityObjectiveService
  - Crear `src/lib/sdk/modules/quality/QualityObjectiveService.ts`
  - Definir QualityObjective interface extendiendo BaseDocument
  - Crear Zod schema para validación
  - Extender BaseService<QualityObjective>
  - Implementar `updateProgress()` method
  - Implementar `getByStatus()` method
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 17.2 Create QualityIndicatorService
  - Crear `src/lib/sdk/modules/quality/QualityIndicatorService.ts`
  - Definir QualityIndicator interface extendiendo BaseDocument
  - Crear Zod schema para validación
  - Extender BaseService<QualityIndicator>
  - Implementar `calculateValue()` method
  - Implementar `updateCurrentValue()` method
  - Implementar `getByObjective()` method
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 17.3 Create MeasurementService
  - Crear `src/lib/sdk/modules/quality/MeasurementService.ts`
  - Definir Measurement interface extendiendo BaseDocument
  - Crear Zod schema para validación
  - Extender BaseService<Measurement>
  - Implementar `getByIndicator()` method
  - Implementar `getByDateRange()` method
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 17.4 Create Quality types and validations
  - Crear `src/lib/sdk/modules/quality/types.ts`
  - Definir interfaces para QualityObjective, QualityIndicator, Measurement
  - Crear `src/lib/sdk/modules/quality/validations.ts`
  - Implementar schemas Zod para create/update
  - _Requirements: 9.1, 9.2_

- [ ] 17.5 Migrate Quality API routes
  - Actualizar API routes de objectives, indicators, measurements
  - Usar withAuth, requireRole, withErrorHandler
  - Reemplazar llamadas con SDK.quality.\*
  - Implementar endpoints de cálculo y actualización
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ]\* 17.6 Write tests for Quality services
  - Crear tests unitarios para todos los servicios de Quality
  - Testear CRUD operations
  - Testear cálculos de indicadores
  - Testear tracking de metas
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 18. Migrate Remaining Modules to SDK
  - Migrar ProcessService, PoliticaService, AnalisisFODAService
  - Migrar OrganigramaService, FlujogramaService, ReunionTrabajoService
  - Actualizar API routes de todos los módulos
  - Asegurar consistencia en toda la aplicación
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13, 6.14, 6.15_

- [ ] 18.1 Create ProcessService
  - Crear `src/lib/sdk/modules/processes/ProcessService.ts`
  - Definir Process interface extendiendo BaseDocument
  - Crear Zod schema para validación
  - Extender BaseService<Process>
  - Implementar métodos específicos de negocio
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 18.2 Create PoliticaService
  - Crear `src/lib/sdk/modules/policies/PoliticaService.ts`
  - Definir Politica interface extendiendo BaseDocument
  - Crear Zod schema para validación
  - Extender BaseService<Politica>
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 18.3 Create AnalisisFODAService
  - Crear `src/lib/sdk/modules/foda/AnalisisFODAService.ts`
  - Definir AnalisisFODA interface extendiendo BaseDocument
  - Crear Zod schema para validación
  - Extender BaseService<AnalisisFODA>
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 18.4 Create OrganigramaService and FlujogramaService
  - Crear `src/lib/sdk/modules/organigramas/OrganigramaService.ts`
  - Crear `src/lib/sdk/modules/flujogramas/FlujogramaService.ts`
  - Definir interfaces extendiendo BaseDocument
  - Crear Zod schemas para validación
  - Extender BaseService para cada uno
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 18.5 Create ReunionTrabajoService
  - Crear `src/lib/sdk/modules/reuniones/ReunionTrabajoService.ts`
  - Definir ReunionTrabajo interface extendiendo BaseDocument
  - Crear Zod schema para validación
  - Extender BaseService<ReunionTrabajo>
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 18.6 Migrate remaining API routes
  - Actualizar API routes de processes, policies, foda
  - Actualizar API routes de organigramas, flujogramas, reuniones
  - Usar withAuth, requireRole, withErrorHandler
  - Reemplazar llamadas con SDK.\*
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ]\* 18.7 Write tests for remaining services
  - Crear tests unitarios para todos los servicios restantes
  - Testear CRUD operations
  - Testear business logic específico
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 19. Implement User Context Service for AI
  - Crear UserContextService para Don Cándido
  - Implementar agregación de contexto completo del usuario
  - Implementar caching de contexto
  - Crear API endpoint para IA
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8, 16.9, 16.10, 16.11, 16.12, 16.13, 16.14, 16.15_

- [ ] 19.1 Create UserContextService
  - Crear `src/lib/sdk/modules/context/UserContextService.ts`
  - Implementar `getUserContext(userId)` method
  - Agregar user profile (name, email, role, position)
  - Agregar assigned processes con detalles
  - Agregar assigned quality objectives con status
  - Agregar assigned quality indicators con valores
  - Agregar assigned documents con expiry status
  - Agregar assigned norm points con compliance
  - Agregar pending actions y deadlines
  - Agregar upcoming calendar events
  - Agregar recent activity y notifications
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8, 16.9, 16.10_

- [ ] 19.2 Implement context caching
  - Implementar cache con TTL de 5 minutos
  - Implementar `invalidateUserContext()` method
  - Agregar context metadata (last updated, completeness)
  - _Requirements: 16.11, 16.12, 16.14_

- [ ] 19.3 Create AI context API endpoint
  - Crear `src/app/api/ai/user-context/route.ts`
  - Usar withAuth middleware
  - Retornar contexto formateado para IA (structured JSON)
  - Implementar soporte para partial context loading
  - _Requirements: 16.13, 16.15_

- [ ] 20. Implement Transaction Support
  - Agregar soporte para transacciones en BaseService
  - Implementar transaction wrapper
  - Agregar retry logic para conflictos
  - Implementar logging de transacciones
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8, 18.9, 18.10_

- [ ] 20.1 Add transaction support to BaseService
  - Agregar método `withTransaction()` a BaseService
  - Implementar atomic updates across múltiples documentos
  - Implementar automatic rollback on error
  - Agregar validación antes de commit
  - Implementar retry logic para transaction conflicts
  - Agregar timeout de 30 segundos
  - Implementar logging de todas las operaciones
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8, 18.9_

- [ ] 21. Implement Notification System
  - Crear NotificationService
  - Implementar event emitter para system events
  - Implementar envío de emails
  - Implementar notificaciones in-app
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8, 19.9, 19.10_

- [ ] 21.1 Create NotificationService
  - Crear `src/lib/sdk/modules/notifications/NotificationService.ts`
  - Implementar event emitter para system events
  - Emitir eventos para: create, update, delete operations
  - Emitir eventos para: authentication, authorization changes
  - Emitir eventos para: deadline approaching, document expiry
  - Implementar subscription a event types específicos
  - Implementar filtering por organizationId
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

- [ ] 21.2 Implement email notifications
  - Implementar `sendEmail()` method
  - Integrar con servicio de email (SendGrid, AWS SES)
  - Implementar templates de email
  - Implementar batching para evitar spam
  - _Requirements: 19.7, 19.10_

- [ ] 21.3 Implement in-app notifications
  - Implementar `createNotification()` method
  - Crear colección de notifications en Firestore
  - Implementar `getNotifications()` method
  - Implementar `markAsRead()` method
  - Implementar notification preferences per user
  - _Requirements: 19.8, 19.9_

- [ ] 22. Implement Data Export/Import
  - Crear ExportService e ImportService
  - Implementar exportación en múltiples formatos
  - Implementar importación con validación
  - Agregar dry-run mode
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8, 20.9, 20.10_

- [ ] 22.1 Create ExportService
  - Crear `src/lib/sdk/modules/export/ExportService.ts`
  - Implementar `exportData()` method para todos los módulos
  - Soportar formatos: JSON, CSV, Excel
  - Incluir metadata (version, timestamp, organizationId)
  - Validar data integrity antes de export
  - Implementar filtering (date range, module, etc.)
  - Comprimir exports grandes automáticamente
  - Agregar logging de operaciones
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.9, 20.10_

- [ ] 22.2 Create ImportService
  - Crear `src/lib/sdk/modules/import/ImportService.ts`
  - Implementar `importData()` method con validación
  - Soportar incremental imports (update existing, add new)
  - Implementar dry-run mode
  - Agregar logging de operaciones
  - _Requirements: 20.5, 20.6, 20.7, 20.8_

- [ ] 23. Implement Monitoring and Metrics
  - Crear MetricsService
  - Implementar tracking de requests y performance
  - Crear dashboard de métricas
  - Implementar alertas de anomalías
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7, 21.8, 21.9, 21.10_

- [ ] 23.1 Create MetricsService
  - Crear `src/lib/sdk/modules/metrics/MetricsService.ts`
  - Implementar tracking de request count per endpoint
  - Implementar tracking de average response time
  - Implementar tracking de error rate
  - Implementar tracking de authentication success/failure
  - Implementar tracking de active users per organization
  - Implementar tracking de storage usage
  - Implementar tracking de database operations
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7_

- [ ] 23.2 Create metrics dashboard
  - Crear página de dashboard de métricas
  - Mostrar gráficos de uso y performance
  - Implementar exportación a monitoring tools
  - _Requirements: 21.8, 21.9_

- [ ] 23.3 Implement anomaly alerts
  - Implementar detección de anomalías (spike in errors, slow responses)
  - Implementar sistema de alertas
  - _Requirements: 21.10_

- [ ] 24. Implement Multi-Tenant Features
  - Agregar enforcement de organizationId en queries
  - Implementar organization management
  - Implementar quotas por organización
  - Agregar logging de cross-organization access attempts
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8, 22.9, 22.10_

- [ ] 24.1 Enforce organization isolation
  - Validar organizationId en todas las queries de BaseService
  - Validar user belongs to organization antes de operations
  - Prevenir cross-organization data access
  - Agregar logging de access attempts
  - _Requirements: 22.1, 22.2, 22.3, 22.8_

- [ ] 24.2 Create OrganizationService
  - Crear `src/lib/sdk/modules/organizations/OrganizationService.ts`
  - Implementar organization management functions
  - Implementar organization-level configuration
  - Implementar organization-level quotas
  - Implementar suspension/activation
  - Implementar usage reports
  - Implementar data export para GDPR compliance
  - _Requirements: 22.4, 22.5, 22.6, 22.7, 22.9, 22.10_

- [ ] 25. Create SDK Main Export and Documentation
  - Crear export principal del SDK
  - Integrar todos los servicios
  - Escribir documentación completa
  - Crear ejemplos de uso
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13, 6.14, 6.15, 13.1-13.10_

- [ ] 25.1 Create SDK main export
  - Crear `src/lib/sdk/index.ts`
  - Exportar todos los servicios en objeto SDK
  - Exportar middleware (withAuth, requireRole, etc.)
  - Exportar helpers (auth, permissions, validation)
  - Exportar error classes
  - Exportar types
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13, 6.14, 6.15_

- [ ] 25.2 Write SDK documentation
  - Crear `src/lib/sdk/README.md`
  - Escribir overview y quick start guide
  - Documentar API de todos los servicios
  - Documentar authentication y authorization patterns
  - Documentar error handling patterns
  - Documentar testing patterns
  - Agregar JSDoc comments para IDE autocomplete
  - _Requirements: 13.1, 13.2, 13.3, 13.5, 13.6, 13.7, 13.8, 13.9_

- [ ] 25.3 Create usage examples
  - Crear ejemplos para common use cases
  - Crear migration guide desde implementación actual
  - Crear troubleshooting guide
  - _Requirements: 13.3, 13.4, 13.10_

- [ ] 26. Setup Firestore Indexes
  - Crear archivo firestore.indexes.json
  - Definir índices para todas las queries comunes
  - Desplegar índices a Firebase
  - Validar performance de queries
  - _Requirements: 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

- [ ] 26.1 Define Firestore indexes
  - Actualizar `firestore.indexes.json`
  - Agregar índices para audits (organizationId + status + scheduledDate)
  - Agregar índices para findings (organizationId + severity + createdAt)
  - Agregar índices para actions (organizationId + status + deadline)
  - Agregar índices para documents (organizationId + type + status)
  - Agregar índices para calendar events (organizationId + date + type)
  - Agregar índices para todos los módulos
  - _Requirements: 14.2, 14.3, 14.4, 14.5_

- [ ] 26.2 Deploy indexes to Firebase
  - Ejecutar `firebase deploy --only firestore:indexes`
  - Validar que todos los índices se crearon correctamente
  - Monitorear performance de queries
  - _Requirements: 14.6, 14.7_

- [ ] 27. Performance Optimization
  - Implementar caching strategy
  - Optimizar database queries
  - Implementar batch operations
  - Agregar monitoring de performance
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 14.10_

- [ ] 27.1 Implement caching
  - Implementar cache de Firebase Admin instances (singleton)
  - Implementar cache de user context (5 min TTL)
  - Implementar cache de query results con Redis
  - Implementar cache de static data (norm points, departments)
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [ ] 27.2 Optimize database operations
  - Implementar batch operations para múltiples updates
  - Implementar cursor-based pagination
  - Implementar lazy loading de related entities
  - Implementar query limits
  - _Requirements: 14.3, 14.6, 14.7, 14.8_

- [ ] 27.3 Optimize API responses
  - Implementar response compression (gzip)
  - Minimizar payload size
  - Usar Promise.all para parallel requests
  - _Requirements: 14.9, 14.10_

- [ ] 28. Integration Testing and Validation
  - Validar que el código compila sin errores
  - Probar autenticación end-to-end
  - Validar API routes con Postman/Thunder Client
  - Verificar que no hay errores de TypeScript
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

- [ ] 28.1 Validate Firebase Admin SDK initialization
  - Ejecutar `npm run build` para verificar compilación
  - Crear script de test para inicializar Firebase Admin
  - Verificar que las credenciales se cargan correctamente
  - Probar conexión a Firestore y Auth
  - Verificar logs de inicialización
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 28.2 Test authentication middleware
  - Crear request de prueba con token válido
  - Probar endpoint protegido con withAuth
  - Verificar que token inválido retorna 401
  - Verificar que sin token retorna 401
  - Verificar que user context se extrae correctamente
  - Usar Thunder Client o Postman para probar
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 28.3 Test permission middleware
  - Probar requireRole con diferentes roles
  - Verificar que rol incorrecto retorna 403
  - Probar requirePermission con diferentes permisos
  - Verificar que permission incorrecta retorna 403
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 28.4 Validate BaseService CRUD operations
  - Crear test service simple extendiendo BaseService
  - Probar create() con datos válidos
  - Probar getById() con ID existente y no existente
  - Probar update() con datos válidos
  - Probar delete() (soft delete)
  - Probar list() con filtros y paginación
  - Verificar que timestamps se agregan automáticamente
  - Verificar que organizationId se filtra correctamente
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ] 28.5 Test error handling
  - Provocar ValidationError y verificar respuesta 400
  - Provocar NotFoundError y verificar respuesta 404
  - Provocar ForbiddenError y verificar respuesta 403
  - Verificar que ZodError se formatea correctamente
  - Verificar que errores incluyen field-specific messages
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 28.6 Validate Audit module integration
  - Probar POST /api/audits para crear auditoría
  - Verificar que auditNumber se genera correctamente
  - Probar GET /api/audits para listar auditorías
  - Probar GET /api/audits/[id] para obtener una auditoría
  - Probar PUT /api/audits/[id] para actualizar
  - Probar DELETE /api/audits/[id] (solo con rol gerente)
  - Verificar que validaciones Zod funcionan
  - Verificar que organizationId se filtra correctamente
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3_

- [ ] 28.7 Run TypeScript type checking
  - Ejecutar `npm run type-check` o `tsc --noEmit`
  - Corregir todos los errores de tipos
  - Verificar que no hay errores de importación
  - Verificar que interfaces están correctamente definidas
  - _Requirements: General code quality_

- [ ] 28.8 Run linting
  - Ejecutar `npm run lint`
  - Corregir todos los warnings y errors de ESLint
  - Verificar que código sigue estándares del proyecto
  - _Requirements: General code quality_

- [ ] 28.9 Test with Firebase Emulator (optional but recommended)
  - Iniciar Firebase Emulator Suite
  - Configurar proyecto para usar emulators
  - Probar operaciones CRUD contra emulator
  - Verificar que transacciones funcionan correctamente
  - _Requirements: 12.6, 14.1, 14.2_

- [ ] 28.10 Create manual testing checklist
  - Documentar casos de prueba manuales
  - Crear colección de Postman/Thunder Client con requests de ejemplo
  - Documentar tokens de prueba y usuarios de test
  - Crear guía de testing para otros desarrolladores
  - _Requirements: 13.1, 13.2, 13.3_

- [ ] 29. Validate Each Module After Migration
  - Después de migrar cada módulo, validar funcionamiento
  - Probar API endpoints del módulo
  - Verificar que no hay regresiones
  - Validar integración con otros módulos
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 29.1 Validate Finding module after migration
  - Probar CRUD operations de findings
  - Verificar relación con auditorías
  - Probar generación de findingNumber
  - Verificar que contadores se actualizan en auditoría
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 29.2 Validate Action module after migration
  - Probar CRUD operations de actions
  - Verificar relación con findings
  - Probar generación de actionNumber
  - Verificar que contadores se actualizan en finding
  - Probar verificación de efectividad
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 29.3 Validate Document module after migration
  - Probar CRUD operations de documents
  - Verificar generación de documentCode
  - Probar control de versiones
  - Probar flujo de aprobación (borrador → revisión → aprobado → publicado)
  - Verificar que file uploads funcionan
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 29.4 Validate NormPoint module after migration
  - Probar CRUD operations de norm points
  - Probar gestión de relaciones norma-proceso-documento
  - Verificar tracking de cumplimiento
  - Probar matriz de cumplimiento
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 29.5 Validate Calendar module after migration
  - Probar CRUD operations de calendar events
  - Verificar queries por fecha y usuario
  - Probar EventPublisher para integración con módulos
  - Verificar exportación iCal
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 29.6 Validate News module after migration
  - Probar CRUD operations de posts
  - Probar CRUD operations de comments
  - Probar toggle de reactions
  - Verificar que contadores se actualizan correctamente
  - Probar feed con paginación
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 29.7 Validate RRHH module after migration
  - Probar CRUD operations de personnel
  - Probar CRUD operations de positions
  - Probar asignación de contexto (procesos, objetivos, indicadores)
  - Probar propagación de contexto de position a personnel
  - Probar trainings y evaluations
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 29.8 Validate Quality module after migration
  - Probar CRUD operations de quality objectives
  - Probar CRUD operations de quality indicators
  - Probar cálculo de valores de indicadores
  - Probar measurements y tracking
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 29.9 Validate remaining modules after migration
  - Probar CRUD operations de processes
  - Probar CRUD operations de policies
  - Probar CRUD operations de FODA
  - Probar CRUD operations de organigramas y flujogramas
  - Probar CRUD operations de reuniones
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 30. End-to-End Integration Testing
  - Probar flujos completos de usuario
  - Validar integración entre módulos
  - Verificar performance general
  - Validar que no hay memory leaks
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 30.1 Test complete audit workflow
  - Crear auditoría
  - Agregar hallazgos a la auditoría
  - Crear acciones desde hallazgos
  - Verificar trazabilidad completa (auditoría → hallazgo → acción)
  - Verificar que contadores se actualizan en cascada
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 30.2 Test document approval workflow
  - Crear documento en estado borrador
  - Cambiar a en_revision
  - Aprobar documento
  - Publicar documento
  - Crear nueva versión
  - Verificar historial de versiones
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 30.3 Test calendar integration with modules
  - Crear auditoría y verificar evento en calendario
  - Crear documento con fecha de vencimiento y verificar evento
  - Crear acción con deadline y verificar evento
  - Modificar fechas y verificar actualización en calendario
  - Eliminar entidad y verificar eliminación de evento
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 30.4 Test user context for AI
  - Obtener contexto completo de usuario
  - Verificar que incluye todos los datos necesarios
  - Verificar que cache funciona correctamente
  - Probar invalidación de cache
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ] 30.5 Performance testing
  - Probar con dataset grande (1000+ documentos)
  - Medir tiempos de respuesta de endpoints
  - Verificar que paginación funciona correctamente
  - Identificar y optimizar queries lentas
  - Verificar que índices de Firestore están siendo usados
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 31. Final Validation and Cleanup
  - Revisar todo el código implementado
  - Eliminar código comentado y console.logs
  - Actualizar documentación
  - Crear guía de deployment
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 31.1 Code review and cleanup
  - Revisar todos los archivos creados
  - Eliminar imports no usados
  - Eliminar código comentado
  - Eliminar console.logs de debug
  - Verificar que todos los TODOs están resueltos
  - _Requirements: General code quality_

- [ ] 31.2 Update documentation
  - Actualizar README principal del proyecto
  - Actualizar SDK README con ejemplos finales
  - Documentar cambios en CHANGELOG
  - Actualizar guías de contribución
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 31.3 Create deployment guide
  - Documentar pasos de deployment
  - Documentar configuración de variables de entorno
  - Documentar deployment de índices de Firestore
  - Crear checklist de pre-deployment
  - _Requirements: 13.4, 13.5_

- [ ] 31.4 Final smoke tests
  - Ejecutar todos los tests
  - Probar en ambiente de staging
  - Verificar que no hay errores en consola
  - Verificar que no hay warnings de TypeScript
  - Verificar que build de producción funciona
  - _Requirements: General validation_

## Notes

- **Testing Strategy**: Las tareas marcadas con `*` son opcionales (tests unitarios automatizados), pero las tareas de validación manual (28.x, 29.x, 30.x) son REQUERIDAS para asegurar que el código funciona correctamente.

- **Incremental Validation**: Después de implementar cada grupo de tareas (1-8 para infraestructura, 9-11 para primeros módulos, etc.), se debe ejecutar las tareas de validación correspondientes antes de continuar.

- **TypeScript Checking**: Ejecutar `npm run type-check` frecuentemente durante el desarrollo para detectar errores de tipos temprano.

- **Firebase Emulator**: Altamente recomendado usar Firebase Emulator Suite para testing local sin afectar datos de producción.

- **Manual Testing**: Crear colección de Postman/Thunder Client con requests de ejemplo para cada endpoint facilita el testing manual.

- **Performance**: Monitorear performance desde el inicio, especialmente queries a Firestore. Usar Firebase Console para ver queries y crear índices necesarios.
