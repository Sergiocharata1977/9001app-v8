/**
 * Test Firebase Admin SDK Connection
 *
 * This script tests the Firebase Admin SDK connection using the credentials
 * from .env.local file.
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '.env.local') });

import {
  initializeFirebaseAdmin,
  getAdminFirestore,
  getAdminAuth,
} from './src/lib/firebase/admin';

async function testFirebaseAdmin() {
  console.log('🔍 Testing Firebase Admin SDK Connection...\n');

  try {
    // Initialize Firebase Admin
    console.log('1️⃣ Initializing Firebase Admin SDK...');
    initializeFirebaseAdmin();
    console.log('   ✅ Firebase Admin SDK initialized\n');

    // Test Firestore connection
    console.log('2️⃣ Testing Firestore connection...');
    const db = getAdminFirestore();

    // Try to list collections (this will verify we have proper access)
    const collections = await db.listCollections();
    console.log(`   ✅ Firestore connected successfully`);
    console.log(`   📁 Found ${collections.length} collections:\n`);

    collections.forEach((collection, index) => {
      console.log(`      ${index + 1}. ${collection.id}`);
    });
    console.log('');

    // Test Auth connection
    console.log('3️⃣ Testing Auth connection...');
    const auth = getAdminAuth();

    // Try to list users (limited to 1 to test connection)
    const listUsersResult = await auth.listUsers(1);
    console.log(`   ✅ Auth connected successfully`);
    console.log(
      `   👥 Total users in project: ${listUsersResult.users.length > 0 ? 'At least 1' : '0'}\n`
    );

    console.log('✅ All Firebase Admin SDK tests passed!\n');
    console.log(
      '🎉 Your Firebase Admin SDK is properly configured and working.\n'
    );

    return true;
  } catch (error: any) {
    console.error('❌ Firebase Admin SDK test failed:\n');
    console.error(`   Error: ${error.message}\n`);

    if (error.code) {
      console.error(`   Error Code: ${error.code}\n`);
    }

    console.error('💡 Troubleshooting tips:');
    console.error(
      '   1. Verify your .env.local file has the correct credentials'
    );
    console.error(
      '   2. Make sure the private key is properly formatted with \\n characters'
    );
    console.error(
      '   3. Check that the service account has the necessary permissions'
    );
    console.error(
      '   4. Ensure the Firebase project ID matches your actual project\n'
    );

    return false;
  }
}

// Run the test
testFirebaseAdmin()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
