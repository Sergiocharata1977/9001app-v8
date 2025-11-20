# Design Document: Sistema de Auditorías Rediseñado

## Fecha: 10 de noviembre de 2025

---

## 🎯 Objetivo

Rediseñar el sistema de auditorías para:

1. Soportar auditorías **completas** (todos los puntos) y **parciales** (puntos seleccionados)
2. Separar claramente la fase de **planificación** vs **ejecución**
3. Preparar estructura para futuras relaciones con hallazgos
4. Mantener simplicidad sin relaciones activas en esta fase

---

## 📊 Modelo de Datos

### Tipo de Auditoría

```typescript
export type AuditType = 'complete' | 'partial';
export type AuditStatus = 'planned' | 'in_progress' | 'completed';
```

### Estructura Principal

```typescript
interface Audit {
  // ============================================
  // IDENTIFICACIÓN
  // ============================================
  id: string;
  auditNumber: string; // Auto-generado: AUD-2025-001

  // ============================================
  // PLANIFICACIÓN (Se completa al crear)
  // ============================================
  title: string;
  auditType: AuditType; // 'complete' o 'partial'
  scope: string; // Alcance de la auditoría
  plannedDate: Timestamp;
  leadAuditor: string;
  leadAuditorId: string | null; // Preparar para futuro

  // Puntos de norma a auditar (solo en planificación)
  selectedNormPoints: string[]; // Códigos: ["4.1", "5.2", ...]
  // Si auditType = 'complete' → se ignora, se usan TODOS
  // Si auditType = 'partial' → solo estos puntos

  // ============================================
  // EJECUCIÓN (Se habilita al iniciar)
  // ============================================
  executionDate: Timestamp | null; // Fecha real de ejecución

  // Verificación de puntos de norma
  normPointsVerification: NormPointVerification[];

  // Reuniones
  openingMeeting: OpeningMeeting | null;
  closingMeeting: ClosingMeeting | null;

  // Entrega de informe
  reportDelivery: ReportDelivery | null;

  // Verificación de acciones previas
  previousActionsVerification: string | null;

  // Observaciones generales
  observations: string | null;

  // ============================================
  // ESTADO Y METADATOS
  // ============================================
  status: AuditStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  createdByName: string;
  isActive: boolean;
}
```

### Estados de Conformidad

```typescript
export type ConformityStatus =
  | 'CF' // Cumple satisfactoriamente los requisitos
  | 'NCM' // No conformidad mayor
  | 'NCm' // No conformidad menor
  | 'NCT' // No conformidad trivial
  | 'R' // Riesgo
  | 'OM' // Oportunidad de mejora
  | 'F' // Fortaleza
  | null; // No verificado aún

export const CONFORMITY_STATUS_LABELS: Record<string, string> = {
  CF: 'Cumple Satisfactoriamente',
  NCM: 'No Conformidad Mayor',
  NCm: 'No Conformidad Menor',
  NCT: 'No Conformidad Trivial',
  R: 'Riesgo',
  OM: 'Oportunidad de Mejora',
  F: 'Fortaleza',
};

export const CONFORMITY_STATUS_COLORS: Record<string, string> = {
  CF: 'bg-green-100 text-green-800 border-green-300',
  NCM: 'bg-red-100 text-red-800 border-red-300',
  NCm: 'bg-orange-100 text-orange-800 border-orange-300',
  NCT: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  R: 'bg-purple-100 text-purple-800 border-purple-300',
  OM: 'bg-blue-100 text-blue-800 border-blue-300',
  F: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};
```

### Verificación de Punto de Norma

```typescript
interface NormPointVerification {
  normPointCode: string; // "4.1", "5.2", etc.
  normPointId: string | null; // Preparar para futuro

  // Clasificación de conformidad
  conformityStatus: ConformityStatus; // CF, NCM, NCm, NCT, R, OM, F, null

  // Procesos relacionados (texto libre por ahora)
  processes: string[]; // ["Gestión de Calidad", "Compras"]
  processIds: string[] | null; // Preparar para futuro

  // Observaciones específicas del punto
  observations: string | null;

  // Metadatos
  verifiedAt: Timestamp | null;
  verifiedBy: string | null;
  verifiedByName: string | null;
}
```

