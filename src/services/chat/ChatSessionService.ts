// Service for managing chat sessions

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { ChatSession, Mensaje } from '@/types/chat';
import { UserContext } from '@/types/context';

const COLLECTION_NAME = 'chat_sessions';
const INACTIVE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

export class ChatSessionService {
  /**
   * Create a new chat session
   * @param userId User ID
   * @param tipo Session type
   * @param contexto User context snapshot
   * @param modulo Optional module name
   * @returns Session ID
   */
  static async createSession(
    userId: string,
    tipo: ChatSession['tipo'],
    contexto: UserContext,
    modulo?: string
  ): Promise<string> {
    try {
      // Limpiar undefined values del contexto (Firestore no los permite)
      const cleanContexto = JSON.parse(JSON.stringify({
        ...contexto,
        supervisor: contexto.supervisor || null
      }));

      const sessionData = {
        user_id: userId,
        tipo,
        modulo: modulo || null,
        estado: 'activo' as const,
        mensajes: [],
        contexto_snapshot: cleanContexto,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), sessionData);
      
      console.log('[ChatSessionService] Created session:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('[ChatSessionService] Error creating session:', error);
      throw new Error('Failed to create chat session');
    }
  }

  /**
   * Get session by ID
   * @param sessionId Session ID
   * @returns Chat session or null
   */
  static async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, sessionId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      
      return {
        id: docSnap.id,
        user_id: data.user_id,
        tipo: data.tipo,
        modulo: data.modulo,
        estado: data.estado,
        mensajes: data.mensajes.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp?.toDate() || new Date()
        })),
        contexto_snapshot: data.contexto_snapshot,
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date()
      } as ChatSession;
    } catch (error) {
      console.error('[ChatSessionService] Error getting session:', error);
      throw new Error('Failed to get chat session');
    }
  }

  /**
   * Add message to session
   * @param sessionId Session ID
   * @param mensaje Message data (without id and timestamp)
   */
  static async agregarMensaje(
    sessionId: string,
    mensaje: Omit<Mensaje, 'id' | 'timestamp'>
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, sessionId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Session not found');
      }

      const mensajesActuales = docSnap.data().mensajes || [];
      
      const nuevoMensaje = {
        ...mensaje,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Timestamp.now()
      };

      await updateDoc(docRef, {
        mensajes: [...mensajesActuales, nuevoMensaje],
        updated_at: serverTimestamp()
      });

      console.log('[ChatSessionService] Added message to session:', sessionId);
    } catch (error) {
      console.error('[ChatSessionService] Error adding message:', error);
      throw new Error('Failed to add message to session');
    }
  }

  /**
   * Get user's active session
   * @param userId User ID
   * @returns Active session or null
   */
  static async getActiveSession(userId: string): Promise<ChatSession | null> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        where('estado', '==', 'activo'),
        orderBy('updated_at', 'desc'),
        firestoreLimit(1)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        user_id: data.user_id,
        tipo: data.tipo,
        modulo: data.modulo,
        estado: data.estado,
        mensajes: data.mensajes.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp?.toDate() || new Date()
        })),
        contexto_snapshot: data.contexto_snapshot,
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date()
      } as ChatSession;
    } catch (error) {
      console.error('[ChatSessionService] Error getting active session:', error);
      throw new Error('Failed to get active session');
    }
  }

  /**
   * Update session status
   * @param sessionId Session ID
   * @param estado New status
   */
  static async updateStatus(
    sessionId: string,
    estado: ChatSession['estado']
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, sessionId);
      
      await updateDoc(docRef, {
        estado,
        updated_at: serverTimestamp()
      });

      console.log('[ChatSessionService] Updated session status:', sessionId, estado);
    } catch (error) {
      console.error('[ChatSessionService] Error updating status:', error);
      throw new Error('Failed to update session status');
    }
  }

  /**
   * Get user's session history
   * @param userId User ID
   * @param limit Maximum number of sessions to return
   * @returns Array of sessions
   */
  static async getUserSessions(
    userId: string,
    limit: number = 10
  ): Promise<ChatSession[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        orderBy('updated_at', 'desc'),
        firestoreLimit(limit)
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          user_id: data.user_id,
          tipo: data.tipo,
          modulo: data.modulo,
          estado: data.estado,
          mensajes: data.mensajes.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp?.toDate() || new Date()
          })),
          contexto_snapshot: data.contexto_snapshot,
          created_at: data.created_at?.toDate() || new Date(),
          updated_at: data.updated_at?.toDate() || new Date()
        } as ChatSession;
      });
    } catch (error) {
      console.error('[ChatSessionService] Error getting user sessions:', error);
      throw new Error('Failed to get user sessions');
    }
  }

  /**
   * Auto-pause inactive sessions (background job)
   * Should be called periodically (e.g., daily cron job)
   */
  static async pauseInactiveSessions(): Promise<void> {
    try {
      const cutoffTime = new Date(Date.now() - INACTIVE_THRESHOLD_MS);
      
      const q = query(
        collection(db, COLLECTION_NAME),
        where('estado', '==', 'activo'),
        where('updated_at', '<', Timestamp.fromDate(cutoffTime))
      );

      const querySnapshot = await getDocs(q);

      const updates = querySnapshot.docs.map(async (docSnapshot) => {
        await updateDoc(docSnapshot.ref, {
          estado: 'pausado',
          updated_at: serverTimestamp()
        });
      });

      await Promise.all(updates);

      console.log(`[ChatSessionService] Paused ${querySnapshot.size} inactive sessions`);
    } catch (error) {
      console.error('[ChatSessionService] Error pausing inactive sessions:', error);
      throw new Error('Failed to pause inactive sessions');
    }
  }

  /**
   * Get all active sessions (for admin/monitoring)
   */
  static async getActiveSessions(): Promise<ChatSession[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('estado', '==', 'activo'),
        orderBy('updated_at', 'desc')
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          user_id: data.user_id,
          tipo: data.tipo,
          modulo: data.modulo,
          estado: data.estado,
          mensajes: data.mensajes.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp?.toDate() || new Date()
          })),
          contexto_snapshot: data.contexto_snapshot,
          created_at: data.created_at?.toDate() || new Date(),
          updated_at: data.updated_at?.toDate() || new Date()
        } as ChatSession;
      });
    } catch (error) {
      console.error('[ChatSessionService] Error getting active sessions:', error);
      throw new Error('Failed to get active sessions');
    }
  }
}
