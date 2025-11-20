# Integración del Calendario con Módulo de Capacitaciones

## Overview

Este documento describe cómo integrar el módulo de Capacitaciones con el sistema de calendario unificado. Las capacitaciones y evaluaciones generan eventos de calendario automáticamente.

## Tipos de Eventos

### 1. Capacitación (Training)

```typescript
type: 'training';
sourceModule: 'trainings';
```

### 2. Evaluación (Evaluation)

```typescript
type: 'evaluation';
sourceModule: 'evaluations';
```

## Estructura de Evento para Capacitaciones

### Metadata para Training

```typescript
interface TrainingEventMetadata {
  trainingId: string;
  trainingCode: string;
  trainingType: 'internal' | 'external' | 'online';
  duration: number; // Duración en horas
  location: string | null;
  instructor: string | null;
  maxParticipants: number | null;
  currentParticipants: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  requiresEvaluation: boolean;
  certificateIssued: boolean;
}
```

### Metadata para Evaluation

```typescript
interface EvaluationEventMetadata {
  evaluationId: string;
  evaluationCode: string;
  trainingId: string;
  trainingCode: string;
  evaluationType: 'written' | 'practical' | 'oral' | 'online';
  duration: number; // Duración en minutos
  passingScore: number;
  maxAttempts: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}
```

## Eventos Multi-Día

Las capacitaciones pueden extenderse por varios días:

```typescript
interface MultiDayTrainingEvent {
  date: Date; // Fecha de inicio
  endDate: Date; // Fecha de fin
  // ... otros campos
}
```

Ejemplo:

- Capacitación del 15 al 17 de enero
- `date`: 2024-01-15 09:00
- `endDate`: 2024-01-17 17:00

## Mapeo de Prioridad

```typescript
function mapTrainingPriority(
  trainingType: 'internal' | 'external' | 'online',
  isRequired: boolean,
  daysUntilStart: number
): EventPriority {
  // Capacitaciones obligatorias externas (más costosas)
  if (trainingType === 'external' && isRequired) {
    if (daysUntilStart <= 7) return 'high';
    if (daysUntilStart <= 30) return 'medium';
    return 'low';
  }

  // Capacitaciones obligatorias internas
  if (isRequired) {
    if (daysUntilStart <= 3) return 'high';
    if (daysUntilStart <= 14) return 'medium';
    return 'low';
  }

  // Capacitaciones opcionales
  return 'low';
}

function mapEvaluationPriority(
  isRequired: boolean,
  daysUntilEvaluation: number
): EventPriority {
  if (isRequired) {
    if (daysUntilEvaluation <= 2) return 'high';
    if (daysUntilEvaluation <= 7) return 'medium';
    return 'low';
  }
  return 'low';
}
```

## Puntos de Integración en TrainingService

### 1. Crear Capacitación

```typescript
// En TrainingService.create()
async create(data: TrainingCreateData): Promise<Training> {
  // ... crear capacitación en Firestore

  // Publicar evento de calendario
  if (training.scheduled_date) {
    try {
      const priority = mapTrainingPriority(
        training.type,
        training.is_required,
        Math.ceil((training.scheduled_date.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      );

      await eventPublisher.publishEvent({
        title: `Capacitación: ${training.title}`,
        description: training.description || null,
        date: training.scheduled_date.toDate(),
        endDate: training.end_date?.toDate() || null,
        type: 'training',
        sourceRecordId: training.id,
        sourceRecordType: 'training',
        sourceRecordNumber: training.training_code,
        responsibleUserId: training.instructor_id,
        responsibleUserName: training.instructor_name,
        participantIds: training.participant_ids,
        priority,
        processId: training.process_id,
        processName: training.process_name,
        metadata: {
          trainingId: training.id,
          trainingCode: training.training_code,
          trainingType: training.type,
          duration: training.duration_hours,
          location: training.location,
          instructor: training.instructor_name,
          maxParticipants: training.max_participants,
          currentParticipants: training.participant_ids?.length || 0,
          status: training.status,
          requiresEvaluation: training.requires_evaluation,
          certificateIssued: false,
        },
      }, 'trainings', user.organizationId);
    } catch (error) {
      console.error('Error publishing training event:', error);
    }
  }

  return training;
}
```