### Reuniones

```typescript
interface OpeningMeeting {
  date: Timestamp;
  participants: Participant[];
  notes: string | null;
}

interface ClosingMeeting {
  date: Timestamp;
  participants: Participant[];
  notes: string | null;
}

interface Participant {
  name: string;
  role: string; // "Auditor", "Responsable de Proceso", etc.
  userId: string | null; // Preparar para futuro
}
```

### Entrega de Informe

```typescript
interface ReportDelivery {
  date: Timestamp;
  deliveredBy: string;
  deliveredById: string | null; // Preparar para futuro
  receivedBy: string[]; // Lista de nombres
  receivedByIds: string[] | null; // Preparar para futuro
  notes: string | null;
}
```

---

## 🎨 Diseño de UI

### 1. Formulario de Planificación (Modal)

**Campos:**

```
┌─────────────────────────────────────────┐
│  Nueva Auditoría - Planificación        │
├─────────────────────────────────────────┤
│                                          │
│  Título *                                │
│  [_________________________________]     │
│                                          │
│  Tipo de Auditoría *                     │
│  ( ) Completa - Todos los puntos        │
│  ( ) Parcial - Puntos seleccionados     │
│                                          │
│  [Si Parcial, mostrar selector]         │
│  Puntos de Norma a Auditar *            │
│  ┌────────────────────────────────┐     │
│  │ Capítulo 4: Contexto           │     │
│  │ ☐ 4.1 Comprensión de la org.   │     │
│  │ ☐ 4.2 Partes interesadas       │     │
│  │ ☐ 4.3 Alcance del SGC          │     │
│  │ ☐ 4.4 Sistema de gestión       │     │
│  │                                 │     │
│  │ Capítulo 5: Liderazgo          │     │
│  │ ☐ 5.1 Liderazgo y compromiso   │     │
│  │ ...                             │     │
│  └────────────────────────────────┘     │
│                                          │
│  Alcance *                               │
│  [_________________________________]     │
│  [_________________________________]     │
│                                          │
│  Fecha Planificada *                     │
│  [__/__/____]                            │
│                                          │
│  Auditor Líder *                         │
│  [_________________________________]     │
│                                          │
│  [Cancelar]              [Crear] ✓      │
└─────────────────────────────────────────┘
```

**Validaciones:**

- Título: requerido, max 200 caracteres
- Tipo: requerido
- Puntos de norma: requerido si tipo = 'parcial', mínimo 1 punto
- Alcance: requerido, max 500 caracteres
- Fecha planificada: requerida
- Auditor líder: requerido

---

### 2. Vista de Detalle - Estado PLANNED

**Layout:**

```
┌────────────────────────────────────────────────────┐
│ ← Volver    AUD-2025-001                          │
│                                                    │
│ Auditoría Interna 2025                            │
│ Auditoría Completa • Planificada                  │
│                                                    │
│ [Editar] [Eliminar] [Iniciar Ejecución] ▶        │
└────────────────────────────────────────────────────┘

┌─ Información de Planificación ─────────────────────┐
│                                                    │
│ Tipo: Auditoría Completa                          │
│ Alcance: Verificación de todos los requisitos...  │
│ Fecha Planificada: 15 de diciembre de 2025       │
│ Auditor Líder: Juan Pérez                         │
│                                                    │
└────────────────────────────────────────────────────┘

┌─ Puntos de Norma a Auditar ────────────────────────┐
│                                                    │
│ [Si completa]                                      │
│ ✓ Todos los puntos de la norma ISO 9001:2015     │
│   (45 puntos)                                      │
│                                                    │
│ [Si parcial]                                       │
│ • 4.1 Comprensión de la organización              │
│ • 5.2 Política                                     │
│ • 8.5 Producción y provisión del servicio         │
│   (3 puntos seleccionados)                        │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

### 3. Vista de Detalle - Estado IN_PROGRESS

**Layout (scroll vertical):**

```
┌────────────────────────────────────────────────────┐
│ ← Volver    AUD-2025-001                          │
│                                                    │
│ Auditoría Interna 2025                            │
│ Auditoría Completa • En Progreso                  │
│                                                    │
│ Progreso: 12/45 puntos verificados (27%)          │
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░        │
└────────────────────────────────────────────────────┘

