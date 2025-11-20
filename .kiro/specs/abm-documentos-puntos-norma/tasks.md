# Implementation Plan - ABM Documentos y Puntos de la Norma

## Tasks

- [x] 1. Crear tipos y validaciones base
  - Crear `src/types/documents.ts` con interfaces Document, DocumentVersion, DocumentFilters, DocumentStats
  - Crear `src/types/normPoints.ts` con interfaces NormPoint, NormPointRelation, ComplianceStats, ComplianceMatrix
  - Crear `src/lib/validations/documents.ts` con schemas Zod para Document
  - Crear `src/lib/validations/normPoints.ts` con schemas Zod para NormPoint y NormPointRelation
  - _Requirements: 1.1-1.10, 7.1-7.10, 19.1-19.10_

- [x] 2. Implementar DocumentService
  - Crear `src/services/documents/DocumentService.ts` con métodos CRUD básicos
  - Implementar getAll, getById, getPaginated con filtros
  - Implementar create con generación automática de código
  - Implementar update y delete (soft delete con is_archived)
  - _Requirements: 1.1-1.10, 15.1-15.10_

- [x] 2.1 Implementar gestión de estados en DocumentService
  - Implementar changeStatus con validación de transiciones
  - Implementar approve, publish, markObsolete
  - Validar transiciones de estado (borrador→revisión→aprobado→publicado)
  - _Requirements: 2.1-2.9_

- [x] 2.2 Implementar control de versiones en DocumentService
  - Implementar createVersion que copia documento a documentVersions
  - Implementar getVersionHistory, getVersion
  - Implementar restoreVersion que crea nueva versión con contenido anterior
  - _Requirements: 3.1-3.8_

- [x] 2.3 Implementar gestión de archivos en DocumentService
  - Implementar uploadFile con Firebase Storage
  - Validar tipo MIME y tamaño máximo (10MB)
  - Implementar downloadFile con incremento de download_count
  - Implementar deleteFile que elimina de Storage
  - _Requirements: 4.1-4.9_

- [x] 2.4 Implementar búsqueda y estadísticas en DocumentService
  - Implementar search por texto en título, descripción, keywords
  - Implementar getByType, getByStatus, getByProcess
  - Implementar getStats con métricas agregadas
  - Implementar getExpiringSoon, getExpired, getMostDownloaded
  - _Requirements: 5.1-5.10, 6.1-6.9_

- [x] 3. Implementar NormPointService
  - Crear `src/services/normPoints/NormPointService.ts` con CRUD básico
  - Implementar getAll, getById, getPaginated con filtros
  - Implementar create, update, delete
  - Implementar getByChapter, getByCategory, getByType, getMandatory
  - _Requirements: 7.1-7.10, 16.1-16.10_

- [x] 4. Implementar NormPointRelationService
  - Crear `src/services/normPoints/NormPointRelationService.ts` con CRUD
  - Implementar create, update, delete de relaciones
  - Implementar getByNormPoint, getByProcess, getByStatus

  - _Requirements: 8.1-8.10_

- [x] 4.1 Implementar tracking de cumplimiento en NormPointRelationService
  - Implementar updateCompliance con validación de porcentaje 0-100
  - Implementar addEvidence con upload de archivos a Storage
  - Implementar removeEvidence con eliminación de Storage
  - _Requirements: 11.1-11.9_

- [x] 4.2 Implementar dashboard y estadísticas en NormPointRelationService
  - Implementar getComplianceStats con cálculo de porcentajes globales y por capítulo
  - Implementar getComplianceMatrix que cruza norm_points con processes
  - Implementar getUpcomingReviews filtrando por next_review_date
  - Implementar getDashboardData que agrega stats, matrix, reviews, mandatory pending
  - _Requirements: 9.1-9.10, 10.1-10.10_

- [x] 5. Crear APIs REST para Documents
  - Crear `src/app/api/documents/route.ts` con GET (list) y POST (create)
  - Crear `src/app/api/documents/[id]/route.ts` con GET, PUT, DELETE
  - Crear `src/app/api/documents/[id]/status/route.ts` con PATCH
  - Crear `src/app/api/documents/[id]/version/route.ts` con POST y GET
  - Crear `src/app/api/documents/[id]/file/route.ts` con POST, GET, DELETE
  - Crear `src/app/api/documents/stats/route.ts` con GET
  - Validar con Zod en todos los endpoints
  - Implementar manejo de errores y códigos HTTP apropiados
  - _Requirements: 15.1-15.10_

- [x] 6. Crear APIs REST para Norm Points
  - Crear `src/app/api/norm-points/route.ts` con GET y POST
  - Crear `src/app/api/norm-points/[id]/route.ts` con GET, PUT, DELETE
  - Crear `src/app/api/norm-points/chapter/[chapter]/route.ts` con GET
  - Crear `src/app/api/norm-points/mandatory/route.ts` con GET
  - Crear `src/app/api/norm-points/stats/route.ts` con GET
  - Validar con Zod en todos los endpoints
  - _Requirements: 16.1-16.10_

