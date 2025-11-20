# Requirements Document

## Introducción

Este documento define los requerimientos para el sistema de gestión de Auditorías, Hallazgos y Acciones para la aplicación 9001app-firebase. El sistema permitirá gestionar el ciclo completo de auditorías internas y externas del sistema de calidad ISO 9001:2015, registrar hallazgos provenientes de múltiples fuentes, y gestionar las acciones correctivas, preventivas y de mejora derivadas de dichos hallazgos.

El sistema implementa tres módulos ABM (Alta, Baja, Modificación) interrelacionados con un sistema de trazabilidad numérica que permite seguir la cadena completa desde una auditoría hasta las acciones implementadas.

## Requerimientos

### Requerimiento 1: Gestión de Auditorías

**User Story:** Como responsable de calidad, quiero gestionar auditorías internas y externas del sistema de calidad, para poder planificar, ejecutar y documentar las auditorías de manera sistemática.

#### Acceptance Criteria

1. WHEN el usuario crea una nueva auditoría THEN el sistema SHALL generar automáticamente un número único de auditoría con formato AUD-YYYY-XXX
2. WHEN el usuario crea una auditoría THEN el sistema SHALL permitir especificar tipo (interna, externa, proveedor, cliente), alcance (completa, parcial, seguimiento), título, descripción y fecha planificada
3. WHEN el usuario crea una auditoría THEN el sistema SHALL permitir seleccionar las cláusulas ISO 9001:2015 que serán cubiertas
4. WHEN el usuario asigna un equipo auditor THEN el sistema SHALL permitir designar un auditor líder y múltiples miembros del equipo con roles (líder, asistente, observador)
5. WHEN el usuario guarda una auditoría THEN el sistema SHALL almacenar la información en Firestore con timestamps de creación y actualización
6. WHEN el usuario lista auditorías THEN el sistema SHALL mostrar todas las auditorías con filtros por estado, tipo, año, y auditor líder
7. WHEN el usuario visualiza una auditoría THEN el sistema SHALL mostrar toda la información incluyendo contadores de hallazgos asociados
8. WHEN el usuario edita una auditoría THEN el sistema SHALL permitir modificar todos los campos excepto el número de auditoría
9. WHEN el usuario elimina una auditoría THEN el sistema SHALL realizar un soft delete marcando isActive como false
10. WHEN el usuario cambia el estado de una auditoría THEN el sistema SHALL permitir transiciones entre estados: planificada, en progreso, completada, cancelada, pospuesta

### Requerimiento 2: Estados y Seguimiento de Auditorías

**User Story:** Como auditor, quiero poder actualizar el estado de las auditorías y registrar información de seguimiento, para mantener un control preciso del progreso de cada auditoría.

#### Acceptance Criteria

1. WHEN una auditoría está en estado "completada" THEN el sistema SHALL permitir registrar fecha real de inicio, fecha real de fin, duración en horas y calificación general
2. WHEN el usuario registra una calificación general THEN el sistema SHALL permitir seleccionar entre: excelente, buena, satisfactoria, necesita mejora, insatisfactoria
3. WHEN una auditoría tiene hallazgos asociados THEN el sistema SHALL actualizar automáticamente los contadores de hallazgos por severidad (críticos, mayores, menores, observaciones)
4. WHEN el usuario marca que se requiere seguimiento THEN el sistema SHALL permitir especificar fecha de seguimiento y fecha límite de corrección
5. WHEN el usuario adjunta documentos THEN el sistema SHALL permitir asociar plan de auditoría, reporte de auditoría y documentos de evidencia

### Requerimiento 3: Gestión de Hallazgos - Fase 1: Detección

**User Story:** Como miembro del equipo de calidad, quiero registrar y gestionar hallazgos provenientes de diferentes fuentes siguiendo la Fase 1 (Detección) de la norma ISO 9001, para poder identificar y documentar no conformidades, observaciones y oportunidades de mejora.

