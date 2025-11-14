import { db } from '@/firebase/config';
import type {
  NewsErrorCode,
  Post,
  PostCreateData,
  PostFilters,
  PostUpdateData,
} from '@/types/news';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  QueryConstraint,
  runTransaction,
  startAfter,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

const COLLECTION_NAME = 'news_posts';

export class PostService {
  // ============================================
  // CRUD OPERATIONS
  // ============================================

  /**
   * Crear un nuevo post
   */
  static async create(data: PostCreateData): Promise<string> {
    try {
      const now = Timestamp.now();

      const postData: Omit<Post, 'id'> = {
        content: data.content,
        images: data.images || [],
        attachments: data.attachments || [],
        authorId: data.authorId,
        authorName: data.authorName,
        authorPhotoURL: data.authorPhotoURL,
        organizationId: data.organizationId,
        isEdited: false,
        editedAt: null,
        commentCount: 0,
        reactionCount: 0,
        isModerated: false,
        moderatedBy: null,
        moderatedAt: null,
        moderationReason: null,
        createdAt: now,
        updatedAt: now,
        isActive: true,
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), postData);

      return docRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw this.handleError(
        error,
        'Error al crear publicación',
        'DATABASE_ERROR' as NewsErrorCode
      );
    }
  }

  /**
   * Obtener post por ID
   */
  static async getById(id: string): Promise<Post | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Post;
    } catch (error) {
      console.error('Error getting post:', error);
      throw this.handleError(
        error,
        'Error al obtener publicación',
        'DATABASE_ERROR' as NewsErrorCode
      );
    }
  }

  /**
   * Obtener todos los posts con paginación
   */
  static async getAll(
    page: number = 1,
    pageLimit: number = 10,
    filters?: PostFilters,
    lastDocId?: string
  ): Promise<{ posts: Post[]; hasMore: boolean; total: number }> {
    try {
      const constraints: QueryConstraint[] = [where('isActive', '==', true)];

      // Filtro por autor
      if (filters?.authorId) {
        constraints.push(where('authorId', '==', filters.authorId));
      }

      // Ordenar por fecha descendente
      constraints.push(orderBy('createdAt', 'desc'));

      // Paginación cursor-based
      if (lastDocId) {
        const lastDocRef = doc(db, COLLECTION_NAME, lastDocId);
        const lastDocSnap = await getDoc(lastDocRef);
        if (lastDocSnap.exists()) {
          constraints.push(startAfter(lastDocSnap));
        }
      }

      // Límite + 1 para saber si hay más
      constraints.push(limit(pageLimit + 1));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);

      let posts: Post[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];

      // Verificar si hay más resultados
      const hasMore = posts.length > pageLimit;
      if (hasMore) {
        posts = posts.slice(0, pageLimit);
      }

      // Filtro de búsqueda en memoria (si se proporciona)
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        posts = posts.filter(post =>
          post.content.toLowerCase().includes(searchLower)
        );
      }

      // Obtener total (aproximado)
      const totalQuery = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true)
      );
      const totalSnapshot = await getDocs(totalQuery);
      const total = totalSnapshot.size;

      return { posts, hasMore, total };
    } catch (error) {
      console.error('Error getting posts:', error);
      throw this.handleError(
        error,
        'Error al obtener publicaciones',
        'DATABASE_ERROR' as NewsErrorCode
      );
    }
  }

  /**
   * Actualizar post (solo contenido)
   */
  static async update(id: string, data: PostUpdateData): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);

      const updateData: Record<string, unknown> = {
        content: data.content,
        isEdited: true,
        editedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating post:', error);
      throw this.handleError(
        error,
        'Error al actualizar publicación',
        'DATABASE_ERROR' as NewsErrorCode
      );
    }
  }

  /**
   * Eliminar post (soft delete)
   */
  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);

      await updateDoc(docRef, {
        isActive: false,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      throw this.handleError(
        error,
        'Error al eliminar publicación',
        'DATABASE_ERROR' as NewsErrorCode
      );
    }
  }

  /**
   * Eliminar post permanentemente (hard delete)
   * Solo para moderación
   */
  static async hardDelete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error hard deleting post:', error);
      throw this.handleError(
        error,
        'Error al eliminar permanentemente publicación',
        'DATABASE_ERROR' as NewsErrorCode
      );
    }
  }

  // ============================================
  // CONTADOR OPERATIONS
  // ============================================

  /**
   * Incrementar contador de comentarios
   */
  static async incrementCommentCount(postId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, postId);
      await updateDoc(docRef, {
        commentCount: increment(1),
      });
    } catch (error) {
      console.error('Error incrementing comment count:', error);
      throw this.handleError(
        error,
        'Error al actualizar contador de comentarios',
        'DATABASE_ERROR' as NewsErrorCode
      );
    }
  }

  /**
   * Decrementar contador de comentarios
   */
  static async decrementCommentCount(postId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, postId);
      await updateDoc(docRef, {
        commentCount: increment(-1),
      });
    } catch (error) {
      console.error('Error decrementing comment count:', error);
      throw this.handleError(
        error,
        'Error al actualizar contador de comentarios',
        'DATABASE_ERROR' as NewsErrorCode
      );
    }
  }

  /**
   * Incrementar contador de reacciones
   */
  static async incrementReactionCount(postId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, postId);
      await updateDoc(docRef, {
        reactionCount: increment(1),
      });
    } catch (error) {
      console.error('Error incrementing reaction count:', error);
      throw this.handleError(
        error,
        'Error al actualizar contador de reacciones',
        'DATABASE_ERROR' as NewsErrorCode
      );
    }
  }

  /**
   * Decrementar contador de reacciones
   */
  static async decrementReactionCount(postId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, postId);
      await updateDoc(docRef, {
        reactionCount: increment(-1),
      });
    } catch (error) {
      console.error('Error decrementing reaction count:', error);
      throw this.handleError(
        error,
        'Error al actualizar contador de reacciones',
        'DATABASE_ERROR' as NewsErrorCode
      );
    }
  }

  // ============================================
  // MODERACIÓN
  // ============================================

  /**
   * Moderar post (marcar como moderado y eliminar)
   */
  static async moderate(
    postId: string,
    moderatorId: string,
    reason: string
  ): Promise<void> {
    try {
      await runTransaction(db, async transaction => {
        const docRef = doc(db, COLLECTION_NAME, postId);
        const docSnap = await transaction.get(docRef);

        if (!docSnap.exists()) {
          throw new Error('Post no encontrado');
        }

        transaction.update(docRef, {
          isModerated: true,
          moderatedBy: moderatorId,
          moderatedAt: Timestamp.now(),
          moderationReason: reason,
          isActive: false,
          updatedAt: Timestamp.now(),
        });
      });
    } catch (error) {
      console.error('Error moderating post:', error);
      throw this.handleError(
        error,
        'Error al moderar publicación',
        'DATABASE_ERROR' as NewsErrorCode
      );
    }
  }

  // ============================================
  // BÚSQUEDA
  // ============================================

  /**
   * Buscar posts por contenido
   */
  static async search(
    searchQuery: string,
    searchLimit: number = 20
  ): Promise<Post[]> {
    try {
      // Obtener todos los posts activos
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(100) // Límite de seguridad
      );

      const querySnapshot = await getDocs(q);
      let posts: Post[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];

      // Filtrar en memoria por búsqueda
      const searchLower = searchQuery.toLowerCase();
      posts = posts.filter(post =>
        post.content.toLowerCase().includes(searchLower)
      );

      // Limitar resultados
      return posts.slice(0, searchLimit);
    } catch (error) {
      console.error('Error searching posts:', error);
      throw this.handleError(
        error,
        'Error al buscar publicaciones',
        'DATABASE_ERROR' as NewsErrorCode
      );
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private static handleError(
    error: unknown,
    message: string,
    code: NewsErrorCode
  ): Error {
    const NewsError = class extends Error {
      constructor(
        message: string,
        public code: NewsErrorCode,
        public details?: unknown
      ) {
        super(message);
        this.name = 'NewsError';
      }
    };

    return new NewsError(message, code, { originalError: error });
  }
}
