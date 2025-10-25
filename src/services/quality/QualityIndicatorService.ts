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
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { QualityIndicator, QualityIndicatorFormData } from '@/types/quality';

const COLLECTION_NAME = 'qualityIndicators';

export class QualityIndicatorService {
  static async getAll(): Promise<QualityIndicator[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate()?.toISOString() || new Date().toISOString(),
        updated_at: doc.data().updated_at?.toDate()?.toISOString() || new Date().toISOString(),
        last_measurement_date: doc.data().last_measurement_date?.toDate()?.toISOString(),
      })) as QualityIndicator[];
    } catch (error) {
      console.error('Error getting quality indicators:', error);
      throw new Error('Error al obtener indicadores de calidad');
    }
  }

  static async getById(id: string): Promise<QualityIndicator | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          created_at: docSnap.data().created_at?.toDate()?.toISOString() || new Date().toISOString(),
          updated_at: docSnap.data().updated_at?.toDate()?.toISOString() || new Date().toISOString(),
          last_measurement_date: docSnap.data().last_measurement_date?.toDate()?.toISOString(),
        } as QualityIndicator;
      }
      return null;
    } catch (error) {
      console.error('Error getting quality indicator:', error);
      throw new Error('Error al obtener indicador de calidad');
    }
  }

  static async getByProcess(processId: string): Promise<QualityIndicator[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('process_definition_id', '==', processId),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate()?.toISOString() || new Date().toISOString(),
        updated_at: doc.data().updated_at?.toDate()?.toISOString() || new Date().toISOString(),
        last_measurement_date: doc.data().last_measurement_date?.toDate()?.toISOString(),
      })) as QualityIndicator[];
    } catch (error) {
      console.error('Error getting quality indicators by process:', error);
      throw new Error('Error al obtener indicadores de calidad por proceso');
    }
  }

  static async getByObjective(objectiveId: string): Promise<QualityIndicator[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('objective_id', '==', objectiveId),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate()?.toISOString() || new Date().toISOString(),
        updated_at: doc.data().updated_at?.toDate()?.toISOString() || new Date().toISOString(),
        last_measurement_date: doc.data().last_measurement_date?.toDate()?.toISOString(),
      })) as QualityIndicator[];
    } catch (error) {
      console.error('Error getting quality indicators by objective:', error);
      throw new Error('Error al obtener indicadores de calidad por objetivo');
    }
  }

  static async create(data: QualityIndicatorFormData): Promise<QualityIndicator> {
    try {
      const now = Timestamp.now();
      const docData = {
        ...data,
        status: 'activo' as const,
        trend: 'estable' as const,
        is_active: true,
        organization_id: 'default', // TODO: Get from context
        created_by: 'system', // TODO: Get from auth
        created_at: now,
        updated_at: now,
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);

      return {
        id: docRef.id,
        ...docData,
        created_at: now.toDate().toISOString(),
        updated_at: now.toDate().toISOString(),
      } as QualityIndicator;
    } catch (error) {
      console.error('Error creating quality indicator:', error);
      throw new Error('Error al crear indicador de calidad');
    }
  }

  static async update(id: string, data: Partial<QualityIndicatorFormData>): Promise<QualityIndicator> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData = {
        ...data,
        updated_at: Timestamp.now(),
        updated_by: 'system', // TODO: Get from auth
      };

      await updateDoc(docRef, updateData);

      const updated = await this.getById(id);
      if (!updated) {
        throw new Error('Indicador de calidad no encontrado después de actualizar');
      }

      return updated;
    } catch (error) {
      console.error('Error updating quality indicator:', error);
      throw new Error('Error al actualizar indicador de calidad');
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        is_active: false,
        status: 'inactivo',
        updated_at: Timestamp.now(),
        updated_by: 'system', // TODO: Get from auth
      });
      // Note: Soft delete instead of hard delete
    } catch (error) {
      console.error('Error deleting quality indicator:', error);
      throw new Error('Error al eliminar indicador de calidad');
    }
  }

  static async calculateTrend(indicatorId: string): Promise<string> {
    try {
      // Get last 5 measurements to calculate trend
      const measurementsRef = collection(db, 'measurements');
      const q = query(
        measurementsRef,
        where('indicator_id', '==', indicatorId),
        orderBy('measurement_date', 'desc'),
        limit(5)
      );

      const measurements = await getDocs(q);
      const values = measurements.docs
        .map(doc => doc.data().value)
        .filter(val => typeof val === 'number')
        .reverse(); // Oldest first

      if (values.length < 2) {
        return 'estable';
      }

      const recent = values.slice(-3); // Last 3 values
      const older = values.slice(0, -3); // Previous values

      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;

      const change = ((recentAvg - olderAvg) / Math.abs(olderAvg)) * 100;

      if (change > 5) return 'ascendente';
      if (change < -5) return 'descendente';
      return 'estable';
    } catch (error) {
      console.error('Error calculating trend:', error);
      return 'estable';
    }
  }

  static async updateTrend(id: string): Promise<QualityIndicator> {
    try {
      const trend = await this.calculateTrend(id);
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        trend,
        updated_at: Timestamp.now(),
        updated_by: 'system', // TODO: Get from auth
      });

      const updated = await this.getById(id);
      return updated!;
    } catch (error) {
      console.error('Error updating trend:', error);
      throw new Error('Error al actualizar tendencia del indicador');
    }
  }

  static async updateCurrentValue(id: string, value: number): Promise<QualityIndicator> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        current_value: value,
        last_measurement_date: Timestamp.now(),
        updated_at: Timestamp.now(),
        updated_by: 'system', // TODO: Get from auth
      });

      const updated = await this.getById(id);
      await this.updateTrend(id); // Update trend after value change

      return updated!;
    } catch (error) {
      console.error('Error updating current value:', error);
      throw new Error('Error al actualizar valor actual del indicador');
    }
  }
}