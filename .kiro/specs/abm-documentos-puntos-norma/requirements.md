# Requirements Document - ABM Documentos y Puntos de la Norma ISO 9001

## Introduction

Este documento define los requisitos para implementar dos módulos ABM (Alta, Baja, Modificación) completos en el sistema 9001app-firebase:

1. **ABM Documentos** - Sistema de gestión documental para el sistema de calidad ISO 9001:2015
2. **ABM Puntos de la Norma** - Sistema de gestión y seguimiento de puntos de control de la norma ISO 9001:2015

Estos módulos permitirán a las organizaciones gestionar su documentación de calidad, controlar versiones, establecer flujos de aprobación, y vincular documentos con los requisitos específicos de la norma ISO 9001:2015. Además, facilitarán el seguimiento del cumplimiento normativo mediante matrices de cumplimiento y dashboards de auditoría.

El sistema se integrará con los módulos existentes de RRHH, Procesos y Objetivos de Calidad, manteniendo la consistencia arquitectónica del proyecto Firebase.

## Requirements

### Requirement 1: Modelo de Datos de Documentos

**User Story:** Como gestor de calidad, quiero un sistema robusto de gestión documental con todos los metadatos necesarios, para mantener organizada la documentación del sistema de calidad.

#### Acceptance Criteria

1. WHEN se crea un documento THEN el sistema SHALL generar un código único automático basado en el tipo y secuencia
2. WHEN se crea un documento THEN el sistema SHALL requerir título, tipo, categoría, responsable y organización
3. WHEN se crea un documento THEN el sistema SHALL permitir tipos: manual, procedimiento, instrucción, formato, registro, política, otro
4. WHEN se crea un documento THEN el sistema SHALL asignar estado inicial 'borrador'
5. WHEN se crea un documento THEN el sistema SHALL inicializar versión en '1.0'
6. WHEN se guarda un documento THEN el sistema SHALL validar que el responsible_user_id existe en la colección users
7. WHEN se guarda un documento THEN el sistema SHALL permitir asociar el documento con una cláusula ISO específica
8. WHEN se guarda un documento THEN el sistema SHALL permitir asociar el documento con un proceso específico
9. WHEN se guarda un documento THEN el sistema SHALL registrar created_by, created_at, updated_by y updated_at
10. WHEN se consulta un documento THEN el sistema SHALL retornar todos los metadatos incluyendo contador de descargas

### Requirement 2: Gestión de Estados y Flujo de Aprobación de Documentos

**User Story:** Como responsable de calidad, quiero controlar el ciclo de vida de los documentos mediante estados y flujos de aprobación, para asegurar que solo documentos validados estén disponibles.

#### Acceptance Criteria

1. WHEN un documento está en estado 'borrador' THEN el sistema SHALL permitir edición completa por el creador
2. WHEN se cambia un documento a 'en_revision' THEN el sistema SHALL notificar al responsable asignado
3. WHEN se aprueba un documento THEN el sistema SHALL cambiar estado a 'aprobado' y registrar approved_by y approved_at
4. WHEN se publica un documento THEN el sistema SHALL cambiar estado a 'publicado' y establecer effective_date
5. WHEN se marca un documento como obsoleto THEN el sistema SHALL cambiar estado a 'obsoleto' y mantener el historial
6. WHEN se archiva un documento THEN el sistema SHALL cambiar is_archived a true sin eliminar el registro
7. WHEN se cambia el estado THEN el sistema SHALL validar las transiciones permitidas (borrador→revisión→aprobado→publicado)
8. WHEN se intenta una transición inválida THEN el sistema SHALL retornar un error descriptivo
9. WHEN se aprueba un documento THEN el sistema SHALL establecer review_date basado en la política de revisión

### Requirement 3: Control de Versiones de Documentos

**User Story:** Como auditor de calidad, quiero mantener un historial completo de versiones de cada documento, para rastrear cambios y cumplir con requisitos de auditoría.

#### Acceptance Criteria

1. WHEN se crea una nueva versión THEN el sistema SHALL incrementar el número de versión automáticamente
2. WHEN se crea una nueva versión THEN el sistema SHALL copiar el documento actual a una colección de historial
3. WHEN se crea una nueva versión THEN el sistema SHALL registrar el motivo del cambio y quién lo realizó
4. WHEN se consulta el historial THEN el sistema SHALL retornar todas las versiones ordenadas por fecha descendente
5. WHEN se visualiza una versión anterior THEN el sistema SHALL mostrarla en modo solo lectura
6. WHEN se comparan versiones THEN el sistema SHALL resaltar las diferencias entre ellas
7. WHEN se restaura una versión anterior THEN el sistema SHALL crear una nueva versión con el contenido restaurado
8. WHEN se elimina un documento THEN el sistema SHALL mantener todas las versiones en el historial

