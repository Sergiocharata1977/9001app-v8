'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PositionForm } from '@/components/rrhh/PositionForm';
import { PositionFormData } from '@/types/rrhh';
import { PositionService } from '@/services/rrhh/PositionService';
import { Position } from '@/types/rrhh';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Users, Briefcase, DollarSign, TrendingUp, FileText, Award, Clock, Building2, User, GraduationCap } from 'lucide-react';

export default function PositionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const positionId = params.id as string;

  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock stats - in a real app, these would come from the backend
  const stats = [
    {
      title: 'Empleados Asignados',
      value: '3',
      change: '+1',
      changeType: 'positive',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Nivel Jerárquico',
      value: 'Gerencial',
      change: '0%',
      changeType: 'neutral',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Salario Promedio',
      value: '$25K',
      change: '+5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Evaluaciones',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Certificaciones',
      value: '2',
      change: '+1',
      changeType: 'positive',
      icon: Award,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Antigüedad Promedio',
      value: '3.2 años',
      change: '+0.5',
      changeType: 'positive',
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  useEffect(() => {
    loadPosition();
  }, [positionId]);

  const loadPosition = async () => {
    try {
      setLoading(true);
      const data = await PositionService.getById(positionId);
      setPosition(data);
    } catch (error) {
      console.error('Error loading position:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: PositionFormData) => {
    try {
      setIsLoading(true);
      await PositionService.update(positionId, formData);
      await loadPosition();
      setEditing(false);
    } catch (error) {
      console.error('Error updating position:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar este puesto?')) {
      try {
        await PositionService.delete(positionId);
        router.push('/dashboard/rrhh/puestos');
      } catch (error) {
        console.error('Error deleting position:', error);
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (editing && position) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Editar Puesto</h1>
          </div>
          
          <PositionForm
            initialData={position}
            onSubmit={handleSave}
            isLoading={isLoading}
            onCancel={() => setEditing(false)}
          />
        </div>
      </DashboardLayout>
    );
  }

  if (!position) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Puesto no encontrado</h3>
            <p className="text-gray-500 mb-4">El puesto que buscas no existe o fue eliminado</p>
            <Button onClick={() => router.push('/dashboard/rrhh/puestos')}>
              Volver a Puestos
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{position.nombre}</h1>
              <p className="text-gray-600 mt-1">{position.descripcion_responsabilidades}</p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 
                        stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500">vs mes anterior</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Main Content - 70% */}
          <div className="lg:col-span-7 space-y-6">
            {/* Información del Puesto */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Información del Puesto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre del Puesto</label>
                    <p className="text-lg font-semibold text-gray-900">{position.nombre}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Departamento</label>
                    <p className="text-lg font-semibold text-gray-900">{position.departamento_id || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nivel Jerárquico</label>
                    <Badge className="bg-blue-100 text-blue-800">
                      {position.reporta_a_id || 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Salario</label>
                    <p className="text-lg font-semibold text-gray-900">N/A</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Descripción</label>
                  <p className="text-gray-700 mt-1">{position.descripcion_responsabilidades || 'Sin descripción disponible'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Responsabilidades */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Responsabilidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <p className="text-sm font-medium text-blue-900">Liderar equipos de trabajo</p>
                    <p className="text-xs text-blue-700">Responsabilidad principal</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50">
                    <p className="text-sm font-medium text-green-900">Gestionar recursos del departamento</p>
                    <p className="text-xs text-green-700">Responsabilidad operativa</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50">
                    <p className="text-sm font-medium text-purple-900">Reportar a la dirección</p>
                    <p className="text-xs text-purple-700">Responsabilidad administrativa</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requisitos */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Requisitos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Experiencia Requerida</label>
                    <p className="text-gray-700 mt-1">{position.requisitos_experiencia || 'Sin especificar'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Formación Requerida</label>
                    <p className="text-gray-700 mt-1">{position.requisitos_formacion || 'Sin especificar'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Competencias</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">Liderazgo</Badge>
                      <Badge variant="outline">Gestión</Badge>
                      <Badge variant="outline">Comunicación</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Related Content - 30% */}
          <div className="lg:col-span-3 space-y-6">
            {/* Personal Asignado */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Personal Asignado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      JP
                    </div>
                    <div>
                      <p className="text-sm font-medium">Juan Pérez</p>
                      <p className="text-xs text-gray-500">Gerente</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      ML
                    </div>
                    <div>
                      <p className="text-sm font-medium">María López</p>
                      <p className="text-xs text-gray-500">Coordinadora</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      CG
                    </div>
                    <div>
                      <p className="text-sm font-medium">Carlos García</p>
                      <p className="text-xs text-gray-500">Analista</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evaluaciones del Puesto */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Evaluaciones del Puesto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Última Evaluación</span>
                    <span className="text-sm font-semibold text-green-600">4.2/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Promedio Anual</span>
                    <span className="text-sm font-semibold text-blue-600">4.0/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Evaluaciones</span>
                    <span className="text-sm font-semibold text-purple-600">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documentos del Puesto */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Documentos del Puesto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Descripción del Puesto</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Manual de Procedimientos</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Evaluación de Desempeño</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historial del Puesto */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Historial del Puesto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Puesto actualizado</p>
                      <p className="text-xs text-gray-500">Hace 1 semana</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Nuevo empleado asignado</p>
                      <p className="text-xs text-gray-500">Hace 2 semanas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Puesto creado</p>
                      <p className="text-xs text-gray-500">Hace 3 meses</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}