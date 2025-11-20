# Design Document

## Overview

Este documento describe el diseño técnico del sistema de gestión de Auditorías, Hallazgos y Acciones para 9001app-firebase. El sistema implementa tres módulos ABM interrelacionados que siguen las 3 fases requeridas por la norma ISO 9001:2015 (Detección, Tratamiento, Control) con un sistema de trazabilidad numérica completo.

El diseño se basa en Next.js 14 con App Router, Firebase Firestore como base de datos, y TypeScript para type safety. La arquitectura sigue el patrón de servicios con separación clara entre capa de presentación, lógica de negocio y acceso a datos.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Auditorías  │  │  Hallazgos   │  │   Acciones   │      │
│  │  Components  │  │  Components  │  │  Components  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js API Routes                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   /audits    │  │  /findings   │  │  /actions    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │AuditService  │  │FindingService│  │ActionService │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌─────────────────────────────────────────────────┐        │
│  │      TraceabilityService (Shared)               │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Firebase Firestore                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   audits     │  │   findings   │  │   actions    │      │
│  │  collection  │  │  collection  │  │  collection  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌─────────────────────────────────────────────────┐        │
│  │         counters collection                      │        │
│  │  (para generación de números secuenciales)      │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Trazabilidad

```
Auditoría (AUD-2024-001)
    │
    ├─► Hallazgo 1 (HAL-2024-001)
    │       │
    │       ├─► Acción 1 (ACC-2024-001)
    │       └─► Acción 2 (ACC-2024-002)
    │
    └─► Hallazgo 2 (HAL-2024-002)
            │
            └─► Acción 3 (ACC-2024-003)
```

### Flujo de las 3 Fases ISO 9001

```
FASE 1: DETECCIÓN
┌─────────────────────────────────────┐
│  Hallazgo Creado                    │
│  - Fecha de registro                │
│  - Reportó / Registró               │
│  - Descripción y consecuencia       │
│  - Acción inmediata (corrección)    │
│  - Responsable del tratamiento      │
└─────────────────────────────────────┘
              │
              ▼
FASE 2: TRATAMIENTO
┌─────────────────────────────────────┐
│  Análisis de Causa Raíz             │
│  - Análisis de causas básicas       │
│  - ¿Requiere acción?                │
│                                      │
│  Creación de Acciones               │
│  - Acción correctiva/preventiva     │
│  - Grupo de trabajo                 │
│  - Responsable de implementación    │
│  - Fechas de compromiso             │
└─────────────────────────────────────┘
              │
              ▼
FASE 3: CONTROL
┌─────────────────────────────────────┐
│  Verificación de Efectividad        │
│  - Responsable de verificación      │
│  - Criterio para considerar eficaz  │
│  - Resultado de verificación        │
│  - Cierre del hallazgo              │
└─────────────────────────────────────┘
```

## Data Models

### Audit Interface

```typescript
export interface Audit {
  // Identificación
  id: string;
  auditNumber: string; // AUD-YYYY-XXX
  title: string;
  description?: string;

  // Clasificación
  auditType: 'internal' | 'external' | 'supplier' | 'customer';
  auditScope: 'full' | 'partial' | 'follow_up';
  isoClausesCovered: string[]; // ['4.1', '5.2', '8.1']

  // Fechas
  plannedDate: string; // ISO date string
  actualStartDate?: string;
  actualEndDate?: string;
  duration?: number; // En horas

  // Equipo auditor
  leadAuditorId: string;
  leadAuditorName: string;
  auditTeam: {
    auditorId: string;
    auditorName: string;
    role: 'lead' | 'assistant' | 'observer';
  }[];

  // Estado y calificación
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  overallRating?:
    | 'excellent'
    | 'good'
    | 'satisfactory'
    | 'needs_improvement'
    | 'unsatisfactory';

  // Contadores de hallazgos (actualizados automáticamente)
  findingsCount: number;
  criticalFindings: number;
  majorFindings: number;
  minorFindings: number;
  observations: number;

  // Seguimiento
  followUpRequired: boolean;
  followUpDate?: string;
  correctionDeadline?: string;

  // Trazabilidad
  traceabilityChain: string[]; // IDs relacionados

  // Metadatos
  createdBy: string;
  updatedBy?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Finding Interface

```typescript
export interface Finding {
  // Identificación
  id: string;
  findingNumber: string; // HAL-YYYY-XXX
  title: string;
  description: string;

  // FASE 1: DETECCIÓN
  // Origen del hallazgo
  source: 'audit' | 'employee' | 'customer' | 'inspection' | 'supplier';
  sourceId: string; // ID del origen
  sourceName: string;
  sourceReference?: string;

