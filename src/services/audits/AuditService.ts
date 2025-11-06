import { db } from '@/firebase/config';
import { TraceabilityService } from '@/services/shared/TraceabilityService';
import type {
  Audit,
  AuditFilters,
  AuditFormData,
  AuditStats,
} from '@/types/audits';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

/**
 * AuditService
 *
 * Servicio para gestionar auditorías del sistema de calidad.
 * Incluye generación de números secuenciales, gestión de estados,
 * y contadores de hallazgos relacionados.
 */
export class AuditService {
  private static readonly COLLECTION = 'audits';

  /**
   * Obtiene todas las auditorías con filtros opcionales
   */
  static async getAll(filters?: AuditFilters): Promise<Audit[]> {
    try {
      const auditsRef = collection(db, this.COLLECTION);
      let q = query(auditsRef, where('isActive', '==', true));

      // Aplicar filtros
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.auditType) {
        q = query(q, where('auditType', '==', filters.auditType));
      }
      if (filters?.leadAuditorId) {
        q = query(q, where('leadAuditorId', '==', filters.leadAuditorId));
      }

      // Ordenar por fecha planificada descendente
      q = query(q, orderBy('plannedDate', 'desc'));

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Audit[];
    } catch (error) {
      console.error('Error getting audits:', error);
      throw new Error('Failed to get audits');
    }
  }

  /**
   * Obtiene una auditoría por ID
   */
  static async getById(id: string): Promise<Audit | null> {
    try {
      const auditRef = doc(db, this.COLLECTION, id);
      const auditDoc = await getDoc(auditRef);

      if (!auditDoc.exists()) {
        return null;
      }

      return {
        id: auditDoc.id,
        ...auditDoc.data(),
      } as Audit;
    } catch (error) {
      console.error('Error getting audit:', error);
      throw new Error('Failed to get audit');
    }
  }

  /**
   * Crea una nueva auditoría
   */
  static async create(data: AuditFormData, userId: string): Promise<string> {
    try {
      const now = new Date();
      const year = new Date(data.plannedDate).getFullYear();

      // Generar número de auditoría
      const auditNumber = await TraceabilityService.generateNumber('AUD', year);

      const auditData: Record<string, unknown> = {
        auditNumber,
        title: data.title,
        description: data.description,
        auditType: data.auditType,
        auditScope: data.auditScope,
        isoClausesCovered: data.isoClausesCovered || [],
        plannedDate: data.plannedDate,
        duration: data.duration || 0,
        leadAuditorId: data.leadAuditorId,
        leadAuditorName: data.leadAuditorName,
        auditTeam: data.auditTeam || [],
        status: 'planned',
        findingsCount: 0,
        criticalFindings: 0,
        majorFindings: 0,
        minorFindings: 0,
        observations: 0,
        followUpRequired: data.followUpRequired || false,
        traceabilityChain: [auditNumber],
        createdBy: userId,
        isActive: true,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      };

      // Solo agregar campos opcionales si tienen valor
      if (data.followUpDate) auditData.followUpDate = data.followUpDate;
      if (data.correctionDeadline)
        auditData.correctionDeadline = data.correctionDeadline;

      const docRef = await addDoc(collection(db, this.COLLECTION), auditData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating audit:', error);
      throw new Error('Failed to create audit');
    }
  }

  /**
   * Actualiza una auditoría existente
   */
  static async update(
    id: string,
    data: Partial<AuditFormData>,
    userId: string
  ): Promise<void> {
    try {
      const auditRef = doc(db, this.COLLECTION, id);
      const updateData: Record<string, unknown> = {
        ...data,
        updatedBy: userId,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      await updateDoc(auditRef, updateData);
    } catch (error) {
      console.error('Error updating audit:', error);
      throw new Error('Failed to update audit');
    }
  }

  /**
   * Elimina una auditoría (soft delete)
   */
  static async delete(id: string, userId: string): Promise<void> {
    try {
      const auditRef = doc(db, this.COLLECTION, id);
      await updateDoc(auditRef, {
        isActive: false,
        updatedBy: userId,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error deleting audit:', error);
      throw new Error('Failed to delete audit');
    }
  }

  /**
   * Actualiza el estado de una auditoría
   */
  static async updateStatus(
    id: string,
    status: Audit['status'],
    userId: string
  ): Promise<void> {
    try {
      const auditRef = doc(db, this.COLLECTION, id);
      const updateData: Record<string, unknown> = {
        status,
        updatedBy: userId,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      // Si el estado es 'in_progress', establecer fecha de inicio real
      if (status === 'in_progress') {
        updateData.actualStartDate = new Date().toISOString();
      }

      // Si el estado es 'completed', establecer fecha de fin real
      if (status === 'completed') {
        updateData.actualEndDate = new Date().toISOString();
      }

      await updateDoc(auditRef, updateData);
    } catch (error) {
      console.error('Error updating audit status:', error);
      throw new Error('Failed to update audit status');
    }
  }

  /**
   * Actualiza los contadores de hallazgos de una auditoría
   */
  static async updateFindingsCounters(auditId: string): Promise<void> {
    try {
      // Obtener todos los hallazgos de esta auditoría
      const findingsRef = collection(db, 'findings');
      const q = query(
        findingsRef,
        where('sourceId', '==', auditId),
        where('source', '==', 'audit'),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);
      const findings = snapshot.docs.map(doc => doc.data());

      // Contar por severidad
      const counters = {
        findingsCount: findings.length,
        criticalFindings: findings.filter(f => f.severity === 'critical')
          .length,
        majorFindings: findings.filter(f => f.severity === 'major').length,
        minorFindings: findings.filter(f => f.severity === 'minor').length,
        observations: findings.filter(f => f.severity === 'low').length,
      };

      // Actualizar auditoría
      const auditRef = doc(db, this.COLLECTION, auditId);
      await updateDoc(auditRef, {
        ...counters,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error updating findings counters:', error);
      throw new Error('Failed to update findings counters');
    }
  }

  /**
   * Obtiene los hallazgos relacionados con una auditoría
   */
  static async getFindings(auditId: string): Promise<unknown[]> {
    try {
      const findingsRef = collection(db, 'findings');
      const q = query(
        findingsRef,
        where('sourceId', '==', auditId),
        where('source', '==', 'audit'),
        where('isActive', '==', true),
        orderBy('identifiedDate', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting audit findings:', error);
      throw new Error('Failed to get audit findings');
    }
  }

  /**
   * Obtiene estadísticas de auditorías por año
   */
  static async getStats(year?: number): Promise<AuditStats> {
    try {
      const auditsRef = collection(db, this.COLLECTION);
      let q = query(auditsRef, where('isActive', '==', true));

      // Filtrar por año si se proporciona
      if (year) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        q = query(
          q,
          where('plannedDate', '>=', startDate),
          where('plannedDate', '<=', endDate)
        );
      }

      const snapshot = await getDocs(q);
      const audits = snapshot.docs.map(doc => doc.data()) as Audit[];

      // Calcular estadísticas
      const stats: AuditStats = {
        total: audits.length,
        byStatus: {},
        byType: {},
        byRating: {},
        totalFindings: 0,
        criticalFindings: 0,
      };

      audits.forEach(audit => {
        // Por estado
        stats.byStatus[audit.status] = (stats.byStatus[audit.status] || 0) + 1;

        // Por tipo
        stats.byType[audit.auditType] =
          (stats.byType[audit.auditType] || 0) + 1;

        // Por calificación
        if (audit.overallRating) {
          stats.byRating[audit.overallRating] =
            (stats.byRating[audit.overallRating] || 0) + 1;
        }

        // Sumar hallazgos
        stats.totalFindings += audit.findingsCount;
        stats.criticalFindings += audit.criticalFindings;
      });

      return stats;
    } catch (error) {
      console.error('Error getting audit stats:', error);
      throw new Error('Failed to get audit stats');
    }
  }
}