#### Acceptance Criteria

1. WHEN el usuario crea un nuevo hallazgo THEN el sistema SHALL generar automáticamente un número único con formato HAL-YYYY-XXX
2. WHEN el usuario crea un hallazgo THEN el sistema SHALL registrar automáticamente la fecha de registro del hallazgo
3. WHEN el usuario crea un hallazgo THEN el sistema SHALL permitir especificar quién reportó el hallazgo y registrar automáticamente quién lo registró en el sistema
4. WHEN el usuario crea un hallazgo THEN el sistema SHALL permitir especificar origen (auditoría, empleado, cliente, inspección, proveedor), descripción y consecuencia
5. WHEN el usuario crea un hallazgo desde una auditoría THEN el sistema SHALL vincular automáticamente el hallazgo con el ID y número de la auditoría origen
6. WHEN el usuario clasifica un hallazgo THEN el sistema SHALL permitir especificar tipo (no conformidad, observación, oportunidad de mejora), severidad (crítica, mayor, menor, baja) y categoría (calidad, seguridad, ambiente, proceso, equipo, documentación)
7. WHEN el usuario registra una acción inmediata (corrección) THEN el sistema SHALL permitir documentar la corrección aplicada, su estado, fecha de compromiso y fecha de cierre
8. WHEN el usuario asigna el hallazgo THEN el sistema SHALL permitir especificar el proceso involucrado y el responsable del tratamiento del hallazgo
9. WHEN el usuario evalúa el riesgo THEN el sistema SHALL permitir asignar nivel de riesgo (bajo, medio, alto, crítico)
10. WHEN el usuario guarda un hallazgo THEN el sistema SHALL almacenar la información en Firestore con la cadena de trazabilidad hacia su origen
11. WHEN el usuario lista hallazgos THEN el sistema SHALL mostrar todos los hallazgos con filtros por origen, estado, severidad, tipo, categoría y año
12. WHEN el usuario visualiza un hallazgo THEN el sistema SHALL mostrar toda la información de la Fase 1 incluyendo contadores de acciones asociadas
13. WHEN el usuario edita un hallazgo THEN el sistema SHALL permitir modificar todos los campos excepto el número de hallazgo y el origen
14. WHEN el usuario elimina un hallazgo THEN el sistema SHALL realizar un soft delete marcando isActive como false

### Requerimiento 4: Análisis de Hallazgos - Fase 2: Tratamiento

**User Story:** Como responsable de proceso, quiero analizar las causas raíz de los hallazgos y determinar si requieren acciones correctivas o preventivas siguiendo la Fase 2 (Tratamiento) de la norma ISO 9001, para asegurar que se implementen soluciones efectivas.

#### Acceptance Criteria

1. WHEN el usuario realiza análisis de causa raíz THEN el sistema SHALL permitir documentar el método utilizado (5 Por qué, Ishikawa, etc.), el análisis de causas básicas y las herramientas empleadas
2. WHEN el usuario identifica causas THEN el sistema SHALL permitir registrar la causa raíz principal (raíz del problema) y factores contribuyentes
3. WHEN el usuario completa el análisis THEN el sistema SHALL permitir indicar si el hallazgo requiere acción correctiva o preventiva
4. WHEN el usuario determina que requiere acción THEN el sistema SHALL permitir crear una o más acciones vinculadas al hallazgo con su número de acción correspondiente
5. WHEN el usuario evalúa el impacto THEN el sistema SHALL permitir marcar si hay impacto en cliente, regulatorio, financiero u operacional con descripción
6. WHEN el usuario asigna responsables THEN el sistema SHALL permitir especificar quién identificó el hallazgo y quién es responsable de su resolución
7. WHEN el usuario establece fechas THEN el sistema SHALL permitir registrar fecha de identificación, fecha objetivo de cierre y fecha real de cierre
8. WHEN el sistema detecta hallazgos similares THEN el sistema SHALL marcar el hallazgo como recurrente y vincular con hallazgos anteriores relacionados