### Requirement 4: Gestión de Archivos y Contenido

**User Story:** Como usuario del sistema, quiero subir, descargar y previsualizar archivos de documentos, para acceder fácilmente a la documentación necesaria.

#### Acceptance Criteria

1. WHEN se sube un archivo THEN el sistema SHALL validar el tipo MIME permitido (PDF, Word, Excel, imágenes)
2. WHEN se sube un archivo THEN el sistema SHALL validar que el tamaño no exceda 10MB
3. WHEN se sube un archivo THEN el sistema SHALL almacenar el archivo en Firebase Storage
4. WHEN se sube un archivo THEN el sistema SHALL guardar file_path, file_size y mime_type en el documento
5. WHEN se descarga un archivo THEN el sistema SHALL incrementar el contador download_count
6. WHEN se descarga un archivo THEN el sistema SHALL registrar la descarga en un log de auditoría
7. WHEN se visualiza un PDF THEN el sistema SHALL mostrar un preview inline sin descargar
8. WHEN se elimina un documento THEN el sistema SHALL eliminar también el archivo de Storage
9. WHEN se reemplaza un archivo THEN el sistema SHALL eliminar el archivo anterior de Storage

### Requirement 5: Búsqueda y Filtrado de Documentos

**User Story:** Como usuario del sistema, quiero buscar y filtrar documentos por múltiples criterios, para encontrar rápidamente la documentación que necesito.

#### Acceptance Criteria

1. WHEN se busca por texto THEN el sistema SHALL buscar en título, descripción y keywords
2. WHEN se filtra por tipo THEN el sistema SHALL retornar solo documentos del tipo seleccionado
3. WHEN se filtra por estado THEN el sistema SHALL retornar solo documentos en el estado seleccionado
4. WHEN se filtra por categoría THEN el sistema SHALL retornar solo documentos de la categoría seleccionada
5. WHEN se filtra por responsable THEN el sistema SHALL retornar solo documentos del responsable seleccionado
6. WHEN se filtra por cláusula ISO THEN el sistema SHALL retornar documentos asociados a esa cláusula
7. WHEN se filtra por proceso THEN el sistema SHALL retornar documentos asociados a ese proceso
8. WHEN se aplican múltiples filtros THEN el sistema SHALL combinarlos con operador AND
9. WHEN se ordena la lista THEN el sistema SHALL permitir ordenar por fecha, título, código o descargas
10. WHEN se pagina la lista THEN el sistema SHALL retornar 20 documentos por página por defecto

### Requirement 6: Dashboard y Estadísticas de Documentos

**User Story:** Como gestor de calidad, quiero visualizar métricas y estadísticas sobre la documentación, para monitorear el estado del sistema documental.

#### Acceptance Criteria

1. WHEN se accede al dashboard THEN el sistema SHALL mostrar el total de documentos por estado
2. WHEN se accede al dashboard THEN el sistema SHALL mostrar el total de documentos por tipo
3. WHEN se accede al dashboard THEN el sistema SHALL mostrar documentos próximos a vencer (review_date cercana)
4. WHEN se accede al dashboard THEN el sistema SHALL mostrar documentos vencidos (review_date pasada)
5. WHEN se accede al dashboard THEN el sistema SHALL mostrar los documentos más descargados
6. WHEN se accede al dashboard THEN el sistema SHALL mostrar documentos creados en el último mes
7. WHEN se accede al dashboard THEN el sistema SHALL mostrar gráficos de distribución por categoría
8. WHEN se accede al dashboard THEN el sistema SHALL permitir filtrar métricas por rango de fechas
9. WHEN se accede al dashboard THEN el sistema SHALL mostrar alertas de documentos que requieren atención

### Requirement 7: Modelo de Datos de Puntos de Norma y Requisitos Legales

**User Story:** Como auditor, quiero gestionar puntos de control de normas de calidad (ISO 9001, ISO 14001, etc.) y requisitos legales aplicables, para estructurar el seguimiento del cumplimiento normativo y legal.

#### Acceptance Criteria

1. WHEN se crea un punto de norma THEN el sistema SHALL requerir código, título, tipo_norma y organización
2. WHEN se crea un punto de norma THEN el sistema SHALL permitir tipo_norma: 'iso_9001', 'iso_14001', 'iso_45001', 'legal', 'otra'
3. WHEN tipo_norma es 'iso_9001' THEN el sistema SHALL validar que el capítulo está entre 4 y 10
4. WHEN tipo_norma es 'legal' THEN el sistema SHALL permitir especificar jurisdicción y número de ley/decreto
5. WHEN tipo_norma es 'otra' THEN el sistema SHALL permitir especificar nombre_norma personalizado
6. WHEN se crea un punto de norma THEN el sistema SHALL permitir definir si es obligatorio (is_mandatory)
7. WHEN se crea un punto de norma THEN el sistema SHALL permitir asignar prioridad: alta, media, baja
8. WHEN se guarda un punto de norma THEN el sistema SHALL permitir asociar múltiples procesos mediante array de IDs
9. WHEN se guarda un punto de norma THEN el sistema SHALL permitir asociar múltiples documentos mediante array de IDs
10. WHEN se guarda un punto de norma THEN el sistema SHALL permitir asociar múltiples objetivos mediante array de IDs

