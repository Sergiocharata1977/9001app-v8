import { db } from '@/firebase/config';
import type {
    CreateOrganizationalStructureData,
    OrganizationalStructure,
    UpdateOrganizationalStructureData,
} from '@/types/organizational-structure';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';

/**
 * OrganizationalStructureService
 * 
 * Servicio consolidado que gestiona:
 * - Organigramas (estructura jerárquica)
 * - Flujogramas (diagramas de flujo de procesos)
 * - Relaciones entre procesos
 * - Mapa de procesos (clasificación estratégica)
 */
export class OrganizationalStructureService {
  private static readonly COLLECTION_NAME = 'organizational_structure';

  /**
   * Obtener la estructura vigente actual
   */
  static async getCurrent(): Promise<OrganizationalStructure | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('estado', '==', 'vigente'),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as OrganizationalStructure;
    } catch (error) {
      console.error('[OrganizationalStructureService] Error getting current structure:', error);
      throw error;
    }
  }

  /**
   * Obtener estructura por ID
   */
  static async getById(id: string): Promise<OrganizationalStructure | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as OrganizationalStructure;
    } catch (error) {
      console.error('[OrganizationalStructureService] Error getting structure by ID:', error);
      throw error;
    }
  }

  /**
   * Crear nueva estructura organizacional
   */
  static async create(data: CreateOrganizationalStructureData): Promise<string> {
    try {
      // Marcar estructura anterior como histórica
      const currentStructure = await this.getCurrent();
      if (currentStructure) {
        await this.markAsHistorico(currentStructure.id);
      }

      const docRef = doc(collection(db, this.COLLECTION_NAME));
      const now = new Date().toISOString();

      // Determinar versión
      const version = currentStructure ? currentStructure.version + 1 : 1;

      await setDoc(docRef, {
        ...data,
        version,
        estado: 'vigente',
        flujogramas: data.flujogramas || [],
        relaciones_procesos: data.relaciones_procesos || [],
        created_at: now,
        updated_at: now,
        is_active: true,
      });

      return docRef.id;
    } catch (error) {
      console.error('[OrganizationalStructureService] Error creating structure:', error);
      throw error;
    }
  }

  /**
   * Actualizar estructura existente
   */
  static async update(id: string, data: UpdateOrganizationalStructureData): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const now = new Date().toISOString();

      await updateDoc(docRef, {
        ...data,
        updated_at: now,
      });
    } catch (error) {
      console.error('[OrganizationalStructureService] Error updating structure:', error);
      throw error;
    }
  }

  /**
   * Marcar estructura como histórica
   */
  static async markAsHistorico(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const now = new Date().toISOString();

      await updateDoc(docRef, {
        estado: 'historico',
        fecha_vigencia_hasta: now,
        updated_at: now,
      });
    } catch (error) {
      console.error('[OrganizationalStructureService] Error marking as historico:', error);
      throw error;
    }
  }

  /**
   * Agregar flujograma a la estructura
   */
  static async addFlujograma(
    structureId: string,
    flujograma: OrganizationalStructure['flujogramas'][0]
  ): Promise<void> {
    try {
      const structure = await this.getById(structureId);
      if (!structure) {
        throw new Error('Estructura no encontrada');
      }

      const updatedFlujogramas = [...structure.flujogramas, flujograma];

      await this.update(structureId, {
        flujogramas: updatedFlujogramas,
      });
    } catch (error) {
      console.error('[OrganizationalStructureService] Error adding flujograma:', error);
      throw error;
    }
  }

  /**
   * Actualizar flujograma existente
   */
  static async updateFlujograma(
    structureId: string,
    flujogramaId: string,
    flujogramaData: Partial<OrganizationalStructure['flujogramas'][0]>
  ): Promise<void> {
    try {
      const structure = await this.getById(structureId);
      if (!structure) {
        throw new Error('Estructura no encontrada');
      }

      const updatedFlujogramas = structure.flujogramas.map(f =>
        f.flujograma_id === flujogramaId ? { ...f, ...flujogramaData } : f
      );

      await this.update(structureId, {
        flujogramas: updatedFlujogramas,
      });
    } catch (error) {
      console.error('[OrganizationalStructureService] Error updating flujograma:', error);
      throw error;
    }
  }

  /**
   * Eliminar flujograma
   */
  static async deleteFlujograma(structureId: string, flujogramaId: string): Promise<void> {
    try {
      const structure = await this.getById(structureId);
      if (!structure) {
        throw new Error('Estructura no encontrada');
      }

      const updatedFlujogramas = structure.flujogramas.filter(
        f => f.flujograma_id !== flujogramaId
      );

      await this.update(structureId, {
        flujogramas: updatedFlujogramas,
      });
    } catch (error) {
      console.error('[OrganizationalStructureService] Error deleting flujograma:', error);
      throw error;
    }
  }

  /**
   * Agregar relación de procesos
   */
  static async addRelacionProcesos(
    structureId: string,
    relacion: OrganizationalStructure['relaciones_procesos'][0]
  ): Promise<void> {
    try {
      const structure = await this.getById(structureId);
      if (!structure) {
        throw new Error('Estructura no encontrada');
      }

      const updatedRelaciones = [...structure.relaciones_procesos, relacion];

      await this.update(structureId, {
        relaciones_procesos: updatedRelaciones,
      });
    } catch (error) {
      console.error('[OrganizationalStructureService] Error adding relacion:', error);
      throw error;
    }
  }

  /**
   * Actualizar relación de procesos
   */
  static async updateRelacionProcesos(
    structureId: string,
    relacionId: string,
    relacionData: Partial<OrganizationalStructure['relaciones_procesos'][0]>
  ): Promise<void> {
    try {
      const structure = await this.getById(structureId);
      if (!structure) {
        throw new Error('Estructura no encontrada');
      }

      const updatedRelaciones = structure.relaciones_procesos.map(r =>
        r.relacion_id === relacionId ? { ...r, ...relacionData } : r
      );

      await this.update(structureId, {
        relaciones_procesos: updatedRelaciones,
      });
    } catch (error) {
      console.error('[OrganizationalStructureService] Error updating relacion:', error);
      throw error;
    }
  }

  /**
   * Eliminar relación de procesos
   */
  static async deleteRelacionProcesos(structureId: string, relacionId: string): Promise<void> {
    try {
      const structure = await this.getById(structureId);
      if (!structure) {
        throw new Error('Estructura no encontrada');
      }

      const updatedRelaciones = structure.relaciones_procesos.filter(
        r => r.relacion_id !== relacionId
      );

      await this.update(structureId, {
        relaciones_procesos: updatedRelaciones,
      });
    } catch (error) {
      console.error('[OrganizationalStructureService] Error deleting relacion:', error);
      throw error;
    }
  }

  /**
   * Actualizar mapa de procesos
   */
  static async updateMapaProcesos(
    structureId: string,
    mapaProcesos: OrganizationalStructure['mapa_procesos']
  ): Promise<void> {
    try {
      await this.update(structureId, {
        mapa_procesos: mapaProcesos,
      });
    } catch (error) {
      console.error('[OrganizationalStructureService] Error updating mapa procesos:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de versiones
   */
  static async getVersionHistory(): Promise<OrganizationalStructure[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('version', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as OrganizationalStructure[];
    } catch (error) {
      console.error('[OrganizationalStructureService] Error getting version history:', error);
      throw error;
    }
  }
}
