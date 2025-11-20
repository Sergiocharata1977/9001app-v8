# Requirements Document - MVP Gestión de Usuarios y Contexto

## Introduction

Este documento define los requerimientos MVP para implementar la gestión de usuarios y puestos, con asignación de contexto (Procesos, Objetivos, Indicadores) a nivel de Puesto para la IA Don Cándido.

**Arquitectura MVP:**

```
Usuario → Personnel → Position → Procesos/Objetivos/Indicadores
```

**Flujo simple:**

1. Crear/editar Puestos (solo info básica)
2. Asignar Procesos/Objetivos/Indicadores a Puestos (en página separada)
3. Crear/editar Personal y asignarle un Puesto
4. Personnel hereda automáticamente las asignaciones del Puesto
5. Don Cándido usa el contexto del Personnel

## Requirements

### Requirement 1: Modelo de datos de Position con asignaciones

**User Story:** Como desarrollador, quiero que el modelo de Position incluya campos para asignaciones de contexto, para almacenar procesos, objetivos e indicadores a nivel de puesto.

#### Acceptance Criteria

1. WHEN se define el modelo Position THEN el sistema SHALL incluir campos opcionales: `procesos_asignados?: string[]`, `objetivos_asignados?: string[]`, `indicadores_asignados?: string[]`
2. WHEN se crea un Position sin asignaciones THEN el sistema SHALL inicializar los arrays como vacíos
3. WHEN se actualiza asignaciones de un Position THEN el sistema SHALL validar que los IDs existen en sus respectivas colecciones
4. WHEN se consulta un Position THEN el sistema SHALL poder expandir las referencias para obtener los objetos completos

### Requirement 2: ABM básico de Puestos

**User Story:** Como administrador de RRHH, quiero crear y editar puestos con información básica, para definir la estructura organizacional.

#### Acceptance Criteria

1. WHEN accedo a gestión de puestos THEN el sistema SHALL mostrar lista de puestos con: nombre, departamento, cantidad de personas
2. WHEN creo un puesto THEN el sistema SHALL solicitar solo: nombre, descripción, departamento_id (opcional), reporta_a_id (opcional)
3. WHEN edito un puesto THEN el sistema SHALL permitir modificar: nombre, descripción, departamento_id, reporta_a_id
4. WHEN elimino un puesto THEN el sistema SHALL validar que no haya personal activo asignado
5. WHEN veo detalle de un puesto THEN el sistema SHALL mostrar: info básica, botón "Asignar Contexto", lista de personas en este puesto

### Requirement 3: Asignación de contexto a Puestos (página separada)

**User Story:** Como administrador de calidad, quiero asignar procesos, objetivos e indicadores a un puesto, para definir el contexto que heredarán las personas en ese puesto.

#### Acceptance Criteria

1. WHEN accedo a "Asignar Contexto" de un puesto THEN el sistema SHALL mostrar página con tres secciones: Procesos, Objetivos, Indicadores
2. WHEN asigno procesos THEN el sistema SHALL mostrar selector múltiple con todos los procesos activos
3. WHEN asigno objetivos THEN el sistema SHALL mostrar selector múltiple con todos los objetivos activos
4. WHEN asigno indicadores THEN el sistema SHALL mostrar selector múltiple con todos los indicadores activos
5. WHEN guardo las asignaciones THEN el sistema SHALL actualizar los arrays en el Position
6. WHEN guardo las asignaciones THEN el sistema SHALL preguntar si desea propagar cambios a todo el personal en ese puesto
7. IF el usuario acepta propagar THEN el sistema SHALL copiar las asignaciones del puesto a todos los personnel con ese puesto

### Requirement 4: ABM de Personal con asignación de Puesto

**User Story:** Como administrador de RRHH, quiero crear y editar personal asignándole un puesto, para que herede automáticamente el contexto del puesto.

#### Acceptance Criteria

1. WHEN creo un registro de personal THEN el sistema SHALL incluir campo "Puesto" con selector de puestos activos
2. WHEN selecciono un puesto al crear personal THEN el sistema SHALL copiar automáticamente las asignaciones del puesto a `procesos_asignados`, `objetivos_asignados`, `indicadores_asignados`
3. WHEN edito un personal y cambio su puesto THEN el sistema SHALL preguntar si desea reemplazar asignaciones actuales con las del nuevo puesto
4. IF el usuario acepta reemplazar THEN el sistema SHALL copiar las asignaciones del nuevo puesto
5. IF el usuario rechaza reemplazar THEN el sistema SHALL mantener las asignaciones actuales
6. WHEN un personal no tiene puesto asignado THEN el sistema SHALL permitir que los arrays de asignaciones estén vacíos

### Requirement 5: Edición manual de asignaciones en Personal (opcional)

**User Story:** Como administrador, quiero poder editar manualmente las asignaciones de un personal específico, para casos excepcionales donde necesite contexto diferente al del puesto.

#### Acceptance Criteria