┌─ Información de Planificación ─────────────────────┐
│ [Datos de planificación en modo lectura]          │
└────────────────────────────────────────────────────┘

┌─ Fecha de Ejecución ───────────────────────────────┐
│ Fecha Real de Ejecución: [__/__/____] *           │
└────────────────────────────────────────────────────┘

┌─ Reunión de Apertura ──────────────────────────────┐
│ Fecha: [__/__/____] *                              │
│                                                    │
│ Participantes:                                     │
│ ┌────────────────────────────────────────┐        │
│ │ Nombre          Función                │        │
│ │ Juan Pérez      Auditor Líder         │ [X]    │
│ │ María García    Responsable Calidad   │ [X]    │
│ └────────────────────────────────────────┘        │
│ [+ Agregar Participante]                          │
│                                                    │
│ Notas:                                             │
│ [_________________________________________]        │
│ [_________________________________________]        │
└────────────────────────────────────────────────────┘

┌─ Verificación de Acciones Previas ─────────────────┐
│ Descripción de acciones verificadas:              │
│ [_________________________________________]        │
│ [_________________________________________]        │
│ [_________________________________________]        │
└────────────────────────────────────────────────────┘

┌─ Verificación de Puntos de Norma ──────────────────┐
│                                                    │
│ Capítulo 4: Contexto de la Organización           │
│                                                    │
│ ┌─ 4.1 Comprensión de la organización ──────┐    │
│ │                                             │    │
│ │ Estado de Conformidad: *                    │    │
│ │ ┌─────────────────────────────────────┐    │    │
│ │ │ ( ) CF  - Cumple Satisfactoriamente │    │    │
│ │ │ ( ) NCM - No Conformidad Mayor      │    │    │
│ │ │ ( ) NCm - No Conformidad Menor      │    │    │
│ │ │ ( ) NCT - No Conformidad Trivial    │    │    │
│ │ │ ( ) R   - Riesgo                    │    │    │
│ │ │ ( ) OM  - Oportunidad de Mejora     │    │    │
│ │ │ ( ) F   - Fortaleza                 │    │    │
│ │ └─────────────────────────────────────┘    │    │
│ │                                             │    │
│ │ Procesos relacionados:                      │    │
│ │ [Gestión Estratégica          ] [+ Agregar]│    │
│ │ • Gestión Estratégica                  [X] │    │
│ │ • Planificación                        [X] │    │
│ │                                             │    │
│ │ Observaciones:                              │    │
│ │ [_____________________________________]     │    │
│ │ [_____________________________________]     │    │
│ │                                             │    │
│ │ [Guardar Verificación] ✓                   │    │
│ └─────────────────────────────────────────────┘    │
│                                                    │
│ ┌─ 4.2 Comprensión de las necesidades ──────┐    │
│ │ [Similar al anterior]                       │    │
│ └─────────────────────────────────────────────┘    │
│                                                    │
│ ... [Resto de puntos] ...                         │
│                                                    │
└────────────────────────────────────────────────────┘

┌─ Reunión de Cierre ────────────────────────────────┐
│ [Similar a Reunión de Apertura]                   │
└────────────────────────────────────────────────────┘

┌─ Entrega del Informe ──────────────────────────────┐
│ Fecha de Entrega: [__/__/____] *                  │
│                                                    │
│ Entregado por: [_____________________]            │
│                                                    │
│ Recibido por:                                      │
│ [Nombre del receptor] [+ Agregar]                 │
│ • María García                            [X]     │
│ • Pedro López                             [X]     │
│                                                    │
│ Notas:                                             │
│ [_________________________________________]        │
└────────────────────────────────────────────────────┘

