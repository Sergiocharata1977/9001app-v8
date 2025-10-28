// Service for managing users collection

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { User, TIPO_PERSONAL_TO_ROL } from '@/types/auth';
import { PersonnelService } from '../rrhh/PersonnelService';

const COLLECTION_NAME = 'users';

export class UserService {
  /**
   * Create a new user record
   * @param authUser Firebase Auth user object
   * @returns Created user
   */
  static async createUser(authUser: { uid: string; email: string }): Promise<User> {
    try {
      const userData = {
        email: authUser.email,
        personnel_id: '',  // Will be assigned later by admin
        rol: 'operario' as const,  // Default role
        activo: true,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      // Use setDoc with UID as document ID
      const userRef = doc(db, COLLECTION_NAME, authUser.uid);
      await setDoc(userRef, userData);

      return {
        id: authUser.uid,
        ...userData,
        created_at: new Date(),
        updated_at: new Date()
      } as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Get user by Firebase Auth UID
   * @param userId Firebase Auth UID
   * @returns User or null if not found
   */
  static async getById(userId: string): Promise<User | null> {
    try {
      // Use document ID directly
      const userRef = doc(db, COLLECTION_NAME, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      const data = userDoc.data();

      return {
        id: userDoc.id,
        email: data.email,
        personnel_id: data.personnel_id,
        rol: data.rol,
        activo: data.activo,
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date()
      } as User;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw new Error('Failed to get user');
    }
  }

  /**
   * Get user by email
   * @param email User email
   * @returns User or null if not found
   */
  static async getByEmail(email: string): Promise<User | null> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('email', '==', email)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        id: data.id,
        email: data.email,
        personnel_id: data.personnel_id,
        rol: data.rol,
        activo: data.activo,
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date()
      } as User;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Failed to get user');
    }
  }

  /**
   * Assign personnel to user and auto-assign role
   * @param userId Firebase Auth UID
   * @param personnelId Personnel ID
   */
  static async assignPersonnel(userId: string, personnelId: string): Promise<void> {
    try {
      // Validate personnel exists
      const personnel = await PersonnelService.getById(personnelId);
      if (!personnel) {
        throw new Error('Personnel not found');
      }

      // Determine role based on tipo_personal
      const rol = TIPO_PERSONAL_TO_ROL[personnel.tipo_personal] || 'operario';

      // Use document ID directly
      const userRef = doc(db, COLLECTION_NAME, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      // Update user
      await updateDoc(userRef, {
        personnel_id: personnelId,
        rol: rol,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error assigning personnel:', error);
      throw new Error('Failed to assign personnel');
    }
  }

  /**
   * Update user role
   * @param userId Firebase Auth UID
   * @param rol New role
   */
  static async updateRole(userId: string, rol: User['rol']): Promise<void> {
    try {
      const userRef = doc(db, COLLECTION_NAME, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      await updateDoc(userRef, {
        rol: rol,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating role:', error);
      throw new Error('Failed to update role');
    }
  }

  /**
   * Activate or deactivate user
   * @param userId Firebase Auth UID
   * @param activo Active status
   */
  static async setActive(userId: string, activo: boolean): Promise<void> {
    try {
      const userRef = doc(db, COLLECTION_NAME, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      await updateDoc(userRef, {
        activo: activo,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error setting active status:', error);
      throw new Error('Failed to set active status');
    }
  }

  /**
   * Get users without personnel assigned
   * @returns Array of users without personnel
   */
  static async getUsersWithoutPersonnel(): Promise<User[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('personnel_id', '==', '')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,  // Usar doc.id en lugar de data.id
          email: data.email,
          personnel_id: data.personnel_id || null,
          rol: data.rol,
          activo: data.activo,
          created_at: data.created_at?.toDate() || new Date(),
          updated_at: data.updated_at?.toDate() || new Date()
        } as User;
      });
    } catch (error) {
      console.error('Error getting users without personnel:', error);
      throw new Error('Failed to get users without personnel');
    }
  }

  /**
   * Get all users
   * @returns Array of all users
   */
  static async getAll(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          personnel_id: data.personnel_id || null,
          rol: data.rol,
          activo: data.activo,
          created_at: data.created_at?.toDate() || new Date(),
          updated_at: data.updated_at?.toDate() || new Date()
        } as User;
      });
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error('Failed to get users');
    }
  }
}
