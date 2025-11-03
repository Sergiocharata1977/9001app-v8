'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DepartmentService } from '@/services/rrhh/DepartmentService';
import { PersonnelService } from '@/services/rrhh/PersonnelService';
import { PositionService } from '@/services/rrhh/PositionService';
import { useState } from 'react';

export default function TestFirestorePage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testFirestoreConnection = async () => {
    setLoading(true);
    setResults([]);

    try {
      addResult('🔍 Probando conexión a Firestore...');

      // Test Departments
      addResult('📁 Probando Departamentos...');
      const departments = await DepartmentService.getAll();
      addResult(`✅ Departamentos encontrados: ${departments.length}`);

      // Test Positions
      addResult('👔 Probando Puestos...');
      const positions = await PositionService.getAll();
      addResult(`✅ Puestos encontrados: ${positions.length}`);

      // Test Personnel
      addResult('👥 Probando Personal...');
      const personnel = await PersonnelService.getAll();
      addResult(`✅ Personal encontrado: ${personnel.length}`);

      addResult('🎉 ¡Conexión exitosa!');
    } catch (error) {
      addResult(
        `❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
      console.error('Error testing Firestore:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTestData = async () => {
    setLoading(true);
    setResults([]);

    try {
      addResult('🌱 Creando datos de prueba...');

      // Crear departamento de prueba
      const department = await DepartmentService.create({
        name: 'Departamento de Prueba',
        description: 'Departamento creado para testing',
        is_active: true,
      });
      addResult(`✅ Departamento creado: ${department.name}`);

      // Crear puesto de prueba
      const positionId = await PositionService.create({
        nombre: 'Puesto de Prueba',
        descripcion_responsabilidades: 'Puesto creado para testing',
        departamento_id: department.id,
        competenciasRequeridas: [],
        frecuenciaEvaluacion: 12,
        nivel: 'operativo' as const,
      });
      addResult(`✅ Puesto creado: ${positionId}`);

      // Crear personal de prueba
      const personnel = await PersonnelService.create({
        nombres: 'Juan',
        apellidos: 'Prueba',
        email: 'juan.prueba@test.com',
        estado: 'Activo',
        meta_mensual: 0,
        comision_porcentaje: 0,
        tipo_personal: 'administrativo',
        puestoId: positionId,
        competenciasActuales: [],
        capacitacionesRealizadas: [],
        evaluaciones: [],
      });
      addResult(
        `✅ Personal creado: ${personnel.nombres} ${personnel.apellidos}`
      );

      addResult('🎉 ¡Datos de prueba creados exitosamente!');
    } catch (error) {
      addResult(
        `❌ Error creando datos: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
      console.error('Error creating test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSeed = async () => {
    setLoading(true);
    setResults([]);

    try {
      addResult('🌱 Ejecutando seed de datos...');

      const response = await fetch('/api/seed/rrhh', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        addResult('🎉 ¡Seed ejecutado exitosamente!');
        addResult(result.message);
      } else {
        addResult(`❌ Error en seed: ${result.error}`);
      }
    } catch (error) {
      addResult(
        `❌ Error ejecutando seed: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
      console.error('Error running seed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Test Firestore
              </h1>
              <p className="text-gray-600">
                Prueba la conexión y funcionalidad de Firestore
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Button
                onClick={testFirestoreConnection}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Probando...' : 'Probar Conexión'}
              </Button>

              <Button
                onClick={createTestData}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Creando...' : 'Crear Datos de Prueba'}
              </Button>

              <Button
                onClick={runSeed}
                disabled={loading}
                variant="secondary"
                className="w-full"
              >
                {loading ? 'Ejecutando...' : 'Ejecutar Seed Completo'}
              </Button>
            </div>

            {results.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Resultados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <div key={index} className="text-sm font-mono">
                        {result}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Instrucciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>1. Probar Conexión:</strong> Verifica que Firestore
                    esté funcionando
                  </p>
                  <p>
                    <strong>2. Crear Datos de Prueba:</strong> Crea un
                    departamento, puesto y personal de prueba
                  </p>
                  <p>
                    <strong>3. Ejecutar Seed Completo:</strong> Pobla la base de
                    datos con datos completos
                  </p>
                  <p className="text-red-600 mt-4">
                    <strong>Nota:</strong> Si hay errores, verifica que
                    Firestore esté habilitado en Firebase Console
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