- [ ] 7. Crear APIs REST para Norm Point Relations
  - Crear `src/app/api/norm-point-relations/route.ts` con GET y POST
  - Crear `src/app/api/norm-point-relations/[id]/route.ts` con GET, PUT, DELETE
  - Crear `src/app/api/norm-point-relations/[id]/compliance/route.ts` con PATCH
  - Crear `src/app/api/norm-point-relations/[id]/evidence/route.ts` con POST y DELETE
  - Crear `src/app/api/norm-point-relations/dashboard/route.ts` con GET
  - Crear `src/app/api/norm-point-relations/matrix/route.ts` con GET
  - Validar con Zod en todos los endpoints
  - _Requirements: 16.9-16.10_

- [x] 8. Crear página de Documentos
  - Crear `src/app/(dashboard)/documentos/page.tsx` con tabs Dashboard y Gestión
  - Implementar DocumentsDashboard con cards de métricas (total, por estado, por tipo)
  - Implementar DocumentsList con tabla, filtros y búsqueda
  - Implementar DocumentForm modal para crear/editar
  - Implementar acciones: ver, editar, eliminar, descargar, cambiar estado
  - _Requirements: 17.1-17.10_

- [x] 9. Crear página de Puntos de Norma
  - Crear `src/app/(dashboard)/puntos-norma/page.tsx` con tabs Dashboard, Gestión, Matriz
  - Implementar ComplianceDashboard con cumplimiento global y por capítulo
  - Implementar NormPointsList con filtros por tipo, capítulo, prioridad
  - Implementar NormPointForm modal para crear/editar puntos
  - Implementar ComplianceMatrix con grid coloreado por estado
  - _Requirements: 18.1-18.10_

- [ ] 10. Extender Personnel y UserContext para Don Cándido
  - Agregar campos `documentos_asignados` y `puntos_norma_asignados` a Personnel type
  - Extender PersonnelService con métodos assignDocuments y assignNormPoints
  - Agregar campos a UserContext: documentos, puntos_norma, documentos_proximos_vencer, puntos_norma_pendientes
  - Extender UserContextService.getUserFullContext para fetch documentos y puntos de norma
  - _Requirements: 23.1-23.9, 24.1-24.9_

- [ ] 11. Integrar con Don Cándido
  - Extender prompts en `src/lib/claude/prompts.ts` para incluir documentos y puntos de norma
  - Actualizar buildUserContextPrompt para incluir documentos asignados con estado
  - Incluir puntos de norma con porcentaje de cumplimiento
  - Incluir documentos próximos a vencer y puntos obligatorios pendientes
  - Implementar consultas específicas sobre documentos y cumplimiento normativo
  - _Requirements: 25.1-25.9, 26.1-26.9, 27.1-27.9_

- [x] 12. Configurar índices de Firestore
  - Agregar índices compuestos en `firestore.indexes.json`
  - Índice: documents (status + created_at DESC)
  - Índice: documents (type + created_at DESC)
  - Índice: documents (responsible_user_id + review_date)
  - Índice: normPoints (tipo_norma + chapter)
  - Índice: normPoints (is_mandatory + priority)
  - Índice: normPointRelations (process_id + compliance_status)
  - Índice: normPointRelations (norm_point_id + compliance_percentage)
  - _Requirements: 20.1-20.10_

- [ ] 13. Implementar seguridad y permisos
  - Validar autenticación en todas las APIs con Firebase Auth
  - Implementar verificación de roles para crear/editar/eliminar documentos
  - Verificar que usuario es responsable o gerente para editar documentos
  - Verificar rol gerente para aprobar documentos
  - Implementar control de acceso en APIs de norm points y relations
  - _Requirements: 21.1-21.10_

- [ ]\* 14. Crear datos de prueba
  - Crear script de seed para puntos de norma ISO 9001:2015 (capítulos 4-10)
  - Crear ejemplos de documentos por tipo (manual, procedimiento, instrucción, etc.)
  - Crear relaciones de ejemplo entre norma-proceso-documento
  - Incluir descripciones y requisitos reales de ISO 9001
  - _Requirements: 22.1-22.10_

- [ ] 15. Extender vista de Procesos
  - Modificar `src/app/(dashboard)/dashboard/procesos/[id]/page.tsx`
  - Agregar sección "Documentos Relacionados" que muestre documento principal y otros documentos
  - Agregar sección "Puntos de Norma" que muestre puntos relacionados con estado de cumplimiento
  - Permitir navegar a detalle de documento o punto de norma
  - _Requirements: 14.1-14.10_

- [ ] 16. Implementar sistema de alertas y notificaciones
  - Crear función para detectar documentos próximos a vencer (30 días)
  - Crear función para detectar documentos vencidos
  - Crear función para detectar puntos obligatorios pendientes
  - Implementar notificaciones en dashboard para responsables
  - Mostrar alertas visuales en UI (badges, colores)
  - _Requirements: 12.1-12.9_

- [ ] 17. Implementar generación de reportes
  - Crear función para generar reporte de cumplimiento por capítulo
  - Incluir lista de documentos asociados a cada punto
  - Incluir evidencias de cumplimiento
  - Permitir exportar a PDF con formato profesional
  - Permitir exportar matriz de cumplimiento a Excel
  - _Requirements: 13.1-13.10_
