/**
 * Seed script for audits collection
 * Creates sample audit data for testing
 */

import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

const db = getAdminFirestore();

async function seedAudits() {
  try {
    console.log('🌱 Starting audit seed...\n');

    const auditsData = [
      {
        auditNumber: 'AUD-2025-00001',
        title: 'Auditoría Interna ISO 9001 - Enero 2025',
        auditType: 'complete',
        scope: 'Procesos de gestión de calidad y documentación',
        plannedDate: Timestamp.fromDate(new Date('2025-01-15')),
        leadAuditor: 'Juan García',
        leadAuditorId: null,
        selectedNormPoints: ['4.4', '7.5', '8.7', '10.2'],
        status: 'planned',
        executionDate: null,
        normPointsVerification: [
          {
            normPointCode: '4.4',
            normPointId: null,
            conformityStatus: null,
            processes: [],
            processIds: null,
            observations: null,
            verifiedAt: null,
            verifiedBy: null,
            verifiedByName: null,
          },
          {
            normPointCode: '7.5',
            normPointId: null,
            conformityStatus: null,
            processes: [],
            processIds: null,
            observations: null,
            verifiedAt: null,
            verifiedBy: null,
            verifiedByName: null,
          },
          {
            normPointCode: '8.7',
            normPointId: null,
            conformityStatus: null,
            processes: [],
            processIds: null,
            observations: null,
            verifiedAt: null,
            verifiedBy: null,
            verifiedByName: null,
          },
          {
            normPointCode: '10.2',
            normPointId: null,
            conformityStatus: null,
            processes: [],
            processIds: null,
            observations: null,
            verifiedAt: null,
            verifiedBy: null,
            verifiedByName: null,
          },
        ],
        openingMeeting: null,
        closingMeeting: null,
        reportDelivery: null,
        previousActionsVerification: null,
        observations: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
        updatedBy: 'system',
        isActive: true,
      },
      {
        auditNumber: 'AUD-2025-00002',
        title: 'Auditoría Parcial - Procesos de Compras',
        auditType: 'partial',
        scope: 'Gestión de proveedores y compras',
        plannedDate: Timestamp.fromDate(new Date('2025-02-10')),
        leadAuditor: 'María López',
        leadAuditorId: null,
        selectedNormPoints: ['8.4', '8.5'],
        status: 'in_progress',
        executionDate: Timestamp.fromDate(new Date('2025-02-10')),
        normPointsVerification: [
          {
            normPointCode: '8.4',
            normPointId: null,
            conformityStatus: 'CF',
            processes: ['Compras'],
            processIds: null,
            observations: 'Proceso conforme',
            verifiedAt: Timestamp.now(),
            verifiedBy: 'auditor-001',
            verifiedByName: 'María López',
          },
          {
            normPointCode: '8.5',
            normPointId: null,
            conformityStatus: 'NCM',
            processes: ['Control de proveedores'],
            processIds: null,
            observations: 'Falta documentación de evaluación',
            verifiedAt: Timestamp.now(),
            verifiedBy: 'auditor-001',
            verifiedByName: 'María López',
          },
        ],
        openingMeeting: {
          date: Timestamp.fromDate(new Date('2025-02-10')),
          participants: [
            { name: 'María López', role: 'Auditor' },
            { name: 'Carlos Rodríguez', role: 'Responsable de Compras' },
          ],
          notes: 'Reunión de apertura realizada',
        },
        closingMeeting: null,
        reportDelivery: null,
        previousActionsVerification: null,
        observations: 'Auditoría en progreso',
        createdAt: Timestamp.fromDate(new Date('2025-02-01')),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
        updatedBy: 'system',
        isActive: true,
      },
      {
        auditNumber: 'AUD-2025-00003',
        title: 'Auditoría Completa - Diciembre 2024',
        auditType: 'complete',
        scope: 'Sistema de gestión de calidad completo',
        plannedDate: Timestamp.fromDate(new Date('2024-12-01')),
        leadAuditor: 'Pedro Martínez',
        leadAuditorId: null,
        selectedNormPoints: ['4.4', '5.1', '6.2', '7.5', '8.1', '8.7', '9.1', '10.2'],
        status: 'completed',
        executionDate: Timestamp.fromDate(new Date('2024-12-05')),
        normPointsVerification: [
          {
            normPointCode: '4.4',
            normPointId: null,
            conformityStatus: 'CF',
            processes: ['Gestión de contexto'],
            processIds: null,
            observations: 'Conforme',
            verifiedAt: Timestamp.fromDate(new Date('2024-12-05')),
            verifiedBy: 'auditor-002',
            verifiedByName: 'Pedro Martínez',
          },
          {
            normPointCode: '5.1',
            normPointId: null,
            conformityStatus: 'CF',
            processes: ['Liderazgo'],
            processIds: null,
            observations: 'Conforme',
            verifiedAt: Timestamp.fromDate(new Date('2024-12-05')),
            verifiedBy: 'auditor-002',
            verifiedByName: 'Pedro Martínez',
          },
          {
            normPointCode: '6.2',
            normPointId: null,
            conformityStatus: 'NCm',
            processes: ['Planificación'],
            processIds: null,
            observations: 'No conformidad menor',
            verifiedAt: Timestamp.fromDate(new Date('2024-12-05')),
            verifiedBy: 'auditor-002',
            verifiedByName: 'Pedro Martínez',
          },
          {
            normPointCode: '7.5',
            normPointId: null,
            conformityStatus: 'CF',
            processes: ['Información documentada'],
            processIds: null,
            observations: 'Conforme',
            verifiedAt: Timestamp.fromDate(new Date('2024-12-05')),
            verifiedBy: 'auditor-002',
            verifiedByName: 'Pedro Martínez',
          },
          {
            normPointCode: '8.1',
            normPointId: null,
            conformityStatus: 'CF',
            processes: ['Planificación operacional'],
            processIds: null,
            observations: 'Conforme',
            verifiedAt: Timestamp.fromDate(new Date('2024-12-05')),
            verifiedBy: 'auditor-002',
            verifiedByName: 'Pedro Martínez',
          },
          {
            normPointCode: '8.7',
            normPointId: null,
            conformityStatus: 'CF',
            processes: ['Control de cambios'],
            processIds: null,
            observations: 'Conforme',
            verifiedAt: Timestamp.fromDate(new Date('2024-12-05')),
            verifiedBy: 'auditor-002',
            verifiedByName: 'Pedro Martínez',
          },
          {
            normPointCode: '9.1',
            normPointId: null,
            conformityStatus: 'CF',
            processes: ['Seguimiento y medición'],
            processIds: null,
            observations: 'Conforme',
            verifiedAt: Timestamp.fromDate(new Date('2024-12-05')),
            verifiedBy: 'auditor-002',
            verifiedByName: 'Pedro Martínez',
          },
          {
            normPointCode: '10.2',
            normPointId: null,
            conformityStatus: 'CF',
            processes: ['Mejora continua'],
            processIds: null,
            observations: 'Conforme',
            verifiedAt: Timestamp.fromDate(new Date('2024-12-05')),
            verifiedBy: 'auditor-002',
            verifiedByName: 'Pedro Martínez',
          },
        ],
        openingMeeting: {
          date: Timestamp.fromDate(new Date('2024-12-05')),
          participants: [
            { name: 'Pedro Martínez', role: 'Auditor' },
            { name: 'Gerencia', role: 'Dirección' },
          ],
          notes: 'Reunión de apertura completada',
        },
        closingMeeting: {
          date: Timestamp.fromDate(new Date('2024-12-06')),
          participants: [
            { name: 'Pedro Martínez', role: 'Auditor' },
            { name: 'Gerencia', role: 'Dirección' },
          ],
          notes: 'Reunión de cierre completada',
        },
        reportDelivery: {
          date: Timestamp.fromDate(new Date('2024-12-10')),
          deliveredBy: 'Pedro Martínez',
          deliveredById: null,
          receivedBy: 'Gerencia',
          receivedByIds: null,
          notes: 'Reporte entregado',
        },
        previousActionsVerification: 'Acciones previas verificadas y cerradas',
        observations: 'Auditoría completada exitosamente',
        createdAt: Timestamp.fromDate(new Date('2024-11-20')),
        updatedAt: Timestamp.fromDate(new Date('2024-12-10')),
        createdBy: 'system',
        updatedBy: 'system',
        isActive: true,
      },
      {
        auditNumber: 'AUD-2025-00004',
        title: 'Auditoría de Seguimiento - Acciones Correctivas',
        auditType: 'partial',
        scope: 'Verificación de cierre de no conformidades',
        plannedDate: Timestamp.fromDate(new Date('2025-03-01')),
        leadAuditor: 'Ana Fernández',
        leadAuditorId: null,
        selectedNormPoints: ['6.2', '8.5'],
        status: 'planned',
        executionDate: null,
        normPointsVerification: [
          {
            normPointCode: '6.2',
            normPointId: null,
            conformityStatus: null,
            processes: [],
            processIds: null,
            observations: null,
            verifiedAt: null,
            verifiedBy: null,
            verifiedByName: null,
          },
          {
            normPointCode: '8.5',
            normPointId: null,
            conformityStatus: null,
            processes: [],
            processIds: null,
            observations: null,
            verifiedAt: null,
            verifiedBy: null,
            verifiedByName: null,
          },
        ],
        openingMeeting: null,
        closingMeeting: null,
        reportDelivery: null,
        previousActionsVerification: null,
        observations: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
        updatedBy: 'system',
        isActive: true,
      },
    ];

    // Delete existing audits first
    console.log('🗑️  Deleting existing audits...');
    const existingSnapshot = await db.collection('audits').get();
    for (const doc of existingSnapshot.docs) {
      await doc.ref.delete();
    }
    console.log(`✅ Deleted ${existingSnapshot.size} existing audits\n`);

    // Add new audits
    console.log('📝 Adding new audits...');
    let count = 0;
    for (const auditData of auditsData) {
      await db.collection('audits').add(auditData);
      count++;
      console.log(`✅ Added: ${auditData.title}`);
    }

    console.log(`\n✨ Seed completed! Added ${count} audits`);
  } catch (error) {
    console.error('❌ Error seeding audits:', error);
  } finally {
    process.exit(0);
  }
}

seedAudits();