  // Registro
  identifiedDate: string; // Fecha de registro
  reportedBy: string; // Quién reportó (ID)
  reportedByName: string;
  identifiedBy: string; // Quién registró (ID)
  identifiedByName: string;

  // Clasificación
  findingType: 'non_conformity' | 'observation' | 'improvement_opportunity';
  severity: 'critical' | 'major' | 'minor' | 'low';
  category:
    | 'quality'
    | 'safety'
    | 'environment'
    | 'process'
    | 'equipment'
    | 'documentation';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';

  // Descripción y consecuencia
  consequence?: string;

  // Acción inmediata (Corrección)
  immediateCorrection?: {
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    commitmentDate?: string; // Fecha de compromiso
    closureDate?: string; // Fecha de cierre
  };

  // Proceso y responsable
  processId?: string;
  processName?: string;
  responsiblePersonId?: string; // Responsable del tratamiento
  responsiblePersonName?: string;

  // Evidencia
  evidence: string;
  evidenceDocuments: string[];

  // FASE 2: TRATAMIENTO
  // Análisis de causa raíz
  rootCauseAnalysis?: {
    method: string; // 5 Por qué, Ishikawa, etc.
    rootCause: string; // Causa raíz (raíz del problema)
    contributingFactors?: string[];
    analysis: string;
  };

  // ¿Requiere acción?
  requiresAction: boolean;

  // Fechas
  targetCloseDate?: string;
  actualCloseDate?: string;

  // Acciones relacionadas
  actionsCount: number;
  openActionsCount: number;
  completedActionsCount: number;

  // FASE 3: CONTROL (se completa cuando las acciones son verificadas)
  // Verificación
  verifiedBy?: string;
  verificationDate?: string;
  verificationEvidence?: string;
  isVerified: boolean;
  verificationComments?: string;

  // Estado y fase actual
  status: 'open' | 'in_analysis' | 'action_planned' | 'in_progress' | 'closed';
  currentPhase: 'detection' | 'treatment' | 'control';
  priority: 'low' | 'medium' | 'high' | 'critical';

  // Recurrencia
  isRecurrent: boolean;
  previousFindingIds?: string[];
  recurrenceCount?: number;

  // Evaluación de impacto
  impactAssessment?: {
    customerImpact: boolean;
    regulatoryImpact: boolean;
    financialImpact: boolean;
    operationalImpact: boolean;
    description?: string;
  };

  // Trazabilidad
  traceabilityChain: string[];

  // Metadatos
  createdBy: string;
  updatedBy?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Action Interface

```typescript
export interface Action {
  // Identificación
  id: string;
  actionNumber: string; // ACC-YYYY-XXX
  title: string;
  description: string;

  // FASE 2: TRATAMIENTO (Implementación)
  // Tipo y origen
  actionType: 'corrective' | 'preventive' | 'improvement';
  sourceType: 'audit' | 'employee' | 'customer' | 'finding';
  sourceId: string;
  findingId: string; // ID del hallazgo relacionado
  findingNumber: string; // Número del hallazgo

  // Fechas de tratamiento
  treatmentStartDate?: string; // Fecha de inicio de tratamiento
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;

  // Responsables e implementación
  responsiblePersonId: string; // Responsable de implementación
  responsiblePersonName: string;
  teamMembers?: {
    // Grupo de trabajo
    userId: string;
    userName: string;
    role: string;
  }[];

  // Fechas de compromiso
  implementationCommitmentDate?: string; // Fecha de compromiso de implementación
  executionDate?: string; // Fecha de ejecución

  // Estado y progreso
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number; // 0-100
  currentPhase: 'treatment' | 'control';

  // Plan de acción
  actionPlan?: {
    steps: {
      sequence: number;
      description: string;
      responsible: string;
      deadline: string;
      status: 'pending' | 'in_progress' | 'completed';
      evidence?: string;
    }[];
  };

  // Recursos requeridos
  requiredResources?: {
    budget?: number;
    equipment?: string[];
    personnel?: string[];
    time?: number; // Horas estimadas
  };

  // FASE 3: CONTROL
  // Verificación de efectividad
  effectivenessVerification?: {
    responsiblePersonId: string; // Responsable de verificación
    responsiblePersonName: string;
    verificationCommitmentDate?: string; // Fecha de compromiso de verificación
    verificationExecutionDate?: string; // Fecha de ejecución de verificación
    method: string;
    criteria: string; // Criterio para considerar eficaz
    isEffective: boolean;
    result: string; // Resultado de la verificación
    evidence: string;
    comments?: string;
  };

  // Documentos y comentarios
  documents: string[];
  comments: {
    userId: string;
    userName: string;
    comment: string;
    timestamp: string;
  }[];

  // Trazabilidad
  traceabilityChain: string[];

  // Metadatos
  createdBy: string;
  updatedBy?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Components and Interfaces

### Component Structure

```
src/components/
├── audits/
│   ├── AuditsList.tsx              # Lista principal con filtros
│   ├── AuditCard.tsx               # Tarjeta de auditoría
│   ├── AuditFormDialog.tsx         # Formulario crear/editar
│   ├── AuditDashboard.tsx          # Dashboard con métricas
│   ├── AuditTeamSelector.tsx       # Selector de equipo auditor
│   └── AuditStatusBadge.tsx        # Badge de estado
│
├── findings/
│   ├── FindingsList.tsx            # Lista principal con filtros
│   ├── FindingCard.tsx             # Tarjeta de hallazgo
│   ├── FindingFormDialog.tsx       # Formulario crear/editar
│   ├── FindingDashboard.tsx        # Dashboard con métricas
│   ├── FindingPhaseIndicator.tsx   # Indicador de fase (1, 2, 3)
│   ├── ImmediateCorrectionForm.tsx # Formulario de corrección inmediata
│   ├── RootCauseAnalysisForm.tsx   # Formulario análisis causa raíz
│   ├── FindingVerificationForm.tsx # Formulario de verificación
│   └── FindingStatusBadge.tsx      # Badge de estado
│
└── actions/
    ├── ActionsList.tsx             # Lista principal con filtros
    ├── ActionCard.tsx              # Tarjeta de acción
    ├── ActionFormDialog.tsx        # Formulario crear/editar
    ├── ActionDashboard.tsx         # Dashboard con métricas
    ├── ActionPlanSteps.tsx         # Componente de pasos del plan
    ├── ActionProgressBar.tsx       # Barra de progreso
    ├── EffectivenessVerificationForm.tsx  # Formulario verificación
    ├── ActionPhaseIndicator.tsx    # Indicador de fase
    └── ActionStatusBadge.tsx       # Badge de estado
```

### Key Component Patterns

#### AuditFormDialog.tsx

- Formulario multi-paso para crear/editar auditorías
- Validación con Zod
- Selector de equipo auditor
- Selector de cláusulas ISO
- Manejo de fechas

#### FindingFormDialog.tsx

- Formulario adaptado según la fase actual
- Fase 1: Campos de detección
- Fase 2: Análisis de causa raíz
- Fase 3: Verificación
- Indicador visual de fase actual

#### ActionFormDialog.tsx

- Vinculación obligatoria a hallazgo
- Plan de acción por pasos
- Asignación de responsables
- Gestión de recursos

## Services

### AuditService

```typescript
export class AuditService {
  // CRUD básico
  static async getAll(filters?: AuditFilters): Promise<Audit[]>;
  static async getById(id: string): Promise<Audit | null>;
  static async create(data: AuditFormData): Promise<Audit>;
  static async update(id: string, data: Partial<AuditFormData>): Promise<Audit>;
  static async delete(id: string): Promise<void>;

  // Operaciones específicas
  static async updateStatus(
    id: string,
    status: string,
    userId: string
  ): Promise<Audit>;
  static async getFindings(auditId: string): Promise<Finding[]>;
  static async updateFindingsCounters(auditId: string): Promise<void>;
  static async getStats(year?: number): Promise<AuditStats>;

  // Generación de número
  static async generateAuditNumber(): Promise<string>; // AUD-YYYY-XXX
}
```

### FindingService

```typescript
export class FindingService {
  // CRUD básico
  static async getAll(filters?: FindingFilters): Promise<Finding[]>;
  static async getById(id: string): Promise<Finding | null>;
  static async create(data: FindingFormData): Promise<Finding>;
  static async update(
    id: string,
    data: Partial<FindingFormData>
  ): Promise<Finding>;
  static async delete(id: string): Promise<void>;

  // Operaciones de fase
  static async updatePhase(id: string, phase: string): Promise<Finding>;
  static async updateStatus(
    id: string,
    status: string,
    userId: string
  ): Promise<Finding>;

  // Fase 1: Detección
  static async addImmediateCorrection(
    id: string,
    correction: ImmediateCorrection
  ): Promise<Finding>;

  // Fase 2: Tratamiento
  static async analyzeRootCause(
    id: string,
    analysis: RootCauseAnalysis
  ): Promise<Finding>;
  static async setRequiresAction(
    id: string,
    requires: boolean
  ): Promise<Finding>;

  // Fase 3: Control
  static async verify(
    id: string,
    verification: VerificationData
  ): Promise<Finding>;

