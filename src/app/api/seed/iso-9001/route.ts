import { NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import iso9001PointsData from '@/data/iso-9001-points.json';

export async function POST() {
  try {
    console.log('Iniciando carga de puntos ISO 9001...');

    let created = 0;
    let skipped = 0;

    for (const point of iso9001PointsData) {
      // Verificar si ya existe
      const existingQuery = query(
        collection(db, 'normPoints'),
        where('code', '==', point.code),
        where('tipo_norma', '==', 'iso_9001')
      );

      const existing = await getDocs(existingQuery);

      if (existing.empty) {
        await addDoc(collection(db, 'normPoints'), {
          code: point.code,
          title: point.title,
          description: `Requisito ${point.code} de ISO 9001:2015`,
          requirement: point.title,
          tipo_norma: 'iso_9001',
          chapter: point.chapter,
          category: point.category,
          is_mandatory: point.is_mandatory,
          priority: point.priority,
          created_by: 'system',
          updated_by: 'system',
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
        });
        created++;
        console.log(`✓ Punto ${point.code} creado`);
      } else {
        skipped++;
        console.log(`⊘ Punto ${point.code} ya existe`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Proceso completado: ${created} creados, ${skipped} omitidos`,
      created,
      skipped,
      total: iso9001PointsData.length,
    });
  } catch (error) {
    console.error('Error al crear puntos:', error);
    return NextResponse.json(
      { error: 'Error al crear puntos de norma' },
      { status: 500 }
    );
  }
}