### 2. Crear Evaluación

```typescript
// En EvaluationService.create()
async create(data: EvaluationCreateData): Promise<Evaluation> {
  // ... crear evaluación en Firestore

  // Publicar evento de calendario
  if (evaluation.scheduled_date) {
    try {
      const priority = mapEvaluationPriority(
        evaluation.is_required,
        Math.ceil((evaluation.scheduled_date.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      );

      await eventPublisher.publishEvent({
        title: `Evaluación: ${evaluation.title}`,
        description: `Evaluación de capacitación: ${evaluation.training_title}`,
        date: evaluation.scheduled_date.toDate(),
        type: 'evaluation',
        sourceRecordId: evaluation.id,
        sourceRecordType: 'evaluation',
        sourceRecordNumber: evaluation.evaluation_code,
        responsibleUserId: evaluation.evaluator_id,
        responsibleUserName: evaluation.evaluator_name,
        participantIds: evaluation.participant_ids,
        priority,
        processId: evaluation.process_id,
        processName: evaluation.process_name,
        metadata: {
          evaluationId: evaluation.id,
          evaluationCode: evaluation.evaluation_code,
          trainingId: evaluation.training_id,
          trainingCode: evaluation.training_code,
          evaluationType: evaluation.type,
          duration: evaluation.duration_minutes,
          passingScore: evaluation.passing_score,
          maxAttempts: evaluation.max_attempts,
          status: evaluation.status,
        },
      }, 'evaluations', user.organizationId);
    } catch (error) {
      console.error('Error publishing evaluation event:', error);
    }
  }

  return evaluation;
}
```

### 3. Actualizar Capacitación

```typescript
// En TrainingService.update()
async update(id: string, data: TrainingUpdateData): Promise<Training> {
  const training = await this.getById(id);

  // ... actualizar capacitación en Firestore

  // Actualizar evento si cambió fecha, estado o participantes
  if (data.scheduled_date || data.end_date || data.status || data.participant_ids) {
    try {
      const updateData: any = {};

      if (data.scheduled_date) {
        updateData.date = data.scheduled_date;
      }

      if (data.end_date) {
        updateData.endDate = data.end_date;
      }

      if (data.status) {
        updateData.status = mapTrainingStatusToEventStatus(data.status);
      }

      if (data.participant_ids) {
        updateData.participantIds = data.participant_ids;
        updateData.metadata = {
          ...training.metadata,
          currentParticipants: data.participant_ids.length,
        };
      }

      await eventPublisher.updatePublishedEvent(
        training.id,
        'trainings',
        updateData,
        user.organizationId
      );
    } catch (error) {
      console.error('Error updating training event:', error);
    }
  }

  return updatedTraining;
}
```

### 4. Eliminar Capacitación/Evaluación

```typescript
// En TrainingService.delete() o EvaluationService.delete()
async delete(id: string): Promise<void> {
  // ... eliminar en Firestore

  // Eliminar evento de calendario
  try {
    await eventPublisher.deletePublishedEvent(
      id,
      'trainings', // o 'evaluations'
      user.organizationId
    );
  } catch (error) {
    console.error('Error deleting training/evaluation event:', error);
  }
}
```

## Mapeo de Estados

