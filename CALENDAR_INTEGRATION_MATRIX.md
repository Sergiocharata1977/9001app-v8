# Matriz de Integración del Calendario - Módulo por Módulo

## Resumen Ejecutivo

Este documento detalla la integración específica de cada módulo con el sistema de calendario, incluyendo:
- Tipo de evento que genera
- Metadata específica
- Lógica de prioridad
- Notificaciones recomendadas
- Plan de testing A1

---

## 1. Módulo de Capacitaciones (Trainings)

### Información General
- **Servicio**: `TrainingService.ts`
- **Colección Firestore**: `trainings`
- **Tipo de evento**: `training`
- **Módulo origen**: `trainings`

### Metadata del Evento

```typescript
interface TrainingEventMetadata {
  trainingId: string;
  trainingCode: string;
  trainingType: 'internal' | 'external' | 'online';
  duration: number; // Horas
  location: string | null;
  instructor: string | null;
  maxParticipants: number | null;
  currentParticipants: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  requiresEvaluation: boolean;
  certificateIssued: boolean;
}
```

### Lógica de Prioridad

```typescript
// Externa + Obligatoria
if (type === 'external' && isRequired) {
  if (daysUntil <= 7) return 'high';
  if (daysUntil <= 30) return 'medium';
  return 'low';
}

// Interna + Obligatoria
if (isRequired) {
  if (daysUntil <= 3) return 'high';
  if (daysUntil <= 14) return 'medium';
  return 'low';
}

// Opcional
return 'low';
```

### Características Especiales
- ✅ **Eventos multi-día**: Usar `endDate` para capacitaciones de varios días
- ✅ **Múltiples participantes**: Array de `participantIds`
- ✅ **Horarios específicos**: Incluir hora en `date`

### Notificaciones
- 7 días antes (preparación)
- 1 día antes (recordatorio)
- Día del evento

### Testing A1

| # | Funcionalidad | Acción | Verificación |
|---|---------------|--------|--------------|
| 1 | Crear capacitación simple | Crear con `scheduled_date` | Evento creado en calendario |
| 2 | Crear capacitación multi-día | Crear con `scheduled_date` y `end_date` | Evento con `endDate` correcto |
| 3 | Actualizar fecha | Modificar `scheduled_date` | Evento actualizado en calendario |
| 4 | Actualizar estado | Cambiar a `completed` | Estado del evento actualizado |
| 5 | Agregar participantes | Modificar `participant_ids` | Metadata actualizada |
| 6 | Eliminar capacitación | Eliminar registro | Evento eliminado del calendario |
| 7 | Capacitación externa obligatoria | Crear con `type: 'external'`, `is_required: true` | Prioridad calculada correctamente |

---

## 2. Módulo de Evaluaciones (Evaluations)

### Información General
- **Servicio**: `EvaluationService.ts`
- **Colección Firestore**: `evaluations`
- **Tipo de evento**: `evaluation`
- **Módulo origen**: `evaluations`

### Metadata del Evento

```typescript
interface EvaluationEventMetadata {
  evaluationId: string;
  evaluationCode: string;
  trainingId: string;
  trainingCode: string;
  evaluationType: 'written' | 'practical' | 'oral' | 'online';
  duration: number; // Minutos
  passingScore: number;
  maxAttempts: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}
```

### Lógica de Prioridad

```typescript
if (isRequired) {
  if (daysUntil <= 2) return 'high';
  if (daysUntil <= 7) return 'medium';
  return 'low';
}
return 'low';
```

### Características Especiales
- ✅ **Vinculación**: Siempre vinculada a una capacitación (`trainingId`)
- ✅ **Duración en minutos**: Diferente a capacitaciones (horas)

### Notificaciones
- 3 días antes (estudio)
- 1 día antes (recordatorio)
- Día del evento

### Testing A1

| # | Funcionalidad | Acción | Verificación |
|---|---------------|--------|--------------|
| 1 | Crear evaluación | Crear con `scheduled_date` | Evento creado |
| 2 | Vinculación con capacitación | Verificar `trainingId` en metadata | Vinculación correcta |
| 3 | Actualizar fecha | Modificar `scheduled_date` | Evento actualizado |
| 4 | Completar evaluación | Cambiar a `completed` | Estado actualizado |
| 5 | Eliminar evaluación | Eliminar registro | Evento eliminado |

