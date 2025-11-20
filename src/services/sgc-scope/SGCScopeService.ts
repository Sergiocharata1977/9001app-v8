import { db } from '@/firebase/config';
import type {
    CreateSGCScopeData,
    SGCScope,
    UpdateSGCScopeData,
} from '@/types/sgc-scope';
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
 * SGCScopeService
 * 
 * Servicio para gestionar el alcance del Sistema de Gestión de Calidad (Cláusula 4.3)
 * Mantiene versionado del alcance
 */
export class SGCScopeService {
  private static readonly COLLECTION_NAME = 'sgc_scope';

  /**
   * Obtener el alcance vigente actual
   */
  static async getCurrentScope(): Promise<SGCScope | null> {
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
      } as SGCScope;
    } catch (error) {
      console.error('[SGCScopeService] Error getting current scope:', error);
      throw error;
    }
  }

  /**
   * Obtener alcance por ID
   */
  static async getById(id: string): Promise<SGCScope | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as SGCScope;
    } catch (error) {
      console.error('[SGCScopeService] Error getting scope by ID:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo alcance del SGC
   */
  static async create(data: CreateSGCScopeData): Promise<string> {
    try {
      // Marcar alcance anterior como obsoleto
      const currentScope = await this.getCurrentScope();
      if (currentScope) {
        await this.markAsObsolete(currentScope.id);
      }

      const docRef = doc(collection(db, this.COLLECTION_NAME));
      const now = new Date().toISOString();

      // Determinar versión
      const version = currentScope ? currentScope.version + 1 : 1;

      await setDoc(docRef, {
        ...data,
        version,
        estado: 'vigente',
        created_at: now,
        updated_at: now,
      });

      return docRef.id;
    } catch (error) {
      console.error('[SGCScopeService] Error creating scope:', error);
      throw error;
    }
  }

  /**
   * Actualizar alcance existente
   */
  static async update(id: string, data: UpdateSGCScopeData): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const now = new Date().toISOString();

      await updateDoc(docRef, {
        ...data,
        updated_at: now,
      });
    } catch (error) {
      console.error('[SGCScopeService] Error updating scope:', error);
      throw error;
    }
  }

  /**
   * Marcar alcance como obsoleto
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
      console.error('[SGCScopeService] Error marking as obsolete:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de versiones del alcance
   */
  static async getVersionHistory(): Promise<SGCScope[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('version', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SGCScope[];
    } catch (error) {
      console.error('[SGCScopeService] Error getting version history:', error);
      throw error;
    }
  }

  /**
   * Obtener alcance para el prompt de IA
   */
  static async getScopeForAI(): Promise<string> {
    try {
      const scope = await this.getCurrentScope();

      if (!scope) {
        return 'No hay alcance del SGC definido.';
      }

      let prompt = `ALCANCE DEL SGC:\n`;
      prompt += `${scope.descripcion_alcance}\n\n`;
      
      prompt += `Límites: ${scope.limites_sgc}\n\n`;
      
      if (scope.productos_servicios_cubiertos.length > 0) {
        prompt += `Productos/Servicios cubiertos:\n`;
        scope.productos_servicios_cubiertos.forEach(ps => {
          prompt += `- ${ps.nombre} (${ps.tipo}): ${ps.descripcion}\n`;
        });
        prompt += `\n`;
      }

      if (scope.procesos_incluidos.length > 0) {
        prompt += `Procesos incluidos: ${scope.procesos_incluidos.length} procesos\n`;
      }

      if (scope.procesos_excluidos && scope.procesos_excluidos.length > 0) {
        prompt += `\nProcesos excluidos:\n`;
        scope.procesos_excluidos.forEach(pe => {
          prompt += `- ${pe.proceso_nombre}: ${pe.justificacion_exclusion}\n`;
        });
      }

      if (scope.requisitos_no_aplicables && scope.requisitos_no_aplicables.length > 0) {
        prompt += `\nRequisitos ISO 9001 no aplicables:\n`;
        scope.requisitos_no_aplicables.forEach(req => {
          prompt += `- ${req.clausula_iso} (${req.titulo_clausula}): ${req.justificacion}\n`;
        });
      }

      return prompt;
    } catch (error) {
      console.error('[SGCScopeService] Error getting scope for AI:', error);
      return 'Error al obtener alcance del SGC.';
    }
  }
}
