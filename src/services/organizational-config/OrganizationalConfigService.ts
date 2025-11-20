import { db } from '@/firebase/config';
import type {
    CreateOrganizationalConfigData,
    OrganizationalConfig,
    UpdateOrganizationalConfigData,
} from '@/types/organizational-config';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc
} from 'firebase/firestore';

/**
 * OrganizationalConfigService
 * 
 * Servicio para gestionar la configuración organizacional única (single-tenant)
 * Incluye identidad, misión, visión, valores y política de calidad
 */
export class OrganizationalConfigService {
  private static readonly COLLECTION_NAME = 'organizational_config';
  private static readonly MAIN_CONFIG_ID = 'org-config-main';

  /**
   * Obtener la configuración organizacional (siempre hay una sola)
   */
  static async getConfig(): Promise<OrganizationalConfig | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, this.MAIN_CONFIG_ID);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
      } as OrganizationalConfig;
    } catch (error) {
      console.error('[OrganizationalConfigService] Error getting config:', error);
      throw error;
    }
  }

  /**
   * Crear o actualizar la configuración organizacional
   */
  static async createOrUpdate(
    data: CreateOrganizationalConfigData
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, this.MAIN_CONFIG_ID);
      
      // Verificar si ya existe
      const existing = await getDoc(docRef);
      
      const now = new Date().toISOString();
      
      if (existing.exists()) {
        // Actualizar
        await updateDoc(docRef, {
          ...data,
          version: (existing.data().version || 0) + 1,
          fecha_actualizacion: now,
          updated_by: data.created_by,
        });
      } else {
        // Crear
        await setDoc(docRef, {
          ...data,
          version: 1,
          fecha_creacion: now,
          fecha_actualizacion: now,
          principios_sgc: data.principios_sgc || {
            orientacion_cliente: true,
            liderazgo: true,
            participacion_personal: true,
            enfoque_procesos: true,
            mejora_continua: true,
            gestion_relaciones: true,
            enfoque_riesgos: true,
            decisiones_evidencia: true,
          },
        });
      }
    } catch (error) {
      console.error('[OrganizationalConfigService] Error creating/updating config:', error);
      throw error;
    }
  }

  /**
   * Actualizar configuración existente
   */
  static async update(data: UpdateOrganizationalConfigData): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, this.MAIN_CONFIG_ID);
      
      const existing = await getDoc(docRef);
      if (!existing.exists()) {
        throw new Error('Configuración organizacional no existe. Debe crearla primero.');
      }

      const now = new Date().toISOString();
      
      await updateDoc(docRef, {
        ...data,
        version: (existing.data().version || 0) + 1,
        fecha_actualizacion: now,
      });
    } catch (error) {
      console.error('[OrganizationalConfigService] Error updating config:', error);
      throw error;
    }
  }

  /**
   * Obtener configuración para el prompt de IA
   * Retorna un string formateado para incluir en el prompt
   */
  static async getConfigForAI(): Promise<string> {
    try {
      const config = await this.getConfig();
      
      if (!config) {
        return 'No hay configuración organizacional definida.';
      }

      let prompt = `CONTEXTO ORGANIZACIONAL:\n`;
      prompt += `Organización: ${config.nombre_organizacion}\n`;
      prompt += `Sector: ${config.sector_industria}\n`;
      prompt += `Empleados: ${config.cantidad_empleados_total} (${config.cantidad_empleados_con_acceso} con acceso al sistema)\n\n`;
      
      prompt += `MISIÓN:\n${config.mision}\n\n`;
      prompt += `VISIÓN:\n${config.vision}\n\n`;
      
      prompt += `VALORES:\n`;
      config.valores.forEach(v => {
        prompt += `- ${v.nombre}: ${v.descripcion}\n`;
      });
      prompt += `\n`;
      
      prompt += `POLÍTICA DE CALIDAD:\n${config.politica_calidad.declaracion}\n`;
      if (config.politica_calidad.compromisos.length > 0) {
        prompt += `Compromisos:\n`;
        config.politica_calidad.compromisos.forEach(c => {
          prompt += `- ${c}\n`;
        });
      }

      return prompt;
    } catch (error) {
      console.error('[OrganizationalConfigService] Error getting config for AI:', error);
      return 'Error al obtener configuración organizacional.';
    }
  }

  /**
   * Verificar si existe configuración
   */
  static async exists(): Promise<boolean> {
    try {
      const config = await this.getConfig();
      return config !== null;
    } catch (error) {
      console.error('[OrganizationalConfigService] Error checking existence:', error);
      return false;
    }
  }

  /**
   * Obtener versión actual
   */
  static async getCurrentVersion(): Promise<number> {
    try {
      const config = await this.getConfig();
      return config?.version || 0;
    } catch (error) {
      console.error('[OrganizationalConfigService] Error getting version:', error);
      return 0;
    }
  }
}
