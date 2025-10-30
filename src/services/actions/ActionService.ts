import { db } from '@/firebase/config';
import { TraceabilityService } from '@/services/shared/TraceabilityService';
import type {
  Action,
  ActionFilters,
  ActionFormData,
  ActionStats,
} from '@/types/actions';
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
 * ActionService - Phase 2: Treatment
 *
 * Servicio para gestionar acciones correctivas, preventivas y de mejora.
 */
export class ActionService {
  private static readonly COLLECTION = 'actions';

  /**
   * Obtiene todas las acciones con filtros opcionales
   */
  static async getAll(filters?: ActionFilters): Promise<Action[]> {
    try {
      const actionsRef = collection(db, this.COLLECTION);
      let q = query(actionsRef, where('isActive', '==', true));

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.actionType) {
        q = query(q, where('actionType', '==', filters.actionType));
      }
      if (filters?.priority) {
        q = query(q, where('priority', '==', filters.priority));
      }
      if (filters?.responsiblePersonId) {
        q = query(
          q,
          where('responsiblePersonId', '==', filters.responsiblePersonId)
        );
      }
      if (filters?.findingId) {
        q = query(q, where('findingId', '==', filters.findingId));
      }

      q = query(q, orderBy('plannedEndDate', 'asc'));

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Action[];
    } catch (error) {
      console.error('Error getting actions:', error);
      throw new Error('Failed to get actions');
    }
  }

  /**
   * Obtiene una acción por ID
   */
  static async getById(id: string): Promise<Action | null> {
    try {
      const actionRef = doc(db, this.COLLECTION, id);
      const actionDoc = await getDoc(actionRef);

      if (!actionDoc.exists()) {
        return null;
      }

      return {
        id: actionDoc.id,
        ...actionDoc.data(),
      } as Action;
    } catch (error) {
      console.error('Error getting action:', error);
      throw new Error('Failed to get action');
    }
  }

  /**
   * Crea una nueva acción (Fase 2: Tratamiento)
   */
  static async create(data: ActionFormData, userId: string): Promise<string> {
    try {
      const now = new Date();
      const year = now.getFullYear();

      // Generar número de acción
      const actionNumber = await TraceabilityService.generateNumber(
        'ACC',
        year
      );

      // Construir cadena de trazabilidad desde el hallazgo
      let traceabilityChain: string[] = [actionNumber];
      if (data.findingId) {
        const finding = await TraceabilityService.getFindingFromAction(
          data.findingId
        );
        if (finding) {
          traceabilityChain = TraceabilityService.buildTraceabilityChain(
            finding.traceabilityChain,
            actionNumber
          );
        }
      }

      const actionData: Omit<Action, 'id'> = {
        actionNumber,
        title: data.title,
        description: data.description,
        actionType: data.actionType,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        findingId: data.findingId,
        findingNumber: data.findingNumber,
        plannedStartDate: data.plannedStartDate,
        plannedEndDate: data.plannedEndDate,
        responsiblePersonId: data.responsiblePersonId,
        responsiblePersonName: data.responsiblePersonName,
        teamMembers: data.teamMembers || [],
        status: 'planned',
        priority: data.priority,
        progress: 0,
        currentPhase: 'treatment',
        actionPlan: data.actionPlan,
        requiredResources: data.requiredResources,
        documents: data.documents || [],
        comments: [],
        traceabilityChain,
        createdBy: userId,
        isActive: true,
        createdAt: Timestamp.fromDate(now) as unknown as Date,
        updatedAt: Timestamp.fromDate(now) as unknown as Date,
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), actionData);

      // Actualizar contadores del hallazgo
      if (data.findingId) {
        await this.updateFindingCounters(data.findingId);
      }

      return docRef.id;
    } catch (error) {
      console.error('Error creating action:', error);
      throw new Error('Failed to create action');
    }
  }

  /**
   * Actualiza una acción existente
   */
  static async update(
    id: string,
    data: Partial<ActionFormData>,
    userId: string
  ): Promise<void> {
    try {
      const actionRef = doc(db, this.COLLECTION, id);
      const updateData: Record<string, unknown> = {
        ...data,
        updatedBy: userId,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      await updateDoc(actionRef, updateData);
    } catch (error) {
      console.error('Error updating action:', error);
      throw new Error('Failed to update action');
    }
  }

  /**
   * Elimina una acción (soft delete)
   */
  static async delete(id: string, userId: string): Promise<void> {
    try {
      const actionRef = doc(db, this.COLLECTION, id);
      await updateDoc(actionRef, {
        isActive: false,
        updatedBy: userId,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error deleting action:', error);
      throw new Error('Failed to delete action');
    }
  }

  /**
   * Actualiza el estado de una acción
   */
  static async updateStatus(
    id: string,
    status: Action['status'],
    userId: string
  ): Promise<void> {
    try {
      const actionRef = doc(db, this.COLLECTION, id);
      const updateData: Record<string, unknown> = {
        status,
        updatedBy: userId,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      if (status === 'in_progress' && !updateData.actualStartDate) {
        updateData.actualStartDate = new Date().toISOString();
      }

      if (status === 'completed') {
        updateData.actualEndDate = new Date().toISOString();
        updateData.progress = 100;
      }

      await updateDoc(actionRef, updateData);

      // Actualizar contadores del hallazgo
      const action = await this.getById(id);
      if (action?.findingId) {
        await this.updateFindingCounters(action.findingId);
      }
    } catch (error) {
      console.error('Error updating action status:', error);
      throw new Error('Failed to update action status');
    }
  }

  /**
   * Actualiza el progreso de una acción
   */
  static async updateProgress(
    id: string,
    progress: number,
    userId: string
  ): Promise<void> {
    try {
      const actionRef = doc(db, this.COLLECTION, id);
      await updateDoc(actionRef, {
        progress: Math.min(100, Math.max(0, progress)),
        updatedBy: userId,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error updating action progress:', error);
      throw new Error('Failed to update action progress');
    }
  }

  /**
   * Actualiza un paso del plan de acción
   */
  static async updateActionPlanStep(
    actionId: string,
    stepSequence: number,
    status: 'pending' | 'in_progress' | 'completed',
    userId: string
  ): Promise<void> {
    try {
      const action = await this.getById(actionId);
      if (!action || !action.actionPlan) {
        throw new Error('Action or action plan not found');
      }

      const updatedSteps = action.actionPlan.steps.map(step =>
        step.sequence === stepSequence ? { ...step, status } : step
      );

      const actionRef = doc(db, this.COLLECTION, actionId);
      await updateDoc(actionRef, {
        actionPlan: { steps: updatedSteps },
        updatedBy: userId,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      // Calcular progreso basado en pasos completados
      const completedSteps = updatedSteps.filter(
        s => s.status === 'completed'
      ).length;
      const totalSteps = updatedSteps.length;
      const progress = Math.round((completedSteps / totalSteps) * 100);

      await this.updateProgress(actionId, progress, userId);
    } catch (error) {
      console.error('Error updating action plan step:', error);
      throw new Error('Failed to update action plan step');
    }
  }

  /**
   * Obtiene acciones por hallazgo
   */
  static async getByFinding(findingId: string): Promise<Action[]> {
    try {
      const actionsRef = collection(db, this.COLLECTION);
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
      })) as Action[];
    } catch (error) {
      console.error('Error getting actions by finding:', error);
      throw new Error('Failed to get actions by finding');
    }
  }

  /**
   * Agrega un comentario a una acción
   */
  static async addComment(
    id: string,
    comment: { userId: string; userName: string; comment: string },
    userId: string
  ): Promise<void> {
    try {
      const action = await this.getById(id);
      if (!action) {
        throw new Error('Action not found');
      }

      const newComment = {
        ...comment,
        timestamp: new Date().toISOString(),
      };

      const actionRef = doc(db, this.COLLECTION, id);
      await updateDoc(actionRef, {
        comments: [...action.comments, newComment],
        updatedBy: userId,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  }

  /**
   * Actualiza los contadores de un hallazgo relacionado
   */
  private static async updateFindingCounters(findingId: string): Promise<void> {
    try {
      const { FindingService } = await import(
        '@/services/findings/FindingService'
      );
      await FindingService.updateActionsCounters(findingId);
    } catch (error) {
      console.error('Error updating finding counters:', error);
    }
  }

  /**
   * Obtiene estadísticas de acciones
   */
  static async getStats(year?: number): Promise<ActionStats> {
    try {
      const actionsRef = collection(db, this.COLLECTION);
      let q = query(actionsRef, where('isActive', '==', true));

      if (year) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        q = query(
          q,
          where('plannedStartDate', '>=', startDate),
          where('plannedStartDate', '<=', endDate)
        );
      }

      const snapshot = await getDocs(q);
      const actions = snapshot.docs.map(doc => doc.data()) as Action[];

      const stats: ActionStats = {
        total: actions.length,
        byStatus: {},
        byType: {},
        byPriority: {},
        effectiveness: 0,
      };

      actions.forEach(action => {
        stats.byStatus[action.status] =
          (stats.byStatus[action.status] || 0) + 1;
        stats.byType[action.actionType] =
          (stats.byType[action.actionType] || 0) + 1;
        stats.byPriority[action.priority] =
          (stats.byPriority[action.priority] || 0) + 1;
      });

      // Calcular efectividad (acciones completadas con verificación efectiva)
      const completedActions = actions.filter(a => a.status === 'completed');
      const effectiveActions = completedActions.filter(
        a => a.effectivenessVerification?.isEffective
      );
      stats.effectiveness =
        completedActions.length > 0
          ? Math.round(
              (effectiveActions.length / completedActions.length) * 100
            )
          : 0;

      return stats;
    } catch (error) {
      console.error('Error getting action stats:', error);
      throw new Error('Failed to get action stats');
    }
  }

  /**
   * FASE 3: CONTROL
   * Verificación de efectividad de acciones
   */

  /**
   * Verifica la efectividad de una acción (Fase 3: Control)
   */
  static async verifyEffectiveness(
    id: string,
    verification: {
      responsiblePersonId: string;
      responsiblePersonName: string;
      verificationCommitmentDate?: string;
      verificationExecutionDate?: string;
      method: string;
      criteria: string;
      isEffective: boolean;
      result: string;
      evidence: string;
      comments?: string;
    },
    userId: string
  ): Promise<void> {
    try {
      const actionRef = doc(db, this.COLLECTION, id);
      await updateDoc(actionRef, {
        effectivenessVerification: verification,
        currentPhase: 'control',
        updatedBy: userId,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      // Si la verificación es efectiva, actualizar estado a completado
      if (verification.isEffective) {
        await this.updateStatus(id, 'completed', userId);
      }
    } catch (error) {
      console.error('Error verifying effectiveness:', error);
      throw new Error('Failed to verify effectiveness');
    }
  }
}
