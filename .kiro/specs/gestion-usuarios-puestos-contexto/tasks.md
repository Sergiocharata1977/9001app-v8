# Implementation Plan - MVP Gestión de Usuarios y Contexto

## Overview

Este plan de implementación está organizado en tareas incrementales que construyen la funcionalidad de gestión de puestos con asignación de contexto para la IA Don Cándido.

**Estrategia:** Implementar de forma incremental, validando cada paso antes de continuar.

---

## Tasks

- [x] 1. Actualizar modelo de datos de Position
  - Agregar campos `procesos_asignados`, `objetivos_asignados`, `indicadores_asignados` al tipo Position
  - Crear tipo `PositionWithAssignments` para datos expandidos
  - Crear tipo `PositionAssignmentsFormData` para formularios

  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Crear PositionService con métodos básicos
  - [x] 2.1 Implementar método `getAll()` para obtener lista de puestos
    - Consultar colección `positions`
    - Ordenar por nombre
    - _Requirements: 2.1_

  - [x] 2.2 Implementar método `getAllWithPersonnelCount()` para obtener puestos con conteo
    - Obtener todos los positions
    - Para cada position, contar personnel con ese puesto
    - Retornar array con `personnel_count`
    - _Requirements: 2.1, 9.1_

  - [ ] 2.3 Implementar método `getById()` para obtener puesto por ID
    - Consultar document en `positions/{id}`
    - Retornar Position o null
    - _Requirements: 2.3_
  - [ ] 2.4 Implementar método `getByIdWithAssignments()` para expandir asignaciones
    - Obtener position

    - Expandir `procesos_asignados` consultando `processDefinitions`
    - Expandir `objetivos_asignados` consultando `qualityObjectives`
    - Expandir `indicadores_asignados` consultando `qualityIndicators`
    - Usar Promise.all() para consultas paralelas
    - Contar personnel en este puesto

    - _Requirements: 1.4, 2.3, 9.4_

  - [ ] 2.5 Implementar método `create()` para crear puesto
    - Validar datos requeridos (nombre)

    - Inicializar arrays de asignaciones como vacíos
    - Crear document en Firestore
    - _Requirements: 1.2, 2.2, 8.1_

  - [ ] 2.6 Implementar método `update()` para actualizar info básica
    - Validar que position existe
    - Actualizar solo campos básicos (nombre, descripción, departamento_id, reporta_a_id)
    - _Requirements: 2.3, 8.1_
  - [ ] 2.7 Implementar método `delete()` con validación
    - Verificar que no haya personnel activo con este puesto
    - Si hay, lanzar error con lista de personas
    - Si no hay, eliminar document
    - _Requirements: 2.4, 8.3_

- [x] 3. Implementar asignación de contexto a Position
  - [ ] 3.1 Implementar método `updateAssignments()` en PositionService
    - Validar que todos los IDs de procesos existen

    - Validar que todos los IDs de objetivos existen
    - Validar que todos los IDs de indicadores existen
    - Actualizar campos en Firestore
    - _Requirements: 1.3, 3.2, 8.2_

  - [ ] 3.2 Implementar método `propagateAssignmentsToPersonnel()` en PositionService
    - Obtener position con sus asignaciones
    - Buscar todos los personnel donde `puesto = positionId` y `estado = 'Activo'`
    - Para cada personnel, actualizar `procesos_asignados`, `objetivos_asignados`, `indicadores_asignados`
    - Usar batch writes si son más de 10 personnel
    - Retornar cantidad de personnel actualizados
    - _Requirements: 3.6, 3.7_
  - [ ] 3.3 Implementar método `getPersonnelInPosition()` en PositionService
    - Consultar personnel donde `puesto = positionId`
    - Ordenar por apellidos
    - _Requirements: 2.5, 9.5_

- [ ] 4. Crear API routes para Positions
  - [x] 4.1 Crear GET /api/positions - Lista todos los puestos
    - Llamar a `PositionService.getAllWithPersonnelCount()`
    - Retornar array de positions con conteo
    - _Requirements: 9.1_

  - [ ] 4.2 Crear POST /api/positions - Crear puesto
    - Validar body con datos requeridos
    - Llamar a `PositionService.create()`
    - Retornar ID del nuevo puesto
    - _Requirements: 2.2_
  - [x] 4.3 Crear GET /api/positions/[id] - Obtener puesto por ID
    - Llamar a `PositionService.getByIdWithAssignments()`
    - Retornar position expandido o 404
    - _Requirements: 2.3, 9.4_

  - [x] 4.4 Crear PUT /api/positions/[id] - Actualizar info básica
    - Validar body
    - Llamar a `PositionService.update()`
    - Retornar success
    - _Requirements: 2.3_

  - [x] 4.5 Crear DELETE /api/positions/[id] - Eliminar puesto
    - Llamar a `PositionService.delete()`
    - Manejar error si hay personnel activo
    - Retornar success o error
    - _Requirements: 2.4_

  - [x] 4.6 Crear PUT /api/positions/[id]/assignments - Actualizar asignaciones
    - Validar body con arrays de IDs
    - Llamar a `PositionService.updateAssignments()`
    - Si `propagate = true`, llamar a `propagateAssignmentsToPersonnel()`
    - Retornar cantidad de personnel actualizados
    - _Requirements: 3.2, 3.6, 3.7_

  - [x] 4.7 Crear GET /api/positions/[id]/personnel - Obtener personal en puesto
    - Llamar a `PositionService.getPersonnelInPosition()`
    - Retornar array de personnel
    - _Requirements: 9.5_

