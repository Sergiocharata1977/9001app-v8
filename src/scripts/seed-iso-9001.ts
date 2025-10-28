// Script para cargar masivamente los puntos de la norma ISO 9001:2015
// Solo puntos con más de 2 cifras (ej: 4.1, 5.1.1, 8.2.3)

import { db } from '@/firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

interface NormPointData {
  code: string;
  title: string;
  description: string;
  requirement: string;
  tipo_norma: 'iso_9001';
  chapter: number;
  category: string;
  is_mandatory: boolean;
  priority: 'alta' | 'media' | 'baja';
  created_by: string;
  updated_by: string;
}

const iso9001Points: NormPointData[] = [
  // Capítulo 4: Contexto de la organización
  {
    code: '4.1',
    title: 'Comprensión de la organización y de su contexto',
    description: 'Determinar cuestiones externas e internas pertinentes',
    requirement: 'La organización debe determinar las cuestiones externas e internas que son pertinentes para su propósito y que afectan a su capacidad para lograr los resultados previstos de su sistema de gestión de la calidad.',
    tipo_norma: 'iso_9001',
    chapter: 4,
    category: 'contexto',
    is_mandatory: true,
    priority: 'alta',
    created_by: 'system',
    updated_by: 'system',
  },
  {
    code: '4.2',
    title: 'Comprensión de las necesidades y expectativas de las partes interesadas',
    description: 'Determinar partes interesadas y sus requisitos',
    requirement: 'La organización debe determinar las partes interesadas relevantes para el sistema de gestión de la calidad y los requisitos pertinentes de estas partes interesadas.',
    tipo_norma: 'iso_9001',
    chapter: 4,
    category: 'contexto',
    is_mandatory: true,
    priority: 'alta',
    created_by: 'system',
    updated_by: 'system',
  },
  {
    code: '4.3',
    title: 'Determinación del alcance del sistema de gestión de la calidad',
    description: 'Determinar límites y aplicabilidad del SGC',
    requirement: 'La organización debe determinar los límites y la aplicabilidad del sistema de gestión de la calidad para establecer su alcance.',
    tipo_norma: 'iso_9001',
    chapter: 4,
    category: 'contexto',
    is_mandatory: true,
    priority: 'alta',
    created_by: 'system',
    updated_by: 'system',
  },
  {
    code: '4.4',
    title: 'Sistema de gestión de la calidad y sus procesos',
    description: 'Establecer, implementar y mejorar el SGC',
    requirement: 'La organización debe establecer, implementar, mantener y mejorar continuamente un sistema de gestión de la calidad, incluidos los procesos necesarios y sus interacciones.',
    tipo_norma: 'iso_9001',
    chapter: 4,
    category: 'contexto',
    is_mandatory: true,
    priority: 'alta',
    created_by: 'system',
    updated_by: 'system',
  },
];

export async function seedISO9001Points() {
  console.log('Iniciando carga de puntos ISO 9001...');
  
  try {
    for (const point of iso9001Points) {
      await addDoc(collection(db, 'normPoints'), {
        ...point,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });
      console.log(`✓ Punto ${point.code} creado`);
    }
    
    console.log(`\n✅ ${iso9001Points.length} puntos creados exitosamente`);
  } catch (error) {
    console.error('Error al crear puntos:', error);
  }
}
