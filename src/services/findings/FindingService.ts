import { db } from '@/firebase/config';
import { TraceabilityService } from '@/services/shared/TraceabilityService';
import type {
  Finding,
  FindingFilters,
  FindingFormData,
  FindingStats,
} from '@/types/findings';
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
 * FindingService - Phase 1: Detection
 *
 * Servicio para gestionar hallazgos en fase de detección.
 */
export class FindingService {
  private static readonly COLLECTION = 'findings';

  /**
   * Obtiene todos los hallazgos con filtros opcionales
   */
  static async getAll(filters?: FindingFilters): Promise<Finding[]> {
    try {
      const findingsRef = collection(db, this.COLLECTION);
      let q = query(findingsRef, where('isActive', '==', true));

      if (filters?.source) {
        q = query(q, where('source', '==', filters.source));
      }
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.severity) {
        q = query(q, where('severity', '==', filters.severity));
      }
      if (filters?.responsiblePersonId) {
        q = query(
          q,
          where('responsiblePersonId', '==', filters.responsiblePersonId)
        );
      }

      q = query(q, orderBy('identifiedDate', 'desc'));

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Finding[];
    } catch (error) {
      console.error('Error getting findings:', error);
      throw new Error('Failed to get findings');
    }
  }

  /**
   * Obtiene un hallazgo por ID
   */
  static async getById(id: string): Promise<Finding | null> {
    try {
      const findingRef = doc(db, this.COLLECTION, id);
      const findingDoc = await getDoc(findingRef);

      if (!findingDoc.exists()) {
        return null;
      }

      return {
        id: findingDoc.id,
        ...findingDoc.data(),
      } as Finding;
    } catch (error) {
      console.error('Error getting finding:', error);
      throw new Error('Failed to get finding');
    }
  }

  /**
   * Crea un nuevo hallazgo (Fase 1: Detección)
   */
  static async create(data: FindingFormData, userId: string): Promise<string> {
    try {
      const now = new Date();
      const year = now.getFullYear();

      // Generar número de hallazgo
      const findingNumber = await TraceabilityService.generateNumber(
        'HAL',
        year
      );

      // Construir cadena de trazabilidad
      let traceabilityChain: string[] = [findingNumber];
      if (data.source === 'audit' && data.sourceId) {
        // Obtener la auditoría directamente por su ID
        const auditRef = doc(db, 'audits', data.sourceId);
        const auditDoc = await getDoc(auditRef);

        if (auditDoc.exists()) {
          const audit = auditDoc.data();
          if (audit.traceabilityChain) {
            traceabilityChain = TraceabilityService.buildTraceabilityChain(
              audit.traceabilityChain,
              findingNumber
            );
          }
        }
      }

      const findingData: Record<string, unknown> = {
        findingNumber,
        title: data.title,
        description: data.description,
        source: data.source,
        sourceId: data.sourceId,
        sourceName: data.sourceName,
        identifiedDate: new Date().toISOString(),
        reportedBy: userId,
        reportedByName: 'Current User', // TODO: Get from user context
        identifiedBy: userId,
        identifiedByName: 'Current User',
        findingType: data.findingType,
        severity: data.severity,
        category: data.category,
        riskLevel: data.riskLevel,
        evidence: data.evidence,
        evidenceDocuments: data.evidenceDocuments || [],
        requiresAction: false,
        actionsCount: 0,
        openActionsCount: 0,
        completedActionsCount: 0,
        isVerified: false,
        status: 'open',
        currentPhase: 'detection',
        priority: data.priority,
        isRecurrent: false,
        traceabilityChain,
        createdBy: userId,
        isActive: true,
        createdAt: Timestamp.fromDate(now) as unknown as Date,
        updatedAt: Timestamp.fromDate(now) as unknown as Date,
      };

      // Agregar campos opcionales solo si tienen valor
      if (data.sourceReference)
        findingData.sourceReference = data.sourceReference;
      if (data.consequence) findingData.consequence = data.consequence;
      if (data.processId) {
        findingData.processId = data.processId;
        findingData.processName = 'Process Name'; // TODO: Get from process
      }
      if (data.responsiblePersonId) {
        findingData.responsiblePersonId = data.responsiblePersonId;
        findingData.responsiblePersonName = 'Responsible Name'; // TODO: Get from user
      }
      if (data.impactAssessment) {
        findingData.impactAssessment = data.impactAssessment;
      }

      const docRef = await addDoc(collection(db, this.COLLECTION), findingData);

      // Si el hallazgo viene de una auditoría, actualizar contadores
      if (data.source === 'audit' && data.sourceId) {
        await this.updateAuditCounters(data.sourceId);
      }

      return docRef.id;
    } catch (error) {
      console.error('Error creating finding:', error);
      throw new Error('Failed to create finding');
    }
  }

  /**
   * Actualiza un hallazgo existente
   */
  static async update(
    id: string,
    data: Partial<FindingFormData>,
    userId: string
  ): Promise<void> {
    try {
      const findingRef = doc(db, this.COLLECTION, id);
      const updateData: Record<string, unknown> = {
        ...data,
        updatedBy: userId,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      await updateDoc(findingRef, updateData);
    } catch (error) {
      console.error('Error updating finding:', error);
      throw new Error('Failed to update finding');
    }
  }

  /**
   * Elimina un hallazgo (soft delete)
   */
  static async delete(id: string, userId: string): Promise<void> {
    try {
      const findingRef = doc(db, this.COLLECTION, id);
      await updateDoc(findingRef, {
        isActive: false,
        updatedBy: userId,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error deleting finding:', error);
      throw new Error('Failed to delete finding');
    }
  }

  /**
   * Agrega corrección inmediata a un hallazgo
   */
  static async addImmediateCorrection(
    id: string,
    correction: Finding['immediateCorrection'],
    userId: string
  ): Promise<void> {
    try {
      const findingRef = doc(db, this.COLLECTION, id);
      await updateDoc(findingRef, {
        immediateCorrection: correction,
        updatedBy: userId,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error adding immediate correction:', error);
      throw new Error('Failed to add immediate correction');
    }
  }

  /**
   * Obtiene hallazgos por fuente
   */
  static async getBySource(
    sourceType: string,
    sourceId: string
  ): Promise<Finding[]> {
    try {
      const findingsRef = collection(db, this.COLLECTION);
      const q = query(
        findingsRef,
        where('source', '==', sourceType),
        where('sourceId', '==', sourceId),
        where('isActive', '==', true),
        orderBy('identifiedDate', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Finding[];
    } catch (error) {
      console.error('Error getting findings by source:', error);
      throw new Error('Failed to get findings by source');
    }
  }

  /**
   * Actualiza la fase de un hallazgo
   */
  static async updatePhase(
    id: string,
    phase: Finding['currentPhase'],
    userId: string
  ): Promise<void> {
    try {
      const findingRef = doc(db, this.COLLECTION, id);
      await updateDoc(findingRef, {
        currentPhase: phase,
        updatedBy: userId,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error updating finding phase:', error);
      throw new Error('Failed to update finding phase');
    }
  }

  /**
   * Actualiza los contadores de una auditoría relacionada
   */
  private static async updateAuditCounters(auditId: string): Promise<void> {
    try {
      // Importar dinámicamente para evitar dependencia circular
      const { AuditService } = await import('@/services/audits/AuditService');
      await AuditService.updateFindingsCounters(auditId);
    } catch (error) {
      console.error('Error updating audit counters:', error);
    }
  }

  /**
   * Obtiene estadísticas de hallazgos
   */
  static async getStats(year?: number): Promise<FindingStats> {
    try {
      const findingsRef = collection(db, this.COLLECTION);
      let q = query(findingsRef, where('isActive', '==', true));

      if (year) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        q = query(
          q,
          where('identifiedDate', '>=', startDate),
          where('identifiedDate', '<=', endDate)
        );
      }

      const snapshot = await getDocs(q);
      const findings = snapshot.docs.map(doc => doc.data()) as Finding[];

      const stats: FindingStats = {
        total: findings.length,
        bySource: {},
        bySeverity: {},
        byStatus: {},
        byPhase: {},
      };

      findings.forEach(finding => {
        stats.bySource[finding.source] =
          (stats.bySource[finding.source] || 0) + 1;
        stats.bySeverity[finding.severity] =
          (stats.bySeverity[finding.severity] || 0) + 1;
        stats.byStatus[finding.status] =
          (stats.byStatus[finding.status] || 0) + 1;
        stats.byPhase[finding.currentPhase] =
          (stats.byPhase[finding.currentPhase] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting finding stats:', error);
      throw new Error('Failed to get finding stats');
    }
  }

  /**
   * FASE 2: TRATAMIENTO
   * Análisis de causa raíz y gestión de acciones
   */

  /**
   * Analiza la causa raíz de un hallazgo
   */
  static async analyzeRootCause(
    id: string,
    analysis: Finding['rootCauseAnalysis'],
    userId: string
  ): Promise<void> {
    try {
      const findingRef = doc(db, this.COLLECTION, id);
      await updateDoc(findingRef, {
        rootCauseAnalysis: analysis,
        currentPhase: 'treatment',
        status: 'in_analysis',
        updatedBy: userId,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error analyzing root cause:', error);
      throw new Error('Failed to analyze root cause');
    }
  }

  /**
   * Marca si un hallazgo requiere acción
   */
  static async setRequiresAction(
    id: string,
    requires: boolean,
    userId: string
  ): Promise<void> {
    try {
      const findingRef = doc(db, this.COLLECTION, id);
      const updateData: Record<string, unknown> = {
        requiresAction: requires,
        updatedBy: userId,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      if (requires) {
        updateData.status = 'action_planned';
      }

      await updateDoc(findingRef, updateData);
    } catch (error) {
      console.error('Error setting requires action:', error);
      throw new Error('Failed to set requires action');
    }
  }

  /**
   * Actualiza los contadores de acciones de un hallazgo
   */
  static async updateActionsCounters(findingId: string): Promise<void> {
    try {
      const actionsRef = collection(db, 'actions');
      const q = query(
        actionsRef,
        where('findingId', '==', findingId),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);
      const actions = snapshot.docs.map(doc => doc.data());

      const counters = {
        actionsCount: actions.length,
        openActionsCount: actions.filter(a =>
          ['planned', 'in_progress', 'on_hold'].includes(a.status)
        ).length,
        completedActionsCount: actions.filter(a => a.status === 'completed')
          .length,
      };

      const findingRef = doc(db, this.COLLECTION, findingId);
      await updateDoc(findingRef, {
        ...counters,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error updating actions counters:', error);
      throw new Error('Failed to update actions counters');
    }
  }

  /**
   * Obtiene las acciones relacionadas con un hallazgo
   */
  static async getActions(findingId: string): Promise<unknown[]> {
    try {
      const actionsRef = collection(db, 'actions');
      const q = query(
        actionsRef,
        where('findingId', '==', findingId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting finding actions:', error);
      throw new Error('Failed to get finding actions');
    }
  }

  /**
   * Verifica si un hallazgo es recurrente
   */
  static async checkRecurrence(findingId: string): Promise<{
    isRecurrent: boolean;
    relatedFindings: string[];
    count: number;
  }> {
    try {
      const finding = await this.getById(findingId);
      if (!finding) {
        return { isRecurrent: false, relatedFindings: [], count: 0 };
      }

      // Buscar hallazgos similares en los últimos 12 meses
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const findingsRef = collection(db, this.COLLECTION);
      const q = query(
        findingsRef,
        where('category', '==', finding.category),
        where('processId', '==', finding.processId),
        where('isActive', '==', true),
        where('identifiedDate', '>=', oneYearAgo.toISOString())
      );

      const snapshot = await getDocs(q);
      const relatedFindings = snapshot.docs
        .filter(doc => doc.id !== findingId)
        .map(doc => doc.id);

      const isRecurrent = relatedFindings.length > 0;

      // Actualizar el hallazgo si es recurrente
      if (isRecurrent) {
        const findingRef = doc(db, this.COLLECTION, findingId);
        await updateDoc(findingRef, {
          isRecurrent: true,
          previousFindingIds: relatedFindings,
          recurrenceCount: relatedFindings.length,
          updatedAt: Timestamp.fromDate(new Date()),
        });
      }

      return {
        isRecurrent,
        relatedFindings,
        count: relatedFindings.length,
      };
    } catch (error) {
      console.error('Error checking recurrence:', error);
      throw new Error('Failed to check recurrence');
    }
  }

  /**
   * FASE 3: CONTROL
   * Verificación y cierre de hallazgos
   */

  /**
   * Verifica un hallazgo (Fase 3: Control)
   */
  static async verify(
    id: string,
    verification: {
      verifiedBy: string;
      verificationDate: string;
      verificationEvidence: string;
      verificationComments?: string;
    },
    userId: string
  ): Promise<void> {
    try {
      const findingRef = doc(db, this.COLLECTION, id);
      await updateDoc(findingRef, {
        verifiedBy: verification.verifiedBy,
        verificationDate: verification.verificationDate,
        verificationEvidence: verification.verificationEvidence,
        verificationComments: verification.verificationComments,
        isVerified: true,
        status: 'closed',
        currentPhase: 'control',
        actualCloseDate: new Date().toISOString(),
        updatedBy: userId,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error verifying finding:', error);
      throw new Error('Failed to verify finding');
    }
  }
}
