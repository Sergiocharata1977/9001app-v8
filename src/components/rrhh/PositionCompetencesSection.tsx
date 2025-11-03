'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, X, Save, Edit } from 'lucide-react';
import type { Competence, PositionLevel } from '@/types/rrhh';

interface Props {
  positionId: string;
  initialCompetences?: Competence[];
  initialFrecuencia?: number;
  initialNivel?: PositionLevel;
  onUpdate?: () => void;
}

export function PositionCompetencesSection({
  positionId,
  initialCompetences = [],
  initialFrecuencia = 12,
  initialNivel = 'operativo',
  onUpdate,
}: Props) {
  const [competences, setCompetences] = useState<Competence[]>(initialCompetences);
  const [availableCompetences, setAvailableCompetences] = useState<Competence[]>([]);
  const [frecuencia, setFrecuencia] = useState(initialFrecuencia);
  const [nivel, setNivel] = useState<PositionLevel>(initialNivel);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCompetenceId, setSelectedCompetenceId] = useState('');

  useEffect(() => {
    loadAvailableCompetences();
  }, []);

  const loadAvailableCompetences = async () => {
    try {
      const response = await fetch('/api/rrhh/competencias');
      const data = await response.json();
      setAvailableCompetences(data);
    } catch (error) {
      console.error('Error al cargar competencias disponibles:', error);
    }
  };

  const loadPositionCompetences = async () => {
    try {
      const response = await fetch(`/api/rrhh/puestos/${positionId}/competencias`);
      const data = await response.json();
      setCompetences(data);
    } catch (error) {
      console.error('Error al cargar competencias del puesto:', error);
    }
  };

  const handleAddCompetence = async () => {
    if (!selectedCompetenceId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/rrhh/puestos/${positionId}/competencias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competenceId: selectedCompetenceId }),
      });

      if (response.ok) {
        await loadPositionCompetences();
        setShowAddDialog(false);
        setSelectedCompetenceId('');
        onUpdate?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al asignar competencia');
      }
    } catch (error) {
      console.error('Error al asignar competencia:', error);
      alert('Error al asignar competencia');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCompetence = async (competenceId: string) => {
    if (!confirm('¿Está seguro de que desea quitar esta competencia del puesto?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/rrhh/puestos/${positionId}/competencias/${competenceId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await loadPositionCompetences();
        onUpdate?.();
      } else {
        alert('Error al quitar competencia');
      }
    } catch (error) {
      console.error('Error al quitar competencia:', error);
      alert('Error al quitar competencia');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFrecuencia = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/rrhh/puestos/${positionId}/frecuencia-evaluacion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meses: frecuencia }),
      });

      if (response.ok) {
        onUpdate?.();
      } else {
        alert('Error al actualizar frecuencia');
      }
    } catch (error) {
      console.error('Error al actualizar frecuencia:', error);
      alert('Error al actualizar frecuencia');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'tecnica': return 'bg-blue-500';
      case 'blanda': return 'bg-green-500';
      case 'seguridad': return 'bg-red-500';
      case 'iso_9001': return 'bg-purple-500';
      case 'otra': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryLabel = (categoria: string) => {
    switch (categoria) {
      case 'tecnica': return 'Técnica';
      case 'blanda': return 'Blanda';
      case 'seguridad': return 'Seguridad';
      case 'iso_9001': return 'ISO 9001';
      case 'otra': return 'Otra';
      default: return categoria;
    }
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1: return 'Básico';
      case 2: return 'Intermedio';
      case 3: return 'Avanzado';
      case 4: return 'Experto';
      case 5: return 'Maestro';
      default: return level.toString();
    }
  };

  // Filtrar competencias que no están ya asignadas
  const unassignedCompetences = availableCompetences.filter(
    comp => !competences.some(assigned => assigned.id === comp.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Competencias del Puesto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuración del puesto */}
        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="nivel">Nivel del Puesto</Label>
            <Select value={nivel} onValueChange={(value: PositionLevel) => setNivel(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operativo">Operativo</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
                <SelectItem value="gerencial">Gerencial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frecuencia">Frecuencia de Evaluación (meses)</Label>
            <div className="flex gap-2">
              <Input
                id="frecuencia"
                type="number"
                min="1"
                max="60"
                value={frecuencia}
                onChange={(e) => setFrecuencia(parseInt(e.target.value) || 12)}
              />
              <Button onClick={handleUpdateFrecuencia} disabled={loading}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de competencias */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Competencias Asignadas</h3>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Competencia
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Competencia al Puesto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Seleccionar Competencia</Label>
                    <Select value={selectedCompetenceId} onValueChange={setSelectedCompetenceId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Elegir competencia..." />
                      </SelectTrigger>
                      <SelectContent>
                        {unassignedCompetences.map((comp) => (
                          <SelectItem key={comp.id} value={comp.id}>
                            {comp.nombre} (Nivel 3)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddCompetence} disabled={loading || !selectedCompetenceId}>
                      Agregar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {competences.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay competencias asignadas a este puesto
            </div>
          ) : (
            <div className="grid gap-3">
              {competences.map((competence) => (
                <div
                  key={competence.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={getCategoryColor(competence.categoria)}>
                      {getCategoryLabel(competence.categoria)}
                    </Badge>
                    <div>
                      <h4 className="font-medium">{competence.nombre}</h4>
                      <p className="text-sm text-gray-600">
                        Nivel requerido: Avanzado
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveCompetence(competence.id)}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}