### Requirement 8: Relaciones Norma-Proceso-Documento

**User Story:** Como gestor de calidad, quiero vincular puntos de la norma con procesos y documentos, para establecer la trazabilidad del cumplimiento normativo.

#### Acceptance Criteria

1. WHEN se crea una relación THEN el sistema SHALL requerir norm_point_id, process_id y organization_id
2. WHEN se crea una relación THEN el sistema SHALL validar que el norm_point_id existe en la colección normPoints
3. WHEN se crea una relación THEN el sistema SHALL validar que el process_id existe en la colección processDefinitions
4. WHEN se crea una relación THEN el sistema SHALL permitir asociar múltiples documentos mediante array de IDs
5. WHEN se crea una relación THEN el sistema SHALL inicializar compliance_status en 'pendiente'
6. WHEN se crea una relación THEN el sistema SHALL inicializar compliance_percentage en 0
7. WHEN se actualiza una relación THEN el sistema SHALL permitir cambiar compliance_status a: completo, parcial, pendiente, no_aplica
8. WHEN se actualiza una relación THEN el sistema SHALL validar que compliance_percentage esté entre 0 y 100
9. WHEN se actualiza una relación THEN el sistema SHALL permitir agregar evidence_description y evidence_files
10. WHEN se actualiza una relación THEN el sistema SHALL registrar verification_date y next_review_date

### Requirement 9: Dashboard de Cumplimiento Normativo

**User Story:** Como director de calidad, quiero visualizar el estado de cumplimiento de la norma ISO 9001, para identificar brechas y priorizar acciones.

#### Acceptance Criteria

1. WHEN se accede al dashboard THEN el sistema SHALL mostrar el porcentaje de cumplimiento global
2. WHEN se accede al dashboard THEN el sistema SHALL mostrar el cumplimiento por capítulo ISO (4-10)
3. WHEN se accede al dashboard THEN el sistema SHALL mostrar el cumplimiento por categoría (contexto, liderazgo, etc.)
4. WHEN se accede al dashboard THEN el sistema SHALL mostrar el total de puntos por estado de cumplimiento
5. WHEN se accede al dashboard THEN el sistema SHALL mostrar puntos obligatorios pendientes con alerta
6. WHEN se accede al dashboard THEN el sistema SHALL mostrar puntos de alta prioridad sin cumplir
7. WHEN se accede al dashboard THEN el sistema SHALL mostrar próximas fechas de revisión
8. WHEN se accede al dashboard THEN el sistema SHALL permitir filtrar por proceso específico
9. WHEN se accede al dashboard THEN el sistema SHALL mostrar gráficos de evolución del cumplimiento
10. WHEN se hace clic en un capítulo THEN el sistema SHALL mostrar el detalle de puntos de ese capítulo

### Requirement 10: Matriz de Cumplimiento

**User Story:** Como auditor, quiero visualizar una matriz de cumplimiento que cruce puntos de norma con procesos, para evaluar la cobertura normativa de cada proceso.

#### Acceptance Criteria

1. WHEN se accede a la matriz THEN el sistema SHALL mostrar puntos de norma en filas y procesos en columnas
2. WHEN se accede a la matriz THEN el sistema SHALL mostrar el estado de cumplimiento en cada celda
3. WHEN se accede a la matriz THEN el sistema SHALL usar códigos de color: verde (completo), amarillo (parcial), rojo (pendiente), gris (no aplica)
4. WHEN se hace clic en una celda THEN el sistema SHALL mostrar el detalle de la relación
5. WHEN se hace clic en una celda THEN el sistema SHALL permitir editar el estado de cumplimiento
6. WHEN se filtra la matriz THEN el sistema SHALL permitir filtrar por capítulo ISO
7. WHEN se filtra la matriz THEN el sistema SHALL permitir filtrar por categoría
8. WHEN se filtra la matriz THEN el sistema SHALL permitir filtrar por prioridad
9. WHEN se exporta la matriz THEN el sistema SHALL generar un archivo Excel con el formato visual
10. WHEN se imprime la matriz THEN el sistema SHALL mantener el formato y colores

