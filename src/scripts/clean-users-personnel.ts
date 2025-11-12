/**
 * Script to clean users and personnel collections
 * Run with: npm run clean-users
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('../../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function cleanUsersAndPersonnel() {
  console.log('🧹 Starting cleanup of users and personnel...\n');

  try {
    // 1. Delete all users from Firebase Authentication
    console.log('1️⃣ Deleting users from Firebase Authentication...');
    const listUsersResult = await auth.listUsers();
    const deletePromises = listUsersResult.users.map(
      (user: admin.auth.UserRecord) => auth.deleteUser(user.uid)
    );
    await Promise.all(deletePromises);
    console.log(
      `   ✅ Deleted ${listUsersResult.users.length} users from Authentication\n`
    );

    // 2. Delete all documents from 'users' collection
    console.log('2️⃣ Deleting documents from users collection...');
    const usersSnapshot = await db.collection('users').get();
    const userDeletePromises = usersSnapshot.docs.map(
      (doc: admin.firestore.QueryDocumentSnapshot) => doc.ref.delete()
    );
    await Promise.all(userDeletePromises);
    console.log(
      `   ✅ Deleted ${usersSnapshot.size} documents from users collection\n`
    );

    // 3. Delete all documents from 'personnel' collection
    console.log('3️⃣ Deleting documents from personnel collection...');
    const personnelSnapshot = await db.collection('personnel').get();
    const personnelDeletePromises = personnelSnapshot.docs.map(
      (doc: admin.firestore.QueryDocumentSnapshot) => doc.ref.delete()
    );
    await Promise.all(personnelDeletePromises);
    console.log(
      `   ✅ Deleted ${personnelSnapshot.size} documents from personnel collection\n`
    );

    console.log('✨ Cleanup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Create new personnel records');
    console.log('   2. Register new users with matching emails');
    console.log('   3. Assign personnel to users in admin panel\n');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Run the cleanup
cleanUsersAndPersonnel()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed:', error);
    process.exit(1);
  });