  // Relaciones
  static async getBySource(
    sourceType: string,
    sourceId: string
  ): Promise<Finding[]>;
  static async getActions(findingId: string): Promise<Action[]>;
  static async updateActionsCounters(findingId: string): Promise<void>;

  // Utilidades
  static async checkRecurrence(findingId: string): Promise<RecurrenceCheck>;
  static async getStats(year?: number): Promise<FindingStats>;
  static async generateFindingNumber(): Promise<string>; // HAL-YYYY-XXX
}
```

### ActionService

```typescript
export class ActionService {
  // CRUD básico
  static async getAll(filters?: ActionFilters): Promise<Action[]>;
  static async getById(id: string): Promise<Action | null>;
  static async create(data: ActionFormData): Promise<Action>;
  static async update(
    id: string,
    data: Partial<ActionFormData>
  ): Promise<Action>;
  static async delete(id: string): Promise<void>;

  // Operaciones de fase
  static async updatePhase(id: string, phase: string): Promise<Action>;
  static async updateStatus(
    id: string,
    status: string,
    userId: string
  ): Promise<Action>;
  static async updateProgress(id: string, progress: number): Promise<Action>;

  // Plan de acción
  static async updateActionPlanStep(
    actionId: string,
    stepSequence: number,
    status: string
  ): Promise<Action>;

  // Fase 3: Control
  static async verifyEffectiveness(
    id: string,
    verification: EffectivenessVerification
  ): Promise<Action>;

  // Relaciones
  static async getByFinding(findingId: string): Promise<Action[]>;

  // Utilidades
  static async addComment(id: string, comment: CommentData): Promise<Action>;
  static async getStats(year?: number): Promise<ActionStats>;
  static async generateActionNumber(): Promise<string>; // ACC-YYYY-XXX
}
```

### TraceabilityService (Shared)

```typescript
export class TraceabilityService {
  // Generación de números secuenciales
  static async generateNumber(prefix: string, year: number): Promise<string>;

  // Construcción de cadena de trazabilidad
  static buildTraceabilityChain(sourceChain: string[], newId: string): string[];

  // Navegación de trazabilidad
  static async getAuditFromAction(actionId: string): Promise<Audit | null>;
  static async getFindingFromAction(actionId: string): Promise<Finding | null>;
  static async getAuditFromFinding(findingId: string): Promise<Audit | null>;

  // Validación de trazabilidad
  static async validateTraceability(
    entityType: string,
    entityId: string
  ): Promise<boolean>;
}
```

## Error Handling

### Error Types

```typescript
export class AuditNotFoundError extends Error {
  constructor(id: string) {
    super(`Audit with id ${id} not found`);
    this.name = 'AuditNotFoundError';
  }
}

export class FindingNotFoundError extends Error {
  constructor(id: string) {
    super(`Finding with id ${id} not found`);
    this.name = 'FindingNotFoundError';
  }
}

export class ActionNotFoundError extends Error {
  constructor(id: string) {
    super(`Action with id ${id} not found`);
    this.name = 'ActionNotFoundError';
  }
}

export class InvalidPhaseTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Invalid phase transition from ${from} to ${to}`);
    this.name = 'InvalidPhaseTransitionError';
  }
}

export class TraceabilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TraceabilityError';
  }
}
```

### Error Handling Pattern

```typescript
// En API Routes
try {
  const result = await AuditService.getById(id);
  return NextResponse.json(result);
} catch (error) {
  if (error instanceof AuditNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

## Testing Strategy

### Unit Tests

- Servicios: Lógica de negocio y transformaciones
- Validaciones: Esquemas Zod
- Utilidades: Funciones helper

### Integration Tests

- API Routes: Endpoints completos
- Firestore: Operaciones de base de datos
- Trazabilidad: Flujos completos

### Component Tests

- Formularios: Validación y submit
- Listas: Filtros y paginación
- Dashboards: Cálculo de métricas

## Future Considerations

### Calendar Integration

Las entidades están preparadas para integrarse con un calendario unificado futuro:

- Auditorías: `plannedDate`, `actualStartDate`, `actualEndDate`
- Hallazgos: `targetCloseDate`, `actualCloseDate`
- Acciones: `plannedStartDate`, `plannedEndDate`, `implementationCommitmentDate`, `verificationCommitmentDate`

### Module Integrations (Fase Final)

- RRHH: Vinculación con Personnel para responsables
- Procesos: Vinculación con ProcessDefinition
- IA Don Cándido: Contexto de auditorías, hallazgos y acciones pendientes

### Performance Optimization

- Índices compuestos en Firestore
- Paginación en listas
- Cache de contadores
- Lazy loading de relaciones
