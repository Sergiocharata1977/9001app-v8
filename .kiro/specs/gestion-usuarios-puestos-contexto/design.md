# Design Document - MVP Gestión de Usuarios y Contexto

## Overview

Este documento describe el diseño técnico para implementar la gestión de usuarios, puestos y asignación de contexto (Procesos, Objetivos, Indicadores) para la IA Don Cándido.

**Objetivo principal:** Permitir que los Puestos actúen como contenedores de contexto organizacional, y que el Personal herede automáticamente ese contexto.

**Alcance MVP:**

- Agregar campos de asignaciones al modelo Position
- Crear UI para gestionar Puestos y asignar contexto
- Modificar ABM de Personal para incluir selector de Puesto
- Implementar herencia automática de asignaciones
- Mantener funcionalidad actual de Don Cándido (usa asignaciones de Personnel)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│  Pages:                                                      │
│  - /admin/puestos (lista)                                   │
│  - /admin/puestos/[id] (detalle)                            │
│  - /admin/puestos/[id]/asignar-contexto                     │
│  - /admin/puestos/crear                                      │
│  - /admin/puestos/[id]/editar                               │
│  - /dashboard/rrhh/personal (modificar para incluir puesto) │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Services Layer                          │
├─────────────────────────────────────────────────────────────┤
│  - PositionService (nuevo)                                   │
│  - PersonnelService (extender)                               │
│  - UserContextService (sin cambios)                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Firestore Collections                     │
├─────────────────────────────────────────────────────────────┤
│  positions: {                                                │
│    procesos_asignados: string[]  ← NUEVO                    │
│    objetivos_asignados: string[] ← NUEVO                    │
│    indicadores_asignados: string[] ← NUEVO                  │
│  }                                                           │
│                                                              │
│  personnel: {                                                │
│    puesto: string (Position ID)                             │
│    procesos_asignados: string[]  ← Heredado de Position     │
│    objetivos_asignados: string[]                            │
│    indicadores_asignados: string[]                          │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow - Asignación de Contexto

```
1. Admin asigna contexto a Position
   ↓
2. PositionService.updateAssignments(positionId, assignments)
   ↓
3. Actualiza Position en Firestore
   ↓
4. Si usuario acepta propagar:
   ↓
5. PersonnelService.propagatePositionAssignments(positionId)
   ↓
6. Busca todos los Personnel con ese puesto
   ↓
7. Actualiza procesos_asignados, objetivos_asignados, indicadores_asignados
   ↓
8. UserContextService sigue funcionando igual (lee de Personnel)
```

## Components and Interfaces

### 1. Data Models

#### Position (extendido)

```typescript
// src/types/rrhh.ts

interface Position {
  id: string;
  nombre: string;
  descripcion_responsabilidades?: string;
  requisitos_experiencia?: string;
  requisitos_formacion?: string;
  departamento_id?: string;
  reporta_a_id?: string;

  // NUEVOS CAMPOS
  procesos_asignados?: string[]; // Array de ProcessDefinition IDs
  objetivos_asignados?: string[]; // Array de QualityObjective IDs
  indicadores_asignados?: string[]; // Array de QualityIndicator IDs

  created_at: Date;
  updated_at: Date;
}

// Tipo extendido con datos expandidos
interface PositionWithAssignments extends Position {
  procesos_details?: ProcessDefinition[];
  objetivos_details?: QualityObjective[];
  indicadores_details?: QualityIndicator[];
  personnel_count?: number; // Cantidad de personas en este puesto
}

// Form data para asignaciones
interface PositionAssignmentsFormData {
  procesos_asignados: string[];
  objetivos_asignados: string[];
  indicadores_asignados: string[];
}
```

#### Personnel (sin cambios en estructura, solo en uso)

```typescript
// Ya existe, solo documentamos el uso
interface Personnel {
  // ... campos existentes
  puesto?: string; // ID del Position

  // Estos campos ahora se heredan del Position
  procesos_asignados?: string[];
  objetivos_asignados?: string[];
  indicadores_asignados?: string[];
}
```

### 2. Services

#### PositionService (nuevo)

```typescript
// src/services/rrhh/PositionService.ts

class PositionService {
  private db: Firestore;
  private collectionName = 'positions';

  /**
   * Obtener todos los puestos con conteo de personal
   */
  async getAllWithPersonnelCount(): Promise<PositionWithAssignments[]> {
    // 1. Obtener todos los positions
    // 2. Para cada position, contar personnel con ese puesto
    // 3. Retornar array con personnel_count
  }

  /**
   * Obtener un puesto por ID con asignaciones expandidas
   */
  async getByIdWithAssignments(
    id: string
  ): Promise<PositionWithAssignments | null> {
    // 1. Obtener position
    // 2. Expandir procesos_asignados a ProcessDefinition[]
    // 3. Expandir objetivos_asignados a QualityObjective[]
    // 4. Expandir indicadores_asignados a QualityIndicator[]
    // 5. Contar personnel en este puesto
    // 6. Retornar objeto completo
  }

  /**
   * Crear puesto (solo info básica)
   */
  async create(data: PositionFormData): Promise<string> {
    // Crear position con arrays vacíos
  }

  /**
   * Actualizar info básica del puesto
   */
  async update(id: string, data: Partial<PositionFormData>): Promise<void> {
    // Actualizar campos básicos
  }

  /**
   * Actualizar asignaciones de contexto
   */
  async updateAssignments(
    id: string,
    assignments: PositionAssignmentsFormData
  ): Promise<void> {
    // 1. Validar que los IDs existen
    // 2. Actualizar procesos_asignados, objetivos_asignados, indicadores_asignados
  }

  /**
   * Propagar asignaciones del puesto a todo su personal
   */
  async propagateAssignmentsToPersonnel(positionId: string): Promise<number> {
    // 1. Obtener position con sus asignaciones
    // 2. Buscar todos los personnel con puesto = positionId
    // 3. Para cada personnel:
    //    - Actualizar procesos_asignados
    //    - Actualizar objetivos_asignados
    //    - Actualizar indicadores_asignados
    // 4. Retornar cantidad de personnel actualizados
  }

  /**
   * Eliminar puesto (con validación)
   */
  async delete(id: string): Promise<void> {
    // 1. Verificar que no haya personnel activo con este puesto
    // 2. Si hay, lanzar error
    // 3. Si no hay, eliminar
  }

  /**
   * Obtener personal en un puesto
   */
  async getPersonnelInPosition(positionId: string): Promise<Personnel[]> {
    // Buscar todos los personnel donde puesto = positionId
  }
}
```

#### PersonnelService (extender)

```typescript
// src/services/rrhh/PersonnelService.ts

class PersonnelService {
  // ... métodos existentes

  /**
   * NUEVO: Asignar puesto a personnel y copiar asignaciones
   */
  async assignPosition(
    personnelId: string,
    positionId: string,
    copyAssignments: boolean = true
  ): Promise<void> {
    // 1. Validar que position existe
    // 2. Actualizar campo puesto en personnel
    // 3. Si copyAssignments = true:
    //    - Obtener asignaciones del position
    //    - Copiar a procesos_asignados, objetivos_asignados, indicadores_asignados
  }

  /**
   * NUEVO: Cambiar puesto de personnel
   */
  async changePosition(
    personnelId: string,
    newPositionId: string,
    replaceAssignments: boolean
  ): Promise<void> {
    // 1. Validar que newPosition existe
    // 2. Actualizar campo puesto
    // 3. Si replaceAssignments = true:
    //    - Obtener asignaciones del nuevo position
    //    - Reemplazar asignaciones actuales
  }

  /**
   * NUEVO: Actualizar asignaciones manualmente
   */
  async updateAssignments(
    personnelId: string,
    assignments: {
      procesos_asignados?: string[];
      objetivos_asignados?: string[];
      indicadores_asignados?: string[];
    }
  ): Promise<void> {
    // Actualizar solo las asignaciones especificadas
  }
}
```

### 3. API Routes

#### Positions API

```typescript
// src/app/api/positions/route.ts
// GET /api/positions - Lista todos los puestos
// POST /api/positions - Crear puesto

// src/app/api/positions/[id]/route.ts
// GET /api/positions/[id] - Obtener puesto por ID
// PUT /api/positions/[id] - Actualizar info básica
// DELETE /api/positions/[id] - Eliminar puesto

// src/app/api/positions/[id]/assignments/route.ts
// PUT /api/positions/[id]/assignments - Actualizar asignaciones
// Body: { procesos_asignados, objetivos_asignados, indicadores_asignados, propagate: boolean }

// src/app/api/positions/[id]/personnel/route.ts
// GET /api/positions/[id]/personnel - Obtener personal en este puesto
```

#### Personnel API (extender)

```typescript
// src/app/api/personnel/[id]/position/route.ts
// PUT /api/personnel/[id]/position - Asignar/cambiar puesto
// Body: { positionId: string, replaceAssignments: boolean }

// src/app/api/personnel/[id]/assignments/route.ts
// PUT /api/personnel/[id]/assignments - Actualizar asignaciones manualmente
// Body: { procesos_asignados?, objetivos_asignados?, indicadores_asignados? }
```

### 4. UI Components

#### PositionsList Component

```typescript
// src/components/positions/PositionsList.tsx

interface PositionsListProps {
  positions: PositionWithAssignments[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// Tabla con columnas:
// - Nombre
// - Departamento
// - Personal (cantidad)
// - Contexto (badge con cantidad de procesos/objetivos/indicadores)
// - Acciones (Ver, Editar, Eliminar)
```

#### PositionFormDialog Component

```typescript
// src/components/positions/PositionFormDialog.tsx

interface PositionFormDialogProps {
  position?: Position; // undefined = crear, definido = editar
  onSave: (data: PositionFormData) => Promise<void>;
  onCancel: () => void;
}

// Formulario simple con:
// - Nombre (requerido)
// - Descripción
// - Departamento (selector)
// - Reporta a (selector de otros puestos)
```

#### PositionAssignmentsForm Component

```typescript
// src/components/positions/PositionAssignmentsForm.tsx

interface PositionAssignmentsFormProps {
  position: PositionWithAssignments;
  onSave: (
    assignments: PositionAssignmentsFormData,
    propagate: boolean
  ) => Promise<void>;
  onCancel: () => void;
}

// Formulario con tres secciones:
// 1. Procesos Asignados
//    - Lista actual con botón eliminar
//    - Selector múltiple para agregar
// 2. Objetivos Asignados
//    - Lista actual con botón eliminar
//    - Selector múltiple para agregar
// 3. Indicadores Asignados
//    - Lista actual con botón eliminar
//    - Selector múltiple para agregar
//
// Al guardar:
// - Mostrar diálogo: "¿Propagar cambios a todo el personal en este puesto?"
// - Botones: "Solo guardar" / "Guardar y propagar"
```

#### PersonnelPositionSelector Component

```typescript
// src/components/personnel/PersonnelPositionSelector.tsx

interface PersonnelPositionSelectorProps {
  currentPositionId?: string;
  onChange: (positionId: string, replaceAssignments: boolean) => void;
}

// Selector de puesto con:
// - Dropdown de puestos disponibles
// - Si cambia de puesto existente:
//   - Mostrar diálogo: "¿Reemplazar asignaciones actuales con las del nuevo puesto?"
//   - Botones: "Mantener actuales" / "Reemplazar"
```

## Data Models

### Firestore Collections

#### positions

```javascript
{
  id: "pos_001",
  nombre: "Jefe de Calidad",
  descripcion_responsabilidades: "Gestionar el sistema de calidad...",
  requisitos_experiencia: "3 años en gestión de calidad",
  requisitos_formacion: "Ingeniería o afín",
  departamento_id: "dep_calidad",
  reporta_a_id: "pos_gerente_operaciones",

  // NUEVOS CAMPOS
  procesos_asignados: ["proc_001", "proc_002", "proc_003"],
  objetivos_asignados: ["obj_001", "obj_002"],
  indicadores_asignados: ["ind_001", "ind_002", "ind_003"],

  created_at: Timestamp,
  updated_at: Timestamp
}
```

#### personnel (sin cambios estructurales)

```javascript
{
  id: "pers_001",
  nombres: "María",
  apellidos: "González",
  email: "maria@empresa.com",
  puesto: "pos_001",  // ← Referencia a Position

  // Estos campos se copian del Position cuando se asigna
  procesos_asignados: ["proc_001", "proc_002", "proc_003"],
  objetivos_asignados: ["obj_001", "obj_002"],
  indicadores_asignados: ["ind_001", "ind_002", "ind_003"],

  // ... resto de campos
}
```

## Error Handling

### Validaciones

1. **Al crear/editar Position:**
   - Nombre no vacío
   - Departamento existe (si se proporciona)
   - Reporta_a existe y no crea ciclo (si se proporciona)

2. **Al asignar contexto a Position:**
   - Todos los IDs de procesos existen en processDefinitions
   - Todos los IDs de objetivos existen en qualityObjectives
   - Todos los IDs de indicadores existen en qualityIndicators

3. **Al eliminar Position:**
   - No hay personnel activo con ese puesto
   - Si hay, retornar error con lista de personas afectadas

4. **Al asignar puesto a Personnel:**
   - Position existe
   - Si se cambia puesto y hay asignaciones manuales, advertir al usuario

### Error Messages

```typescript
const ERROR_MESSAGES = {
  POSITION_NOT_FOUND: 'El puesto no existe',
  POSITION_HAS_PERSONNEL:
    'No se puede eliminar. Hay {count} personas en este puesto',
  INVALID_PROCESS_ID: 'Proceso no encontrado: {id}',
  INVALID_OBJECTIVE_ID: 'Objetivo no encontrado: {id}',
  INVALID_INDICATOR_ID: 'Indicador no encontrado: {id}',
  CIRCULAR_REFERENCE:
    'No se puede crear referencia circular en jerarquía de puestos',
};
```

## Testing Strategy

### Unit Tests

1. **PositionService:**
   - ✓ create() crea position con arrays vacíos
   - ✓ updateAssignments() valida IDs antes de guardar
   - ✓ propagateAssignmentsToPersonnel() actualiza todos los personnel
   - ✓ delete() valida que no haya personnel activo

2. **PersonnelService:**
   - ✓ assignPosition() copia asignaciones del position
   - ✓ changePosition() pregunta antes de reemplazar asignaciones
   - ✓ updateAssignments() actualiza solo campos especificados

### Integration Tests

1. **Flujo completo de asignación:**
   - Crear Position
   - Asignar contexto al Position
   - Crear Personnel con ese Position
   - Verificar que Personnel tiene las asignaciones
   - Cambiar asignaciones del Position
   - Propagar a Personnel
   - Verificar que Personnel se actualizó

2. **Flujo de cambio de puesto:**
   - Crear Personnel con Position A
   - Cambiar a Position B
   - Verificar que asignaciones se actualizaron

### Manual Testing Checklist

- [ ] Crear puesto sin asignaciones
- [ ] Asignar procesos/objetivos/indicadores a puesto
- [ ] Propagar asignaciones a personal existente
- [ ] Crear personal nuevo con puesto (hereda automáticamente)
- [ ] Cambiar puesto de personal (con y sin reemplazo)
- [ ] Editar asignaciones manualmente en personal
- [ ] Eliminar puesto sin personal
- [ ] Intentar eliminar puesto con personal (debe fallar)
- [ ] Verificar que Don Cándido sigue funcionando correctamente

## Performance Considerations

### Optimizaciones

1. **Carga de Positions:**
   - Usar paginación si hay muchos puestos
   - Cachear lista de puestos en cliente (5 min TTL)

2. **Expansión de asignaciones:**
   - Usar Promise.all() para cargar procesos/objetivos/indicadores en paralelo
   - Cachear objetos expandidos en memoria (1 min TTL)

3. **Propagación a Personnel:**
   - Usar batch writes de Firestore (máx 500 por batch)
   - Mostrar progress bar si hay muchos personnel
   - Ejecutar en background si son más de 50 personas

4. **Conteo de Personnel:**
   - Cachear conteos por position (5 min TTL)
   - Invalidar cache al crear/actualizar/eliminar personnel

### Firestore Indexes

```javascript
// firestore.indexes.json

{
  "indexes": [
    {
      "collectionGroup": "personnel",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "puesto", "order": "ASCENDING" },
        { "fieldPath": "estado", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "positions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "departamento_id", "order": "ASCENDING" },
        { "fieldPath": "nombre", "order": "ASCENDING" }
      ]
    }
  ]
}
```

## Security Considerations

### Firestore Rules

```javascript
// firestore.rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Positions - solo admin y gerente pueden modificar
    match /positions/{positionId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol in ['admin', 'gerente']);
    }

    // Personnel - admin, gerente y jefe pueden modificar
    match /personnel/{personnelId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol in ['admin', 'gerente', 'jefe']);
      allow delete: if request.auth != null &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol in ['admin', 'gerente']);
    }
  }
}
```

## Migration Strategy

### Fase 1: Agregar campos a Position (sin afectar funcionalidad actual)

1. Actualizar tipo Position en `src/types/rrhh.ts`
2. Los campos son opcionales, no rompe nada existente
3. Desplegar

### Fase 2: Crear servicios y APIs

1. Crear PositionService
2. Extender PersonnelService
3. Crear API routes
4. Desplegar

### Fase 3: Crear UI

1. Crear componentes de Positions
2. Modificar formulario de Personnel
3. Desplegar

### Fase 4: Migración de datos (opcional, manual)

1. Script para copiar asignaciones de Personnel a Position
2. Agrupar por puesto
3. Consolidar asignaciones comunes
4. Ejecutar manualmente cuando sea necesario

## Future Enhancements

### Fase 2 (Post-MVP)

- Plantillas de asignaciones por tipo de puesto
- Asignación masiva por departamento
- Dashboard de cobertura (qué procesos están cubiertos)
- Historial de cambios en asignaciones
- Notificaciones cuando cambian asignaciones

### Fase 3 (Avanzado)

- Matriz RACI por proceso y puesto
- Sugerencias automáticas de asignaciones basadas en IA
- Análisis de carga de trabajo por puesto
- Reportes de distribución de responsabilidades
