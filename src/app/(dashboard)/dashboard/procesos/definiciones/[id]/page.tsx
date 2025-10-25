'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProcessDefinitionForm } from '@/components/procesos/ProcessDefinition';
import { ProcessQualityObjectives } from '@/components/procesos/ProcessQualityObjectives';
import { ProcessQualityMetrics } from '@/components/procesos/ProcessQualityMetrics';
import { ProcessDefinitionFormData } from '@/lib/validations/procesos';
import { ProcessService } from '@/services/procesos/ProcessService';
import { ProcessDefinition } from '@/types/procesos';
import { QualityObjective, QualityIndicator, Measurement } from '@/types/quality';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Trash2, FileText, Tag, File, User, Clock, CheckCircle, Target, BarChart3 } from 'lucide-react';

export default function ProcessDefinitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const processId = params.id as string;

  const [process, setProcess] = useState<ProcessDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Quality data state
  const [qualityObjectives, setQualityObjectives] = useState<QualityObjective[]>([]);
  const [qualityIndicators, setQualityIndicators] = useState<QualityIndicator[]>([]);
  const [qualityMeasurements, setQualityMeasurements] = useState<Measurement[]>([]);

  // Mock stats - in a real app, these would come from the backend
  const stats = [
    {
      title: 'Registros Activos',
      value: '5',
      change: '+2',
      changeType: 'positive' as const,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Versión Actual',
      value: '2.1',
      change: '',
      changeType: 'neutral' as const,
      icon: Tag,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Documentos',
      value: '12',
      change: '+3',
      changeType: 'positive' as const,
      icon: File,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Responsable',
      value: 'Juan Pérez',
      change: '',
      changeType: 'neutral' as const,
      icon: User,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Última Actualización',
      value: '15 días',
      change: '',
      changeType: 'positive' as const,
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Estado',
      value: 'Activo',
      change: '',
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100'
    }
  ];

  useEffect(() => {
    const fetchProcess = async () => {
      try {
        const data = await ProcessService.getById(processId);
        setProcess(data);
      } catch (error) {
        console.error('Error al cargar proceso:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchQualityData = async () => {
      try {
        // Fetch quality objectives for this process
        const objectives = await fetch(`/api/quality/processes/${processId}/objectives`).then(res => res.json());
        setQualityObjectives(objectives);

        // Get all indicators for these objectives
        const objectiveIds = objectives.map((obj: QualityObjective) => obj.id);
        const allIndicators: QualityIndicator[] = [];
        for (const objId of objectiveIds) {
          const indicators = await fetch(`/api/quality/objectives/${objId}/indicators`).then(res => res.json());
          allIndicators.push(...indicators);
        }
        setQualityIndicators(allIndicators);

        // Get recent measurements for these indicators
        const indicatorIds = allIndicators.map(ind => ind.id);
        const allMeasurements: Measurement[] = [];
        for (const indId of indicatorIds) {
          const measurements = await fetch(`/api/quality/indicators/${indId}/measurements`).then(res => res.json());
          allMeasurements.push(...measurements.slice(0, 5)); // Last 5 measurements per indicator
        }
        setQualityMeasurements(allMeasurements);
      } catch (error) {
        console.error('Error al cargar datos de calidad:', error);
      }
    };

    if (processId) {
      fetchProcess();
      fetchQualityData();
    }
  }, [processId]);

  const handleFormSubmit = async (data: ProcessDefinitionFormData) => {
    setIsLoading(true);
    try {
      await ProcessService.update(processId, data);
      const updatedProcess = await ProcessService.getById(processId);
      setProcess(updatedProcess);
      setEditing(false);
    } catch (error) {
      console.error('Error al actualizar proceso:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta definición de proceso?')) return;

    try {
      await ProcessService.delete(processId);
      router.push('/dashboard/procesos');
    } catch (error) {
      console.error('Error al eliminar proceso:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!process) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Proceso no encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            El proceso que buscas no existe o ha sido eliminado.
          </p>
          <Button
            onClick={() => router.push('/dashboard/procesos')}
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al listado
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (editing) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setEditing(false)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                ← Volver al detalle
              </button>
            </div>
            <ProcessDefinitionForm
              initialData={process}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isLoading={isLoading}
            />
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
              <h1 className="text-3xl font-bold text-gray-900">{process.nombre}</h1>
              <p className="text-gray-600 mt-1">Código: {process.codigo}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={process.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {process.estado === 'activo' ? 'Activo' : 'Inactivo'}
            </Badge>
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
                    {stat.change && (
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-medium ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {stat.change}
                        </span>
                        <span className="text-xs text-gray-500">vs mes anterior</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="quality">Calidad</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="related">Relacionados</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Objetivo</h4>
                    <p className="text-gray-600">{process.objetivo}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Alcance</h4>
                    <p className="text-gray-600">{process.alcance}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Responsable</h4>
                    <p className="text-gray-600">{process.responsable}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Estado</h4>
                    <Badge className={process.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {process.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality">
            <div className="space-y-6">
              {/* Quality Metrics */}
              <ProcessQualityMetrics
                objectives={qualityObjectives}
                indicators={qualityIndicators}
                measurements={qualityMeasurements}
              />

              {/* Quality Objectives Section */}
              <ProcessQualityObjectives
                processId={processId}
                onNavigateToQuality={() => router.push('/dashboard/quality')}
              />
            </div>
          </TabsContent>

          <TabsContent value="details">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Detalles del Proceso</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <p className="text-gray-900">{process.nombre}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                    <p className="text-gray-900">{process.codigo}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
                    <p className="text-gray-900">{process.objetivo}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alcance</label>
                    <p className="text-gray-900">{process.alcance}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                    <p className="text-gray-900">{process.responsable}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="related">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Entidades Relacionadas</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Registros de Proceso</h4>
                    <p className="text-gray-600">Registros asociados a esta definición de proceso</p>
                    <Button
                      className="mt-2"
                      onClick={() => router.push(`/dashboard/procesos/${processId}/registros`)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Ver Registros
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Objetivos de Calidad</h4>
                    <p className="text-gray-600">Objetivos SMART vinculados a este proceso</p>
                    <Button
                      className="mt-2"
                      onClick={() => router.push(`/dashboard/quality/objetivos?process_definition_id=${processId}`)}
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Ver Objetivos
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Documentos</h4>
                    <p className="text-gray-600">Documentos asociados al proceso</p>
                    {/* Aquí iría la lista de documentos */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Historial de Cambios</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Proceso creado</p>
                      <p className="text-sm text-gray-500">
                        {new Date(process.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Última actualización</p>
                      <p className="text-sm text-gray-500">
                        {new Date(process.updatedAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}