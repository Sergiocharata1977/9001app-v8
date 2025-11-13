import { db } from '@/firebase/config';
import type {
  CalendarErrorCode,
  CalendarEvent,
  CalendarEventCreateData,
  CalendarEventUpdateData,
  EventFilters,
} from '@/types/calendar';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

const COLLECTION_NAME = 'calendar_events';

export class CalendarService {
  // ============================================
  // CRUD OPERATIONS
  // ============================================

  /**
   * Crear un nuevo evento de calendario
   */
  static async createEvent(data: CalendarEventCreateData): Promise<string> {
    try {
      const now = Timestamp.now();

      const eventData: Omit<CalendarEvent, 'id'> = {
        title: data.title,
        description: data.description,
        date: Timestamp.fromDate(data.date),
        endDate: data.endDate ? Timestamp.fromDate(data.endDate) : null,
        type: data.type,
        sourceModule: data.sourceModule,
        status: 'scheduled',
        priority: data.priority,
        sourceRecordId: data.sourceRecordId,
        sourceRecordType: data.sourceRecordType,
        sourceRecordNumber: data.sourceRecordNumber,
        responsibleUserId: data.responsibleUserId,
        responsibleUserName: data.responsibleUserName,
        participantIds: data.participantIds,
        organizationId: data.organizationId,
        processId: data.processId,
        processName: data.processName,
        metadata: data.metadata,
        notificationSchedule: data.notificationSchedule,
        notificationsSent: false,
        isRecurring: data.isRecurring,
        recurrenceRule: data.recurrenceRule
          ? {
              frequency: data.recurrenceRule.frequency,
              interval: data.recurrenceRule.interval,
              endDate: data.recurrenceRule.endDate
                ? Timestamp.fromDate(data.recurrenceRule.endDate)
                : null,
              occurrences: data.recurrenceRule.occurrences,
            }
          : null,
        createdAt: now,
        updatedAt: now,
        createdBy: data.createdBy,
        createdByName: data.createdByName,
        isActive: true,
        isSystemGenerated: data.isSystemGenerated,
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), eventData);

      return docRef.id;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw this.handleError(
        error,
        'Error al crear evento de calendario',
        'DATABASE_ERROR' as CalendarErrorCode
      );
    }
  }

  /**
   * Obtener evento por ID
   */
  static async getEventById(id: string): Promise<CalendarEvent | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as CalendarEvent;
    } catch (error) {
      console.error('Error getting calendar event:', error);
      throw this.handleError(
        error,
        'Error al obtener evento de calendario',
        'DATABASE_ERROR' as CalendarErrorCode
      );
    }
  }

  /**
   * Actualizar evento
   */
  static async updateEvent(
    id: string,
    data: CalendarEventUpdateData
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);

      const updateData: Record<string, unknown> = {
        updatedAt: Timestamp.now(),
      };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.date !== undefined)
        updateData.date = Timestamp.fromDate(data.date);
      if (data.endDate !== undefined)
        updateData.endDate = data.endDate
          ? Timestamp.fromDate(data.endDate)
          : null;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.responsibleUserId !== undefined)
        updateData.responsibleUserId = data.responsibleUserId;
      if (data.responsibleUserName !== undefined)
        updateData.responsibleUserName = data.responsibleUserName;
      if (data.participantIds !== undefined)
        updateData.participantIds = data.participantIds;
      if (data.processId !== undefined) updateData.processId = data.processId;
      if (data.processName !== undefined)
        updateData.processName = data.processName;
      if (data.metadata !== undefined) updateData.metadata = data.metadata;
      if (data.notificationSchedule !== undefined)
        updateData.notificationSchedule = data.notificationSchedule;

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw this.handleError(
        error,
        'Error al actualizar evento de calendario',
        'DATABASE_ERROR' as CalendarErrorCode
      );
    }
  }

  /**
   * Eliminar evento (soft delete)
   */
  static async deleteEvent(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);

      await updateDoc(docRef, {
        isActive: false,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw this.handleError(
        error,
        'Error al eliminar evento de calendario',
        'DATABASE_ERROR' as CalendarErrorCode
      );
    }
  }

  /**
   * Eliminar evento permanentemente (hard delete)
   * Solo para uso interno en sincronización
   */
  static async hardDeleteEvent(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error hard deleting calendar event:', error);
      throw this.handleError(
        error,
        'Error al eliminar permanentemente evento de calendario',
        'DATABASE_ERROR' as CalendarErrorCode
      );
    }
  }

  // ============================================
  // QUERY OPERATIONS
  // ============================================

  /**
   * Obtener eventos por rango de fechas
   */
  static async getEventsByDateRange(
    startDate: Date,
    endDate: Date,
    filters?: EventFilters,
    organizationId?: string
  ): Promise<CalendarEvent[]> {
    try {
      const constraints: QueryConstraint[] = [where('isActive', '==', true)];

      // Filtro por organización (requerido para seguridad)
      if (organizationId) {
        constraints.push(where('organizationId', '==', organizationId));
      }

      // Filtro por rango de fechas
      constraints.push(where('date', '>=', Timestamp.fromDate(startDate)));
      constraints.push(where('date', '<=', Timestamp.fromDate(endDate)));

      // Aplicar filtros adicionales
      if (filters?.type && typeof filters.type === 'string') {
        constraints.push(where('type', '==', filters.type));
      }

      if (filters?.sourceModule && typeof filters.sourceModule === 'string') {
        constraints.push(where('sourceModule', '==', filters.sourceModule));
      }

      if (filters?.status && typeof filters.status === 'string') {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters?.responsibleUserId) {
        constraints.push(
          where('responsibleUserId', '==', filters.responsibleUserId)
        );
      }

      if (filters?.processId) {
        constraints.push(where('processId', '==', filters.processId));
      }

      if (filters?.isSystemGenerated !== undefined) {
        constraints.push(
          where('isSystemGenerated', '==', filters.isSystemGenerated)
        );
      }

      // Ordenar por fecha
      constraints.push(orderBy('date', 'asc'));
      constraints.push(limit(500)); // Límite de seguridad

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);

      let events: CalendarEvent[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CalendarEvent[];

      // Filtros en memoria para arrays
      if (filters?.type && Array.isArray(filters.type)) {
        events = events.filter(e => filters.type!.includes(e.type));
      }

      if (filters?.sourceModule && Array.isArray(filters.sourceModule)) {
        events = events.filter(e =>
          filters.sourceModule!.includes(e.sourceModule)
        );
      }

      if (filters?.status && Array.isArray(filters.status)) {
        events = events.filter(e => filters.status!.includes(e.status));
      }

      if (filters?.priority && Array.isArray(filters.priority)) {
        events = events.filter(e => filters.priority!.includes(e.priority));
      } else if (filters?.priority && typeof filters.priority === 'string') {
        events = events.filter(e => e.priority === filters.priority);
      }

      // Filtro de búsqueda en memoria
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        events = events.filter(
          e =>
            e.title.toLowerCase().includes(searchLower) ||
            e.description?.toLowerCase().includes(searchLower) ||
            e.sourceRecordNumber?.toLowerCase().includes(searchLower)
        );
      }

      return events;
    } catch (error) {
      console.error('Error getting events by date range:', error);
      throw this.handleError(
        error,
        'Error al obtener eventos por rango de fechas',
        'DATABASE_ERROR' as CalendarErrorCode
      );
    }
  }

  /**
   * Obtener eventos de un usuario
   */
  static async getEventsByUser(
    userId: string,
    filters?: EventFilters,
    organizationId?: string
  ): Promise<CalendarEvent[]> {
    try {
      const constraints: QueryConstraint[] = [
        where('isActive', '==', true),
        where('responsibleUserId', '==', userId),
      ];

      if (organizationId) {
        constraints.push(where('organizationId', '==', organizationId));
      }

      constraints.push(orderBy('date', 'asc'));
      constraints.push(limit(500));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);

      let events: CalendarEvent[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CalendarEvent[];

      // Aplicar filtros adicionales en memoria
      events = this.applyInMemoryFilters(events, filters);

      return events;
    } catch (error) {
      console.error('Error getting events by user:', error);
      throw this.handleError(
        error,
        'Error al obtener eventos del usuario',
        'DATABASE_ERROR' as CalendarErrorCode
      );
    }
  }

  /**
   * Obtener eventos por módulo
   */
  static async getEventsByModule(
    module: string,
    filters?: EventFilters,
    organizationId?: string
  ): Promise<CalendarEvent[]> {
    try {
      const constraints: QueryConstraint[] = [
        where('isActive', '==', true),
        where('sourceModule', '==', module),
      ];

      if (organizationId) {
        constraints.push(where('organizationId', '==', organizationId));
      }

      constraints.push(orderBy('date', 'asc'));
      constraints.push(limit(500));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);

      let events: CalendarEvent[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CalendarEvent[];

      events = this.applyInMemoryFilters(events, filters);

      return events;
    } catch (error) {
      console.error('Error getting events by module:', error);
      throw this.handleError(
        error,
        'Error al obtener eventos del módulo',
        'DATABASE_ERROR' as CalendarErrorCode
      );
    }
  }

  /**
   * Obtener eventos próximos (N días)
   */
  static async getUpcomingEvents(
    days: number,
    filters?: EventFilters,
    organizationId?: string
  ): Promise<CalendarEvent[]> {
    try {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      return await this.getEventsByDateRange(
        now,
        futureDate,
        filters,
        organizationId
      );
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      throw this.handleError(
        error,
        'Error al obtener eventos próximos',
        'DATABASE_ERROR' as CalendarErrorCode
      );
    }
  }

  /**
   * Obtener eventos vencidos
   */
  static async getOverdueEvents(
    filters?: EventFilters,
    organizationId?: string
  ): Promise<CalendarEvent[]> {
    try {
      const constraints: QueryConstraint[] = [
        where('isActive', '==', true),
        where('date', '<', Timestamp.now()),
        where('status', '!=', 'completed'),
      ];

      if (organizationId) {
        constraints.push(where('organizationId', '==', organizationId));
      }

      constraints.push(orderBy('status'));
      constraints.push(orderBy('date', 'desc'));
      constraints.push(limit(200));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);

      let events: CalendarEvent[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CalendarEvent[];

      events = this.applyInMemoryFilters(events, filters);

      return events;
    } catch (error) {
      console.error('Error getting overdue events:', error);
      throw this.handleError(
        error,
        'Error al obtener eventos vencidos',
        'DATABASE_ERROR' as CalendarErrorCode
      );
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private static applyInMemoryFilters(
    events: CalendarEvent[],
    filters?: EventFilters
  ): CalendarEvent[] {
    if (!filters) return events;

    let filtered = events;

    if (filters.type && Array.isArray(filters.type)) {
      filtered = filtered.filter(e => filters.type!.includes(e.type));
    } else if (filters.type) {
      filtered = filtered.filter(e => e.type === filters.type);
    }

    if (filters.sourceModule && Array.isArray(filters.sourceModule)) {
      filtered = filtered.filter(e =>
        filters.sourceModule!.includes(e.sourceModule)
      );
    } else if (filters.sourceModule) {
      filtered = filtered.filter(e => e.sourceModule === filters.sourceModule);
    }

    if (filters.status && Array.isArray(filters.status)) {
      filtered = filtered.filter(e => filters.status!.includes(e.status));
    } else if (filters.status) {
      filtered = filtered.filter(e => e.status === filters.status);
    }

    if (filters.priority && Array.isArray(filters.priority)) {
      filtered = filtered.filter(e => filters.priority!.includes(e.priority));
    } else if (filters.priority) {
      filtered = filtered.filter(e => e.priority === filters.priority);
    }

    if (filters.processId) {
      filtered = filtered.filter(e => e.processId === filters.processId);
    }

    if (filters.isSystemGenerated !== undefined) {
      filtered = filtered.filter(
        e => e.isSystemGenerated === filters.isSystemGenerated
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.title.toLowerCase().includes(searchLower) ||
          e.description?.toLowerCase().includes(searchLower) ||
          e.sourceRecordNumber?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  private static handleError(
    error: unknown,
    message: string,
    code: CalendarErrorCode
  ): Error {
    const CalendarError = class extends Error {
      constructor(
        message: string,
        public code: CalendarErrorCode,
        public details?: unknown
      ) {
        super(message);
        this.name = 'CalendarError';
      }
    };

    return new CalendarError(message, code, { originalError: error });
  }
}
