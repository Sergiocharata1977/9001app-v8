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
import { Personnel, PersonnelFilters, PaginationParams, PaginatedResponse } from '@/types/rrhh';

const COLLECTION_NAME = 'personnel';

export class PersonnelService {
  static async getAll(): Promise<Personnel[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha_nacimiento: doc.data().fecha_nacimiento?.toDate(),
        fecha_contratacion: doc.data().fecha_contratacion?.toDate(),
        fecha_inicio_ventas: doc.data().fecha_inicio_ventas?.toDate(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Personnel[];
    } catch (error) {
      console.error('Error getting personnel:', error);
      throw new Error('Error al obtener personal');
    }
  }

  static async getById(id: string): Promise<Personnel | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          fecha_nacimiento: docSnap.data().fecha_nacimiento?.toDate(),
          fecha_contratacion: docSnap.data().fecha_contratacion?.toDate(),
          fecha_inicio_ventas: docSnap.data().fecha_inicio_ventas?.toDate(),
          created_at: docSnap.data().created_at?.toDate() || new Date(),
          updated_at: docSnap.data().updated_at?.toDate() || new Date(),
        } as Personnel;
      }
      return null;
    } catch (error) {
      console.error('Error getting personnel:', error);
      throw new Error('Error al obtener personal');
    }
  }

  static async getPaginated(
    filters: PersonnelFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<Personnel>> {
    try {
      let q = query(collection(db, COLLECTION_NAME));

      // Apply filters
      if (filters.search) {
        // Search in names and email
        q = query(q, where('nombres', '>=', filters.search), where('nombres', '<=', filters.search + '\uf8ff'));
      }

      if (filters.estado) {
        q = query(q, where('estado', '==', filters.estado));
      }

      if (filters.tipo_personal) {
        q = query(q, where('tipo_personal', '==', filters.tipo_personal));
      }

      if (filters.supervisor_id) {
        q = query(q, where('supervisor_id', '==', filters.supervisor_id));
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
          fecha_nacimiento: doc.data().fecha_nacimiento?.toDate(),
          fecha_contratacion: doc.data().fecha_contratacion?.toDate(),
          fecha_inicio_ventas: doc.data().fecha_inicio_ventas?.toDate(),
          created_at: doc.data().created_at?.toDate() || new Date(),
          updated_at: doc.data().updated_at?.toDate() || new Date(),
        })) as Personnel[];

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
        fecha_nacimiento: doc.data().fecha_nacimiento?.toDate(),
        fecha_contratacion: doc.data().fecha_contratacion?.toDate(),
        fecha_inicio_ventas: doc.data().fecha_inicio_ventas?.toDate(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Personnel[];

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
      console.error('Error getting paginated personnel:', error);
      throw new Error('Error al obtener personal paginado');
    }
  }

  static async create(data: Omit<Personnel, 'id' | 'created_at' | 'updated_at'>): Promise<Personnel> {
    try {
      const now = Timestamp.now();
      const docData = {
        ...data,
        fecha_nacimiento: data.fecha_nacimiento ? Timestamp.fromDate(data.fecha_nacimiento) : null,
        fecha_contratacion: data.fecha_contratacion ? Timestamp.fromDate(data.fecha_contratacion) : null,
        fecha_inicio_ventas: data.fecha_inicio_ventas ? Timestamp.fromDate(data.fecha_inicio_ventas) : null,
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
      console.error('Error creating personnel:', error);
      throw new Error('Error al crear personal');
    }
  }

  static async update(id: string, data: Partial<Omit<Personnel, 'id' | 'created_at'>>): Promise<Personnel> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData = {
        ...data,
        fecha_nacimiento: data.fecha_nacimiento ? Timestamp.fromDate(data.fecha_nacimiento) : undefined,
        fecha_contratacion: data.fecha_contratacion ? Timestamp.fromDate(data.fecha_contratacion) : undefined,
        fecha_inicio_ventas: data.fecha_inicio_ventas ? Timestamp.fromDate(data.fecha_inicio_ventas) : undefined,
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
        throw new Error('Personal no encontrado después de actualizar');
      }

      return updated;
    } catch (error) {
      console.error('Error updating personnel:', error);
      throw new Error('Error al actualizar personal');
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting personnel:', error);
      throw new Error('Error al eliminar personal');
    }
  }

  static async toggleStatus(id: string): Promise<Personnel> {
    try {
      const personnel = await this.getById(id);
      if (!personnel) {
        throw new Error('Personal no encontrado');
      }

      const newStatus = personnel.estado === 'Activo' ? 'Inactivo' : 'Activo';
      return await this.update(id, { estado: newStatus });
    } catch (error) {
      console.error('Error toggling personnel status:', error);
      throw new Error('Error al cambiar estado del personal');
    }
  }

  static async getBySupervisor(supervisorId: string): Promise<Personnel[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('supervisor_id', '==', supervisorId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha_nacimiento: doc.data().fecha_nacimiento?.toDate(),
        fecha_contratacion: doc.data().fecha_contratacion?.toDate(),
        fecha_inicio_ventas: doc.data().fecha_inicio_ventas?.toDate(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Personnel[];
    } catch (error) {
      console.error('Error getting personnel by supervisor:', error);
      throw new Error('Error al obtener personal por supervisor');
    }
  }

  static async getActive(): Promise<Personnel[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('estado', '==', 'Activo'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha_nacimiento: doc.data().fecha_nacimiento?.toDate(),
        fecha_contratacion: doc.data().fecha_contratacion?.toDate(),
        fecha_inicio_ventas: doc.data().fecha_inicio_ventas?.toDate(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Personnel[];
    } catch (error) {
      console.error('Error getting active personnel:', error);
      throw new Error('Error al obtener personal activo');
    }
  }
}