- [x] 5. Extender PersonnelService con métodos de asignación
  - [x] 5.1 Implementar método `assignPosition()` en PersonnelService
    - Validar que position existe
    - Actualizar campo `puesto` en personnel
    - Si `copyAssignments = true`, obtener asignaciones del position y copiarlas
    - _Requirements: 4.2, 6.2_

  - [x] 5.2 Implementar método `changePosition()` en PersonnelService
    - Validar que newPosition existe
    - Actualizar campo `puesto`
    - Si `replaceAssignments = true`, reemplazar asignaciones con las del nuevo puesto
    - _Requirements: 4.3, 4.4, 4.5_

  - [x] 5.3 Implementar método `updateAssignments()` en PersonnelService
    - Actualizar solo los campos especificados en el objeto assignments
    - Permitir actualización parcial
    - _Requirements: 5.3_

- [x] 6. Crear API routes para Personnel (extensión)
  - [x] 6.1 Crear PUT /api/personnel/[id]/position - Asignar/cambiar puesto
    - Validar body con `positionId` y `replaceAssignments`
    - Llamar a `PersonnelService.changePosition()`
    - Retornar personnel actualizado
    - _Requirements: 4.2, 4.3_

  - [x] 6.2 Crear PUT /api/personnel/[id]/assignments - Actualizar asignaciones manualmente
    - Validar body con arrays opcionales
    - Llamar a `PersonnelService.updateAssignments()`

    - Retornar personnel actualizado
    - _Requirements: 5.2, 5.3_

- [x] 7. Crear componentes UI para lista de Puestos
  - [x] 7.1 Crear componente PositionsList
    - Tabla con columnas: Nombre, Departamento, Personal (count), Contexto (badges), Acciones
    - Botones: Ver, Editar, Eliminar
    - Usar estilos consistentes con el resto de la app (sin bordes, sombras verdes)
    - _Requirements: 9.1, 9.2_

  - [x] 7.2 Crear página /admin/puestos (lista)
    - Usar PositionsList component
    - Botón "Crear Puesto" que abre diálogo
    - Cargar datos desde GET /api/positions
    - _Requirements: 9.1_

- [x] 8. Crear componentes UI para crear/editar Puesto
  - [ ] 8.1 Crear componente PositionFormDialog
    - Formulario simple con: Nombre, Descripción, Departamento (selector), Reporta a (selector)
    - Modo crear y editar

    - Validación de campos requeridos
    - _Requirements: 2.2, 2.3_

  - [ ] 8.2 Integrar PositionFormDialog en página de lista
    - Abrir diálogo al hacer clic en "Crear Puesto"
    - Abrir diálogo al hacer clic en "Editar"
    - Llamar a POST /api/positions o PUT /api/positions/[id]
    - Recargar lista después de guardar
    - _Requirements: 2.2, 2.3_

- [x] 9. Crear página de detalle de Puesto
  - [x] 9.1 Crear página /admin/puestos/[id]
    - Mostrar información básica del puesto

    - Mostrar sección "Contexto Asignado" con resumen (cantidad de procesos/objetivos/indicadores)
    - Mostrar sección "Personal en este Puesto" con lista de personas
    - Botones: "Editar", "Asignar Contexto", "Volver"

    - Cargar datos desde GET /api/positions/[id]
    - _Requirements: 2.5, 9.3, 9.4, 9.5_