### Requerimiento 5: Gestión de Acciones - Fase 2: Tratamiento (Implementación)

**User Story:** Como responsable de implementar mejoras, quiero crear y gestionar acciones correctivas, preventivas y de mejora vinculadas a hallazgos siguiendo la Fase 2 (Tratamiento) de la norma ISO 9001, para resolver las causas raíz y prevenir recurrencias.

#### Acceptance Criteria

1. WHEN el usuario crea una nueva acción THEN el sistema SHALL generar automáticamente un número único con formato ACC-YYYY-XXX
2. WHEN el usuario crea una acción THEN el sistema SHALL requerir vincularla a un hallazgo específico mediante su ID y número
3. WHEN el usuario crea una acción THEN el sistema SHALL permitir especificar tipo (correctiva, preventiva, mejora), título, descripción de la acción y fechas planificadas
4. WHEN el usuario crea una acción THEN el sistema SHALL registrar la fecha de inicio de tratamiento de la acción
5. WHEN el usuario crea una acción THEN el sistema SHALL heredar automáticamente la información de trazabilidad del hallazgo origen
6. WHEN el usuario asigna responsables THEN el sistema SHALL permitir designar un responsable de implementación de la acción y opcionalmente un grupo de trabajo con sus roles
7. WHEN el usuario establece fechas THEN el sistema SHALL permitir registrar fecha de compromiso de implementación y fecha de ejecución de la acción
8. WHEN el usuario define prioridad THEN el sistema SHALL permitir seleccionar entre: baja, media, alta, crítica
9. WHEN el usuario guarda una acción THEN el sistema SHALL almacenar la información en Firestore con la cadena completa de trazabilidad
10. WHEN el usuario lista acciones THEN el sistema SHALL mostrar todas las acciones con filtros por estado, tipo, prioridad, responsable, hallazgo y año
11. WHEN el usuario visualiza una acción THEN el sistema SHALL mostrar toda la información incluyendo el hallazgo y auditoría relacionados
12. WHEN el usuario edita una acción THEN el sistema SHALL permitir modificar todos los campos excepto el número de acción y el hallazgo vinculado
13. WHEN el usuario elimina una acción THEN el sistema SHALL realizar un soft delete marcando isActive como false

### Requerimiento 6: Plan de Acción y Seguimiento

**User Story:** Como responsable de una acción, quiero definir un plan de acción detallado por pasos y hacer seguimiento del progreso, para asegurar la implementación efectiva de las acciones.

#### Acceptance Criteria

1. WHEN el usuario crea un plan de acción THEN el sistema SHALL permitir agregar múltiples pasos con secuencia, descripción, responsable, fecha límite y estado
2. WHEN el usuario define pasos THEN el sistema SHALL permitir que cada paso tenga estado: pendiente, en progreso, completado
3. WHEN el usuario actualiza un paso THEN el sistema SHALL permitir adjuntar evidencia de cumplimiento
4. WHEN el usuario actualiza el progreso THEN el sistema SHALL permitir registrar un porcentaje de avance (0-100)
5. WHEN el usuario cambia el estado de una acción THEN el sistema SHALL permitir transiciones entre: planificada, en progreso, completada, cancelada, en pausa
6. WHEN el usuario registra fechas reales THEN el sistema SHALL permitir capturar fecha real de inicio y fecha real de fin
7. WHEN el usuario especifica recursos THEN el sistema SHALL permitir documentar presupuesto, equipo necesario, personal requerido y tiempo estimado en horas
8. WHEN el usuario agrega comentarios THEN el sistema SHALL permitir registrar comentarios con usuario, timestamp y texto
9. WHEN el usuario adjunta documentos THEN el sistema SHALL permitir asociar documentos y archivos adjuntos a la acción

### Requerimiento 7: Verificación de Efectividad de Acciones - Fase 3: Control