┌─ Observaciones Generales ──────────────────────────┐
│ [_________________________________________]        │
│ [_________________________________________]        │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│                                                    │
│         [Completar Auditoría] ✓                   │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

### 4. Vista de Detalle - Estado COMPLETED

**Layout:**

```
┌────────────────────────────────────────────────────┐
│ ← Volver    AUD-2025-001                          │
│                                                    │
│ Auditoría Interna 2025                            │
│ Auditoría Completa • Completada ✓                 │
│                                                    │
│ Completada: 45/45 puntos verificados (100%)       │
│ ██████████████████████████████████████████████     │
│                                                    │
│ [Exportar PDF] [Ver Hallazgos Relacionados]      │
└────────────────────────────────────────────────────┘

[Todas las secciones en modo SOLO LECTURA]

┌─ Resumen de Verificación ──────────────────────────┐
│                                                    │
│ ✓ CF  - Cumple: 38 puntos (84%)                   │
│ ✗ NCM - No Conformidad Mayor: 1 punto (2%)        │
│ ⚠ NCm - No Conformidad Menor: 2 puntos (4%)       │
│ ⚠ NCT - No Conformidad Trivial: 1 punto (2%)      │
│ ⚡ R   - Riesgo: 1 punto (2%)                      │
│ ⭐ OM  - Oportunidad de Mejora: 1 punto (2%)       │
│ 💪 F   - Fortaleza: 1 punto (2%)                   │
│                                                    │
│ Puntos críticos (NCM):                             │
│ • 8.3.4 Controles de diseño                       │
│                                                    │
│ Puntos a mejorar (NCm):                            │
│ • 6.2 Objetivos de calidad                        │
│ • 7.1.5 Recursos de seguimiento                   │
│                                                    │
│ Riesgos identificados (R):                         │
│ • 8.5.1 Control de producción                     │
│                                                    │
│ Oportunidades de mejora (OM):                      │
│ • 9.1.2 Satisfacción del cliente                  │
│                                                    │
│ Fortalezas (F):                                    │
│ • 5.1 Liderazgo y compromiso                      │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Trabajo

### Fase 1: Planificación

```
Usuario crea auditoría
    ↓
Selecciona tipo (Completa/Parcial)
    ↓
[Si Parcial] Selecciona puntos de norma
    ↓
Completa datos básicos
    ↓
Sistema genera número AUD-2025-XXX
    ↓
Estado: PLANNED
```

### Fase 2: Inicio de Ejecución

```
Usuario hace clic en "Iniciar Ejecución"
    ↓
Sistema cambia estado a IN_PROGRESS
    ↓
Sistema registra executionDate
    ↓
Se habilitan campos de ejecución
    ↓
Sistema crea array normPointsVerification
    [Si completa] → TODOS los puntos
    [Si parcial] → Solo puntos seleccionados
```

### Fase 3: Ejecución

```
Usuario completa:
    ↓
1. Fecha de ejecución
2. Reunión de apertura
3. Verificación de acciones previas
4. Verificación de cada punto de norma:
   - ¿Implementado?
   - Procesos relacionados
   - Observaciones
5. Reunión de cierre
6. Entrega del informe
7. Observaciones generales
```

### Fase 4: Completar

```
Usuario hace clic en "Completar Auditoría"
    ↓
Sistema valida:
    ✓ Todos los puntos verificados
    ✓ Reunión de apertura completa
    ✓ Reunión de cierre completa
    ✓ Entrega de informe completa
    ↓
Estado: COMPLETED
    ↓
