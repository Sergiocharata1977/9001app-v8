'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PersonnelForm } from '@/components/rrhh/PersonnelForm';
import { PersonnelFormData } from '@/types/rrhh';
import { PersonnelService } from '@/services/rrhh/PersonnelService';
import { Personnel } from '@/types/rrhh';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Briefcase,
  FileText,
  Award,
  User,
  Star,
  GraduationCap,
  Folder,
} from 'lucide-react';

export default function PersonnelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const personnelId = params.id as string;

  const [personnel, setPersonnel] = useState<Personnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadPersonnel = useCallback(async () => {
    try {
      setLoading(true);
      const data = await PersonnelService.getById(personnelId);
      setPersonnel(data);
    } catch (error) {
      console.error('Error loading personnel:', error);
    } finally {
      setLoading(false);
    }
  }, [personnelId]);

  useEffect(() => {
    loadPersonnel();
  }, [loadPersonnel]);

  const handleSave = async (formData: PersonnelFormData) => {
    try {
      setIsLoading(true);

      if (formData.puesto && formData.puesto !== personnel?.puesto) {
        await fetch(`/api/personnel/${personnelId}/position`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            positionId: formData.puesto,
            replaceAssignments: true,
          }),
        });
      }

      await PersonnelService.update(personnelId, formData);
      await loadPersonnel();
      setEditing(false);
    } catch (error) {
      console.error('Error updating personnel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      try {
        await PersonnelService.delete(personnelId);
        router.push('/dashboard/rrhh/personnel');
      } catch (error) {
        console.error('Error deleting personnel:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (editing && personnel) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Editar Empleado</h1>
        </div>

        <PersonnelForm
          initialData={personnel}
          onSubmit={handleSave}
          isLoading={isLoading}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  if (!personnel) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Empleado no encontrado
          </h3>
          <p className="text-gray-500 mb-4">
            El empleado que buscas no existe o fue eliminado
          </p>
          <Button onClick={() => router.push('/dashboard/rrhh/personnel')}>
            Volver a Personal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
              {personnel.nombres
                ?.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {personnel.nombres} {personnel.apellidos}
              </h1>
              <p className="text-gray-600 mt-1">
                {personnel.puesto} - {personnel.departamento}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nombre Completo
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {personnel.nombres} {personnel.apellidos}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {personnel.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Teléfono
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {personnel.telefono || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Estado
                  </label>
                  <Badge
                    className={
                      personnel.estado === 'Activo'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {personnel.estado}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Información Laboral
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Puesto
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {personnel.puesto}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Departamento
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {personnel.departamento}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Supervisor
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {personnel.supervisor_nombre || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Fecha de Ingreso
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {personnel.fecha_ingreso
                      ? personnel.fecha_ingreso instanceof Date
                        ? personnel.fecha_ingreso.toLocaleDateString()
                        : new Date(
                            personnel.fecha_ingreso.seconds * 1000
                          ).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Contexto Asignado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-blue-50">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Procesos
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {personnel.procesos_asignados?.length || 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-50">
                  <p className="text-sm font-medium text-green-900 mb-2">
                    Objetivos
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {personnel.objetivos_asignados?.length || 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50">
                  <p className="text-sm font-medium text-purple-900 mb-2">
                    Indicadores
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {personnel.indicadores_asignados?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Capacitaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-blue-50">
                  <p className="text-sm font-medium text-blue-900">
                    Liderazgo Efectivo
                  </p>
                  <p className="text-xs text-blue-700">Completado - 15 horas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Certificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">ISO 9001:2015</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Contrato de Trabajo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