**User Story:** Como auditor de calidad, quiero verificar la efectividad de las acciones implementadas siguiendo la Fase 3 (Control) de la norma ISO 9001, para confirmar que resolvieron el problema y previenen su recurrencia.

#### Acceptance Criteria

1. WHEN una acción está completada THEN el sistema SHALL permitir realizar verificación de efectividad
2. WHEN el usuario asigna verificación THEN el sistema SHALL permitir especificar el responsable de la verificación de eficacia de la acción
3. WHEN el usuario programa verificación THEN el sistema SHALL permitir registrar fecha de compromiso de la verificación y fecha de ejecución de la verificación
4. WHEN el usuario define criterios THEN el sistema SHALL permitir especificar el criterio para considerar eficaz la acción (aplicable cuando se busque un resultado mensurable intermedio)
5. WHEN el usuario verifica efectividad THEN el sistema SHALL permitir especificar método de verificación y quién realizó la verificación
6. WHEN el usuario registra la verificación THEN el sistema SHALL permitir capturar el resultado de la verificación de la eficacia (efectiva/no efectiva), evidencia y observaciones
7. WHEN el usuario completa la verificación THEN el sistema SHALL permitir actualizar el estado de la acción según el resultado
8. WHEN una acción es verificada como efectiva THEN el sistema SHALL permitir cerrar el hallazgo asociado
9. WHEN una acción no es efectiva THEN el sistema SHALL permitir crear nuevas acciones relacionadas al mismo hallazgo
10. WHEN el usuario visualiza una acción THEN el sistema SHALL mostrar claramente en qué fase se encuentra (Detección, Tratamiento, Control)

### Requerimiento 8: Sistema de Trazabilidad Numérica

**User Story:** Como usuario del sistema, quiero poder rastrear la cadena completa de trazabilidad desde una acción hasta su auditoría origen, para entender el contexto completo de cada elemento.

#### Acceptance Criteria

1. WHEN el sistema genera un número de auditoría THEN el sistema SHALL usar el formato AUD-YYYY-XXX donde YYYY es el año actual y XXX es un secuencial de 3 dígitos
2. WHEN el sistema genera un número de hallazgo THEN el sistema SHALL usar el formato HAL-YYYY-XXX donde YYYY es el año actual y XXX es un secuencial de 3 dígitos
3. WHEN el sistema genera un número de acción THEN el sistema SHALL usar el formato ACC-YYYY-XXX donde YYYY es el año actual y XXX es un secuencial de 3 dígitos
4. WHEN un hallazgo se crea desde una auditoría THEN el sistema SHALL almacenar el ID y número de la auditoría en los campos sourceId y sourceReference
5. WHEN una acción se crea desde un hallazgo THEN el sistema SHALL almacenar el ID y número del hallazgo en los campos findingId y findingNumber
6. WHEN el usuario visualiza una acción THEN el sistema SHALL mostrar el número del hallazgo relacionado y permitir navegar a él
7. WHEN el usuario visualiza un hallazgo THEN el sistema SHALL mostrar el número de la auditoría origen (si aplica) y permitir navegar a ella
8. WHEN el usuario visualiza una auditoría THEN el sistema SHALL mostrar la lista de hallazgos asociados con sus números
9. WHEN el usuario visualiza un hallazgo THEN el sistema SHALL mostrar la lista de acciones asociadas con sus números
10. WHEN el sistema almacena cualquier entidad THEN el sistema SHALL mantener un array traceabilityChain con todos los IDs relacionados en la cadena

### Requerimiento 9: Contadores y Estadísticas

**User Story:** Como responsable de calidad, quiero ver contadores y estadísticas actualizadas automáticamente, para tener visibilidad del estado general del sistema de gestión.

#### Acceptance Criteria

