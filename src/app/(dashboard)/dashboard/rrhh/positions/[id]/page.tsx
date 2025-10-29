'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, User, Briefcase, X, Save } from 'lucide-react';
import { PositionWithAssignments, Personnel } from '@/types/rrhh';
import { ProcessDefinition } from '@/types/procesos';
import { AssignPersonnelDialog } from '@/components/positions/AssignPersonnelDialog';

export default function PositionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const positionId = params.id as string;

  const [position, setPosition] = useState<PositionWithAssignments | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [allProcesses, setAllProcesses] = useState<ProcessDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProcesses, setEditingProcesses] = useState(false);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Cargar puesto con asignaciones
      const posRes = await fetch(`/api/positions/${positionId}`);
      const posData = await posRes.json();
      setPosition(posData);
      setSelectedProcesses(posData.procesos_asignados || []);

      // Cargar personal en este puesto
      const persRes = await fetch(`/api/positions/${positionId}/personnel`);
      const persData = await persRes.json();
      setPersonnel(persData);

      // Cargar todos los procesos disponibles
      const procRes = await fetch('/api/processes/definitions');
      if (procRes.ok) {
        const procData = await procRes.json();
        setAllProcesses(procData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [positionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveProcesses = async () => {
    try {
      setSaving(true);
      
      const res = await fetch(`/api/positions/${positionId}/assignments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          procesos_asignados: selectedProcesses,
          objetivos_asignados: position?.objetivos_asignados || [],
          indicadores_asignados: position?.indicadores_asignados || [],
          propagate: true, // Propagar a personal
        }),
      });

      if (res.ok) {
        await loadData();
        setEditingProcesses(false);
        alert('Procesos actualizados exitosamente');
      } else {
        alert('Error al actualizar procesos');
      }
    } catch (error) {
      console.error('Error saving processes:', error);
      alert('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar este puesto?')) {
      try {
        const res = await fetch(`/api/positions/${positionId}`, {
          method: 'DELETE',
        });
        
        if (res.ok) {
          router.push('/dashboard/rrhh/positions');
        } else {
          const data = await res.json();
          alert(data.error || 'Error al eliminar puesto');
        }
      } catch (error) {
        console.error('Error deleting position:', error);
        alert('Error al eliminar puesto');
      }
    }
  };

  const addProcess = (processId: string) => {
    if (!selectedProcesses.includes(processId)) {
      setSelectedProcesses([...selectedProcesses, processId]);
    }
  };

  const removeProcess = (processId: string) => {
    setSelectedProcesses(selectedProcesses.filter(id => id !== processId));
  };

  const handleAssignPersonnel = async (personnelIds: string[]) => {
    try {
      // Asignar cada persona al puesto
      for (const personnelId of personnelIds) {
        await fetch(`/api/personnel/${personnelId}/position`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            positionId,
            replaceAssignments: true, // Reemplazar con asignaciones del puesto
          }),
        });
      }
      
      // Recargar datos
      await loadData();
      alert(`${personnelIds.length} persona(s) asignada(s) exitosamente`);
    } catch (error) {
      console.error('Error assigning personnel:', error);
      alert('Error al asignar personal');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Puesto no encontrado</h3>
          <Button onClick={() => router.push('/dashboard/rrhh/positions')}>
            Volver a Puestos
          </Button>
        </div>
      </div>
    );
  }

  const assignedPerson = personnel[0]; // Relación 1:1
  const assignedProcessesDetails = (position.procesos_details || []) as ProcessDefinition[];

  return (
    <div className="space-y-6 p-6">
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
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Asignado */}
        <Card className="shadow-lg shadow-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Personal Asignado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedPerson ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {assignedPerson.nombres?.[0]}{assignedPerson.apellidos?.[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {assignedPerson.nombres} {assignedPerson.apellidos}
                    </h3>
                    <p className="text-sm text-gray-600">{assignedPerson.email}</p>
                    <Badge className="mt-2 bg-green-100 text-green-800">
                      {assignedPerson.estado}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/dashboard/rrhh/personnel/${assignedPerson.id}`)}
                >
                  Ver Detalle
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No hay personal asignado a este puesto</p>
                <Button variant="outline" onClick={() => setShowAssignDialog(true)}>
                  Asignar Persona
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información del Puesto */}
        <Card className="shadow-lg shadow-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-600" />
              Información del Puesto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Departamento</label>
              <p className="text-gray-900">{position.departamento_id || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Reporta a</label>
              <p className="text-gray-900">{position.reporta_a_id || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Requisitos de Experiencia</label>
              <p className="text-gray-700 text-sm">{position.requisitos_experiencia || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Requisitos de Formación</label>
              <p className="text-gray-700 text-sm">{position.requisitos_formacion || 'No especificado'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Procesos Asignados */}
      <Card className="shadow-lg shadow-green-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-600" />
              Procesos Asignados ({selectedProcesses.length})
            </CardTitle>
            {!editingProcesses ? (
              <Button 
                onClick={() => setEditingProcesses(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Procesos
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveProcesses}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedProcesses(position.procesos_asignados || []);
                    setEditingProcesses(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingProcesses && (
            <div className="mb-4 p-4 bg-green-50 rounded-lg">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Agregar Proceso
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                onChange={(e) => {
                  if (e.target.value) {
                    addProcess(e.target.value);
                    e.target.value = '';
                  }
                }}
              >
                <option value="">Seleccionar proceso...</option>
                {allProcesses
                  .filter(p => !selectedProcesses.includes(p.id))
                  .map(process => (
                    <option key={process.id} value={process.id}>
                      {process.codigo} - {process.nombre}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {selectedProcesses.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay procesos asignados a este puesto</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedProcesses.map(processId => {
                const process = allProcesses.find(p => p.id === processId) || 
                               assignedProcessesDetails.find((p) => p.id === processId);
                
                return (
                  <div 
                    key={processId}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {process?.codigo || processId}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {process?.nombre || 'Cargando...'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!editingProcesses && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/dashboard/procesos/${processId}`)}
                        >
                          Ver Detalle
                        </Button>
                      )}
                      {editingProcesses && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeProcess(processId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para asignar personal */}
      <AssignPersonnelDialog
        open={showAssignDialog}
        onClose={() => setShowAssignDialog(false)}
        positionId={positionId}
        positionName={position?.nombre || ''}
        onAssign={handleAssignPersonnel}
      />
    </div>
  );
}