---

## 3. Módulo de Acciones (Actions)

### Información General
- **Servicio**: `ActionService.ts`
- **Colección Firestore**: `actions`
- **Tipo de evento**: `action_deadline`
- **Módulo origen**: `actions`

### Metadata del Evento

```typescript
interface ActionEventMetadata {
  actionId: string;
  actionNumber: string;
  actionType: 'correctiva' | 'preventiva';
  findingId: string | null;
  findingNumber: string | null;
  auditId: string | null;
  auditNumber: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  verificationRequired: boolean;
}
```

### Lógica de Prioridad

```typescript
// Correctiva + Hallazgo Crítico
if (type === 'correctiva' && findingSeverity === 'critical') {
  if (daysUntil <= 7) return 'critical';
  if (daysUntil <= 15) return 'high';
  return 'medium';
}

// Correctiva + Hallazgo Mayor
if (type === 'correctiva' && findingSeverity === 'major') {
  if (daysUntil <= 3) return 'critical';
  if (daysUntil <= 10) return 'high';
  return 'medium';
}

// Preventiva o Menor
if (daysUntil <= 3) return 'high';
if (daysUntil <= 7) return 'medium';
return 'low';
```

### Características Especiales
- ✅ **Prioridad dinámica**: Basada en severidad del hallazgo
- ✅ **Vinculación múltiple**: Con hallazgo y auditoría

### Notificaciones
- 7 días antes
- 3 días antes
- 1 día antes
- Día del vencimiento

### Testing A1

| # | Funcionalidad | Acción | Verificación |
|---|---------------|--------|--------------|
| 1 | Acción correctiva crítica | Crear con `type: 'correctiva'`, hallazgo crítico | Prioridad `critical` o `high` |
| 2 | Acción preventiva | Crear con `type: 'preventiva'` | Prioridad calculada |
| 3 | Actualizar fecha límite | Modificar `due_date` | Evento y prioridad actualizados |
| 4 | Completar acción | Cambiar a `completed` | Estado `completed` |
| 5 | Eliminar acción | Eliminar registro | Evento eliminado |

---

## 4. Módulo de Auditorías (Audits)

### Información General
- **Servicio**: `AuditService.ts`
- **Colección Firestore**: `audits`
- **Tipo de evento**: `audit`
- **Módulo origen**: `audits`

### Metadata del Evento

```typescript
interface AuditEventMetadata {
  auditId: string;
  auditNumber: string;
  auditType: 'internal' | 'external' | 'certification';
  scope: string;
  leadAuditor: string;
  auditTeam: string[];
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
}
```

### Lógica de Prioridad

```typescript
if (type === 'certification') {
  return 'critical';
}

if (type === 'external') {
  if (daysUntil <= 14) return 'high';
  return 'medium';
}

// Internal
if (daysUntil <= 7) return 'medium';
return 'low';
```

### Notificaciones
- 30 días antes (certificación)
- 14 días antes (externa)
- 7 días antes (interna)
- 1 día antes

### Testing A1

| # | Funcionalidad | Acción | Verificación |
|---|---------------|--------|--------------|
| 1 | Auditoría de certificación | Crear con `type: 'certification'` | Prioridad `critical` |
| 2 | Auditoría externa | Crear con `type: 'external'` | Prioridad `high` o `medium` |
| 3 | Auditoría interna | Crear con `type: 'internal'` | Evento creado |
| 4 | Actualizar fecha | Modificar fecha programada | Evento actualizado |
| 5 | Cancelar auditoría | Cambiar a `cancelled` | Estado actualizado |

---

## 5. Módulo de Documentos (Documents)

### Información General
- **Servicio**: `DocumentService.ts`
- **Colección Firestore**: `documents`
- **Tipo de evento**: `document_expiry`
- **Módulo origen**: `documents`

### Metadata del Evento

```typescript
interface DocumentEventMetadata {
  documentId: string;
  documentCode: string;
  documentType: string;
  version: string;
  expiryDate: Date;
  renewalRequired: boolean;
  responsibleArea: string;
}
```

### Lógica de Prioridad

```typescript
if (daysUntil <= 0) return 'critical'; // Vencido
if (daysUntil <= 7) return 'high';
if (daysUntil <= 15) return 'medium';
if (daysUntil <= 30) return 'low';
return 'low';
```