1. WHEN una auditoría tiene hallazgos THEN el sistema SHALL actualizar automáticamente los contadores: findingsCount, criticalFindings, majorFindings, minorFindings, observations
2. WHEN un hallazgo tiene acciones THEN el sistema SHALL actualizar automáticamente los contadores: actionsCount, openActionsCount, completedActionsCount
3. WHEN el usuario solicita estadísticas de auditorías THEN el sistema SHALL calcular y mostrar métricas por año, tipo, estado y calificación
4. WHEN el usuario solicita estadísticas de hallazgos THEN el sistema SHALL calcular y mostrar distribución por origen, severidad, tipo, categoría y estado
5. WHEN el usuario solicita estadísticas de acciones THEN el sistema SHALL calcular y mostrar distribución por tipo, estado, prioridad y efectividad

### Requerimiento 10: Flujo de las 3 Fases de la Norma ISO 9001

**User Story:** Como usuario del sistema, quiero que el sistema guíe el flujo de trabajo a través de las 3 fases requeridas por la norma ISO 9001 (Detección, Tratamiento, Control), para asegurar el cumplimiento normativo y la trazabilidad completa.

#### Acceptance Criteria

1. WHEN el usuario crea un hallazgo THEN el sistema SHALL iniciar automáticamente la Fase 1: Detección
2. WHEN el usuario completa la información de detección THEN el sistema SHALL permitir avanzar a la Fase 2: Tratamiento
3. WHEN el usuario realiza el análisis de causa raíz THEN el sistema SHALL permitir determinar si requiere acción correctiva/preventiva
4. WHEN el usuario crea acciones vinculadas THEN el sistema SHALL considerar que el hallazgo está en Fase 2: Tratamiento
5. WHEN todas las acciones están implementadas THEN el sistema SHALL permitir avanzar a la Fase 3: Control
6. WHEN el usuario verifica la efectividad THEN el sistema SHALL considerar que la acción está en Fase 3: Control
7. WHEN todas las acciones son verificadas como efectivas THEN el sistema SHALL permitir cerrar el hallazgo completando el ciclo de las 3 fases
8. WHEN el usuario visualiza un hallazgo o acción THEN el sistema SHALL mostrar claramente en qué fase se encuentra
9. WHEN el usuario genera reportes THEN el sistema SHALL incluir información de las 3 fases con sus responsables y fechas correspondientes
10. WHEN el sistema valida el flujo THEN el sistema SHALL asegurar que no se pueda saltar fases sin completar la información requerida

### Requerimiento 11: Validaciones y Reglas de Negocio

**User Story:** Como usuario del sistema, quiero que el sistema valide la información ingresada y aplique reglas de negocio, para mantener la integridad y consistencia de los datos.

#### Acceptance Criteria

1. WHEN el usuario crea una auditoría THEN el sistema SHALL validar que el título no esté vacío y tenga máximo 200 caracteres
2. WHEN el usuario crea un hallazgo THEN el sistema SHALL validar que tenga un origen válido y que el sourceId exista en el sistema
3. WHEN el usuario crea una acción THEN el sistema SHALL validar que el hallazgo vinculado exista y esté activo
4. WHEN el usuario establece fechas THEN el sistema SHALL validar que la fecha de fin sea posterior a la fecha de inicio
5. WHEN el usuario genera un número secuencial THEN el sistema SHALL asegurar que no haya duplicados mediante transacciones atómicas
6. WHEN el usuario intenta eliminar una auditoría con hallazgos THEN el sistema SHALL prevenir la eliminación y mostrar un mensaje de error
7. WHEN el usuario intenta eliminar un hallazgo con acciones THEN el sistema SHALL prevenir la eliminación y mostrar un mensaje de error
8. WHEN el usuario cambia el estado de una entidad THEN el sistema SHALL validar que la transición de estado sea válida
9. WHEN el usuario guarda cualquier entidad THEN el sistema SHALL validar todos los campos requeridos según el esquema Zod definido
10. WHEN el sistema detecta un error de validación THEN el sistema SHALL mostrar mensajes de error claros y específicos al usuario
