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
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import {
  Document,
  DocumentFilters,
  PaginationParams,
  PaginatedResponse,
  DocumentFormData,
  DocumentCreateData,
  DocumentType,
  DocumentStatus,
  DocumentStats,
  DocumentVersion,
} from '@/types/documents';

const COLLECTION_NAME = 'documents';

export class DocumentService {
  // ============================================
  // CRUD OPERATIONS
  // ============================================

  static async getAll(): Promise<Document[]> {
    try {
      // Por defecto, no mostrar documentos archivados
      const q = query(
        collection(db, COLLECTION_NAME),
        where('is_archived', '==', false)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        effective_date: doc.data().effective_date?.toDate(),
        review_date: doc.data().review_date?.toDate(),
        approved_at: doc.data().approved_at?.toDate(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Document[];
    } catch (error) {
      console.error('Error getting documents:', error);
      throw new Error('Error al obtener documentos');
    }
  }

  static async getById(id: string): Promise<Document | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          effective_date: docSnap.data().effective_date?.toDate(),
          review_date: docSnap.data().review_date?.toDate(),
          approved_at: docSnap.data().approved_at?.toDate(),
          created_at: docSnap.data().created_at?.toDate() || new Date(),
          updated_at: docSnap.data().updated_at?.toDate() || new Date(),
        } as Document;
      }
      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw new Error('Error al obtener documento');
    }
  }


  static async getPaginated(
    filters: DocumentFilters = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<Document>> {
    try {
      let q = query(collection(db, COLLECTION_NAME));

      // Por defecto, excluir archivados a menos que se especifique explícitamente
      if (filters.is_archived !== undefined) {
        q = query(q, where('is_archived', '==', filters.is_archived));
      } else {
        q = query(q, where('is_archived', '==', false));
      }

      // Apply filters
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }

      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.responsible_user_id) {
        q = query(q, where('responsible_user_id', '==', filters.responsible_user_id));
      }

      if (filters.process_id) {
        q = query(q, where('process_id', '==', filters.process_id));
      }

      // Apply sorting
      const sortField = pagination.sort || 'created_at';
      const sortOrder = pagination.order === 'asc' ? 'asc' : 'desc';
      q = query(q, orderBy(sortField, sortOrder));

      // Get all docs for pagination
      const querySnapshot = await getDocs(q);
      const total = querySnapshot.size;

      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit;
      const docs = querySnapshot.docs.slice(offset, offset + pagination.limit);

      const data = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        effective_date: doc.data().effective_date?.toDate(),
        review_date: doc.data().review_date?.toDate(),
        approved_at: doc.data().approved_at?.toDate(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Document[];

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
    } catch (error) {
      console.error('Error getting paginated documents:', error);
      throw new Error('Error al obtener documentos paginados');
    }
  }

  static async create(data: DocumentCreateData): Promise<Document> {
    try {
      const now = Timestamp.now();
      
      // Generate code
      const code = await this.generateCode(data.type);

      const docData = {
        ...data,
        code,
        download_count: 0,
        is_archived: false,
        effective_date: data.effective_date ? Timestamp.fromDate(data.effective_date) : null,
        review_date: data.review_date ? Timestamp.fromDate(data.review_date) : null,
        approved_at: data.approved_at ? Timestamp.fromDate(data.approved_at) : null,
        created_at: now,
        updated_at: now,
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);

      return {
        id: docRef.id,
        ...data,
        code,
        download_count: 0,
        is_archived: false,
        created_at: now.toDate(),
        updated_at: now.toDate(),
      };
    } catch (error) {
      console.error('Error creating document:', error);
      throw new Error('Error al crear documento');
    }
  }

  static async update(
    id: string,
    data: Partial<DocumentFormData>
  ): Promise<Document> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      // Build update object with proper types
      const updateData: Record<string, Timestamp | string | number | boolean | string[] | null> = {
        updated_at: Timestamp.now(),
      };

      // Copy non-date fields
      Object.keys(data).forEach((key) => {
        const value = (data as Record<string, unknown>)[key];
        if (value !== undefined && key !== 'effective_date' && key !== 'review_date' && key !== 'approved_at') {
          updateData[key] = value as string | number | boolean | string[] | null;
        }
      });

      // Convert dates
      if (data.effective_date) {
        updateData.effective_date = Timestamp.fromDate(data.effective_date);
      }
      if (data.review_date) {
        updateData.review_date = Timestamp.fromDate(data.review_date);
      }
      if (data.approved_at) {
        updateData.approved_at = Timestamp.fromDate(data.approved_at);
      }

      await updateDoc(docRef, updateData);

      const updated = await this.getById(id);
      if (!updated) {
        throw new Error('Documento no encontrado después de actualizar');
      }

      return updated;
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Error al actualizar documento');
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Error al eliminar documento');
    }
  }

  static async archive(id: string): Promise<Document> {
    try {
      console.log('[Service] Archivando documento:', id);
      
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        is_archived: true,
        updated_at: Timestamp.now(),
      });
      
      console.log('[Service] Documento marcado como archivado');
      
      const updated = await this.getById(id);
      if (!updated) {
        throw new Error('Documento no encontrado después de archivar');
      }
      
      console.log('[Service] Documento archivado exitosamente:', updated.id);
      return updated;
    } catch (error) {
      console.error('[Service] Error archiving document:', error);
      if (error instanceof Error) {
        console.error('[Service] Error message:', error.message);
        throw error;
      }
      throw new Error('Error al archivar documento');
    }
  }


  // ============================================
  // STATUS MANAGEMENT
  // ============================================

  static async changeStatus(
    id: string,
    newStatus: DocumentStatus,
    userId: string
  ): Promise<Document> {
    try {
      const document = await this.getById(id);
      if (!document) {
        throw new Error('Documento no encontrado');
      }

      // Validate status transition
      this.validateStatusTransition(document.status, newStatus);

      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status: newStatus,
        updated_by: userId,
        updated_at: Timestamp.now(),
      });

      const updated = await this.getById(id);
      if (!updated) {
        throw new Error('Documento no encontrado después de actualizar');
      }

      return updated;
    } catch (error) {
      console.error('Error changing document status:', error);
      throw error;
    }
  }

  static async approve(id: string, userId: string): Promise<Document> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status: 'aprobado',
        approved_by: userId,
        approved_at: Timestamp.now(),
        updated_by: userId,
        updated_at: Timestamp.now(),
      });

      const updated = await this.getById(id);
      if (!updated) {
        throw new Error('Documento no encontrado después de aprobar');
      }

      return updated;
    } catch (error) {
      console.error('Error approving document:', error);
      throw new Error('Error al aprobar documento');
    }
  }

  static async publish(id: string, effectiveDate: Date): Promise<Document> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status: 'publicado',
        effective_date: Timestamp.fromDate(effectiveDate),
        updated_at: Timestamp.now(),
      });

      const updated = await this.getById(id);
      if (!updated) {
        throw new Error('Documento no encontrado después de publicar');
      }

      return updated;
    } catch (error) {
      console.error('Error publishing document:', error);
      throw new Error('Error al publicar documento');
    }
  }

  static async markObsolete(id: string): Promise<Document> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status: 'obsoleto',
        updated_at: Timestamp.now(),
      });

      const updated = await this.getById(id);
      if (!updated) {
        throw new Error('Documento no encontrado después de marcar obsoleto');
      }

      return updated;
    } catch (error) {
      console.error('Error marking document obsolete:', error);
      throw new Error('Error al marcar documento como obsoleto');
    }
  }

  private static validateStatusTransition(
    currentStatus: DocumentStatus,
    newStatus: DocumentStatus
  ): void {
    const validTransitions: Record<DocumentStatus, DocumentStatus[]> = {
      borrador: ['en_revision'],
      en_revision: ['borrador', 'aprobado'],
      aprobado: ['en_revision', 'publicado'],
      publicado: ['obsoleto'],
      obsoleto: [],
    };

    const allowed = validTransitions[currentStatus];
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Transición de estado inválida: ${currentStatus} → ${newStatus}`
      );
    }
  }

  // ============================================
  // VERSION MANAGEMENT
  // ============================================

  static async createVersion(
    id: string,
    changeReason: string,
    userId: string
  ): Promise<Document> {
    try {
      const document = await this.getById(id);
      if (!document) {
        throw new Error('Documento no encontrado');
      }

      // Save current version to history
      const versionData = {
        document_id: id,
        version: document.version,
        change_reason: changeReason,
        changed_by: userId,
        changed_at: Timestamp.now(),
        snapshot: {
          ...document,
          created_at: undefined,
          updated_at: undefined,
        },
      };

      await addDoc(collection(db, 'documentVersions'), versionData);

      // Increment version
      const [major, minor] = document.version.split('.').map(Number);
      const newVersion = `${major}.${minor + 1}`;

      // Update document
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        version: newVersion,
        updated_by: userId,
        updated_at: Timestamp.now(),
      });

      const updated = await this.getById(id);
      if (!updated) {
        throw new Error('Documento no encontrado después de crear versión');
      }

      return updated;
    } catch (error) {
      console.error('Error creating document version:', error);
      throw new Error('Error al crear versión del documento');
    }
  }

  static async getVersionHistory(documentId: string): Promise<DocumentVersion[]> {
    try {
      const q = query(
        collection(db, 'documentVersions'),
        where('document_id', '==', documentId),
        orderBy('changed_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        document_id: doc.data().document_id,
        version: doc.data().version,
        change_reason: doc.data().change_reason,
        changed_by: doc.data().changed_by,
        changed_at: doc.data().changed_at?.toDate() || new Date(),
        snapshot: doc.data().snapshot || {},
      })) as DocumentVersion[];
    } catch (error) {
      console.error('Error getting version history:', error);
      throw new Error('Error al obtener historial de versiones');
    }
  }

  static async getVersion(versionId: string): Promise<DocumentVersion | null> {
    try {
      const docRef = doc(db, 'documentVersions', versionId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          document_id: docSnap.data().document_id,
          version: docSnap.data().version,
          change_reason: docSnap.data().change_reason,
          changed_by: docSnap.data().changed_by,
          changed_at: docSnap.data().changed_at?.toDate() || new Date(),
          snapshot: docSnap.data().snapshot || {},
        } as DocumentVersion;
      }
      return null;
    } catch (error) {
      console.error('Error getting version:', error);
      throw new Error('Error al obtener versión');
    }
  }

  static async restoreVersion(
    documentId: string,
    versionId: string,
    userId: string
  ): Promise<Document> {
    try {
      const version = await this.getVersion(versionId);
      if (!version || !version.snapshot) {
        throw new Error('Versión no encontrada');
      }

      // Create new version with current state before restoring
      await this.createVersion(
        documentId,
        `Restauración desde versión ${version.version}`,
        userId
      );

      // Restore from snapshot
      const docRef = doc(db, COLLECTION_NAME, documentId);
      const snapshot = version.snapshot as Partial<Document>;
      
      const restoreData: Record<string, Timestamp | string | number | boolean | string[] | Date | null> = {
        ...snapshot,
        updated_by: userId,
        updated_at: Timestamp.now(),
      };

      // Remove undefined values
      Object.keys(restoreData).forEach((key) => {
        if (restoreData[key] === undefined) {
          delete restoreData[key];
        }
      });

      await updateDoc(docRef, restoreData);

      const updated = await this.getById(documentId);
      if (!updated) {
        throw new Error('Documento no encontrado después de restaurar');
      }

      return updated;
    } catch (error) {
      console.error('Error restoring version:', error);
      throw new Error('Error al restaurar versión');
    }
  }

  // ============================================
  // FILE MANAGEMENT
  // ============================================

  static async uploadFile(documentId: string, file: File): Promise<string> {
    try {
      console.log('[Service] Iniciando upload de archivo:', {
        documentId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif',
      ];

      if (!allowedTypes.includes(file.type)) {
        console.error('[Service] Tipo de archivo no permitido:', file.type);
        throw new Error('Tipo de archivo no permitido');
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        console.error('[Service] Archivo excede tamaño máximo:', file.size);
        throw new Error('El archivo excede el tamaño máximo de 10MB');
      }

      console.log('[Service] Validaciones pasadas, importando Firebase Storage...');

      // Upload to Firebase Storage
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('@/firebase/config');
      
      console.log('[Service] Firebase Storage importado, creando referencia...');
      
      const fileName = `documents/${documentId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      console.log('[Service] Subiendo archivo a Storage:', fileName);
      await uploadBytes(storageRef, file);
      
      console.log('[Service] Archivo subido, obteniendo URL de descarga...');
      const downloadURL = await getDownloadURL(storageRef);
      
      console.log('[Service] URL obtenida, actualizando documento en Firestore...');

      // Update document with file info
      const docRef = doc(db, COLLECTION_NAME, documentId);
      await updateDoc(docRef, {
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type,
        updated_at: Timestamp.now(),
      });

      console.log('[Service] Documento actualizado exitosamente');
      return downloadURL;
    } catch (error) {
      console.error('[Service] Error completo al subir archivo:', error);
      if (error instanceof Error) {
        console.error('[Service] Error message:', error.message);
        console.error('[Service] Error stack:', error.stack);
      }
      throw error;
    }
  }

  static async downloadFile(documentId: string, userId: string): Promise<string> {
    try {
      const document = await this.getById(documentId);
      if (!document || !document.file_path) {
        throw new Error('Archivo no encontrado');
      }

      // Increment download count
      const docRef = doc(db, COLLECTION_NAME, documentId);
      await updateDoc(docRef, {
        download_count: document.download_count + 1,
      });

      // Get download URL
      const { ref, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('@/firebase/config');
      
      const storageRef = ref(storage, document.file_path);
      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Error al descargar archivo');
    }
  }

  static async deleteFile(documentId: string): Promise<void> {
    try {
      const document = await this.getById(documentId);
      if (!document || !document.file_path) {
        return;
      }

      // Delete from Storage
      const { ref, deleteObject } = await import('firebase/storage');
      const { storage } = await import('@/firebase/config');
      
      const storageRef = ref(storage, document.file_path);
      await deleteObject(storageRef);

      // Update document
      const docRef = doc(db, COLLECTION_NAME, documentId);
      await updateDoc(docRef, {
        file_path: null,
        file_size: null,
        mime_type: null,
        updated_at: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Error al eliminar archivo');
    }
  }

  // ============================================
  // SEARCH AND FILTER
  // ============================================

  static async search(searchTerm: string): Promise<Document[]> {
    try {
      const allDocs = await this.getAll();
      const term = searchTerm.toLowerCase();

      return allDocs.filter(
        (doc) =>
          doc.title.toLowerCase().includes(term) ||
          doc.description?.toLowerCase().includes(term) ||
          doc.code.toLowerCase().includes(term) ||
          doc.keywords?.some((k) => k.toLowerCase().includes(term))
      );
    } catch (error) {
      console.error('Error searching documents:', error);
      throw new Error('Error al buscar documentos');
    }
  }

  static async getByType(type: DocumentType): Promise<Document[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('type', '==', type));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        effective_date: doc.data().effective_date?.toDate(),
        review_date: doc.data().review_date?.toDate(),
        approved_at: doc.data().approved_at?.toDate(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Document[];
    } catch (error) {
      console.error('Error getting documents by type:', error);
      throw new Error('Error al obtener documentos por tipo');
    }
  }

  static async getByStatus(status: DocumentStatus): Promise<Document[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('status', '==', status));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        effective_date: doc.data().effective_date?.toDate(),
        review_date: doc.data().review_date?.toDate(),
        approved_at: doc.data().approved_at?.toDate(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Document[];
    } catch (error) {
      console.error('Error getting documents by status:', error);
      throw new Error('Error al obtener documentos por estado');
    }
  }

  static async getByProcess(processId: string): Promise<Document[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('process_id', '==', processId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        effective_date: doc.data().effective_date?.toDate(),
        review_date: doc.data().review_date?.toDate(),
        approved_at: doc.data().approved_at?.toDate(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Document[];
    } catch (error) {
      console.error('Error getting documents by process:', error);
      throw new Error('Error al obtener documentos por proceso');
    }
  }

  static async getByNormPoint(normPointId: string): Promise<Document[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('norm_point_ids', 'array-contains', normPointId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        effective_date: doc.data().effective_date?.toDate(),
        review_date: doc.data().review_date?.toDate(),
        approved_at: doc.data().approved_at?.toDate(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Document[];
    } catch (error) {
      console.error('Error getting documents by norm point:', error);
      throw new Error('Error al obtener documentos por punto de norma');
    }
  }


  // ============================================
  // STATISTICS
  // ============================================

  static async getStats(): Promise<DocumentStats> {
    try {
      const allDocs = await this.getAll();
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const by_status: Record<DocumentStatus, number> = {
        borrador: 0,
        en_revision: 0,
        aprobado: 0,
        publicado: 0,
        obsoleto: 0,
      };

      const by_type: Record<DocumentType, number> = {
        manual: 0,
        procedimiento: 0,
        instruccion: 0,
        formato: 0,
        registro: 0,
        politica: 0,
        otro: 0,
      };

      let expiring_soon = 0;
      let expired = 0;

      allDocs.forEach((doc) => {
        by_status[doc.status]++;
        by_type[doc.type]++;

        if (doc.review_date) {
          if (doc.review_date < now) {
            expired++;
          } else if (doc.review_date < thirtyDaysFromNow) {
            expiring_soon++;
          }
        }
      });

      // Most downloaded
      const most_downloaded = [...allDocs]
        .sort((a, b) => b.download_count - a.download_count)
        .slice(0, 10);

      // Recent
      const recent = [...allDocs]
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .slice(0, 10);

      return {
        total: allDocs.length,
        by_status,
        by_type,
        expiring_soon,
        expired,
        most_downloaded,
        recent,
      };
    } catch (error) {
      console.error('Error getting document stats:', error);
      throw new Error('Error al obtener estadísticas de documentos');
    }
  }

  static async getExpiringSoon(days: number = 30): Promise<Document[]> {
    try {
      const allDocs = await this.getAll();
      const now = new Date();
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      return allDocs.filter(
        (doc) =>
          doc.review_date &&
          doc.review_date > now &&
          doc.review_date <= futureDate
      );
    } catch (error) {
      console.error('Error getting expiring documents:', error);
      throw new Error('Error al obtener documentos próximos a vencer');
    }
  }

  static async getExpired(): Promise<Document[]> {
    try {
      const allDocs = await this.getAll();
      const now = new Date();

      return allDocs.filter((doc) => doc.review_date && doc.review_date < now);
    } catch (error) {
      console.error('Error getting expired documents:', error);
      throw new Error('Error al obtener documentos vencidos');
    }
  }

  static async getMostDownloaded(limit: number = 10): Promise<Document[]> {
    try {
      const allDocs = await this.getAll();
      return [...allDocs]
        .sort((a, b) => b.download_count - a.download_count)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting most downloaded documents:', error);
      throw new Error('Error al obtener documentos más descargados');
    }
  }

  // ============================================
  // CODE GENERATION
  // ============================================

  static async generateCode(type: DocumentType): Promise<string> {
    try {
      const prefix = this.getCodePrefix(type);
      const docs = await this.getByType(type);
      
      // Extract numbers from existing codes
      const numbers = docs
        .map((doc) => {
          const match = doc.code.match(/\d+$/);
          return match ? parseInt(match[0], 10) : 0;
        })
        .filter((n) => !isNaN(n));

      const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
      const nextNumber = maxNumber + 1;

      return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating code:', error);
      throw new Error('Error al generar código');
    }
  }

  private static getCodePrefix(type: DocumentType): string {
    const prefixes: Record<DocumentType, string> = {
      manual: 'MAN',
      procedimiento: 'PROC',
      instruccion: 'INST',
      formato: 'FOR',
      registro: 'REG',
      politica: 'POL',
      otro: 'DOC',
    };
    return prefixes[type];
  }
}