### Notificaciones
- 30 días antes
- 15 días antes
- 7 días antes
- Día del vencimiento
- Cada día después de vencido

### Testing A1

| # | Funcionalidad | Acción | Verificación |
|---|---------------|--------|--------------|
| 1 | Documento con vencimiento | Crear con `expiry_date` | Evento creado |
| 2 | Documento vencido | Crear con fecha pasada | Prioridad `critical`, estado `overdue` |
| 3 | Renovar documento | Actualizar `expiry_date` | Nueva fecha en evento |
| 4 | Eliminar documento | Eliminar registro | Evento eliminado |

---

## 6. Módulo de Reuniones (Meetings)

### Información General
- **Servicio**: `ReunionTrabajoService.ts`
- **Colección Firestore**: `reuniones_trabajo`
- **Tipo de evento**: `meeting`
- **Módulo origen**: `meetings`

### Metadata del Evento

```typescript
interface MeetingEventMetadata {
  meetingId: string;
  meetingType: string;
  agenda: string;
  location: string;
  participants: string[];
  isRecurring: boolean;
  recurrencePattern?: string;
}
```

### Lógica de Prioridad

```typescript
// Reuniones de dirección
if (meetingType === 'management_review') {
  return 'high';
}

// Reuniones regulares
if (daysUntil <= 1) return 'medium';
return 'low';
```

### Notificaciones
- 1 día antes
- 1 hora antes (opcional)

### Testing A1

| # | Funcionalidad | Acción | Verificación |
|---|---------------|--------|--------------|
| 1 | Crear reunión | Crear con fecha y participantes | Evento creado |
| 2 | Reunión recurrente | Crear con `isRecurring: true` | Múltiples eventos |
| 3 | Reprogramar | Modificar fecha | Evento actualizado |
| 4 | Cancelar | Cambiar estado | Estado `cancelled` |

---

## 7. Módulo de Indicadores de Calidad (Quality Indicators)

### Información General
- **Servicio**: `QualityIndicatorService.ts`
- **Colección Firestore**: `quality_indicators`
- **Tipo de evento**: `measurement_due`
- **Módulo origen**: `quality_indicators`

### Metadata del Evento

```typescript
interface MeasurementEventMetadata {
  indicatorId: string;
  indicatorCode: string;
  indicatorName: string;
  measurementFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  targetValue: number;
  unit: string;
}
```

### Lógica de Prioridad

```typescript
// Mediciones vencidas
if (daysUntil <= 0) return 'high';

// Próximas mediciones
if (frequency === 'daily' && daysUntil <= 1) return 'medium';
if (frequency === 'weekly' && daysUntil <= 2) return 'medium';
if (frequency === 'monthly' && daysUntil <= 7) return 'medium';

return 'low';
```

### Características Especiales
- ✅ **Eventos recurrentes**: Crear próximo evento al registrar medición

### Notificaciones
- Según frecuencia (día antes para diarias, semana antes para mensuales)

### Testing A1

| # | Funcionalidad | Acción | Verificación |
|---|---------------|--------|--------------|
| 1 | Indicador mensual | Crear con `frequency: 'monthly'` | Evento recurrente creado |
| 2 | Registrar medición | Registrar valor | Próximo evento creado |
| 3 | Cambiar frecuencia | Modificar de mensual a trimestral | Eventos recalculados |

---

## 8. Módulo de Objetivos de Calidad (Quality Objectives)

### Información General
- **Servicio**: `QualityObjectiveService.ts`
- **Colección Firestore**: `quality_objectives`
- **Tipo de evento**: `objective_review`
- **Módulo origen**: `quality_objectives`

### Metadata del Evento

```typescript
interface ObjectiveReviewEventMetadata {
  objectiveId: string;
  objectiveCode: string;
  objectiveName: string;
  reviewFrequency: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  targetDate: Date;
  progress: number;
}
```

### Lógica de Prioridad

```typescript
if (daysUntil <= 7) return 'high';
if (daysUntil <= 30) return 'medium';
return 'low';
```

### Testing A1

| # | Funcionalidad | Acción | Verificación |
|---|---------------|--------|--------------|
| 1 | Objetivo trimestral | Crear con revisión trimestral | Eventos de revisión creados |
| 2 | Completar revisión | Registrar revisión | Próxima fecha calculada |
| 3 | Modificar frecuencia | Cambiar de trimestral a mensual | Eventos actualizados |

