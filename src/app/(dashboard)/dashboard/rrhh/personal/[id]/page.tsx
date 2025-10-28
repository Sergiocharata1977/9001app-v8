'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PersonnelForm } from '@/components/rrhh/PersonnelForm';
import { PersonnelFormData } from '@/types/rrhh';
import { PersonnelService } from '@/services/rrhh/PersonnelService';
import { Personnel } from '@/types/rrhh';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Users, Briefcase, DollarSign, TrendingUp, FileText, Award, Clock, User, Star, GraduationCap, Folder } from 'lucide-react';

export default function PersonnelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const personnelId = params.id as string;

  const [personnel, setPersonnel] = useState<Personnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock stats - in a real app, these would come from the backend
  const stats = [
    {
      title: 'Antigüedad',
      value: '3.2 años',
      change: '+0.5',
      changeType: 'positive',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Evaluaciones',
      value: '4.2/5',
      change: '+0.3',
      changeType: 'positive',
      icon: Star,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Capacitaciones',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: GraduationCap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Certificaciones',
      value: '3',
      change: '+1',
      changeType: 'positive',
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Proyectos',
      value: '12',
      change: '+3',
      changeType: 'positive',
      icon: Folder,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Salario Actual',
      value: '$25K',
      change: '+5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  useEffect(() => {
    loadPersonnel();
  }, [personnelId]);

  const loadPersonnel = async () => {
    try {
      setLoading(true);
      const data = await PersonnelService.getById(personnelId);
      setPersonnel(data);
    } catch (error) {
      console.error('Error loading personnel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: PersonnelFormData) => {
    try {
      setIsLoading(true);
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
        router.push('/dashboard/rrhh/personal');
      } catch (error) {
        console.error('Error deleting personnel:', error);
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

  if (editing && personnel) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
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
      </DashboardLayout>
    );
  }

  if (!personnel) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Empleado no encontrado</h3>
            <p className="text-gray-500 mb-4">El empleado que buscas no existe o fue eliminado</p>
            <Button onClick={() => router.push('/dashboard/rrhh/personal')}>
              Volver a Personal
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
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                {personnel.nombres?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{personnel.nombres} {personnel.apellidos}</h1>
                <p className="text-gray-600 mt-1">{personnel.puesto} - {personnel.departamento}</p>
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
            {/* Información Personal */}
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
                    <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                    <p className="text-lg font-semibold text-gray-900">{personnel.nombres} {personnel.apellidos}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-lg font-semibold text-gray-900">{personnel.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teléfono</label>
                    <p className="text-lg font-semibold text-gray-900">{personnel.telefono || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <Badge className={personnel.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {personnel.estado}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información Laboral */}
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
                    <label className="text-sm font-medium text-gray-500">Puesto</label>
                    <p className="text-lg font-semibold text-gray-900">{personnel.puesto}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Departamento</label>
                    <p className="text-lg font-semibold text-gray-900">{personnel.departamento}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Supervisor</label>
                    <p className="text-lg font-semibold text-gray-900">{personnel.supervisor_nombre || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha de Ingreso</label>
                    <p className="text-lg font-semibold text-gray-900">{personnel.fecha_ingreso ? (personnel.fecha_ingreso instanceof Date ? personnel.fecha_ingreso.toLocaleDateString() : new Date(personnel.fecha_ingreso.seconds * 1000).toLocaleDateString()) : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evaluaciones de Desempeño */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Evaluaciones de Desempeño
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-green-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-green-900">Evaluación Q3 2024</span>
                      <span className="text-sm font-semibold text-green-600">4.2/5</span>
                    </div>
                    <p className="text-xs text-green-700">Excelente desempeño en todas las áreas</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-blue-900">Evaluación Q2 2024</span>
                      <span className="text-sm font-semibold text-blue-600">3.8/5</span>
                    </div>
                    <p className="text-xs text-blue-700">Buen desempeño con áreas de mejora</p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-purple-900">Evaluación Q1 2024</span>
                      <span className="text-sm font-semibold text-purple-600">4.0/5</span>
                    </div>
                    <p className="text-xs text-purple-700">Desempeño consistente y estable</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Related Content - 30% */}
          <div className="lg:col-span-3 space-y-6">
            {/* Capacitaciones */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Capacitaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <p className="text-sm font-medium text-blue-900">Liderazgo Efectivo</p>
                    <p className="text-xs text-blue-700">Completado - 15 horas</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50">
                    <p className="text-sm font-medium text-green-900">Gestión de Proyectos</p>
                    <p className="text-xs text-green-700">En progreso - 8/12 horas</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50">
                    <p className="text-sm font-medium text-purple-900">Comunicación Asertiva</p>
                    <p className="text-xs text-purple-700">Completado - 10 horas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificaciones */}
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
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                    <Award className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">PMP Certification</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                    <Award className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Scrum Master</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Proyectos Asignados */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Proyectos Asignados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <p className="text-sm font-medium text-blue-900">Implementación ISO 9001</p>
                    <p className="text-xs text-blue-700">En progreso - 75%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50">
                    <p className="text-sm font-medium text-green-900">Mejora de Procesos</p>
                    <p className="text-xs text-green-700">Completado - 100%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50">
                    <p className="text-sm font-medium text-purple-900">Capacitación del Equipo</p>
                    <p className="text-xs text-purple-700">En progreso - 40%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documentos del Empleado */}
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
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Evaluación de Desempeño</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Certificaciones</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historial del Empleado */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Historial</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Promoción a Gerente</p>
                      <p className="text-xs text-gray-500">Hace 3 meses</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Cambio de departamento</p>
                      <p className="text-xs text-gray-500">Hace 6 meses</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Empleado contratado</p>
                      <p className="text-xs text-gray-500">Hace 3 años</p>
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