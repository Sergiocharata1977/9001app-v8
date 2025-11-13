import { Timestamp } from 'firebase/firestore';

// ============================================
// ENUMS Y TIPOS BASE
// ============================================

export type EventType =
  | 'audit'
  | 'document_expiry'
  | 'action_deadline'
  | 'training'
  | 'evaluation'
  | 'meeting'
  | 'general';

export type SourceModule =
  | 'audits'
  | 'documents'
  | 'actions'
  | 'trainings'
  | 'evaluations'
  | 'custom';

export type EventStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'overdue';

export type EventPriority = 'low' | 'medium' | 'high' | 'critical';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type IntegrationStatus = 'pending' | 'active' | 'disabled' | 'error';

// ============================================
// INTERFACES PRINCIPALES
// ============================================

export interface CalendarEvent {
  id: string;

  // Información básica
  title: string;
  description: string | null;
  date: Timestamp;
  endDate: Timestamp | null; // Para eventos multi-día

  // Categorización
  type: EventType;
  sourceModule: SourceModule;
  status: EventStatus;
  priority: EventPriority;

  // Origen y trazabilidad
  sourceRecordId: string; // ID del registro origen (audit, document, etc.)
  sourceRecordType: string; // Tipo del registro origen
  sourceRecordNumber: string | null; // Número de auditoría, documento, etc.

  // Responsabilidad
  responsibleUserId: string | null;
  responsibleUserName: string | null;
  participantIds: string[] | null; // Para eventos con múltiples participantes

  // Organización
  organizationId: string;
  processId: string | null;
  processName: string | null;

  // Metadata adicional
  metadata: Record<string, unknown> | null; // Datos específicos del módulo

  // Notificaciones
  notificationSchedule: NotificationSchedule | null;
  notificationsSent: boolean;

  // Recurrencia (para eventos personales)
  isRecurring: boolean;
  recurrenceRule: RecurrenceRule | null;

  // Auditoría
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  createdByName: string;
  isActive: boolean;
  isSystemGenerated: boolean; // true para eventos de ABM, false para personales
}

export interface NotificationSchedule {
  sevenDaysBefore: boolean;
  oneDayBefore: boolean;
  onEventDay: boolean;
  customDays: number[] | null; // Días personalizados antes del evento
}

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // Cada cuántos períodos (ej: cada 2 semanas)
  endDate: Timestamp | null;
  occurrences: number | null; // Número de repeticiones
}

export interface RecurrenceRuleInput {
  frequency: RecurrenceFrequency;
  interval: number;
  endDate: Date | null;
  occurrences: number | null;
}

export interface ModuleIntegration {
  id: string;
  moduleName: SourceModule;
  displayName: string;
  isEnabled: boolean;
  integrationStatus: IntegrationStatus;

  // Configuración
  config: {
    autoCreateEvents: boolean;
    autoUpdateEvents: boolean;
    autoDeleteEvents: boolean;
    defaultNotifications: boolean;
  };

  // Estadísticas
  stats: {
    totalEvents: number;
    activeEvents: number;
    lastSyncAt: Timestamp | null;
    lastError: string | null;
  };

  // Auditoría
  createdAt: Timestamp;
  updatedAt: Timestamp;
  enabledBy: string | null;
  enabledByName: string | null;
}

export interface CalendarNotification {
  id: string;
  eventId: string;
  userId: string;
  type: 'seven_days' | 'one_day' | 'event_day' | 'custom';
  scheduledFor: Timestamp;
  sentAt: Timestamp | null;
  status: 'pending' | 'sent' | 'failed';
  message: string;
  createdAt: Timestamp;
}

export interface NotificationPreferences {
  userId: string;
  enabled: boolean;
  sevenDaysBefore: boolean;
  oneDayBefore: boolean;
  onEventDay: boolean;
  customDays: number[] | null;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  updatedAt: Timestamp;
}

// ============================================
// TIPOS PARA FORMULARIOS Y CREACIÓN
// ============================================

export interface CalendarEventCreateData {
  title: string;
  description: string | null;
  date: Date;
  endDate: Date | null;
  type: EventType;
  sourceModule: SourceModule;
  priority: EventPriority;
  sourceRecordId: string;
  sourceRecordType: string;
  sourceRecordNumber: string | null;
  responsibleUserId: string | null;
  responsibleUserName: string | null;
  participantIds: string[] | null;
  organizationId: string;
  processId: string | null;
  processName: string | null;
  metadata: Record<string, unknown> | null;
  notificationSchedule: NotificationSchedule | null;
  isRecurring: boolean;
  recurrenceRule: RecurrenceRuleInput | null;
  createdBy: string;
  createdByName: string;
  isSystemGenerated: boolean;
}