### Requirement 11: Gestión de Evidencias de Cumplimiento

**User Story:** Como responsable de proceso, quiero adjuntar evidencias de cumplimiento a cada punto de norma, para demostrar el cumplimiento durante auditorías.

#### Acceptance Criteria

1. WHEN se agrega evidencia THEN el sistema SHALL permitir subir múltiples archivos (PDF, imágenes, Excel)
2. WHEN se agrega evidencia THEN el sistema SHALL validar que cada archivo no exceda 5MB
3. WHEN se agrega evidencia THEN el sistema SHALL almacenar los archivos en Firebase Storage
4. WHEN se agrega evidencia THEN el sistema SHALL guardar las rutas en el array evidence_files
5. WHEN se agrega evidencia THEN el sistema SHALL permitir agregar una descripción textual
6. WHEN se visualiza evidencia THEN el sistema SHALL mostrar preview de imágenes y PDFs
7. WHEN se descarga evidencia THEN el sistema SHALL registrar la descarga en el log de auditoría
8. WHEN se elimina evidencia THEN el sistema SHALL eliminar el archivo de Storage
9. WHEN se actualiza evidencia THEN el sistema SHALL mantener un historial de cambios

### Requirement 12: Alertas y Notificaciones

**User Story:** Como responsable de calidad, quiero recibir alertas automáticas sobre documentos y cumplimiento normativo, para tomar acciones preventivas.

#### Acceptance Criteria

1. WHEN un documento está próximo a vencer (30 días) THEN el sistema SHALL enviar notificación al responsable
2. WHEN un documento ha vencido THEN el sistema SHALL enviar alerta diaria al responsable
3. WHEN un punto de norma obligatorio está pendiente THEN el sistema SHALL mostrar alerta en el dashboard
4. WHEN se acerca una fecha de revisión (15 días) THEN el sistema SHALL notificar al responsible_user_id
5. WHEN se cambia el estado de un documento a 'en_revision' THEN el sistema SHALL notificar al revisor
6. WHEN se aprueba un documento THEN el sistema SHALL notificar a la distribution_list
7. WHEN el cumplimiento global cae por debajo del 80% THEN el sistema SHALL alertar al director de calidad
8. WHEN se crea una nueva versión de documento THEN el sistema SHALL notificar a los usuarios que lo tienen descargado
9. WHEN se configura una alerta THEN el sistema SHALL permitir definir umbrales personalizados

### Requirement 13: Reportes de Auditoría

**User Story:** Como auditor interno, quiero generar reportes completos de cumplimiento normativo, para preparar auditorías de certificación.

#### Acceptance Criteria

1. WHEN se genera un reporte THEN el sistema SHALL incluir el estado de cumplimiento por capítulo
2. WHEN se genera un reporte THEN el sistema SHALL incluir la lista de documentos asociados a cada punto
3. WHEN se genera un reporte THEN el sistema SHALL incluir las evidencias de cumplimiento
4. WHEN se genera un reporte THEN el sistema SHALL incluir las fechas de verificación y próximas revisiones
5. WHEN se genera un reporte THEN el sistema SHALL incluir los responsables de cada punto
6. WHEN se genera un reporte THEN el sistema SHALL permitir filtrar por capítulo, categoría o proceso
7. WHEN se genera un reporte THEN el sistema SHALL permitir exportar a PDF con formato profesional
8. WHEN se genera un reporte THEN el sistema SHALL permitir exportar a Excel para análisis
9. WHEN se genera un reporte THEN el sistema SHALL incluir gráficos de cumplimiento
10. WHEN se genera un reporte THEN el sistema SHALL incluir el logo y datos de la organización

### Requirement 14: Integración con Módulos Existentes

**User Story:** Como usuario del sistema, quiero que los documentos y puntos de norma se integren con procesos, objetivos e indicadores, para tener una visión unificada del sistema de calidad.

#### Acceptance Criteria

1. WHEN se visualiza un proceso THEN el sistema SHALL mostrar el documento principal del proceso
2. WHEN se visualiza un proceso THEN el sistema SHALL mostrar otros documentos relacionados (formatos, instructivos, etc.)
3. WHEN se visualiza un proceso THEN el sistema SHALL mostrar los puntos de norma/requisitos legales relacionados
4. WHEN se visualiza un objetivo THEN el sistema SHALL mostrar los puntos de norma que lo requieren
5. WHEN se visualiza un indicador THEN el sistema SHALL mostrar los puntos de norma asociados
6. WHEN se crea un documento THEN el sistema SHALL permitir seleccionar procesos de la lista existente
7. WHEN se crea un punto de norma THEN el sistema SHALL permitir seleccionar objetivos de la lista existente
8. WHEN se elimina un proceso THEN el sistema SHALL actualizar las relaciones en documentos y puntos de norma
9. WHEN se elimina un documento THEN el sistema SHALL actualizar las relaciones en puntos de norma
10. WHEN se consulta desde Don Cándido THEN el sistema SHALL incluir documentos y cumplimiento normativo en el contexto

