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
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import {
  Position,
  PositionWithAssignments,
  PositionFormData,
  PositionAssignmentsFormData,
  Personnel,
} from '@/types/rrhh';

const COLLECTION_NAME = 'positions';
const PERSONNEL_COLLECTION = 'personnel';

export class PositionService {
  /**
   * Obtener todos los puestos ordenados por nombre
   */
  static async getAll(): Promise<Position[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('nombre', 'asc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc) => ({
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

  /**
   * Obtener todos los puestos con conteo de personal
   */
  static async getAllWithPersonnelCount(): Promise<PositionWithAssignments[]> {
    try {
      const positions = await this.getAll();
      
      // Obtener conteo de personnel para cada position
      const positionsWithCount = await Promise.all(
        positions.map(async (position) => {
          const count = await this.getPersonnelCountInPosition(position.id);
          return {
            ...position,
            personnel_count: count,
          } as PositionWithAssignments;
        })
      );
      
      return positionsWithCount;
    } catch (error) {
      console.error('Error getting positions with personnel count:', error);
      throw new Error('Error al obtener puestos con conteo');
    }
  }

  /**
   * Obtener un puesto por ID
   */
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
      console.error('Error getting position by id:', error);
      throw new Error('Error al obtener puesto');
    }
  }

  /**
   * Obtener un puesto por ID con asignaciones expandidas
   */
  static async getByIdWithAssignments(id: string): Promise<PositionWithAssignments | null> {
    try {
      const position = await this.getById(id);
      
      if (!position) {
        return null;
      }

      // Expandir asignaciones en paralelo
      const [procesos_details, objetivos_details, indicadores_details, personnel_count] =
        await Promise.all([
          this.expandProcesses(position.procesos_asignados || []),
          this.expandObjectives(position.objetivos_asignados || []),
          this.expandIndicators(position.indicadores_asignados || []),
          this.getPersonnelCountInPosition(id),
        ]);

      return {
        ...position,
        procesos_details,
        objetivos_details,
        indicadores_details,
        personnel_count,
      } as PositionWithAssignments;
    } catch (error) {
      console.error('Error getting position with assignments:', error);
      throw new Error('Error al obtener puesto con asignaciones');
    }
  }

  /**
   * Crear un nuevo puesto
   */
  static async create(data: PositionFormData): Promise<string> {
    try {
      // Validar datos requeridos
      if (!data.nombre || data.nombre.trim() === '') {
        throw new Error('El nombre del puesto es requerido');
      }

      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        procesos_asignados: [],
        objetivos_asignados: [],
        indicadores_asignados: [],
        created_at: now,
        updated_at: now,
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating position:', error);
      throw error instanceof Error ? error : new Error('Error al crear puesto');
    }
  }

  /**
   * Actualizar información básica del puesto
   */
  static async update(id: string, data: Partial<PositionFormData>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('El puesto no existe');
      }

      await updateDoc(docRef, {
        ...data,
        updated_at: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating position:', error);
      throw error instanceof Error ? error : new Error('Error al actualizar puesto');
    }
  }

  /**
   * Eliminar un puesto (con validación de personnel activo)
   */
  static async delete(id: string): Promise<void> {
    try {
      // Verificar que no haya personnel activo con este puesto
      const personnelInPosition = await this.getPersonnelInPosition(id);
      const activePersonnel = personnelInPosition.filter((p) => p.estado === 'Activo');

      if (activePersonnel.length > 0) {
        throw new Error(
          `No se puede eliminar. Hay ${activePersonnel.length} persona(s) activa(s) en este puesto`
        );
      }

      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting position:', error);
      throw error instanceof Error ? error : new Error('Error al eliminar puesto');
    }
  }

