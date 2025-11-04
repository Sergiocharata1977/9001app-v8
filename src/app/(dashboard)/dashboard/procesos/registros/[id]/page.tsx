'use client';

import { ProcessRecordTaskFormDialog } from '@/components/processRecords/ProcessRecordTaskFormDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, ArrowLeft, Plus, Trash2, User } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Tipos
interface ProcessRecordStage {
  id: string;
  nombre: string;
  descripcion?: string;
  color: string;
  orden: number;
  es_etapa_final: boolean;
}

interface ProcessRecordTask {
  id: string;
  stage_id: string;
  titulo: string;
  descripcion: string;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  asignado_a_nombre?: string;
  fecha_vencimiento?: string;
  etiquetas: string[];
  orden: number;
}

interface ProcessRecord {
  id: string;
  nombre: string;
  descripcion: string;
  process_definition_nombre?: string;
  status: 'activo' | 'pausado' | 'completado';
  created_at: string;
}

const DEFAULT_STAGES = [
  { nombre: 'Pendiente', color: '#e5e7eb', orden: 0, es_etapa_final: false },
  { nombre: 'En Progreso', color: '#dbeafe', orden: 1, es_etapa_final: false },
  { nombre: 'Completado', color: '#d1fae5', orden: 2, es_etapa_final: true },
];

export default function ProcessRecordKanbanPage() {
  const params = useParams();
  const recordId = params.id as string;

  const [processRecord, setProcessRecord] = useState<ProcessRecord | null>(
    null
  );
  const [stages, setStages] = useState<ProcessRecordStage[]>([]);
  const [tasksByStage, setTasksByStage] = useState<
    Map<string, ProcessRecordTask[]>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [showStageDialog, setShowStageDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedStage, setSelectedStage] = useState<{
    id: string;
    nombre: string;
  } | null>(null);
  const [stageForm, setStageForm] = useState({ nombre: '', color: '#e5e7eb' });

  useEffect(() => {
    loadData();
  }, [recordId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar registro
      const recordRes = await fetch(`/api/process-records/${recordId}`);
      if (recordRes.ok) {
        const recordData = await recordRes.json();
        setProcessRecord(recordData);
      }

      // Cargar etapas
      const stagesRes = await fetch(`/api/process-records/${recordId}/stages`);
      if (stagesRes.ok) {
        const stagesData = await stagesRes.json();
        if (stagesData.length === 0) {
          // Crear etapas por defecto
          await createDefaultStages();
        } else {
          setStages(stagesData);
          // Cargar tareas para cada etapa
          await loadTasks(stagesData);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultStages = async () => {
    try {
      const createdStages: ProcessRecordStage[] = [];

      for (const stage of DEFAULT_STAGES) {
        const res = await fetch(`/api/process-records/${recordId}/stages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stage),
        });

        if (res.ok) {
          const created = await res.json();
          createdStages.push(created);
        }
      }

      setStages(createdStages);
      setTasksByStage(new Map());
    } catch (error) {
      console.error('Error creating default stages:', error);
    }
  };

  const loadTasks = async (stagesList: ProcessRecordStage[]) => {
    const tasksMap = new Map<string, ProcessRecordTask[]>();

    for (const stage of stagesList) {
      try {
        const res = await fetch(
          `/api/process-records/${recordId}/tasks?stage_id=${stage.id}`
        );
        if (res.ok) {
          const tasks = await res.json();
          tasksMap.set(stage.id, tasks);
        }
      } catch (error) {
        console.error(`Error loading tasks for stage ${stage.id}:`, error);
      }
    }

    setTasksByStage(tasksMap);
  };

  const handleCreateStage = async () => {
    try {
      const res = await fetch(`/api/process-records/${recordId}/stages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...stageForm,
          orden: stages.length,
          es_etapa_final: false,
        }),
      });

      if (res.ok) {
        await loadData();
        setShowStageDialog(false);
        setStageForm({ nombre: '', color: '#e5e7eb' });
      }
    } catch (error) {
      console.error('Error creating stage:', error);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    if (
      !confirm(
        '¿Estás seguro de eliminar esta etapa? Se eliminarán todas las tareas asociadas.'
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/process-records/${recordId}/stages/${stageId}`,
        {
          method: 'DELETE',
        }
      );

      if (res.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting stage:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return 'bg-red-100 text-red-800';
      case 'alta':
        return 'bg-orange-100 text-orange-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-1">
                <div className="h-12 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  {[...Array(2)].map((_, j) => (
                    <div
                      key={j}
                      className="h-24 bg-gray-200 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!processRecord) {
    return (
      <div className="p-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Registro no encontrado
            </h3>
            <Link href="/dashboard/procesos/registros">
              <Button className="bg-emerald-600 hover:bg-emerald-700 mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al listado
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/procesos/registros">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {processRecord.nombre}
              </h1>
              <p className="text-gray-600 mt-1">{processRecord.descripcion}</p>
              <div className="flex items-center gap-2 mt-2">
                {processRecord.process_definition_nombre && (
                  <Badge className="bg-blue-100 text-blue-800">
                    {processRecord.process_definition_nombre}
                  </Badge>
                )}
                <Badge className="bg-green-100 text-green-800">
                  {processRecord.status}
                </Badge>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setShowStageDialog(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Etapa
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stages.map(stage => {
            const tasks = tasksByStage.get(stage.id) || [];
            return (
              <Card key={stage.id} className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stage.nombre}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {tasks.length}
                      </p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: stage.color }}
                    >
                      <span className="text-lg font-semibold text-gray-700">
                        {tasks.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tablero Kanban */}
        <div className="flex gap-6 overflow-x-auto pb-4">
          {stages.map(stage => {
            const tasks = tasksByStage.get(stage.id) || [];
            return (
              <div key={stage.id} className="shrink-0 w-80">
                <Card className="border-0 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {stage.nombre}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gray-100 text-gray-600">
                          {tasks.length}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStage(stage.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 min-h-96">
                    {tasks.map(task => (
                      <Card
                        key={task.id}
                        className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-gray-900">
                                {task.titulo}
                              </h4>
                              <Badge
                                className={getPriorityColor(task.prioridad)}
                              >
                                {task.prioridad}
                              </Badge>
                            </div>
                            {task.descripcion && (
                              <p className="text-sm text-gray-600">
                                {task.descripcion}
                              </p>
                            )}
                            {task.asignado_a_nombre && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <User className="h-3 w-3" />
                                {task.asignado_a_nombre}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <Button
                      variant="outline"
                      className="w-full border-dashed border-2"
                      onClick={() => {
                        setSelectedStage({
                          id: stage.id,
                          nombre: stage.nombre,
                        });
                        setShowTaskDialog(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar tarjeta
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dialog para crear etapa */}
      <Dialog open={showStageDialog} onOpenChange={setShowStageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Etapa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre de la Etapa</Label>
              <Input
                id="nombre"
                value={stageForm.nombre}
                onChange={e =>
                  setStageForm({ ...stageForm, nombre: e.target.value })
                }
                placeholder="Ej. Revisión"
              />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={stageForm.color}
                onChange={e =>
                  setStageForm({ ...stageForm, color: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowStageDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateStage}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Crear Etapa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear tarea */}
      {selectedStage && (
        <ProcessRecordTaskFormDialog
          open={showTaskDialog}
          onClose={() => {
            setShowTaskDialog(false);
            setSelectedStage(null);
          }}
          onSuccess={loadData}
          recordId={recordId}
          stageId={selectedStage.id}
          stageName={selectedStage.nombre}
        />
      )}
    </div>
  );
}
