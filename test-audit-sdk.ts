/**
 * Test Audit SDK (Sepeck)
 * 
 * This script tests the Audit Service SDK to verify it's working correctly
 * with the Firebase Admin credentials.
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '.env.local') });

import { AuditService } from './src/lib/sdk/modules/audits/AuditService';

async function testAuditSDK() {
  console.log('🔍 Testing Audit SDK (Sepeck)...\n');

  try {
    // Initialize Audit Service
    console.log('1️⃣ Initializing Audit Service...');
    const auditService = new AuditService();
    console.log('   ✅ Audit Service initialized\n');

    // Test listing audits
    console.log('2️⃣ Testing list audits...');
    const audits = await auditService.list({}, { limit: 5 });
    console.log(`   ✅ Successfully retrieved audits`);
    console.log(`   📋 Found ${audits.length} audits (limited to 5)\n`);

    if (audits.length > 0) {
      console.log('   📄 Sample audit:');
      const sampleAudit = audits[0];
      console.log(`      - ID: ${sampleAudit.id}`);
      console.log(`      - Number: ${sampleAudit.auditNumber}`);
      console.log(`      - Title: ${sampleAudit.title}`);
      console.log(`      - Type: ${sampleAudit.auditType}`);
      console.log(`      - Status: ${sampleAudit.status}`);
      console.log(`      - Norm Points: ${sampleAudit.selectedNormPoints.length}`);
      console.log('');
    }

    // Test counting audits
    console.log('3️⃣ Testing count audits...');
    const totalCount = await auditService.count();
    console.log(`   ✅ Total audits in database: ${totalCount}\n`);

    // Test filtering by status
    console.log('4️⃣ Testing filter by status...');
    const plannedAudits = await auditService.list({ status: 'planned' });
    const inProgressAudits = await auditService.list({ status: 'in_progress' });
    const completedAudits = await auditService.list({ status: 'completed' });
    
    console.log(`   ✅ Audits by status:`);
    console.log(`      - Planned: ${plannedAudits.length}`);
    console.log(`      - In Progress: ${inProgressAudits.length}`);
    console.log(`      - Completed: ${completedAudits.length}\n`);

    // Test creating a new audit (we'll delete it after)
    console.log('5️⃣ Testing create audit...');
    const testAuditId = await auditService.createAndReturnId({
      title: 'Test Audit - SDK Verification',
      auditType: 'partial',
      scope: 'Testing SDK functionality',
      plannedDate: new Date(),
      leadAuditor: 'Test Auditor',
      selectedNormPoints: ['4.4', '7.5'],
    }, 'test-user-id');
    
    console.log(`   ✅ Test audit created successfully`);
    console.log(`   🆔 Audit ID: ${testAuditId}\n`);

    // Test getting audit by ID
    console.log('6️⃣ Testing get audit by ID...');
    const createdAudit = await auditService.getById(testAuditId);
    
    if (createdAudit) {
      console.log(`   ✅ Successfully retrieved audit`);
      console.log(`   📄 Audit details:`);
      console.log(`      - Number: ${createdAudit.auditNumber}`);
      console.log(`      - Title: ${createdAudit.title}`);
      console.log(`      - Status: ${createdAudit.status}`);
      console.log(`      - Norm Points: ${createdAudit.selectedNormPoints.join(', ')}\n`);
    }

    // Clean up: Delete test audit
    console.log('7️⃣ Cleaning up test audit...');
    await auditService.delete(testAuditId);
    console.log(`   ✅ Test audit deleted successfully\n`);

    console.log('✅ All Audit SDK tests passed!\n');
    console.log('🎉 Your Audit SDK (Sepeck) is properly configured and working.\n');
    console.log('📊 Summary:');
    console.log(`   - Total audits: ${totalCount}`);
    console.log(`   - Planned: ${plannedAudits.length}`);
    console.log(`   - In Progress: ${inProgressAudits.length}`);
    console.log(`   - Completed: ${completedAudits.length}`);
    console.log(`   - SDK operations: ✅ All working\n`);
    
    return true;
  } catch (error: any) {
    console.error('❌ Audit SDK test failed:\n');
    console.error(`   Error: ${error.message}\n`);
    
    if (error.stack) {
      console.error('   Stack trace:');
      console.error(error.stack);
    }
    
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Verify Firebase Admin SDK is properly initialized');
    console.error('   2. Check that the audits collection exists in Firestore');
    console.error('   3. Ensure the service account has read/write permissions');
    console.error('   4. Review the error message above for specific issues\n');
    
    return false;
  }
}

// Run the test
testAuditSDK()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });