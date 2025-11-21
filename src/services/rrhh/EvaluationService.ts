import { db } from '@/lib/firebase';
import { EventPublisher } from '@/services/calendar/EventPublisher';
import {
    CompetenceEvaluation,
    PaginatedResponse,
    PaginationParams,
    PerformanceEvaluation,
    PerformanceEvaluationFilters,
} from '@/types/rrhh';
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
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';

const COLLECTION_NAME = 'evaluations';

export class EvaluationService {
  static async getAll(): Promise<PerformanceEvaluation[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha_evaluacion: doc.data().fecha_evaluacion?.toDate() || new Date(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as PerformanceEvaluation[];
    } catch (error) {
      console.error('Error getting evaluations:', error);
      throw new Error('Error al obtener evaluaciones');
    }
  }

  static async getById(id: string): Promise<PerformanceEvaluation | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          fecha_evaluacion:
            docSnap.data().fecha_evaluacion?.toDate() || new Date(),
          created_at: docSnap.data().created_at?.toDate() || new Date(),
          updated_at: docSnap.data().updated_at?.toDate() || new Date(),
        } as PerformanceEvaluation;
      }
      return null;
    } catch (error) {
      console.error('Error getting evaluation:', error);
      throw new Error('Error al obtener evaluación');
    }
  }

  static async getPaginated(
    filters: PerformanceEvaluationFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<PerformanceEvaluation>> {
    try {
      let q = query(collection(db, COLLECTION_NAME));

      // Apply filters
      if (filters.search) {
        // Search in personnel_id or evaluador_id - this would need compound queries in production
        q = query(
          q,
          where('personnel_id', '>=', filters.search),
          where('personnel_id', '<=', filters.search + '\uf8ff')
        );
      }

      if (filters.estado) {
        q = query(q, where('estado', '==', filters.estado));
      }

      if (filters.periodo) {
        q = query(q, where('periodo', '==', filters.periodo));
      }

      if (filters.personnel_id) {
        q = query(q, where('personnel_id', '==', filters.personnel_id));
      }

      if (filters.evaluador_id) {
        q = query(q, where('evaluador_id', '==', filters.evaluador_id));
      }

      // Apply sorting
      const sortField = pagination.sort || 'created_at';
      const sortOrder = pagination.order === 'asc' ? 'asc' : 'desc';
      q = query(q, orderBy(sortField, sortOrder));

      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit;
      if (offset > 0) {
        const allDocs = await getDocs(q);
        const docs = allDocs.docs.slice(offset, offset + pagination.limit);
        const total = allDocs.size;

        const data = docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha_evaluacion: doc.data().fecha_evaluacion?.toDate() || new Date(),
          created_at: doc.data().created_at?.toDate() || new Date(),
          updated_at: doc.data().updated_at?.toDate() || new Date(),
        })) as PerformanceEvaluation[];

        return {
          data,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages: Math.ceil(total / pagination.limit),
            hasNext: offset + pagination.limit < total,
            hasPrev: pagination.page > 1,
          },
        };
      }

      q = query(q, limit(pagination.limit));
      const querySnapshot = await getDocs(q);
      const total = querySnapshot.size;

      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha_evaluacion: doc.data().fecha_evaluacion?.toDate() || new Date(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as PerformanceEvaluation[];

      return {
        data,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit),
          hasNext: data.length === pagination.limit,
          hasPrev: pagination.page > 1,
        },
      };
    } catch (error) {
      console.error('Error getting paginated evaluations:', error);
      throw new Error('Error al obtener evaluaciones paginadas');
    }
  }

  static async create(
    data: Omit<PerformanceEvaluation, 'id' | 'created_at' | 'updated_at'>
  ): Promise<PerformanceEvaluation> {
    try {
      const now = Timestamp.now();
      const docData = {
        ...data,
        fecha_evaluacion: Timestamp.fromDate(data.fecha_evaluacion),
        created_at: now,
        updated_at: now,
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);

      const evaluationId = docRef.id;
      const evaluation: PerformanceEvaluation = {
        id: evaluationId,
        ...data,
        created_at: now.toDate(),
        updated_at: now.toDate(),
      };

      // Publicar evento en el calendario si tiene fecha programada
      try {
        await EventPublisher.publishEvent('evaluations', {
          title: `Evaluación: ${data.periodo}`,
          description: `Evaluación de desempeño - ${data.personnel_id}`,
          date: data.fecha_evaluacion,
          type: 'evaluation',
          sourceRecordId: evaluationId,
          sourceRecordType: 'evaluation',
          priority: 'medium',
          responsibleUserId: data.evaluador_id,
          metadata: {
            evaluationId,
            personnelId: data.personnel_id,
            periodo: data.periodo,
            estado: data.estado,
          },
        });
      } catch (error) {
        console.error('Error publishing evaluation event:', error);
      }

      return evaluation;
    } catch (error) {
      console.error('Error creating evaluation:', error);
      throw new Error('Error al crear evaluación');
    }
  }

  static async update(
    id: string,
    data: Partial<Omit<PerformanceEvaluation, 'id' | 'created_at'>>
  ): Promise<PerformanceEvaluation> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData = {
        ...data,
        fecha_evaluacion: data.fecha_evaluacion
          ? Timestamp.fromDate(data.fecha_evaluacion)
          : undefined,
        updated_at: Timestamp.now(),
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if ((updateData as any)[key] === undefined) {
          delete (updateData as any)[key];
        }
      });

      await updateDoc(docRef, updateData);

      const updated = await this.getById(id);
      if (!updated) {
        throw new Error('Evaluación no encontrada después de actualizar');
      }

      return updated;
    } catch (error) {
      console.error('Error updating evaluation:', error);
      throw new Error('Error al actualizar evaluación');
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);

      // Eliminar evento del calendario
      try {
        await EventPublisher.deletePublishedEvent('evaluations', id);
      } catch (error) {
        console.error('Error deleting evaluation event:', error);
      }
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      throw new Error('Error al eliminar evaluación');
    }
  }

  static async updateStatus(
    id: string,
    status: PerformanceEvaluation['estado']
  ): Promise<PerformanceEvaluation> {
    try {
      return await this.update(id, { estado: status });
    } catch (error) {
      console.error('Error updating evaluation status:', error);
      throw new Error('Error al actualizar estado de evaluación');
    }
  }

  static async getByPersonnel(
    personnelId: string
  ): Promise<PerformanceEvaluation[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('personnel_id', '==', personnelId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha_evaluacion: doc.data().fecha_evaluacion?.toDate() || new Date(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as PerformanceEvaluation[];
    } catch (error) {
      console.error('Error getting evaluations by personnel:', error);
      throw new Error('Error al obtener evaluaciones por personal');
    }
  }

  static async getByEvaluator(
    evaluatorId: string
  ): Promise<PerformanceEvaluation[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('evaluador_id', '==', evaluatorId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha_evaluacion: doc.data().fecha_evaluacion?.toDate() || new Date(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as PerformanceEvaluation[];
    } catch (error) {
      console.error('Error getting evaluations by evaluator:', error);
      throw new Error('Error al obtener evaluaciones por evaluador');
    }
  }

  static async getByPeriod(period: string): Promise<PerformanceEvaluation[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('periodo', '==', period)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha_evaluacion: doc.data().fecha_evaluacion?.toDate() || new Date(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as PerformanceEvaluation[];
    } catch (error) {
      console.error('Error getting evaluations by period:', error);
      throw new Error('Error al obtener evaluaciones por período');
    }
  }

  static async getPending(): Promise<PerformanceEvaluation[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('estado', 'in', ['borrador', 'publicado'])
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha_evaluacion: doc.data().fecha_evaluacion?.toDate() || new Date(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as PerformanceEvaluation[];
    } catch (error) {
      console.error('Error getting pending evaluations:', error);
      throw new Error('Error al obtener evaluaciones pendientes');
    }
  }

  // ===== NUEVOS MÉTODOS PARA ANÁLISIS DE BRECHAS =====

  /**
   * Crear evaluación desde plantilla del puesto
   */
  static async createFromPositionTemplate(
    personnelId: string
  ): Promise<PerformanceEvaluation> {
    try {
      // Obtener empleado
      const personnelDoc = await getDoc(doc(db, 'personnel', personnelId));
      if (!personnelDoc.exists()) {
        throw new Error('Empleado no encontrado');
      }
      const personnel = personnelDoc.data();

      if (!personnel?.puestoId) {
        throw new Error('El empleado no tiene un puesto asignado');
      }

      // Obtener puesto
      const positionDoc = await getDoc(
        doc(db, 'positions', personnel.puestoId)
      );
      if (!positionDoc.exists()) {
        throw new Error('Puesto no encontrado');
      }
      const position = positionDoc.data();

      // Obtener competencias requeridas del puesto
      const competenceIds = position?.competenciasRequeridas || [];
      if (competenceIds.length === 0) {
        throw new Error('El puesto no tiene competencias definidas');
      }

      // Crear estructura de competencias para la evaluación
      const competencePromises = competenceIds.map(
        async (competenceId: string) => {
          const compDoc = await getDoc(doc(db, 'competencias', competenceId));
          if (compDoc.exists()) {
            const competence = compDoc.data();
            return {
              competenciaId: competenceId,
              nombreCompetencia: competence?.nombre || '',
              nivelRequerido: 3,
              nivelEvaluado: 0, // Por defecto, será evaluado durante la evaluación
              observaciones: '',
              brecha: 3,
            };
          }
          return null;
        }
      );

      const competenceEvaluations = (
        await Promise.all(competencePromises)
      ).filter(Boolean);

      // Crear evaluación
      const evaluationData = {
        personnel_id: personnelId,
        puestoId: personnel.puestoId,
        periodo: new Date().toISOString().slice(0, 7), // YYYY-MM
        fecha_evaluacion: new Date(),
        evaluador_id: '', // Se asignará después
        competencias: competenceEvaluations,
        resultado_global: 'Requiere Capacitación' as const,
        fechaProximaEvaluacion:
          this.calculateNextEvaluationDateFromPosition(position),
        comentarios_generales: '',
        plan_mejora: '',
        estado: 'borrador' as const,
      };

      return await this.create(evaluationData);
    } catch (error) {
      console.error('Error creating evaluation from position template:', error);
      throw error instanceof Error
        ? error
        : new Error('Error al crear evaluación desde plantilla');
    }
  }

  /**
   * Calcular brechas de competencias para un empleado
   */
  static async calculateGaps(
    personnelId: string
  ): Promise<import('@/types/rrhh').CompetenceGap[]> {
    try {
      // 1. Obtener empleado y su puesto
      const personnelDoc = await getDoc(doc(db, 'personnel', personnelId));
      if (!personnelDoc.exists()) {
        throw new Error('Empleado no encontrado');
      }
      const personnel = personnelDoc.data();

      if (!personnel?.puestoId) {
        return [];
      }

      // 2. Obtener competencias requeridas del puesto
      const positionDoc = await getDoc(
        doc(db, 'positions', personnel.puestoId)
      );
      if (!positionDoc.exists()) {
        return [];
      }
      const position = positionDoc.data();
      const competenceIds = position?.competenciasRequeridas || [];

      if (competenceIds.length === 0) {
        return [];
      }

      // 3. Obtener última evaluación del empleado
      const evaluations = await this.getByPersonnel(personnelId);
      const lastEvaluation = evaluations
        .filter(e => e.estado === 'publicado')
        .sort(
          (a, b) => b.fecha_evaluacion.getTime() - a.fecha_evaluacion.getTime()
        )[0];

      // 4. Comparar competencias evaluadas vs requeridas
      const gaps: import('@/types/rrhh').CompetenceGap[] = [];

      for (const requiredCompId of competenceIds) {
        const compDoc = await getDoc(doc(db, 'competencias', requiredCompId));
        if (!compDoc.exists()) continue;

        const competence = compDoc.data();
        const evaluatedComp = lastEvaluation?.competencias?.find(
          (c: CompetenceEvaluation) => c.competenciaId === requiredCompId
        );

        if (
          !evaluatedComp ||
          evaluatedComp.nivelEvaluado < evaluatedComp.nivelRequerido
        ) {
          const brecha = evaluatedComp
            ? evaluatedComp.nivelRequerido - evaluatedComp.nivelEvaluado
            : 3; // Valor por defecto

          gaps.push({
            personnelId,
            personnelName: `${personnel?.nombres} ${personnel?.apellidos}`,
            puestoId: personnel.puestoId,
            puestoName: position?.nombre || '',
            competenciaId: requiredCompId,
            competenciaNombre: competence?.nombre || '',
            nivelRequerido: evaluatedComp?.nivelRequerido || 3,
            nivelActual: evaluatedComp?.nivelEvaluado || 0,
            brecha,
            severidad: brecha >= 3 ? 'critica' : brecha >= 2 ? 'media' : 'baja',
            capacitacionesSugeridas: [],
            fechaUltimaEvaluacion: lastEvaluation?.fecha_evaluacion,
          });
        }
      }

      // 5. Buscar capacitaciones sugeridas para cada brecha
      for (const gap of gaps) {
        const trainings = await this.getSuggestedTrainings(gap.competenciaId);
        gap.capacitacionesSugeridas = trainings.map(t => t.id);
      }

      return gaps;
    } catch (error) {
      console.error('Error calculating gaps:', error);
      throw error instanceof Error
        ? error
        : new Error('Error al calcular brechas');
    }
  }

  /**
   * Obtener capacitaciones sugeridas para una competencia
   */
  private static async getSuggestedTrainings(
    competenceId: string
  ): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'trainings'),
        where('competenciasDesarrolladas', 'array-contains', competenceId),
        where('estado', '==', 'completada')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting suggested trainings:', error);
      return [];
    }
  }

  /**
   * Calcular fecha de próxima evaluación desde posición
   */
  private static calculateNextEvaluationDateFromPosition(
    position: Record<string, unknown>
  ): Date {
    const frecuencia = position?.frecuenciaEvaluacion || 12; // meses por defecto
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth() + Number(frecuencia || 0),
      now.getDate()
    );
  }

  /**
   * Obtener historial de evolución de una competencia
   */
  static async getCompetenceHistory(
    personnelId: string,
    competenceId: string
  ): Promise<any[]> {
    try {
      const evaluations = await this.getByPersonnel(personnelId);
      const history = [];

      for (const evaluation of evaluations) {
        if (evaluation.estado === 'publicado') {
          const competenceEval = evaluation.competencias.find(
            (c: CompetenceEvaluation) => c.competenciaId === competenceId
          );
          if (competenceEval) {
            history.push({
              fecha: evaluation.fecha_evaluacion,
              nivelEvaluado: competenceEval.nivelEvaluado,
              nivelRequerido: competenceEval.nivelRequerido,
              evaluador: evaluation.evaluador_id,
              periodo: evaluation.periodo,
            });
          }
        }
      }

      return history.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    } catch (error) {
      console.error('Error getting competence history:', error);
      throw new Error('Error al obtener historial de competencia');
    }
  }

  /**
   * Calcular fecha de próxima evaluación para un empleado
   */
  static async calculateNextEvaluationDate(personnelId: string): Promise<Date> {
    try {
      const personnelDoc = await getDoc(doc(db, 'personnel', personnelId));
      if (!personnelDoc.exists()) {
        throw new Error('Empleado no encontrado');
      }
      const personnel = personnelDoc.data();

      if (!personnel?.puestoId) {
        throw new Error('Empleado sin puesto asignado');
      }

      const positionDoc = await getDoc(
        doc(db, 'positions', personnel.puestoId)
      );
      if (!positionDoc.exists()) {
        throw new Error('Puesto no encontrado');
      }
      const position = positionDoc.data();

      return this.calculateNextEvaluationDateFromPosition(position);
    } catch (error) {
      console.error('Error calculating next evaluation date:', error);
      throw error instanceof Error
        ? error
        : new Error('Error al calcular próxima evaluación');
    }
  }
}