Modo solo lectura
```

---

## 📋 Validaciones

### Al Crear (Planificación):

- ✅ Título requerido
- ✅ Tipo de auditoría requerido
- ✅ Si parcial: al menos 1 punto seleccionado
- ✅ Alcance requerido
- ✅ Fecha planificada requerida
- ✅ Auditor líder requerido

### Al Iniciar Ejecución:

- ✅ Fecha de ejecución requerida

### Durante Ejecución:

- ⚠️ Advertir si faltan puntos por verificar
- ⚠️ Advertir si falta reunión de apertura
- ⚠️ Advertir si falta reunión de cierre

### Al Completar:

- ✅ TODOS los puntos deben estar verificados (Sí/No/No aplica)
- ✅ Reunión de apertura completa (fecha + al menos 1 participante)
- ✅ Reunión de cierre completa (fecha + al menos 1 participante)
- ✅ Entrega de informe completa (fecha + entregado por + al menos 1 receptor)

---

## 🗂️ Archivos a Crear/Modificar

### Types

```
src/types/audits.ts
```

### Validations

```
src/lib/validations/audits.ts
```

### Services

```
src/services/audits/AuditService.ts
```

### API Routes

```
src/app/api/audits/route.ts
src/app/api/audits/[id]/route.ts
src/app/api/audits/[id]/status/route.ts
src/app/api/audits/[id]/execution/route.ts (NUEVO)
src/app/api/audits/[id]/norm-point-verification/route.ts (NUEVO)
```

### Components

```
src/components/audits/AuditFormDialog.tsx
src/components/audits/AuditCard.tsx
src/components/audits/NormPointSelector.tsx (NUEVO)
src/components/audits/NormPointVerificationCard.tsx (NUEVO)
src/components/audits/MeetingForm.tsx (NUEVO)
src/components/audits/ReportDeliveryForm.tsx (NUEVO)
src/components/audits/AuditSummary.tsx (NUEVO)
```

### Pages

```
src/app/(dashboard)/auditorias/page.tsx
src/app/(dashboard)/auditorias/[id]/page.tsx
```

---

## 🚀 Orden de Implementación

### Sprint 1: Estructura Base

1. ✅ Actualizar `types/audits.ts`
2. ✅ Actualizar `validations/audits.ts`
3. ✅ Actualizar `AuditService.ts`

### Sprint 2: Planificación

1. ✅ Actualizar `AuditFormDialog` con tipo de auditoría
2. ✅ Crear `NormPointSelector` para auditorías parciales
3. ✅ Actualizar API de creación

### Sprint 3: Ejecución - Parte 1

1. ✅ Crear `MeetingForm` (apertura/cierre)
2. ✅ Crear `ReportDeliveryForm`
3. ✅ Actualizar página de detalle con secciones básicas

### Sprint 4: Ejecución - Parte 2

1. ✅ Crear `NormPointVerificationCard`
2. ✅ Implementar lógica de verificación por punto
3. ✅ API para guardar verificaciones

### Sprint 5: Completar y Resumen

1. ✅ Validaciones de completitud
2. ✅ Crear `AuditSummary` para auditorías completadas
3. ✅ Modo solo lectura

### Sprint 6: Listados

1. ✅ Actualizar `AuditCard` con nuevo diseño
2. ✅ Actualizar Kanban
3. ✅ Actualizar Lista

---

## 🔮 Preparación para Futuras Fases

### Campos preparados:

- `leadAuditorId` → Usuarios
- `processIds` → Procesos
- `normPointId` → Puntos de norma en Firestore
- `userId` en participantes → Usuarios
- `receivedByIds` → Usuarios

### Relaciones futuras:

1. **Fase 2**: Auditoría → Hallazgos (botón "Crear Hallazgo" desde punto no conforme)
2. **Fase 3**: Auditoría → Procesos (selector en lugar de texto)
3. **Fase 4**: Auditoría → Documentos (adjuntar evidencias)

---

## ✅ Confirmado

- ✅ Hallazgos se implementarán en fase posterior
- ✅ Auditorías completas = todos los puntos
- ✅ Auditorías parciales = puntos seleccionados en planificación
- ✅ Observaciones y campos de ejecución se habilitan al iniciar
- ✅ Procesos como texto libre (preparado para IDs futuros)
