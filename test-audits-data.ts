/**
 * Test script to check audits data in Firestore
 */

import { getAdminFirestore } from './src/lib/firebase/admin';

const db = getAdminFirestore();

async function checkAuditsData() {
  try {
    console.log('🔍 Checking audits collection...\n');

    // Get all audits
    const snapshot = await db.collection('audits').get();
    console.log(`Total documents in 'audits' collection: ${snapshot.size}`);

    if (snapshot.size === 0) {
      console.log('⚠️  No audits found in Firestore!');
      console.log('\nChecking if collection exists...');

      // Try to get collection metadata
      const collections = await db.listCollections();
      const auditCollectionExists = collections.some(c => c.id === 'audits');
      console.log(`Collection 'audits' exists: ${auditCollectionExists}`);

      console.log('\nAvailable collections:');
      collections.forEach(c => console.log(`  - ${c.id}`));
    } else {
      console.log('\n✅ Audits found! Listing first 5:\n');

      let count = 0;
      snapshot.forEach(doc => {
        if (count < 5) {
          const data = doc.data();
          console.log(`Document ID: ${doc.id}`);
          console.log(`  Title: ${data.title}`);
          console.log(`  Status: ${data.status}`);
          console.log(`  Type: ${data.auditType}`);
          console.log(
            `  Created: ${data.createdAt?.toDate?.() || data.createdAt}`
          );
          console.log(`  isActive: ${data.isActive}`);
          console.log('');
          count++;
        }
      });
    }

    // Check for isActive filter
    console.log('\n🔍 Checking audits with isActive = true...');
    const activeSnapshot = await db
      .collection('audits')
      .where('isActive', '==', true)
      .get();
    console.log(`Active audits: ${activeSnapshot.size}`);

    // Check for isActive = false
    console.log('\n🔍 Checking audits with isActive = false...');
    const inactiveSnapshot = await db
      .collection('audits')
      .where('isActive', '==', false)
      .get();
    console.log(`Inactive audits: ${inactiveSnapshot.size}`);

    // Check for documents without isActive field
    console.log('\n🔍 Checking all documents (regardless of isActive)...');
    const allSnapshot = await db.collection('audits').limit(10).get();
    console.log(`First 10 documents (all):`);
    allSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(
        `  - ${doc.id}: isActive=${data.isActive}, status=${data.status}`
      );
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkAuditsData();