---

## 9. Módulo de No Conformidades (Findings)

### Información General
- **Servicio**: `FindingService.ts`
- **Colección Firestore**: `findings`
- **Tipo de evento**: `finding_deadline`
- **Módulo origen**: `findings`

### Metadata del Evento

```typescript
interface FindingDeadlineEventMetadata {
  findingId: string;
  findingNumber: string;
  severity: 'critical' | 'major' | 'minor';
  auditId: string;
  auditNumber: string;
  requiresAction: boolean;
}
```

### Lógica de Prioridad

```typescript
if (severity === 'critical') {
  if (daysUntil <= 7) return 'critical';
  return 'high';
}

if (severity === 'major') {
  if (daysUntil <= 15) return 'high';
  return 'medium';
}

// Minor
if (daysUntil <= 7) return 'medium';
return 'low';
```

### Testing A1

| # | Funcionalidad | Acción | Verificación |
|---|---------------|--------|--------------|
| 1 | Hallazgo crítico | Crear con `severity: 'critical'` | Prioridad `critical` |
| 2 | Hallazgo menor | Crear con `severity: 'minor'` | Prioridad `low` o `medium` |
| 3 | Cerrar hallazgo | Cambiar a `closed` | Estado `completed` |

---

## 10. Módulo de Políticas (Policies)

### Información General
- **Servicio**: `PoliciaService.ts`
- **Colección Firestore**: `policies`
- **Tipo de evento**: `policy_review`
- **Módulo origen**: `policies`

### Metadata del Evento

```typescript
interface PolicyReviewEventMetadata {
  policyId: string;
  policyCode: string;
  policyName: string;
  reviewFrequency: 'annual' | 'biannual';
  lastReviewDate: Date;
  nextReviewDate: Date;
}
```

### Lógica de Prioridad

```typescript
if (daysUntil <= 30) return 'high';
if (daysUntil <= 60) return 'medium';
return 'low';
```

### Notificaciones
- 60 días antes
- 30 días antes
- 7 días antes

### Testing A1

| # | Funcionalidad | Acción | Verificación |
|---|---------------|--------|--------------|
| 1 | Crear política | Crear con fecha de revisión | Evento creado |
| 2 | Revisar política | Registrar revisión | Próxima fecha calculada |
| 3 | Archivar política | Cambiar a archivada | Eventos futuros eliminados |

---

## Resumen de Tipos de Eventos

| Módulo | Tipo de Evento | Prioridad Máxima | Multi-día | Recurrente |
|--------|----------------|------------------|-----------|------------|
| Capacitaciones | `training` | High | ✅ | ❌ |
| Evaluaciones | `evaluation` | High | ❌ | ❌ |
| Acciones | `action_deadline` | Critical | ❌ | ❌ |
| Auditorías | `audit` | Critical | ❌ | ❌ |
| Documentos | `document_expiry` | Critical | ❌ | ❌ |
| Reuniones | `meeting` | High | ❌ | ✅ |
| Indicadores | `measurement_due` | High | ❌ | ✅ |
| Objetivos | `objective_review` | High | ❌ | ✅ |
| Hallazgos | `finding_deadline` | Critical | ❌ | ❌ |
| Políticas | `policy_review` | High | ❌ | ✅ |

---

## Checklist de Integración por Módulo

Para cada módulo, verificar:

- [ ] EventPublisher inyectado en constructor
- [ ] Llamada a `publishEvent()` en método `create()`
- [ ] Llamada a `updatePublishedEvent()` en método `update()`
- [ ] Llamada a `deletePublishedEvent()` en método `delete()`
- [ ] Metadata completa según especificación
- [ ] Lógica de prioridad implementada
- [ ] Mapeo de estados correcto
- [ ] Manejo de errores no-bloqueante
- [ ] Testing A1 completo (todas las funcionalidades)
- [ ] Documentación actualizada

---

## Próximos Pasos

1. Implementar infraestructura base (EventPublisher, tipos, utils)
2. Seleccionar módulo piloto (recomendado: Acciones)
3. Implementar integración completa del piloto
4. Ejecutar testing A1 del piloto
5. Validar patrón antes de escalar
6. Replicar a los 9 módulos restantes
7. Implementar API para IA
8. Desarrollar UI mejorada
9. Testing integral