1. WHEN veo detalle de un personal THEN el sistema SHALL mostrar botón "Editar Asignaciones"
2. WHEN edito asignaciones de un personal THEN el sistema SHALL mostrar página similar a la de asignación de puesto
3. WHEN modifico asignaciones manualmente THEN el sistema SHALL actualizar solo ese personnel sin afectar el puesto ni otros personnel
4. WHEN un personal tiene asignaciones manuales diferentes al puesto THEN el sistema SHALL mostrar indicador visual en su detalle

### Requirement 6: Construcción del contexto para Don Cándido

**User Story:** Como usuario del sistema, quiero que Don Cándido tenga mi contexto completo basado en mi puesto, para recibir asistencia relevante.

#### Acceptance Criteria

1. WHEN un usuario inicia sesión THEN el sistema SHALL construir contexto: User → Personnel → Position → Procesos/Objetivos/Indicadores
2. WHEN se construye el contexto THEN el sistema SHALL obtener los arrays de IDs desde `personnel.procesos_asignados`, `personnel.objetivos_asignados`, `personnel.indicadores_asignados`
3. WHEN se construye el contexto THEN el sistema SHALL expandir los IDs para obtener objetos completos de ProcessDefinition, QualityObjective, QualityIndicator
4. WHEN Don Cándido recibe una consulta THEN el sistema SHALL incluir en el prompt todo el contexto expandido
5. WHEN el contexto incluye procesos THEN el sistema SHALL incluir: código, nombre, objetivo, alcance
6. WHEN el contexto incluye objetivos THEN el sistema SHALL incluir: código, título, meta, valor actual, estado
7. WHEN el contexto incluye indicadores THEN el sistema SHALL incluir: código, nombre, fórmula, metas, valor actual

### Requirement 7: Gestión de Usuarios (mantener funcionalidad actual)

**User Story:** Como administrador del sistema, quiero gestionar usuarios vinculándolos con personal, para controlar accesos al sistema.

#### Acceptance Criteria

1. WHEN creo un usuario THEN el sistema SHALL crear cuenta en Firebase Auth y registro en colección `users`
2. WHEN creo un usuario THEN el sistema SHALL vincular con un registro de personnel existente mediante `personnel_id`
3. WHEN creo un usuario THEN el sistema SHALL asignar rol según `tipo_personal` del personnel
4. WHEN edito un usuario THEN el sistema SHALL permitir cambiar: email, rol, estado activo, personnel_id
5. WHEN desactivo un usuario THEN el sistema SHALL marcar `activo = false` sin eliminar el registro
6. WHEN veo lista de usuarios THEN el sistema SHALL mostrar: email, rol, estado, nombre del personal vinculado

### Requirement 8: Validaciones básicas

**User Story:** Como desarrollador, quiero que el sistema valide las relaciones entre entidades, para mantener integridad de datos.

#### Acceptance Criteria

1. WHEN se asigna un puesto a personnel THEN el sistema SHALL validar que el puesto existe
2. WHEN se asignan procesos/objetivos/indicadores THEN el sistema SHALL validar que los IDs existen
3. WHEN se elimina un puesto THEN el sistema SHALL validar que no haya personnel activo con ese puesto
4. WHEN se crea un usuario THEN el sistema SHALL validar que el email sea único
5. WHEN se vincula usuario con personnel THEN el sistema SHALL validar que el personnel_id existe

### Requirement 9: Interfaz de usuario - Lista y detalle de Puestos

**User Story:** Como usuario, quiero ver la lista de puestos y sus detalles, para entender la estructura organizacional.

#### Acceptance Criteria

1. WHEN accedo a /admin/puestos THEN el sistema SHALL mostrar tabla con: nombre, departamento, cantidad de personas, acciones
2. WHEN hago clic en "Ver" un puesto THEN el sistema SHALL navegar a /admin/puestos/[id]
3. WHEN veo detalle de un puesto THEN el sistema SHALL mostrar: información básica, botón "Editar", botón "Asignar Contexto"
4. WHEN veo detalle de un puesto THEN el sistema SHALL mostrar sección "Contexto Asignado" con resumen de procesos/objetivos/indicadores
5. WHEN veo detalle de un puesto THEN el sistema SHALL mostrar sección "Personal en este Puesto" con lista de personas

### Requirement 10: Interfaz de usuario - Asignación de contexto

**User Story:** Como administrador, quiero una interfaz clara para asignar contexto a puestos, para configurar fácilmente las asignaciones.

#### Acceptance Criteria

1. WHEN accedo a /admin/puestos/[id]/asignar-contexto THEN el sistema SHALL mostrar formulario con tres secciones
2. WHEN veo la sección de Procesos THEN el sistema SHALL mostrar lista de procesos asignados y selector para agregar más
3. WHEN veo la sección de Objetivos THEN el sistema SHALL mostrar lista de objetivos asignados y selector para agregar más
4. WHEN veo la sección de Indicadores THEN el sistema SHALL mostrar lista de indicadores asignados y selector para agregar más
5. WHEN guardo cambios THEN el sistema SHALL mostrar diálogo preguntando si desea propagar a personal
6. WHEN confirmo guardar THEN el sistema SHALL mostrar mensaje de éxito y redirigir al detalle del puesto
