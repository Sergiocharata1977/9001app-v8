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
import { Training, TrainingFilters, PaginationParams, PaginatedResponse } from '@/types/rrhh';

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
        q = query(q, where('tema', '>=', filters.search), where('tema', '<=', filters.search + '\uf8ff'));
      }

      if (filters.estado) {
        q = query(q, where('estado', '==', filters.estado));
      }

      if (filters.modalidad) {
        q = query(q, where('modalidad', '==', filters.modalidad));
      }

      if (filters.fecha_inicio && filters.fecha_fin) {
        q = query(q, where('fecha_inicio', '>=', Timestamp.fromDate(filters.fecha_inicio)));
        q = query(q, where('fecha_fin', '<=', Timestamp.fromDate(filters.fecha_fin)));
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

  static async create(data: Omit<Training, 'id' | 'created_at' | 'updated_at'>): Promise<Training> {
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

  static async update(id: string, data: Partial<Omit<Training, 'id' | 'created_at'>>): Promise<Training> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData = {
        ...data,
        fecha_inicio: data.fecha_inicio ? Timestamp.fromDate(data.fecha_inicio) : undefined,
        fecha_fin: data.fecha_fin ? Timestamp.fromDate(data.fecha_fin) : undefined,
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

  static async updateStatus(id: string, status: Training['estado']): Promise<Training> {
    try {
      return await this.update(id, { estado: status });
    } catch (error) {
      console.error('Error updating training status:', error);
      throw new Error('Error al actualizar estado de capacitación');
    }
  }

  static async addParticipant(trainingId: string, participantId: string): Promise<Training> {
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

  static async removeParticipant(trainingId: string, participantId: string): Promise<Training> {
    try {
      const training = await this.getById(trainingId);
      if (!training) {
        throw new Error('Capacitación no encontrada');
      }

      const participants = training.participantes || [];
      const updatedParticipants = participants.filter(id => id !== participantId);

      return await this.update(trainingId, { participantes: updatedParticipants });
    } catch (error) {
      console.error('Error removing participant:', error);
      throw new Error('Error al remover participante');
    }
  }

  static async getByParticipant(participantId: string): Promise<Training[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('participantes', 'array-contains', participantId));
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
      const q = query(collection(db, COLLECTION_NAME), where('estado', 'in', ['planificada', 'en_curso']));
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
}