/**
 * Firebase Admin SDK Initialization
 *
 * This module initializes and exports Firebase Admin SDK instances
 * using the singleton pattern to prevent multiple initializations.
 */

import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

// Singleton instance
let adminApp: App | null = null;

/**
 * Initialize Firebase Admin SDK with service account credentials
 * Uses singleton pattern to prevent multiple initializations
 */
export function initializeFirebaseAdmin(): App {
  // Return existing instance if already initialized
  if (adminApp) {
    return adminApp;
  }

  try {
    // Check if Firebase Admin is already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      adminApp = existingApps[0];
      console.log('✅ Firebase Admin SDK already initialized');
      return adminApp;
    }

    // Validate required environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Missing required Firebase Admin SDK credentials. ' +
          'Please ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.'
      );
    }

    // Initialize Firebase Admin
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        // Replace escaped newlines in private key
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
      storageBucket: storageBucket || `${projectId}.appspot.com`,
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log(`   Project ID: ${projectId}`);
    console.log(
      `   Storage Bucket: ${storageBucket || `${projectId}.appspot.com`}`
    );

    return adminApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

/**
 * Get Firebase Admin Auth instance
 * Initializes Firebase Admin if not already initialized
 */
export function getAdminAuth(): Auth {
  initializeFirebaseAdmin();
  return getAuth();
}

/**
 * Get Firebase Admin Firestore instance
 * Initializes Firebase Admin if not already initialized
 */
export function getAdminFirestore(): Firestore {
  initializeFirebaseAdmin();
  return getFirestore();
}

/**
 * Get Firebase Admin Storage instance
 * Initializes Firebase Admin if not already initialized
 */
export function getAdminStorage(): Storage {
  initializeFirebaseAdmin();
  return getStorage();
}

/**
 * Check if Firebase Admin SDK is properly initialized
 */
export function isFirebaseAdminInitialized(): boolean {
  return adminApp !== null || getApps().length > 0;
}
