import { db } from '@/lib/firebase';
import {
  PaginatedResponse,
  PaginationParams,
  Training,
  TrainingFilters,
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

const COLLECTION_NAME = 'trainings';

export class TrainingService {
  static async getAll(): Promise<Training[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha_inicio: doc.data().fecha_inicio?.toDate() || new Date(),
        fecha_fin: doc.data().fecha_fin?.toDate() || new Date(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Training[];
    } catch (error) {
      console.error('Error getting trainings:', error);
      throw new Error('Error al obtener capacitaciones');
    }
  }

  static async getById(id: string): Promise<Training | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          fecha_inicio: docSnap.data().fecha_inicio?.toDate() || new Date(),
          fecha_fin: docSnap.data().fecha_fin?.toDate() || new Date(),
          created_at: docSnap.data().created_at?.toDate() || new Date(),
          updated_at: docSnap.data().updated_at?.toDate() || new Date(),
        } as Training;
      }
      return null;
    } catch (error) {
      console.error('Error getting training:', error);
      throw new Error('Error al obtener capacitación');
    }
  }

  static async getPaginated(
    filters: TrainingFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<Training>> {
    try {
      let q = query(collection(db, COLLECTION_NAME));

      // Apply filters
      if (filters.search) {
        q = query(
          q,
          where('tema', '>=', filters.search),
          where('tema', '<=', filters.search + '\uf8ff')
        );
      }

      if (filters.estado) {
        q = query(q, where('estado', '==', filters.estado));
      }

      if (filters.modalidad) {
        q = query(q, where('modalidad', '==', filters.modalidad));
      }

      if (filters.fecha_inicio && filters.fecha_fin) {
        q = query(
          q,
          where('fecha_inicio', '>=', Timestamp.fromDate(filters.fecha_inicio))
        );
        q = query(
          q,
          where('fecha_fin', '<=', Timestamp.fromDate(filters.fecha_fin))
        );
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
          fecha_inicio: doc.data().fecha_inicio?.toDate() || new Date(),
          fecha_fin: doc.data().fecha_fin?.toDate() || new Date(),
          created_at: doc.data().created_at?.toDate() || new Date(),
          updated_at: doc.data().updated_at?.toDate() || new Date(),
        })) as Training[];

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
        fecha_inicio: doc.data().fecha_inicio?.toDate() || new Date(),
        fecha_fin: doc.data().fecha_fin?.toDate() || new Date(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Training[];

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
      console.error('Error getting paginated trainings:', error);
      throw new Error('Error al obtener capacitaciones paginadas');
    }
  }

  static async create(
    data: Omit<Training, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Training> {
    try {
      const now = Timestamp.now();
      const docData = {
        ...data,
        fecha_inicio: Timestamp.fromDate(data.fecha_inicio),
        fecha_fin: Timestamp.fromDate(data.fecha_fin),
        created_at: now,
        updated_at: now,
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);

      return {
        id: docRef.id,
        ...data,
        created_at: now.toDate(),
        updated_at: now.toDate(),
      };
    } catch (error) {
      console.error('Error creating training:', error);
      throw new Error('Error al crear capacitación');
    }
  }

  static async update(
    id: string,
    data: Partial<Omit<Training, 'id' | 'created_at'>>
  ): Promise<Training> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData = {
        ...data,
        fecha_inicio: data.fecha_inicio
          ? Timestamp.fromDate(data.fecha_inicio)
          : undefined,
        fecha_fin: data.fecha_fin
          ? Timestamp.fromDate(data.fecha_fin)
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
        throw new Error('Capacitación no encontrada después de actualizar');
      }

      return updated;
    } catch (error) {
      console.error('Error updating training:', error);
      throw new Error('Error al actualizar capacitación');
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting training:', error);
      throw new Error('Error al eliminar capacitación');
    }
  }

  static async updateStatus(
    id: string,
    status: Training['estado']
  ): Promise<Training> {
    try {
      return await this.update(id, { estado: status });
    } catch (error) {
      console.error('Error updating training status:', error);
      throw new Error('Error al actualizar estado de capacitación');
    }
  }

  static async addParticipant(
    trainingId: string,
    participantId: string
  ): Promise<Training> {
    try {
      const training = await this.getById(trainingId);
      if (!training) {
        throw new Error('Capacitación no encontrada');
      }

      const participants = training.participantes || [];
      if (!participants.includes(participantId)) {
        participants.push(participantId);
        return await this.update(trainingId, { participantes: participants });
      }

      return training;
    } catch (error) {
      console.error('Error adding participant:', error);
      throw new Error('Error al agregar participante');
    }
  }

  static async removeParticipant(
    trainingId: string,
    participantId: string
  ): Promise<Training> {
    try {
      const training = await this.getById(trainingId);
      if (!training) {
        throw new Error('Capacitación no encontrada');
      }

      const participants = training.participantes || [];
      const updatedParticipants = participants.filter(
        id => id !== participantId
      );

      return await this.update(trainingId, {
        participantes: updatedParticipants,
      });
    } catch (error) {
      console.error('Error removing participant:', error);
      throw new Error('Error al remover participante');
    }
  }

  static async getByParticipant(participantId: string): Promise<Training[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('participantes', 'array-contains', participantId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha_inicio: doc.data().fecha_inicio?.toDate() || new Date(),
        fecha_fin: doc.data().fecha_fin?.toDate() || new Date(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Training[];
    } catch (error) {
      console.error('Error getting trainings by participant:', error);
      throw new Error('Error al obtener capacitaciones por participante');
    }
  }

  static async getActive(): Promise<Training[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('estado', 'in', ['planificada', 'en_curso'])
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha_inicio: doc.data().fecha_inicio?.toDate() || new Date(),
        fecha_fin: doc.data().fecha_fin?.toDate() || new Date(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Training[];
    } catch (error) {
      console.error('Error getting active trainings:', error);
      throw new Error('Error al obtener capacitaciones activas');
    }
  }

  // ===== NUEVOS MÉTODOS PARA VINCULACIÓN CON COMPETENCIAS =====

  /**
   * Vincular competencias a una capacitación
   */
  static async linkCompetences(
    trainingId: string,
    competenceIds: string[]
  ): Promise<void> {
    try {
      await this.update(trainingId, {
        competenciasDesarrolladas: competenceIds,
      });
    } catch (error) {
      console.error('Error linking competences to training:', error);
      throw new Error('Error al vincular competencias a la capacitación');
    }
  }

  /**
   * Obtener capacitaciones que desarrollan una competencia específica
   */
  static async getByCompetence(competenceId: string): Promise<Training[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('competenciasDesarrolladas', 'array-contains', competenceId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha_inicio: doc.data().fecha_inicio?.toDate() || new Date(),
        fecha_fin: doc.data().fecha_fin?.toDate() || new Date(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Training[];
    } catch (error) {
      console.error('Error getting trainings by competence:', error);
      throw new Error('Error al obtener capacitaciones por competencia');
    }
  }

  /**
   * Actualizar competencias de un empleado después de completar una capacitación
   */
  static async updateEmployeeCompetences(
    personnelId: string,
    trainingId: string
  ): Promise<void> {
    try {
      // Obtener la capacitación
      const training = await this.getById(trainingId);
      if (!training) {
        throw new Error('Capacitación no encontrada');
      }

      // Verificar que el empleado participó en la capacitación
      if (!training.participantes?.includes(personnelId)) {
        throw new Error('El empleado no participó en esta capacitación');
      }

      // Obtener competencias desarrolladas por la capacitación
      const competenceIds = training.competenciasDesarrolladas || [];
      if (competenceIds.length === 0) {
        return; // No hay competencias para actualizar
      }

      // Obtener empleado actual
      const personnelDoc = await getDoc(doc(db, 'personnel', personnelId));
      if (!personnelDoc.exists()) {
        throw new Error('Empleado no encontrado');
      }
      const personnel = personnelDoc.data();

      // Actualizar competencias del empleado
      const currentCompetences = personnel?.competenciasActuales || [];
      const now = new Date();

      // Para cada competencia desarrollada, actualizar el nivel si es mayor
      for (const competenceId of competenceIds) {
        const competenceDoc = await getDoc(
          doc(db, 'competencias', competenceId)
        );
        if (!competenceDoc.exists()) continue;

        const competence = competenceDoc.data();
        const nivelDesarrollado = competence?.nivelRequerido || 3; // Nivel que desarrolla la capacitación

        // Buscar si ya tiene esta competencia
        const existingIndex = currentCompetences.findIndex(
          (c: any) => c.competenciaId === competenceId
        );

        if (existingIndex >= 0) {
          // Actualizar si el nuevo nivel es mayor
          if (
            nivelDesarrollado > currentCompetences[existingIndex].nivelAlcanzado
          ) {
            currentCompetences[existingIndex] = {
              ...currentCompetences[existingIndex],
              nivelAlcanzado: nivelDesarrollado,
              fechaUltimaEvaluacion: now,
            };
          }
        } else {
          // Agregar nueva competencia
          currentCompetences.push({
            competenciaId: competenceId,
            nivelAlcanzado: nivelDesarrollado,
            fechaUltimaEvaluacion: now,
          });
        }
      }

      // Actualizar empleado
      await updateDoc(doc(db, 'personnel', personnelId), {
        competenciasActuales: currentCompetences,
        capacitacionesRealizadas: [
          ...(personnel?.capacitacionesRealizadas || []),
          trainingId,
        ],
        updated_at: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating employee competences:', error);
      throw error instanceof Error
        ? error
        : new Error('Error al actualizar competencias del empleado');
    }
  }

  /**
   * Crear evaluación posterior a una capacitación
   */
  static async createPostEvaluation(trainingId: string): Promise<string> {
    try {
      // Obtener la capacitación
      const training = await this.getById(trainingId);
      if (!training) {
        throw new Error('Capacitación no encontrada');
      }

      // Verificar que requiere evaluación posterior
      if (!training.evaluacionPosterior) {
        throw new Error('Esta capacitación no requiere evaluación posterior');
      }

      // Verificar que ya tiene evaluación posterior
      if (training.evaluacionPosteriorId) {
        return training.evaluacionPosteriorId; // Ya existe
      }

      // Obtener participantes
      const participants = training.participantes || [];
      if (participants.length === 0) {
        throw new Error('La capacitación no tiene participantes');
      }

      // Para cada participante, crear evaluación post-capacitación
      const evaluationIds: string[] = [];

      for (const participantId of participants) {
        try {
          // Obtener empleado
          const personnelDoc = await getDoc(
            doc(db, 'personnel', participantId)
          );
          if (!personnelDoc.exists()) continue;
          const personnel = personnelDoc.data();

          if (!personnel?.puestoId) continue;

          // Crear evaluación desde plantilla del puesto
          const evaluation = await this.createPostEvaluationForParticipant(
            participantId,
            trainingId,
            training.competenciasDesarrolladas || []
          );

          evaluationIds.push(evaluation.id);
        } catch (error) {
          console.error(
            `Error creando evaluación para participante ${participantId}:`,
            error
          );
        }
      }

      // Actualizar capacitación con ID de evaluación posterior
      await this.update(trainingId, {
        evaluacionPosteriorId: evaluationIds[0], // Guardar primera evaluación como referencia
      });

      return evaluationIds[0];
    } catch (error) {
      console.error('Error creating post evaluation:', error);
      throw error instanceof Error
        ? error
        : new Error('Error al crear evaluación posterior');
    }
  }

  /**
   * Crear evaluación post-capacitación para un participante específico
   */
  private static async createPostEvaluationForParticipant(
    personnelId: string,
    trainingId: string,
    competenceIds: string[]
  ): Promise<any> {
    try {
      // Obtener empleado
      const personnelDoc = await getDoc(doc(db, 'personnel', personnelId));
      if (!personnelDoc.exists()) {
        throw new Error('Empleado no encontrado');
      }
      const personnel = personnelDoc.data();

      if (!personnel?.puestoId) {
        throw new Error('Empleado sin puesto asignado');
      }

      // Crear estructura de competencias para evaluación post
      const competenceEvaluations = [];

      for (const competenceId of competenceIds) {
        const compDoc = await getDoc(doc(db, 'competencias', competenceId));
        if (compDoc.exists()) {
          const competence = compDoc.data();
          competenceEvaluations.push({
            competenciaId: competenceId,
            nombreCompetencia: competence?.nombre || '',
            nivelRequerido: competence?.nivelRequerido || 3,
            nivelEvaluado: 0, // Por evaluar
            observaciones: `Evaluación post-capacitación: ${trainingId}`,
            brecha: competence?.nivelRequerido || 3,
          });
        }
      }

      // Crear evaluación
      const evaluationData = {
        personnel_id: personnelId,
        puestoId: personnel.puestoId,
        periodo: `Post-capacitación ${trainingId}`,
        fecha_evaluacion: new Date(),
        evaluador_id: '', // Se asignará después
        competencias: competenceEvaluations,
        resultado_global: 'Requiere Capacitación' as const,
        fechaProximaEvaluacion: new Date(), // No aplica para evaluación post
        comentarios_generales: `Evaluación posterior a capacitación ${trainingId}`,
        plan_mejora: '',
        estado: 'borrador' as const,
      };

      return await this.createEvaluation(evaluationData);
    } catch (error) {
      console.error('Error creating post evaluation for participant:', error);
      throw error;
    }
  }

  /**
   * Método auxiliar para crear evaluación (debe importarse de EvaluationService)
   */
  private static async createEvaluation(data: any): Promise<unknown> {
    // Importar dinámicamente para evitar dependencias circulares
    const { EvaluationService } = await import('./EvaluationService');
    return await EvaluationService.create(data);
  }
}