- [x] 10. Crear componentes UI para asignar contexto a Puesto
  - [ ] 10.1 Crear componente PositionAssignmentsForm
    - Tres secciones: Procesos, Objetivos, Indicadores
    - Cada sección con: lista actual (con botón eliminar) y selector múltiple para agregar

    - Cargar opciones desde APIs correspondientes
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 10.2, 10.3, 10.4_

  - [ ] 10.2 Implementar diálogo de confirmación de propagación
    - Al guardar, mostrar diálogo: "¿Propagar cambios a todo el personal en este puesto?"

    - Mostrar cantidad de personas que serán afectadas
    - Botones: "Solo guardar" / "Guardar y propagar"
    - _Requirements: 3.6, 10.5_

  - [ ] 10.3 Crear página /admin/puestos/[id]/asignar-contexto
    - Usar PositionAssignmentsForm component
    - Cargar asignaciones actuales desde GET /api/positions/[id]

    - Guardar cambios con PUT /api/positions/[id]/assignments
    - Mostrar mensaje de éxito con cantidad de personnel actualizados
    - Redirigir a detalle del puesto
    - _Requirements: 10.1, 10.5, 10.6_

- [x] 11. Modificar ABM de Personal para incluir Puesto
  - [x] 11.1 Crear componente PersonnelPositionSelector
    - Selector de puesto con lista de puestos activos
    - Si cambia de puesto existente, mostrar diálogo de confirmación
    - Diálogo: "¿Reemplazar asignaciones actuales con las del nuevo puesto?"
    - Botones: "Mantener actuales" / "Reemplazar"
    - _Requirements: 4.1, 4.3_

  - [ ] 11.2 Integrar PersonnelPositionSelector en formulario de Personal
    - Agregar campo "Puesto" en formulario de crear/editar
    - Al seleccionar puesto en creación, copiar asignaciones automáticamente
    - Al cambiar puesto en edición, mostrar diálogo de confirmación
    - Llamar a PUT /api/personnel/[id]/position con parámetro `replaceAssignments`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 12. Crear página para editar asignaciones de Personal manualmente
  - [ ] 12.1 Crear página /dashboard/rrhh/personal/[id]/asignar-contexto
    - Similar a la página de asignación de puesto
    - Usar formulario con tres secciones: Procesos, Objetivos, Indicadores
    - Cargar asignaciones actuales del personnel
    - Guardar con PUT /api/personnel/[id]/assignments
    - Mostrar indicador si las asignaciones difieren del puesto
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ] 12.2 Agregar botón "Editar Asignaciones" en detalle de Personal
    - En página de detalle de personnel, agregar botón
    - Navegar a /dashboard/rrhh/personal/[id]/asignar-contexto
    - _Requirements: 5.1_

- [ ] 13. Actualizar navegación y sidebar
  - [ ] 13.1 Agregar enlace a gestión de Puestos en sidebar
    - En sección "Administración" o "RRHH"
    - Enlace a /admin/puestos
    - Solo visible para admin y gerente
  - [ ] 13.2 Actualizar breadcrumbs en páginas nuevas
    - Agregar breadcrumbs consistentes en todas las páginas de puestos
    - Ejemplo: Inicio > Administración > Puestos > Detalle

- [ ] 14. Testing y validación
  - [ ] 14.1 Probar flujo completo de creación de puesto
    - Crear puesto sin asignaciones
    - Verificar que aparece en lista
    - Verificar que se puede ver detalle
  - [ ] 14.2 Probar asignación de contexto a puesto
    - Asignar procesos/objetivos/indicadores
    - Verificar que se guardan correctamente
    - Verificar que aparecen en detalle del puesto
  - [ ] 14.3 Probar propagación a personnel
    - Crear personnel con puesto
    - Verificar que hereda asignaciones
    - Cambiar asignaciones del puesto
    - Propagar cambios
    - Verificar que personnel se actualiza
  - [ ] 14.4 Probar cambio de puesto en personnel
    - Cambiar puesto de personnel existente
    - Probar con "Mantener actuales"
    - Probar con "Reemplazar"
    - Verificar que asignaciones se actualizan correctamente
  - [ ] 14.5 Probar edición manual de asignaciones en personnel
    - Editar asignaciones manualmente
    - Verificar que se guardan
    - Verificar que Don Cándido usa el contexto correcto
  - [ ] 14.6 Probar validaciones
    - Intentar eliminar puesto con personnel activo (debe fallar)
    - Intentar asignar IDs inválidos (debe fallar)
    - Verificar mensajes de error claros
  - [ ] 14.7 Verificar que Don Cándido sigue funcionando
    - Iniciar sesión con usuario que tiene personnel
    - Abrir chat de Don Cándido
    - Verificar que tiene contexto completo
    - Hacer consulta y verificar respuesta contextualizada

- [ ] 15. Documentación y limpieza
  - [ ] 15.1 Actualizar README con nueva funcionalidad
    - Documentar flujo de asignación de contexto
    - Agregar screenshots de las nuevas páginas
  - [ ] 15.2 Agregar comentarios en código complejo
    - Documentar lógica de propagación
    - Documentar validaciones importantes
  - [ ] 15.3 Limpiar console.logs y código de debug
    - Remover logs innecesarios
    - Verificar que no hay TODOs pendientes
