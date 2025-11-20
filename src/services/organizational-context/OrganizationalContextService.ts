import { db } from '@/firebase/config';
import type {
    CreateOrganizationalContextData,
    OrganizationalContext,
    UpdateOrganizationalContextData,
} from '@/types/organizational-context';
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
 * OrganizationalContextService
 * 
 * Servicio para gestionar el contexto organizacional (Cláusula 4.1)
 * Cuestiones externas e internas que afectan al SGC
 */
export class OrganizationalContextService {
  private static readonly COLLECTION_NAME = 'organizational_context';

  /**
   * Obtener el contexto vigente actual
   */
  static async getCurrent(): Promise<OrganizationalContext | null> {
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
      } as OrganizationalContext;
    } catch (error) {
      console.error('[OrganizationalContextService] Error getting current context:', error);
      throw error;
    }
  }

  /**
   * Obtener contexto por ID
   */
  static async getById(id: string): Promise<OrganizationalContext | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as OrganizationalContext;
    } catch (error) {
      console.error('[OrganizationalContextService] Error getting context by ID:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo contexto organizacional
   */
  static async create(data: CreateOrganizationalContextData): Promise<string> {
    try {
      // Marcar contexto anterior como obsoleto
      const currentContext = await this.getCurrent();
      if (currentContext) {
        await this.markAsObsolete(currentContext.id);
      }

      const docRef = doc(collection(db, this.COLLECTION_NAME));
      const now = new Date().toISOString();

      // Calcular próxima revisión
      const fechaAnalisis = new Date(data.fecha_analisis);
      let proximaRevision: Date;
      
      switch (data.frecuencia_revision) {
        case 'trimestral':
          proximaRevision = new Date(fechaAnalisis.setMonth(fechaAnalisis.getMonth() + 3));
          break;
        case 'semestral':
          proximaRevision = new Date(fechaAnalisis.setMonth(fechaAnalisis.getMonth() + 6));
          break;
        case 'anual':
          proximaRevision = new Date(fechaAnalisis.setFullYear(fechaAnalisis.getFullYear() + 1));
          break;
        default:
          // Por defecto, usar revisión anual
          proximaRevision = new Date(fechaAnalisis.setFullYear(fechaAnalisis.getFullYear() + 1));
          break;
      }

      await setDoc(docRef, {
        ...data,
        estado: 'vigente',
        proxima_revision: proximaRevision.toISOString(),
        created_at: now,
        updated_at: now,
      });

      return docRef.id;
    } catch (error) {
      console.error('[OrganizationalContextService] Error creating context:', error);
      throw error;
    }
  }

  /**
   * Actualizar contexto existente
   */
  static async update(id: string, data: UpdateOrganizationalContextData): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const now = new Date().toISOString();

      await updateDoc(docRef, {
        ...data,
        updated_at: now,
      });
    } catch (error) {
      console.error('[OrganizationalContextService] Error updating context:', error);
      throw error;
    }
  }

  /**
   * Marcar contexto como obsoleto
   */
  static async markAsObsolete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const now = new Date().toISOString();

      await updateDoc(docRef, {
        estado: 'obsoleto',
        updated_at: now,
      });
    } catch (error) {
      console.error('[OrganizationalContextService] Error marking as obsolete:', error);
      throw error;
    }
  }

  /**
   * Sincronizar con análisis FODA
   * Extrae cuestiones del FODA y las convierte en contexto organizacional
   */
  static async syncWithFODA(fodaId: string): Promise<void> {
    try {
      // TODO: Implementar cuando se extienda el FODA
      // Por ahora, solo guardamos la referencia
      const currentContext = await this.getCurrent();
      if (currentContext) {
        await this.update(currentContext.id, {
          analisis_foda_id: fodaId,
        });
      }
    } catch (error) {
      console.error('[OrganizationalContextService] Error syncing with FODA:', error);
      throw error;
    }
  }

  /**
   * Obtener contexto para el prompt de IA
   */
  static async getContextForAI(): Promise<string> {
    try {
      const context = await this.getCurrent();

      if (!context) {
        return 'No hay contexto organizacional definido.';
      }

      let prompt = `CONTEXTO ORGANIZACIONAL (Cláusula 4.1):\n\n`;
      
      if (context.cuestiones_externas.length > 0) {
        prompt += `Cuestiones Externas:\n`;
        context.cuestiones_externas.forEach(ce => {
          prompt += `- [${ce.tipo.toUpperCase()}] ${ce.descripcion} (Impacto: ${ce.impacto}, Nivel: ${ce.nivel_impacto})\n`;
        });
        prompt += `\n`;
      }

      if (context.cuestiones_internas.length > 0) {
        prompt += `Cuestiones Internas:\n`;
        context.cuestiones_internas.forEach(ci => {
          const indicador = ci.fortaleza_debilidad === 'fortaleza' ? '✓' : '⚠';
          prompt += `${indicador} [${ci.tipo.toUpperCase()}] ${ci.descripcion}\n`;
        });
        prompt += `\n`;
      }

      if (context.analisis_foda_id) {
        prompt += `Vinculado con Análisis FODA: ${context.analisis_foda_id}\n`;
      }

      return prompt;
    } catch (error) {
      console.error('[OrganizationalContextService] Error getting context for AI:', error);
      return 'Error al obtener contexto organizacional.';
    }
  }

  /**
   * Obtener historial de contextos
   */
  static async getHistory(): Promise<OrganizationalContext[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('fecha_analisis', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as OrganizationalContext[];
    } catch (error) {
      console.error('[OrganizationalContextService] Error getting history:', error);
      throw error;
    }
  }
}