### Requirement 15: APIs REST para Documentos

**User Story:** Como desarrollador frontend, quiero APIs REST bien definidas para gestionar documentos, para construir interfaces de usuario eficientes.

#### Acceptance Criteria

1. WHEN se llama a GET /api/documents THEN el sistema SHALL retornar lista paginada con filtros opcionales
2. WHEN se llama a GET /api/documents/[id] THEN el sistema SHALL retornar el documento completo o 404
3. WHEN se llama a POST /api/documents THEN el sistema SHALL validar datos con Zod y crear el documento
4. WHEN se llama a PUT /api/documents/[id] THEN el sistema SHALL actualizar el documento y retornar la versión actualizada
5. WHEN se llama a DELETE /api/documents/[id] THEN el sistema SHALL marcar como eliminado (soft delete) o 404
6. WHEN se llama a PATCH /api/documents/[id]/status THEN el sistema SHALL cambiar solo el estado
7. WHEN se llama a PATCH /api/documents/[id]/version THEN el sistema SHALL crear nueva versión
8. WHEN se llama a GET /api/documents/stats THEN el sistema SHALL retornar estadísticas agregadas
9. WHEN ocurre un error THEN el sistema SHALL retornar código HTTP apropiado y mensaje descriptivo
10. WHEN se llama a cualquier endpoint THEN el sistema SHALL validar autenticación y permisos

### Requirement 16: APIs REST para Puntos de Norma

**User Story:** Como desarrollador frontend, quiero APIs REST bien definidas para gestionar puntos de norma, para construir dashboards de cumplimiento.

#### Acceptance Criteria

1. WHEN se llama a GET /api/norm-points THEN el sistema SHALL retornar lista con filtros por capítulo, categoría, prioridad
2. WHEN se llama a GET /api/norm-points/[id] THEN el sistema SHALL retornar el punto completo con relaciones
3. WHEN se llama a POST /api/norm-points THEN el sistema SHALL validar código ISO y crear el punto
4. WHEN se llama a PUT /api/norm-points/[id] THEN el sistema SHALL actualizar el punto
5. WHEN se llama a DELETE /api/norm-points/[id] THEN el sistema SHALL eliminar el punto y sus relaciones
6. WHEN se llama a GET /api/norm-points/chapter/[chapter] THEN el sistema SHALL retornar puntos del capítulo
7. WHEN se llama a GET /api/norm-points/mandatory THEN el sistema SHALL retornar solo puntos obligatorios
8. WHEN se llama a GET /api/norm-points/stats THEN el sistema SHALL retornar estadísticas de cumplimiento
9. WHEN se llama a GET /api/norm-point-relations THEN el sistema SHALL retornar relaciones con filtros
10. WHEN se llama a GET /api/norm-point-relations/dashboard THEN el sistema SHALL retornar datos para dashboard

### Requirement 17: Componentes UI de Documentos

**User Story:** Como usuario del sistema, quiero interfaces intuitivas para gestionar documentos, para trabajar eficientemente con la documentación de calidad.

#### Acceptance Criteria

1. WHEN se accede a /documentos THEN el sistema SHALL mostrar tabs: Dashboard, Gestión, Categorías, Versiones
2. WHEN se visualiza la lista THEN el sistema SHALL mostrar tabla con código, título, tipo, estado, responsable, acciones
3. WHEN se visualiza la lista THEN el sistema SHALL incluir filtros por tipo, estado, categoría, responsable
4. WHEN se visualiza la lista THEN el sistema SHALL incluir búsqueda por texto
5. WHEN se hace clic en "Nuevo" THEN el sistema SHALL abrir formulario modal de creación
6. WHEN se hace clic en "Editar" THEN el sistema SHALL abrir formulario modal con datos precargados
7. WHEN se hace clic en "Ver" THEN el sistema SHALL navegar a página de detalle del documento
8. WHEN se hace clic en "Descargar" THEN el sistema SHALL iniciar descarga del archivo
9. WHEN se hace clic en "Eliminar" THEN el sistema SHALL solicitar confirmación antes de eliminar
10. WHEN se visualiza el dashboard THEN el sistema SHALL mostrar cards con métricas y gráficos

### Requirement 18: Componentes UI de Puntos de Norma

**User Story:** Como auditor, quiero interfaces visuales para gestionar puntos de norma y cumplimiento, para facilitar el seguimiento normativo.

#### Acceptance Criteria

