// Service for aggregating complete user context for IA

import { UserContext, UserContextLight } from '@/types/context';
import { User } from '@/types/auth';
import { Personnel, Position, Department } from '@/types/rrhh';
import { ProcessDefinition, ProcessRecord } from '@/types/procesos';
import { QualityObjective, QualityIndicator } from '@/types/quality';
import { UserService } from '../auth/UserService';
import { PersonnelService } from '../rrhh/PersonnelService';
import { PositionService } from '../rrhh/PositionService';
import { DepartmentService } from '../rrhh/DepartmentService';
import { ProcessService } from '../procesos/ProcessService';
import { ProcessRecordService } from '../procesos/ProcessRecordService';
import { QualityObjectiveService } from '../quality/QualityObjectiveService';
import { QualityIndicatorService } from '../quality/QualityIndicatorService';

// Cache for user contexts (5 minute TTL)
interface CacheEntry {
  context: UserContext;
  timestamp: number;
}

const contextCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class UserContextService {
  /**
   * Get complete user context in one call
   * Includes user, personnel, position, department, processes, objectives, indicators
   * @param userId Firebase Auth UID
   * @returns Complete user context
   */
  static async getUserFullContext(userId: string): Promise<UserContext> {
    try {
      // Check cache first
      const cached = contextCache.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        console.log('[UserContextService] Cache hit for user:', userId);
        return cached.context;
      }

      console.log('[UserContextService] Fetching fresh context for user:', userId);
      const startTime = Date.now();

      // Fetch user
      const user = await this.fetchUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Si no tiene personnel asignado, retornar contexto básico
      if (!user.personnel_id) {
        const context: UserContext = {
          user,
          personnel: null,
          position: null,
          department: null,
          procesos: [],
          objetivos: [],
          indicadores: [],
          supervisor: undefined,
          processRecords: []
        };

        // Update cache
        contextCache.set(userId, {
          context,
          timestamp: Date.now()
        });

        return context;
      }

      const personnel = await this.fetchPersonnel(user.personnel_id);
      if (!personnel) {
        // Si no encuentra personnel, retornar contexto básico
        const context: UserContext = {
          user,
          personnel: null,
          position: null,
          department: null,
          procesos: [],
          objetivos: [],
          indicadores: [],
          supervisor: undefined,
          processRecords: []
        };

        contextCache.set(userId, {
          context,
          timestamp: Date.now()
        });

        return context;
      }

      // Fetch all related data in parallel
      const [
        position,
        department,
        procesos,
        objetivos,
        indicadores,
        supervisor,
        processRecords
      ] = await Promise.all([
        personnel.puesto ? this.fetchPosition(personnel.puesto) : Promise.resolve(null),
        personnel.departamento ? this.fetchDepartment(personnel.departamento) : Promise.resolve(null),
        this.fetchProcesses(personnel.procesos_asignados || []),
        this.fetchObjectives(personnel.objetivos_asignados || []),
        this.fetchIndicators(personnel.indicadores_asignados || []),
        personnel.supervisor_id ? this.fetchPersonnel(personnel.supervisor_id) : Promise.resolve(undefined),
        this.fetchProcessRecords(personnel.procesos_asignados || [])
      ]);

      const context: UserContext = {
        user,
        personnel,
        position,
        department,
        procesos,
        objetivos,
        indicadores,
        supervisor,
        processRecords
      };

      // Update cache
      contextCache.set(userId, {
        context,
        timestamp: Date.now()
      });

      const duration = Date.now() - startTime;
      console.log(`[UserContextService] Context fetched in ${duration}ms`);

      if (duration > 2000) {
        console.warn('[UserContextService] Context fetch took longer than 2 seconds');
      }

      return context;
    } catch (error) {
      console.error('[UserContextService] Error getting full context:', error);
      throw error;
    }
  }

  /**
   * Get lightweight context (without assignments)
   * @param userId Firebase Auth UID
   * @returns Light user context
   */
  static async getUserContextLight(userId: string): Promise<UserContextLight> {
    try {
      const user = await this.fetchUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Si no tiene personnel asignado, retornar solo el usuario
      if (!user.personnel_id) {
        return {
          user,
          personnel: null,
          position: null,
          department: null
        };
      }

      const personnel = await this.fetchPersonnel(user.personnel_id);
      if (!personnel) {
        return {
          user,
          personnel: null,
          position: null,
          department: null
        };
      }

      const [position, department] = await Promise.all([
        personnel.puesto ? this.fetchPosition(personnel.puesto) : Promise.resolve(null),
        personnel.departamento ? this.fetchDepartment(personnel.departamento) : Promise.resolve(null)
      ]);

      return {
        user,
        personnel,
        position,
        department
      };
    } catch (error) {
      console.error('[UserContextService] Error getting light context:', error);
      throw error;
    }
  }

  /**
   * Refresh context (invalidate cache and fetch fresh)
   * @param userId Firebase Auth UID
   * @returns Fresh user context
   */
  static async refreshContext(userId: string): Promise<UserContext> {
    this.invalidateCache(userId);
    return this.getUserFullContext(userId);
  }

  /**
   * Invalidate cache for a user
   * @param userId Firebase Auth UID
   */
  static invalidateCache(userId: string): void {
    contextCache.delete(userId);
  }

  /**
   * Clear all cache
   */
  static clearCache(): void {
    contextCache.clear();
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private static async fetchUser(userId: string): Promise<User> {
    const user = await UserService.getById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    return user;
  }

  private static async fetchPersonnel(personnelId: string): Promise<Personnel> {
    const personnel = await PersonnelService.getById(personnelId);
    if (!personnel) {
      throw new Error(`Personnel not found: ${personnelId}`);
    }
    return personnel;
  }

  private static async fetchPosition(positionId: string): Promise<Position | null> {
    try {
      return await PositionService.getById(positionId);
    } catch (error) {
      console.warn(`[UserContextService] Position not found: ${positionId}`);
      return null;
    }
  }

  private static async fetchDepartment(departmentId: string): Promise<Department | null> {
    try {
      return await DepartmentService.getById(departmentId);
    } catch (error) {
      console.warn(`[UserContextService] Department not found: ${departmentId}`);
      return null;
    }
  }

  private static async fetchProcesses(processIds: string[]): Promise<ProcessDefinition[]> {
    if (!processIds || processIds.length === 0) {
      return [];
    }

    try {
      const processes = await Promise.all(
        processIds.map(id => ProcessService.getById(id))
      );
      return processes.filter(p => p !== null) as ProcessDefinition[];
    } catch (error) {
      console.warn('[UserContextService] Error fetching processes:', error);
      return [];
    }
  }

  private static async fetchObjectives(objectiveIds: string[]): Promise<QualityObjective[]> {
    if (!objectiveIds || objectiveIds.length === 0) {
      return [];
    }

    try {
      const objectives = await Promise.all(
        objectiveIds.map(id => QualityObjectiveService.getById(id))
      );
      return objectives.filter(o => o !== null) as QualityObjective[];
    } catch (error) {
      console.warn('[UserContextService] Error fetching objectives:', error);
      return [];
    }
  }

  private static async fetchIndicators(indicatorIds: string[]): Promise<QualityIndicator[]> {
    if (!indicatorIds || indicatorIds.length === 0) {
      return [];
    }

    try {
      const indicators = await Promise.all(
        indicatorIds.map(id => QualityIndicatorService.getById(id))
      );
      return indicators.filter(i => i !== null) as QualityIndicator[];
    } catch (error) {
      console.warn('[UserContextService] Error fetching indicators:', error);
      return [];
    }
  }

  private static async fetchProcessRecords(processIds: string[]): Promise<ProcessRecord[]> {
    if (!processIds || processIds.length === 0) {
      return [];
    }

    try {
      // Fetch records for all assigned processes
      const recordsArrays = await Promise.all(
        processIds.map(processId => ProcessRecordService.getByProcessId(processId))
      );
      
      // Flatten arrays and return
      return recordsArrays.flat();
    } catch (error) {
      console.warn('[UserContextService] Error fetching process records:', error);
      return [];
    }
  }
}
