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
import { Position, PositionFilters, PaginationParams, PaginatedResponse } from '@/types/rrhh';

const COLLECTION_NAME = 'positions';

export class PositionService {
  static async getAll(): Promise<Position[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Position[];
    } catch (error) {
      console.error('Error getting positions:', error);
      throw new Error('Error al obtener puestos');
    }
  }

  static async getById(id: string): Promise<Position | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          created_at: docSnap.data().created_at?.toDate() || new Date(),
          updated_at: docSnap.data().updated_at?.toDate() || new Date(),
        } as Position;
      }
      return null;
    } catch (error) {
      console.error('Error getting position:', error);
      throw new Error('Error al obtener puesto');
    }
  }

  static async getPaginated(
    filters: PositionFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<Position>> {
    try {
      let q = query(collection(db, COLLECTION_NAME));

      // Apply filters
      if (filters.search) {
        q = query(q, where('nombre', '>=', filters.search), where('nombre', '<=', filters.search + '\uf8ff'));
      }

      if (filters.departamento_id) {
        q = query(q, where('departamento_id', '==', filters.departamento_id));
      }

      if (filters.reporta_a_id) {
        q = query(q, where('reporta_a_id', '==', filters.reporta_a_id));
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
          created_at: doc.data().created_at?.toDate() || new Date(),
          updated_at: doc.data().updated_at?.toDate() || new Date(),
        })) as Position[];

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
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Position[];

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
      console.error('Error getting paginated positions:', error);
      throw new Error('Error al obtener puestos paginados');
    }
  }

  static async create(data: Omit<Position, 'id' | 'created_at' | 'updated_at'>): Promise<Position> {
    try {
      const now = Timestamp.now();
      const docData = {
        ...data,
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
      console.error('Error creating position:', error);
      throw new Error('Error al crear puesto');
    }
  }

  static async update(id: string, data: Partial<Omit<Position, 'id' | 'created_at'>>): Promise<Position> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData = {
        ...data,
        updated_at: Timestamp.now(),
      };

      await updateDoc(docRef, updateData);

      const updated = await this.getById(id);
      if (!updated) {
        throw new Error('Puesto no encontrado después de actualizar');
      }

      return updated;
    } catch (error) {
      console.error('Error updating position:', error);
      throw new Error('Error al actualizar puesto');
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting position:', error);
      throw new Error('Error al eliminar puesto');
    }
  }

  static async getByDepartment(departmentId: string): Promise<Position[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('departamento_id', '==', departmentId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Position[];
    } catch (error) {
      console.error('Error getting positions by department:', error);
      throw new Error('Error al obtener puestos por departamento');
    }
  }
}