1. WHEN se accede a /puntos-norma THEN el sistema SHALL mostrar tabs: Dashboard, Gestión, Relaciones, Matriz
2. WHEN se visualiza el dashboard THEN el sistema SHALL mostrar cumplimiento global y por capítulo
3. WHEN se visualiza la gestión THEN el sistema SHALL mostrar lista de puntos con filtros por capítulo y categoría
4. WHEN se visualiza relaciones THEN el sistema SHALL mostrar tabla de relaciones norma-proceso-documento
5. WHEN se visualiza la matriz THEN el sistema SHALL mostrar grid con puntos vs procesos coloreado por estado
6. WHEN se hace clic en "Nuevo Punto" THEN el sistema SHALL abrir formulario con campos de punto de norma
7. WHEN se hace clic en "Nueva Relación" THEN el sistema SHALL abrir formulario con selects de punto, proceso y documentos
8. WHEN se edita una relación THEN el sistema SHALL permitir cambiar estado de cumplimiento y porcentaje
9. WHEN se visualiza detalle de punto THEN el sistema SHALL mostrar todos los procesos y documentos relacionados
10. WHEN se exporta la matriz THEN el sistema SHALL generar archivo Excel con formato

### Requirement 19: Validaciones con Zod

**User Story:** Como desarrollador, quiero esquemas de validación robustos con Zod, para asegurar la integridad de los datos en documentos y puntos de norma.

#### Acceptance Criteria

1. WHEN se valida un documento THEN el sistema SHALL verificar que code es string no vacío
2. WHEN se valida un documento THEN el sistema SHALL verificar que type es uno de los valores permitidos
3. WHEN se valida un documento THEN el sistema SHALL verificar que status es uno de los estados válidos
4. WHEN se valida un documento THEN el sistema SHALL verificar que version sigue formato semántico (X.Y)
5. WHEN se valida un documento THEN el sistema SHALL verificar que effective_date es fecha válida si existe
6. WHEN se valida un punto de norma THEN el sistema SHALL verificar que code sigue formato ISO (X.Y.Z)
7. WHEN se valida un punto de norma THEN el sistema SHALL verificar que chapter está entre 4 y 10
8. WHEN se valida una relación THEN el sistema SHALL verificar que compliance_percentage está entre 0 y 100
9. WHEN se valida una relación THEN el sistema SHALL verificar que compliance_status es valor válido
10. WHEN falla una validación THEN el sistema SHALL retornar errores descriptivos por campo

### Requirement 20: Índices de Firestore y Performance

**User Story:** Como administrador del sistema, quiero que las consultas a Firestore sean eficientes, para mantener tiempos de respuesta rápidos incluso con grandes volúmenes de datos.

#### Acceptance Criteria

1. WHEN se consulta documentos THEN el sistema SHALL usar índice compuesto en organization_id + status
2. WHEN se consulta documentos THEN el sistema SHALL usar índice compuesto en organization_id + type
3. WHEN se consulta documentos THEN el sistema SHALL usar índice en created_at para ordenamiento
4. WHEN se consulta puntos de norma THEN el sistema SHALL usar índice compuesto en organization_id + chapter
5. WHEN se consulta puntos de norma THEN el sistema SHALL usar índice compuesto en organization_id + category
6. WHEN se consulta relaciones THEN el sistema SHALL usar índice compuesto en organization_id + norm_point_id
7. WHEN se consulta relaciones THEN el sistema SHALL usar índice compuesto en organization_id + process_id
8. WHEN se implementan índices THEN el sistema SHALL definirlos en firestore.indexes.json
9. WHEN se pagina resultados THEN el sistema SHALL usar cursores de Firestore para paginación eficiente
10. WHEN se cargan listas THEN el sistema SHALL limitar resultados a 50 por página por defecto

### Requirement 21: Seguridad y Permisos

**User Story:** Como administrador de seguridad, quiero controlar el acceso a documentos y puntos de norma según roles, para proteger información sensible.

#### Acceptance Criteria

1. WHEN se accede a un documento THEN el sistema SHALL verificar que el usuario pertenece a la organización
2. WHEN se crea un documento THEN el sistema SHALL verificar que el usuario tiene rol 'gerente' o 'jefe'
3. WHEN se edita un documento THEN el sistema SHALL verificar que el usuario es el responsable o tiene rol 'gerente'
4. WHEN se elimina un documento THEN el sistema SHALL verificar que el usuario tiene rol 'gerente'
5. WHEN se aprueba un documento THEN el sistema SHALL verificar que el usuario tiene rol 'gerente' o 'jefe'
6. WHEN se accede a puntos de norma THEN el sistema SHALL verificar permisos de organización
7. WHEN se edita cumplimiento THEN el sistema SHALL verificar que el usuario es responsable del proceso o gerente
8. WHEN se exportan reportes THEN el sistema SHALL verificar que el usuario tiene rol 'gerente' o 'auditor'
9. WHEN se accede a APIs THEN el sistema SHALL validar token de Firebase Auth
10. WHEN falla la autenticación THEN el sistema SHALL retornar 401 Unauthorized

