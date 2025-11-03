import { db } from '@/lib/firebase';
import type {
  Competence,
  CompetenceFilters,
  CompetenceFormData,
  PaginatedResponse,
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
  updateDoc,
  where,
} from 'firebase/firestore';

export class CompetenceService {
  private collectionName = 'competencias';

  async getAll(
    categoria?: string | null,
    search?: string | null
  ): Promise<Competence[]> {
    try {
      let q = query(
        collection(db, this.collectionName),
        where('activo', '==', true),
        orderBy('nombre', 'asc')
      );

      // Aplicar filtro de categoría si existe
      if (categoria && categoria !== 'all') {
        q = query(
          collection(db, this.collectionName),
          where('activo', '==', true),
          where('categoria', '==', categoria),
          orderBy('nombre', 'asc')
        );
      }

      const snapshot = await getDocs(q);
      let competences = snapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Competence
      );

      // Filtrar por búsqueda si existe
      if (search) {
        const searchLower = search.toLowerCase();
        competences = competences.filter(
          c =>
            c.nombre.toLowerCase().includes(searchLower) ||
            c.descripcion?.toLowerCase().includes(searchLower)
        );
      }

      return competences;
    } catch (error) {
      console.error('Error al obtener competencias:', error);
      throw new Error('No se pudieron cargar las competencias');
    }
  }

  async getById(id: string): Promise<Competence | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Competence;
      }

      return null;
    } catch (error) {
      console.error('Error al obtener competencia:', error);
      throw error;
    }
  }

  async getPaginated(
    filters: CompetenceFilters,
    page: number = 1,
    limitCount: number = 10
  ): Promise<PaginatedResponse<Competence>> {
    try {
      let q = query(collection(db, this.collectionName));

      // Aplicar filtros
      if (filters.organization_id) {
        q = query(q, where('organization_id', '==', filters.organization_id));
      }

      if (filters.activo !== undefined) {
        q = query(q, where('activo', '==', filters.activo));
      }

      if (filters.categoria) {
        q = query(q, where('categoria', '==', filters.categoria));
      }

      // Ordenamiento
      q = query(q, orderBy('nombre', 'asc'));

      // Paginación
      const offset = (page - 1) * limitCount;
      if (offset > 0) {
        // Para paginación avanzada necesitaríamos implementar cursor-based pagination
        // Por simplicidad, limitamos a la primera página por ahora
        q = query(q, limit(limitCount));
      } else {
        q = query(q, limit(limitCount));
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Competence
      );

      // Para este ejemplo, calculamos total aproximado
      // En producción, usaríamos una colección separada para contar
      let totalQuery = query(collection(db, this.collectionName));
      if (filters.organization_id) {
        totalQuery = query(
          collection(db, this.collectionName),
          where('organization_id', '==', filters.organization_id)
        );
      }
      const totalSnapshot = await getDocs(totalQuery);

      return {
        data,
        pagination: {
          page,
          limit: limitCount,
          total: totalSnapshot.size,
          totalPages: Math.ceil(totalSnapshot.size / limitCount),
          hasNext: page * limitCount < totalSnapshot.size,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error al obtener competencias paginadas:', error);
      throw error;
    }
  }

  async getByCategory(
    organizationId: string,
    categoria: string
  ): Promise<Competence[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('organization_id', '==', organizationId),
        where('categoria', '==', categoria),
        where('activo', '==', true)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Competence
      );
    } catch (error) {
      console.error('Error al obtener competencias por categoría:', error);
      throw error;
    }
  }

  async getByPuesto(puestoId: string): Promise<Competence[]> {
    try {
      // Primero obtenemos el puesto para ver qué competencias requiere
      const positionDoc = await getDoc(doc(db, 'positions', puestoId));
      if (!positionDoc.exists()) {
        throw new Error('Puesto no encontrado');
      }

      const position = positionDoc.data();
      const competenceIds = position?.competenciasRequeridas || [];

      if (competenceIds.length === 0) {
        return [];
      }

      // Obtenemos las competencias
      const competencePromises = competenceIds.map((id: string) =>
        this.getById(id)
      );
      const competences = await Promise.all(competencePromises);

      return competences.filter((comp): comp is Competence => comp !== null);
    } catch (error) {
      console.error('Error al obtener competencias por puesto:', error);
      throw error;
    }
  }

  async create(data: CompetenceFormData): Promise<Competence> {
    try {
      const competenceData = {
        ...data,
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const docRef = await addDoc(
        collection(db, this.collectionName),
        competenceData
      );

      return {
        id: docRef.id,
        ...competenceData,
      } as Competence;
    } catch (error) {
      console.error('Error al crear competencia:', error);
      throw new Error('No se pudo crear la competencia');
    }
  }

  async update(id: string, data: Partial<CompetenceFormData>): Promise<void> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date(),
      };

      await updateDoc(doc(db, this.collectionName, id), updateData);
    } catch (error) {
      console.error('Error al actualizar competencia:', error);
      throw new Error('No se pudo actualizar la competencia');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const canDelete = await this.validateCanDelete(id);

      if (!canDelete) {
        throw new Error(
          'No se puede eliminar: la competencia está asignada a uno o más puestos'
        );
      }

      await deleteDoc(doc(db, this.collectionName, id));
    } catch (error) {
      console.error('Error al eliminar competencia:', error);
      throw error;
    }
  }

  async validateCanDelete(competenceId: string): Promise<boolean> {
    try {
      // Verificar si está asignada a algún puesto
      const positionsQuery = query(
        collection(db, 'positions'),
        where('competenciasRequeridas', 'array-contains', competenceId)
      );

      const snapshot = await getDocs(positionsQuery);
      return snapshot.empty; // true si NO está asignada
    } catch (error) {
      console.error('Error al validar eliminación:', error);
      return false;
    }
  }
}

export const competenceService = new CompetenceService();
