import { db } from '@/lib/firebase';
import type {
  AuditExecutionData,
  AuditFirestore,
  AuditFormData,
  AuditStatus,
} from '@/types/audits';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

export class AuditService {
  private static COLLECTION = 'audits';

  // Crear auditoría (estado: planned)
  static async create(data: AuditFormData): Promise<string> {
    try {
      console.log('AuditService.create - Input data:', data);

      const auditData = {
        title: data.title,
        description: data.description || '',
        plannedDate: Timestamp.fromDate(data.plannedDate),
        leadAuditor: data.leadAuditor,
        status: 'planned' as AuditStatus,
        processes: [],
        normPointCodes: [],
        findings: '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      console.log('AuditService.create - Firestore data:', auditData);
      console.log('AuditService.create - Collection:', this.COLLECTION);

      const collectionRef = collection(db, this.COLLECTION);
      console.log('AuditService.create - Collection ref created');

      const docRef = await addDoc(collectionRef, auditData);
      console.log('AuditService.create - Document created with ID:', docRef.id);

      return docRef.id;
    } catch (error) {
      console.error('AuditService.create - Error:', error);
      throw error;
    }
  }

  // Obtener auditoría por ID
  static async getById(id: string): Promise<AuditFirestore | null> {
    const docRef = doc(db, this.COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as AuditFirestore;
  }

  // Listar todas las auditorías
  static async getAll(): Promise<AuditFirestore[]> {
    const q = query(
      collection(db, this.COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AuditFirestore[];
  }

  // Actualizar información de planificación
  static async update(id: string, data: Partial<AuditFormData>): Promise<void> {
    const docRef = doc(db, this.COLLECTION, id);
    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    if (data.plannedDate) {
      updateData.plannedDate = Timestamp.fromDate(data.plannedDate);
    }

    await updateDoc(docRef, updateData);
  }

  // Cambiar estado
  static async updateStatus(id: string, status: AuditStatus): Promise<void> {
    const docRef = doc(db, this.COLLECTION, id);
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  }

  // Actualizar ejecución (procesos, puntos de norma, hallazgos)
  static async updateExecution(
    id: string,
    data: AuditExecutionData
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION, id);
    await updateDoc(docRef, {
      processes: data.processes,
      normPointCodes: data.normPointCodes,
      findings: data.findings,
      updatedAt: Timestamp.now(),
    });
  }

  // Eliminar auditoría
  static async delete(id: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, id);
    await deleteDoc(docRef);
  }

  // Obtener auditorías por estado
  static async getByStatus(status: AuditStatus): Promise<AuditFirestore[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AuditFirestore[];
  }
}