  /**
   * Obtener personal en un puesto
   */
  static async getPersonnelInPosition(positionId: string): Promise<Personnel[]> {
    try {
      const q = query(
        collection(db, PERSONNEL_COLLECTION),
        where('puesto', '==', positionId)
        // orderBy('apellidos', 'asc') // Comentado temporalmente - requiere índice
      );
      const querySnapshot = await getDocs(q);
      
      // Ordenar en memoria
      const personnel = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        fecha_nacimiento: doc.data().fecha_nacimiento?.toDate(),
        fecha_contratacion: doc.data().fecha_contratacion?.toDate(),
        fecha_inicio_ventas: doc.data().fecha_inicio_ventas?.toDate(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Personnel[];
      
      // Ordenar por apellidos en memoria
      return personnel.sort((a, b) => 
        (a.apellidos || '').localeCompare(b.apellidos || '')
      );
    } catch (error) {
      console.error('Error getting personnel in position:', error);
      throw new Error('Error al obtener personal del puesto');
    }
  }

  /**
   * Obtener conteo de personnel en un puesto
   */
  private static async getPersonnelCountInPosition(positionId: string): Promise<number> {
    try {
      const q = query(
        collection(db, PERSONNEL_COLLECTION),
        where('puesto', '==', positionId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error counting personnel in position:', error);
      return 0;
    }
  }

  /**
   * Expandir IDs de procesos a objetos completos
   */
  private static async expandProcesses(processIds: string[]): Promise<unknown[]> {
    if (processIds.length === 0) return [];

    try {
      const processes = await Promise.all(
        processIds.map(async (id) => {
          const docRef = doc(db, 'processDefinitions', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
          }
          return null;
        })
      );

      return processes.filter((p) => p !== null);
    } catch (error) {
      console.error('Error expanding processes:', error);
      return [];
    }
  }

  /**
   * Expandir IDs de objetivos a objetos completos
   */
  private static async expandObjectives(objectiveIds: string[]): Promise<unknown[]> {
    if (objectiveIds.length === 0) return [];

    try {
      const objectives = await Promise.all(
        objectiveIds.map(async (id) => {
          const docRef = doc(db, 'qualityObjectives', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
          }
          return null;
        })
      );

      return objectives.filter((o) => o !== null);
    } catch (error) {
      console.error('Error expanding objectives:', error);
      return [];
    }
  }

  /**
   * Expandir IDs de indicadores a objetos completos
   */
  private static async expandIndicators(indicatorIds: string[]): Promise<unknown[]> {
    if (indicatorIds.length === 0) return [];

    try {
      const indicators = await Promise.all(
        indicatorIds.map(async (id) => {
          const docRef = doc(db, 'qualityIndicators', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
          }
          return null;
        })
      );

      return indicators.filter((i) => i !== null);
    } catch (error) {
      console.error('Error expanding indicators:', error);
      return [];
    }
  }

  /**
   * Actualizar asignaciones de contexto de un puesto
   */
  static async updateAssignments(
    id: string,
    assignments: PositionAssignmentsFormData
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('El puesto no existe');
      }

      // Validar que los IDs existen
      await this.validateAssignments(assignments);

      // Actualizar asignaciones
      await updateDoc(docRef, {
        procesos_asignados: assignments.procesos_asignados,
        objetivos_asignados: assignments.objetivos_asignados,
        indicadores_asignados: assignments.indicadores_asignados,
        updated_at: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating position assignments:', error);
      throw error instanceof Error ? error : new Error('Error al actualizar asignaciones');
    }
  }

  /**
   * Propagar asignaciones del puesto a todo su personal
   */
  static async propagateAssignmentsToPersonnel(positionId: string): Promise<number> {
    try {
      // Obtener position con sus asignaciones
      const position = await this.getById(positionId);
      
      if (!position) {
        throw new Error('El puesto no existe');
      }

      // Buscar todos los personnel activos con este puesto
      const q = query(
        collection(db, PERSONNEL_COLLECTION),
        where('puesto', '==', positionId),
        where('estado', '==', 'Activo')
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return 0;
      }

      // Usar batch writes para actualizar múltiples documentos
      const batch = writeBatch(db);
      let count = 0;

      querySnapshot.docs.forEach((personnelDoc) => {
        const personnelRef = doc(db, PERSONNEL_COLLECTION, personnelDoc.id);
        batch.update(personnelRef, {
          procesos_asignados: position.procesos_asignados || [],
          objetivos_asignados: position.objetivos_asignados || [],
          indicadores_asignados: position.indicadores_asignados || [],
          updated_at: Timestamp.now(),
        });
        count++;
      });

      await batch.commit();
      return count;
    } catch (error) {
      console.error('Error propagating assignments to personnel:', error);
      throw error instanceof Error ? error : new Error('Error al propagar asignaciones');
    }
  }

  /**
   * Validar que los IDs de asignaciones existen
   */
  private static async validateAssignments(
    assignments: PositionAssignmentsFormData
  ): Promise<void> {
    const errors: string[] = [];

    // Validar procesos
    for (const processId of assignments.procesos_asignados) {
      const docRef = doc(db, 'processDefinitions', processId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        errors.push(`Proceso no encontrado: ${processId}`);
      }
    }

    // Validar objetivos
    for (const objectiveId of assignments.objetivos_asignados) {
      const docRef = doc(db, 'qualityObjectives', objectiveId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        errors.push(`Objetivo no encontrado: ${objectiveId}`);
      }
    }

    // Validar indicadores
    for (const indicatorId of assignments.indicadores_asignados) {
      const docRef = doc(db, 'qualityIndicators', indicatorId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        errors.push(`Indicador no encontrado: ${indicatorId}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }
}