export interface CalendarEventUpdateData {
  title?: string;
  description?: string | null;
  date?: Date;
  endDate?: Date | null;
  status?: EventStatus;
  priority?: EventPriority;
  responsibleUserId?: string | null;
  responsibleUserName?: string | null;
  participantIds?: string[] | null;
  processId?: string | null;
  processName?: string | null;
  metadata?: Record<string, unknown> | null;
  notificationSchedule?: NotificationSchedule | null;
}

export interface PublishEventData {
  title: string;
  description: string | null;
  date: Date;
  endDate?: Date | null;
  type: EventType;
  sourceRecordId: string;
  sourceRecordType: string;
  sourceRecordNumber?: string | null;
  responsibleUserId?: string | null;
  responsibleUserName?: string | null;
  participantIds?: string[] | null;
  priority: EventPriority;
  processId?: string | null;
  processName?: string | null;
  metadata?: Record<string, unknown> | null;
}

// ============================================
// TIPOS PARA FILTROS Y QUERIES
// ============================================

export interface EventFilters {
  type?: EventType | EventType[];
  sourceModule?: SourceModule | SourceModule[];
  status?: EventStatus | EventStatus[];
  priority?: EventPriority | EventPriority[];
  responsibleUserId?: string;
  processId?: string;
  isSystemGenerated?: boolean;
  search?: string;
}

export interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
}

// ============================================
// TIPOS PARA RESPUESTAS DE API
// ============================================

export interface CalendarStats {
  total: number;
  byType: Record<EventType, number>;
  byModule: Record<SourceModule, number>;
  byStatus: Record<EventStatus, number>;
  byPriority: Record<EventPriority, number>;
  upcoming7Days: number;
  upcoming30Days: number;
  overdue: number;
}

export interface UserWorkload {
  userId: string;
  period: 'week' | 'month' | 'quarter';
  totalEvents: number;
  overdueEvents: number;
  upcomingEvents: number;
  byType: Record<EventType, number>;
  byPriority: Record<EventPriority, number>;
  completionRate: number; // Porcentaje de eventos completados
}

export interface AvailabilitySlot {
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
}

export interface EventContext {
  event: CalendarEvent;
  sourceRecord: Record<string, unknown>; // Registro origen (Audit, Document, etc.)
  relatedRecords: Record<string, unknown>[]; // Registros relacionados
  responsibleUser: Record<string, unknown> | null;
  participants: Record<string, unknown>[] | null;
}

// ============================================
// TIPOS PARA SINCRONIZACIÓN
// ============================================

export interface SyncResult {
  module: SourceModule;
  success: boolean;
  eventsProcessed: number;
  eventsCreated: number;
  eventsUpdated: number;
  eventsDeleted: number;
  errors: string[];
  timestamp: Date;
}

export interface ValidationResult {
  valid: boolean;
  totalEvents: number;
  orphanedEvents: number;
  inconsistentEvents: number;
  errors: Array<{
    eventId: string;
    error: string;
  }>;
}

export interface CleanupResult {
  eventsDeleted: number;
  eventIds: string[];
  timestamp: Date;
}

export interface DailySyncResult {
  success: boolean;
  modules: SyncResult[];
  validation: ValidationResult;
  cleanup: CleanupResult;
  timestamp: Date;
}

// ============================================
// TIPOS PARA ERRORES
// ============================================

export enum CalendarErrorCode {
  // Validación
  INVALID_EVENT_DATA = 'INVALID_EVENT_DATA',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  INVALID_MODULE = 'INVALID_MODULE',

  // Permisos
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Integración
  MODULE_NOT_INTEGRATED = 'MODULE_NOT_INTEGRATED',
  MODULE_DISABLED = 'MODULE_DISABLED',
  INTEGRATION_ERROR = 'INTEGRATION_ERROR',

  // Sincronización
  SYNC_FAILED = 'SYNC_FAILED',
  SOURCE_RECORD_NOT_FOUND = 'SOURCE_RECORD_NOT_FOUND',
  ORPHANED_EVENT = 'ORPHANED_EVENT',

  // Notificaciones
  NOTIFICATION_FAILED = 'NOTIFICATION_FAILED',

  // General
  EVENT_NOT_FOUND = 'EVENT_NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class CalendarError extends Error {
  constructor(
    message: string,
    public code: CalendarErrorCode,
    public details?: unknown
  ) {
    super(message);
    this.name = 'CalendarError';
  }
}