```typescript
function mapTrainingStatusToEventStatus(
  trainingStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
): EventStatus {
  switch (trainingStatus) {
    case 'scheduled':
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

### Para Capacitaciones

```typescript
const trainingNotificationSchedule: NotificationSchedule = {
  sevenDaysBefore: true, // 7 días antes (para preparación)
  oneDayBefore: true, // 1 día antes (recordatorio)
  onEventDay: true, // El día de la capacitación
  customDays: null,
};
```

### Para Evaluaciones

```typescript
const evaluationNotificationSchedule: NotificationSchedule = {
  sevenDaysBefore: false,
  oneDayBefore: true, // 1 día antes
  onEventDay: true, // El día de la evaluación
  customDays: [3], // 3 días antes (para estudio)
};
```

## Visualización en Calendario

### Capacitaciones

- **Color**: Verde esmeralda (`bg-emerald-100 border-emerald-500 text-emerald-900`)
- **Icono**: GraduationCap o BookOpen
- **Badge**: Tipo (Interna/Externa/Online)
- **Duración**: Mostrar si es multi-día

### Evaluaciones

- **Color**: Púrpura (`bg-purple-100 border-purple-500 text-purple-900`)
- **Icono**: ClipboardCheck o FileCheck
- **Badge**: Tipo de evaluación
- **Duración**: Mostrar duración en minutos

## Manejo de Participantes

Los eventos de capacitación/evaluación incluyen múltiples participantes:

```typescript
participantIds: ['user1', 'user2', 'user3'];
```

Cada participante verá el evento en su calendario personal.

## Vista Semanal Recomendada

Para capacitaciones con horarios específicos, la vista semanal es ideal:

```
Lunes 15/01
09:00 - 17:00  Capacitación ISO 9001 (Día 1)

Martes 16/01
09:00 - 17:00  Capacitación ISO 9001 (Día 2)

Miércoles 17/01
09:00 - 17:00  Capacitación ISO 9001 (Día 3)
14:00 - 15:30  Evaluación ISO 9001
```

## Ejemplo Completo

```typescript
// Crear capacitación multi-día
const training = await trainingService.create({
  title: 'Capacitación ISO 9001:2015',
  description: 'Capacitación completa sobre requisitos de ISO 9001',
  type: 'external',
  scheduled_date: new Date('2024-01-15 09:00'),
  end_date: new Date('2024-01-17 17:00'),
  duration_hours: 24,
  location: 'Hotel Sheraton - Sala A',
  instructor_id: 'instructor123',
  instructor_name: 'Dr. Carlos Méndez',
  participant_ids: ['user1', 'user2', 'user3', 'user4'],
  max_participants: 20,
  is_required: true,
  requires_evaluation: true,
  process_id: 'proc001',
  process_name: 'Gestión de Calidad',
  status: 'scheduled',
  organizationId: 'org123',
  createdBy: 'admin',
  createdByName: 'Admin User',
});

// Crear evaluación asociada
const evaluation = await evaluationService.create({
  title: 'Evaluación ISO 9001:2015',
  training_id: training.id,
  training_code: training.training_code,
  training_title: training.title,
  type: 'written',
  scheduled_date: new Date('2024-01-17 14:00'),
  duration_minutes: 90,
  passing_score: 70,
  max_attempts: 2,
  evaluator_id: 'instructor123',
  evaluator_name: 'Dr. Carlos Méndez',
  participant_ids: ['user1', 'user2', 'user3', 'user4'],
  is_required: true,
  process_id: 'proc001',
  process_name: 'Gestión de Calidad',
  status: 'scheduled',
  organizationId: 'org123',
  createdBy: 'admin',
  createdByName: 'Admin User',
});
```

## Consideraciones Especiales

1. **Eventos Multi-Día**: Usar `endDate` para capacitaciones de varios días
2. **Participantes Múltiples**: Todos los participantes ven el evento
3. **Horarios Específicos**: Incluir hora exacta en `date`
4. **Capacidad**: Validar `max_participants` antes de agregar participantes
5. **Certificados**: Actualizar metadata cuando se emite certificado
6. **Evaluaciones**: Crear evento separado para evaluación post-capacitación

## Testing

```typescript
describe('Training Calendar Integration', () => {
  it('should create calendar event for multi-day training', async () => {
    const training = await trainingService.create({
      // ... datos de capacitación
      scheduled_date: new Date('2024-01-15'),
      end_date: new Date('2024-01-17'),
    });

    const events = await calendarService.getEventsByModule('trainings');
    expect(events).toHaveLength(1);
    expect(events[0].endDate).toBeDefined();
    expect(events[0].type).toBe('training');
  });

  it('should create separate event for evaluation', async () => {
    // ... test de evaluación
  });

  it('should include all participants in event', async () => {
    // ... test de participantes
  });
});
```
