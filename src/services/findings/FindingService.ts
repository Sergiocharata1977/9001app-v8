import { db } from '@/firebase/config';
import { TraceabilityService } from '@/services/shared/TraceabilityService';
import type {
  Finding,
  FindingFilters,
  FindingFormData,
  FindingImmediateActionExecutionFormData,
  FindingImmediateActionPlanningFormData,
  FindingRootCauseAnalysisFormData,
  FindingStats,
} from '@/types/findings';
import {
  addDoc,
  collection,
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

const COLLECTION_NAME = 'findings';

export class FindingService {
  // ============================================
  // CREAR HALLAZGO (Formulario 1: Alta)
  // ============================================

  static async create(
    data: FindingFormData,
    userId: string,
    userName: string
  ): Promise<string> {
    try {
      // Generar número de hallazgo
      const year = new Date().getFullYear();
      const findingNumber = await TraceabilityService.generateNumber(
        'HAL',
        year
      );

      const now = Timestamp.now();

      const findingData: Omit<Finding, 'id'> = {
        findingNumber,

        // Fase 1: Registro del Hallazgo
        registration: {
          origin: data.origin,
          name: data.name,
          description: data.description,
          processId: data.processId,
          processName: data.processName,
          source: data.source,
          sourceId: data.sourceId,
        },

        // Fase 2: Planificación de Acción Inmediata (null inicialmente)
        immediateActionPlanning: null,

        // Fase 3: Ejecución de Acción Inmediata (null inicialmente)
        immediateActionExecution: null,

        // Fase 4: Análisis de Causa Raíz (null inicialmente)
        rootCauseAnalysis: null,

        status: 'registrado',
        currentPhase: 'registered',
        progress: 0,

        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        createdByName: userName,
        updatedBy: null,
        updatedByName: null,
        isActive: true,
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), findingData);

      return docRef.id;
    } catch (error) {
      console.error('Error creating finding:', error);
      throw new Error('Error al crear el hallazgo');
    }
  }

  // ============================================
  // OBTENER HALLAZGO POR ID
  // ============================================

  static async getById(id: string): Promise<Finding | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Finding;
    } catch (error) {
      console.error('Error getting finding:', error);
      throw new Error('Error al obtener el hallazgo');
    }
  }

  // ============================================
  // LISTAR HALLAZGOS CON FILTROS
  // ============================================

  static async list(
    filters?: FindingFilters,
    pageSize: number = 50
  ): Promise<{ findings: Finding[] }> {
    try {
      const constraints: QueryConstraint[] = [where('isActive', '==', true)];

      // Aplicar filtros
      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters?.processId) {
        constraints.push(
          where('registration.processId', '==', filters.processId)
        );
      }

      if (filters?.sourceId) {
        constraints.push(
          where('registration.sourceId', '==', filters.sourceId)
        );
      }

      if (filters?.year) {
        const startDate = new Date(filters.year, 0, 1);
        const endDate = new Date(filters.year, 11, 31, 23, 59, 59);
        constraints.push(
          where('createdAt', '>=', Timestamp.fromDate(startDate))
        );
        constraints.push(where('createdAt', '<=', Timestamp.fromDate(endDate)));
      }

      // Ordenar por fecha de creación
      constraints.push(orderBy('createdAt', 'desc'));
      constraints.push(limit(pageSize));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);

      const findings: Finding[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Finding[];

      // Filtro de búsqueda en memoria
      let filteredFindings = findings;
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredFindings = findings.filter(
          finding =>
            finding.registration?.name?.toLowerCase().includes(searchLower) ||
            finding.registration?.description
              ?.toLowerCase()
              .includes(searchLower) ||
            finding.findingNumber?.toLowerCase().includes(searchLower)
        );
      }

      // Filtro de requiresAction en memoria
      if (filters?.requiresAction !== undefined) {
        filteredFindings = filteredFindings.filter(
          finding =>
            finding.rootCauseAnalysis?.requiresAction === filters.requiresAction
        );
      }

      return { findings: filteredFindings };
    } catch (error) {
      console.error('Error listing findings:', error);
      throw new Error('Error al listar los hallazgos');
    }
  }

  // ============================================
  // ACTUALIZAR PLANIFICACIÓN DE ACCIÓN INMEDIATA (Formulario 2)
  // ============================================

  static async updateImmediateActionPlanning(
    id: string,
    data: FindingImmediateActionPlanningFormData,
    userId: string,
    userName: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);

      const immediateActionPlanning = {
        responsiblePersonId: data.responsiblePersonId,
        responsiblePersonName: data.responsiblePersonName,
        plannedDate: Timestamp.fromDate(data.plannedDate),
        comments: data.comments || null,
      };

      await updateDoc(docRef, {
        immediateActionPlanning,
        status: 'accion_planificada',
        currentPhase: 'immediate_action_planned',
        progress: 25,
        updatedAt: Timestamp.now(),
        updatedBy: userId,
        updatedByName: userName,
      });
    } catch (error) {
      console.error('Error updating immediate action planning:', error);
      throw new Error(
        'Error al actualizar la planificación de acción inmediata'
      );
    }
  }

  // ============================================
  // ACTUALIZAR EJECUCIÓN DE ACCIÓN INMEDIATA (Formulario 3)
  // ============================================

  static async updateImmediateActionExecution(
    id: string,
    data: FindingImmediateActionExecutionFormData,
    userId: string,
    userName: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);

      const immediateActionExecution = {
        executionDate: Timestamp.fromDate(data.executionDate),
        correction: data.correction,
        executedBy: userId,
        executedByName: userName,
      };

      await updateDoc(docRef, {
        immediateActionExecution,
        status: 'accion_ejecutada',
        currentPhase: 'immediate_action_executed',
        progress: 50,
        updatedAt: Timestamp.now(),
        updatedBy: userId,
        updatedByName: userName,
      });
    } catch (error) {
      console.error('Error updating immediate action execution:', error);
      throw new Error('Error al actualizar la ejecución de acción inmediata');
    }
  }

  // ============================================
  // ACTUALIZAR ANÁLISIS DE CAUSA RAÍZ (Formulario 4)
  // ============================================

  static async updateRootCauseAnalysis(
    id: string,
    data: FindingRootCauseAnalysisFormData,
    userId: string,
    userName: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);

      const rootCauseAnalysis = {
        analysis: data.analysis,
        requiresAction: data.requiresAction,
        analyzedBy: userId,
        analyzedByName: userName,
        analyzedDate: Timestamp.now(),
      };

      await updateDoc(docRef, {
        rootCauseAnalysis,
        status: 'analisis_completado',
        currentPhase: 'root_cause_analyzed',
        progress: 75,
        updatedAt: Timestamp.now(),
        updatedBy: userId,
        updatedByName: userName,
      });
    } catch (error) {
      console.error('Error updating root cause analysis:', error);
      throw new Error('Error al actualizar el análisis de causa raíz');
    }
  }

  // ============================================
  // CERRAR HALLAZGO
  // ============================================

  static async close(
    id: string,
    userId: string,
    userName: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);

      await updateDoc(docRef, {
        status: 'cerrado',
        progress: 100,
        updatedAt: Timestamp.now(),
        updatedBy: userId,
        updatedByName: userName,
      });
    } catch (error) {
      console.error('Error closing finding:', error);
      throw new Error('Error al cerrar el hallazgo');
    }
  }

  // ============================================
  // ELIMINAR (SOFT DELETE)
  // ============================================

  static async delete(
    id: string,
    userId: string,
    userName: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);

      await updateDoc(docRef, {
        isActive: false,
        updatedAt: Timestamp.now(),
        updatedBy: userId,
        updatedByName: userName,
      });
    } catch (error) {
      console.error('Error deleting finding:', error);
      throw new Error('Error al eliminar el hallazgo');
    }
  }

  // ============================================
  // OBTENER ESTADÍSTICAS
  // ============================================

  static async getStats(filters?: FindingFilters): Promise<FindingStats> {
    try {
      const { findings } = await this.list(filters, 1000);

      const stats: FindingStats = {
        total: findings.length,
        byStatus: {
          registrado: 0,
          accion_planificada: 0,
          accion_ejecutada: 0,
          analisis_completado: 0,
          cerrado: 0,
        },
        byProcess: {},
        averageProgress: 0,
        requiresActionCount: 0,
        closedCount: 0,
      };

      let totalProgress = 0;

      findings.forEach(finding => {
        // Contar por estado
        stats.byStatus[finding.status]++;

        // Contar por proceso
        if (finding.registration?.processName) {
          stats.byProcess[finding.registration.processName] =
            (stats.byProcess[finding.registration.processName] || 0) + 1;
        }

        // Progreso total
        totalProgress += finding.progress;

        // Requiere acción
        if (finding.rootCauseAnalysis?.requiresAction) {
          stats.requiresActionCount++;
        }

        // Cerrados
        if (finding.status === 'cerrado') {
          stats.closedCount++;
        }
      });

      stats.averageProgress =
        findings.length > 0 ? Math.round(totalProgress / findings.length) : 0;

      return stats;
    } catch (error) {
      console.error('Error getting finding stats:', error);
      throw new Error('Error al obtener estadísticas');
    }
  }
}
