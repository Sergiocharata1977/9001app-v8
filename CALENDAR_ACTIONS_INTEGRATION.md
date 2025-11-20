# Integración del Calendario con Módulo de Acciones

## Overview

Este documento describe cómo integrar el módulo de Acciones con el sistema de calendario unificado. Las acciones correctivas/preventivas generan eventos de calendario automáticamente cuando tienen fechas límite.

## Estructura de Evento para Acciones

### Tipo de Evento

```typescript
type: 'action_deadline';
sourceModule: 'actions';
```

### Campos Específicos

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

## Mapeo de Prioridad

La prioridad del evento se determina según la urgencia de la acción y días hasta el vencimiento:

```typescript
function mapActionPriority(
  dueDate: Date,
  actionType: 'correctiva' | 'preventiva',
  findingSeverity?: 'critical' | 'major' | 'minor'
): EventPriority {
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  // Acciones correctivas de hallazgos críticos
  if (actionType === 'correctiva' && findingSeverity === 'critical') {
    if (daysUntilDue <= 7) return 'critical';
    if (daysUntilDue <= 15) return 'high';
    return 'medium';
  }

  // Acciones correctivas de hallazgos mayores
  if (actionType === 'correctiva' && findingSeverity === 'major') {
    if (daysUntilDue <= 3) return 'critical';
    if (daysUntilDue <= 10) return 'high';
    return 'medium';
  }

  // Acciones preventivas o correctivas menores
  if (daysUntilDue <= 3) return 'high';
  if (daysUntilDue <= 7) return 'medium';
  return 'low';
}
```

## Puntos de Integración en ActionService

### 1. Crear Acción

Cuando se crea una acción con fecha límite:

```typescript
// En ActionService.create()
async create(data: ActionCreateData): Promise<Action> {
  // ... crear acción en Firestore

  // Publicar evento de calendario si tiene due_date
  if (action.due_date) {
    try {
      const priority = mapActionPriority(
        action.due_date.toDate(),
        action.type,
        action.finding?.severity
      );

      await eventPublisher.publishEvent({
        title: `Acción ${action.type}: ${action.description}`,
        description: action.root_cause || null,
        date: action.due_date.toDate(),
        type: 'action_deadline',
        sourceRecordId: action.id,
        sourceRecordType: 'action',
        sourceRecordNumber: action.action_number,
        responsibleUserId: action.responsible_user_id,
        responsibleUserName: action.responsible_user_name,
        priority,
        processId: action.process_id,
        processName: action.process_name,
        metadata: {
          actionId: action.id,
          actionNumber: action.action_number,
          actionType: action.type,
          findingId: action.finding_id,
          findingNumber: action.finding?.finding_number,
          auditId: action.audit_id,
          auditNumber: action.audit?.audit_number,
          status: action.status,
          verificationRequired: action.verification_required,
        },
      }, 'actions', user.organizationId);
    } catch (error) {
      console.error('Error publishing action event:', error);
      // No fallar la operación principal
    }
  }

  return action;
}
```

### 2. Actualizar Acción

Cuando se actualiza la fecha límite o estado:

```typescript
// En ActionService.update()
async update(id: string, data: ActionUpdateData): Promise<Action> {
  const action = await this.getById(id);

  // ... actualizar acción en Firestore

  // Actualizar evento si cambió due_date o status
  if (data.due_date || data.status) {
    try {
      const updateData: any = {};

      if (data.due_date) {
        updateData.date = data.due_date;
        updateData.priority = mapActionPriority(
          data.due_date,
          updatedAction.type,
          updatedAction.finding?.severity
        );
      }

      if (data.status) {
        updateData.status = mapActionStatusToEventStatus(data.status);
        updateData.metadata = {
          ...action.metadata,
          status: data.status,
        };
      }

      await eventPublisher.updatePublishedEvent(
        action.id,
        'actions',
        updateData,
        user.organizationId
      );
    } catch (error) {
      console.error('Error updating action event:', error);
    }
  }

  return updatedAction;
}
```

### 3. Eliminar Acción

Cuando se elimina una acción:

```typescript
// En ActionService.delete()
async delete(id: string): Promise<void> {
  // ... eliminar acción en Firestore

  // Eliminar evento de calendario
  try {
    await eventPublisher.deletePublishedEvent(
      id,
      'actions',
      user.organizationId
    );
  } catch (error) {
    console.error('Error deleting action event:', error);
  }
}
```

## Mapeo de Estados

```typescript
function mapActionStatusToEventStatus(
  actionStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled'
): EventStatus {
  switch (actionStatus) {
    case 'pending':
      return 'scheduled';
    case 'in_progress':
      return 'in_progress';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'scheduled';
  }
}
```

## Notificaciones Recomendadas

Para acciones, se recomienda:

```typescript
const notificationSchedule: NotificationSchedule = {
  sevenDaysBefore: true, // 7 días antes
  oneDayBefore: true, // 1 día antes
  onEventDay: true, // El día del vencimiento
  customDays: [3], // 3 días antes (adicional)
};
```

## Visualización en Calendario

- **Color**: Rojo (`bg-red-100 border-red-500 text-red-900`)
- **Icono**: AlertTriangle o ClipboardCheck
- **Badge**: Mostrar tipo de acción (Correctiva/Preventiva)
- **Indicador de vencido**: Si `due_date < now && status !== 'completed'`

## Ejemplo Completo

```typescript
// Crear acción con integración de calendario
const action = await actionService.create({
  description: 'Actualizar procedimiento de calibración',
  root_cause: 'Procedimiento desactualizado',
  type: 'correctiva',
  due_date: new Date('2024-12-31'),
  responsible_user_id: 'user123',
  responsible_user_name: 'Juan Pérez',
  finding_id: 'finding456',
  audit_id: 'audit789',
  process_id: 'proc001',
  process_name: 'Calibración',
  verification_required: true,
  status: 'pending',
  organizationId: 'org123',
  createdBy: 'user456',
  createdByName: 'Admin User',
});

// Esto automáticamente crea un evento en el calendario:
// - Título: "Acción correctiva: Actualizar procedimiento de calibración"
// - Fecha: 2024-12-31
// - Tipo: action_deadline
// - Prioridad: calculada según días hasta vencimiento
// - Responsable: Juan Pérez
```

## Consideraciones

1. **Manejo de Errores**: La publicación de eventos no debe fallar la operación principal
2. **Transacciones**: Considerar usar transacciones si es crítico mantener consistencia
3. **Performance**: La publicación es asíncrona y no bloquea
4. **Sincronización**: El SyncService puede validar consistencia periódicamente
5. **Permisos**: Solo usuarios con acceso a la acción pueden ver el evento

## Testing

```typescript
describe('Action Calendar Integration', () => {
  it('should create calendar event when action is created with due_date', async () => {
    const action = await actionService.create({
      // ... datos de acción
      due_date: new Date('2024-12-31'),
    });

    const events = await calendarService.getEventsByModule('actions');
    expect(events).toHaveLength(1);
    expect(events[0].sourceRecordId).toBe(action.id);
    expect(events[0].type).toBe('action_deadline');
  });

  it('should update calendar event when due_date changes', async () => {
    // ... test de actualización
  });

  it('should delete calendar event when action is deleted', async () => {
    // ... test de eliminación
  });
});
```