### Requirement 22: Datos de Prueba ISO 9001:2015

**User Story:** Como desarrollador, quiero datos de prueba realistas de la norma ISO 9001:2015, para probar el sistema con información real.

#### Acceptance Criteria

1. WHEN se inicializa el sistema THEN el sistema SHALL permitir cargar puntos de norma predefinidos
2. WHEN se cargan datos de prueba THEN el sistema SHALL incluir todos los capítulos del 4 al 10
3. WHEN se cargan datos de prueba THEN el sistema SHALL incluir puntos principales como 4.1, 5.2.1, 6.2.1, 7.1.5, 8.2.1, 9.1.2, 10.2.1
4. WHEN se cargan datos de prueba THEN el sistema SHALL incluir descripciones y requisitos de cada punto
5. WHEN se cargan datos de prueba THEN el sistema SHALL marcar correctamente los puntos obligatorios
6. WHEN se cargan datos de prueba THEN el sistema SHALL asignar prioridades apropiadas
7. WHEN se cargan datos de prueba THEN el sistema SHALL incluir ejemplos de documentos por tipo
8. WHEN se cargan datos de prueba THEN el sistema SHALL incluir relaciones de ejemplo entre norma-proceso-documento
9. WHEN se ejecuta el seed THEN el sistema SHALL verificar que no existan datos duplicados
10. WHEN se ejecuta el seed THEN el sistema SHALL registrar en log los datos creados

### Requirement 23: Integración con Contexto de Usuario para Don Cándido

**User Story:** Como usuario del sistema, quiero que Don Cándido conozca los documentos y puntos de norma relevantes a mi rol, para recibir asesoramiento contextualizado sobre documentación y cumplimiento normativo.

#### Acceptance Criteria

1. WHEN se extiende el modelo Personnel THEN el sistema SHALL agregar campo `documentos_asignados: string[]` para IDs de documentos
2. WHEN se extiende el modelo Personnel THEN el sistema SHALL agregar campo `puntos_norma_asignados: string[]` para IDs de puntos de norma
3. WHEN se construye el contexto del usuario THEN el sistema SHALL incluir los documentos asignados con sus detalles completos
4. WHEN se construye el contexto del usuario THEN el sistema SHALL incluir los puntos de norma asignados con estado de cumplimiento
5. WHEN se construye el contexto del usuario THEN el sistema SHALL incluir documentos próximos a vencer del usuario
6. WHEN se construye el contexto del usuario THEN el sistema SHALL incluir puntos de norma obligatorios pendientes
7. WHEN se genera el prompt para Don Cándido THEN el sistema SHALL incluir lista de documentos del usuario con estado
8. WHEN se genera el prompt para Don Cándido THEN el sistema SHALL incluir puntos de norma con porcentaje de cumplimiento
9. WHEN se genera el prompt para Don Cándido THEN el sistema SHALL marcar documentos vencidos con indicador ⚠️
10. WHEN se genera el prompt para Don Cándido THEN el sistema SHALL marcar puntos obligatorios pendientes con indicador 🔴

### Requirement 24: Extensión del UserContextService

**User Story:** Como desarrollador, quiero que el UserContextService incluya documentos y puntos de norma, para que la IA tenga acceso completo al contexto documental del usuario.

#### Acceptance Criteria

1. WHEN se llama a getUserFullContext THEN el sistema SHALL incluir campo `documentos: Document[]` en el UserContext
2. WHEN se llama a getUserFullContext THEN el sistema SHALL incluir campo `puntosNorma: NormPoint[]` en el UserContext
3. WHEN se llama a getUserFullContext THEN el sistema SHALL incluir campo `relacionesNorma: NormPointRelation[]` en el UserContext
4. WHEN se obtienen documentos del usuario THEN el sistema SHALL filtrar por responsible_user_id o documentos_asignados
5. WHEN se obtienen puntos de norma THEN el sistema SHALL incluir solo los asignados al usuario o a sus procesos
6. WHEN se obtienen relaciones de norma THEN el sistema SHALL filtrar por los procesos asignados al usuario
7. WHEN se construye el contexto THEN el sistema SHALL calcular estadísticas de documentos (total, vencidos, por estado)
8. WHEN se construye el contexto THEN el sistema SHALL calcular estadísticas de cumplimiento normativo
9. WHEN el contexto incluye documentos THEN el sistema SHALL completar la operación en menos de 2.5 segundos
10. WHEN se cachea el contexto THEN el sistema SHALL incluir documentos y puntos de norma en el cache

