import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { PerformanceEvaluation, PerformanceEvaluationFilters, PaginationParams, PaginatedResponse } from '@/types/rrhh';

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
          fecha_evaluacion: docSnap.data().fecha_evaluacion?.toDate() || new Date(),
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
        q = query(q, where('personnel_id', '>=', filters.search), where('personnel_id', '<=', filters.search + '\uf8ff'));
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

  static async create(data: Omit<PerformanceEvaluation, 'id' | 'created_at' | 'updated_at'>): Promise<PerformanceEvaluation> {
    try {
      const now = Timestamp.now();
      const docData = {
        ...data,
        fecha_evaluacion: Timestamp.fromDate(data.fecha_evaluacion),
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
      console.error('Error creating evaluation:', error);
      throw new Error('Error al crear evaluación');
    }
  }

  static async update(id: string, data: Partial<Omit<PerformanceEvaluation, 'id' | 'created_at'>>): Promise<PerformanceEvaluation> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData = {
        ...data,
        fecha_evaluacion: data.fecha_evaluacion ? Timestamp.fromDate(data.fecha_evaluacion) : undefined,
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
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      throw new Error('Error al eliminar evaluación');
    }
  }

  static async updateStatus(id: string, status: PerformanceEvaluation['estado']): Promise<PerformanceEvaluation> {
    try {
      return await this.update(id, { estado: status });
    } catch (error) {
      console.error('Error updating evaluation status:', error);
      throw new Error('Error al actualizar estado de evaluación');
    }
  }

  static async getByPersonnel(personnelId: string): Promise<PerformanceEvaluation[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('personnel_id', '==', personnelId));
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

  static async getByEvaluator(evaluatorId: string): Promise<PerformanceEvaluation[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('evaluador_id', '==', evaluatorId));
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
      const q = query(collection(db, COLLECTION_NAME), where('periodo', '==', period));
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
      const q = query(collection(db, COLLECTION_NAME), where('estado', 'in', ['borrador', 'publicado']));
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
}