### Requirement 25: Prompts Contextualizados con Documentos y Norma

**User Story:** Como usuario, quiero que Don Cándido me asesore sobre documentos y cumplimiento normativo específicos a mi rol, para recibir orientación práctica y relevante.

#### Acceptance Criteria

1. WHEN se genera el prompt THEN el sistema SHALL incluir sección "DOCUMENTOS ASIGNADOS" con código, título, tipo y estado
2. WHEN se genera el prompt THEN el sistema SHALL incluir sección "DOCUMENTOS PRÓXIMOS A VENCER" con días restantes
3. WHEN se genera el prompt THEN el sistema SHALL incluir sección "PUNTOS DE NORMA ASIGNADOS" con código, título y cumplimiento
4. WHEN se genera el prompt THEN el sistema SHALL incluir sección "CUMPLIMIENTO NORMATIVO" con porcentaje global y por capítulo
5. WHEN un documento está vencido THEN el sistema SHALL marcarlo con "⚠️ VENCIDO" en el prompt
6. WHEN un punto de norma obligatorio está pendiente THEN el sistema SHALL marcarlo con "🔴 OBLIGATORIO PENDIENTE"
7. WHEN el cumplimiento de un capítulo es menor al 80% THEN el sistema SHALL marcarlo con "⚠️ REQUIERE ATENCIÓN"
8. WHEN se genera el prompt THEN el sistema SHALL incluir instrucciones específicas sobre documentación según el rol
9. WHEN el usuario es gerente THEN el sistema SHALL incluir estadísticas globales de documentación
10. WHEN el usuario es operario THEN el sistema SHALL enfocarse en documentos y normas de sus procesos específicos

### Requirement 26: Consultas Específicas sobre Documentos y Norma

**User Story:** Como usuario, quiero poder consultar a Don Cándido sobre documentos específicos y requisitos de la norma, para obtener orientación inmediata sin buscar en el sistema.

#### Acceptance Criteria

1. WHEN el usuario pregunta por un documento específico THEN el sistema SHALL buscar por código o título en los documentos del contexto
2. WHEN el usuario pregunta por un punto de norma THEN el sistema SHALL buscar por código ISO (ej: "4.1", "5.2.1")
3. WHEN el usuario pregunta "qué documentos tengo vencidos" THEN el sistema SHALL listar documentos con review_date pasada
4. WHEN el usuario pregunta "cuál es mi cumplimiento normativo" THEN el sistema SHALL reportar porcentaje global y por capítulo
5. WHEN el usuario pregunta por un capítulo ISO THEN el sistema SHALL listar puntos de ese capítulo con su estado
6. WHEN el usuario pregunta "qué documentos debo revisar" THEN el sistema SHALL priorizar por fecha de vencimiento
7. WHEN el usuario pregunta sobre un proceso THEN el sistema SHALL incluir documentos y puntos de norma relacionados
8. WHEN el usuario pregunta "qué puntos obligatorios me faltan" THEN el sistema SHALL listar puntos is_mandatory=true con estado pendiente
9. WHEN el usuario pregunta sobre evidencias THEN el sistema SHALL mencionar qué evidencias faltan por punto de norma
10. WHEN Don Cándido responde THEN el sistema SHALL incluir enlaces directos a documentos o puntos de norma mencionados

### Requirement 27: Actualización Automática de Contexto

**User Story:** Como usuario, quiero que Don Cándido refleje cambios recientes en documentos y cumplimiento normativo, para recibir información actualizada durante la conversación.

#### Acceptance Criteria

1. WHEN se crea un nuevo documento THEN el sistema SHALL invalidar el cache del contexto del responsible_user_id
2. WHEN se actualiza el estado de un documento THEN el sistema SHALL invalidar el cache de usuarios relacionados
3. WHEN se actualiza una relación de norma THEN el sistema SHALL invalidar el cache de usuarios con ese proceso asignado
4. WHEN se cambia el compliance_status THEN el sistema SHALL invalidar el cache de usuarios responsables
5. WHEN se aprueba un documento THEN el sistema SHALL invalidar el cache de usuarios en distribution_list
6. WHEN una sesión de chat dura más de 10 minutos THEN el sistema SHALL refrescar el contexto automáticamente
7. WHEN se detecta un cambio relevante THEN el sistema SHALL notificar al usuario en el chat si está activo
8. WHEN se invalida el cache THEN el sistema SHALL registrar el motivo en los logs
9. WHEN se refresca el contexto THEN el sistema SHALL mantener el historial de mensajes de la sesión
10. WHEN se refresca el contexto THEN el sistema SHALL actualizar el contexto_snapshot de la sesión
