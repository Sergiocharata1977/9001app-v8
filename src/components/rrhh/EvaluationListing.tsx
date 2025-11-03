'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EvaluationService } from '@/services/rrhh/EvaluationService';
import { PerformanceEvaluation } from '@/types/rrhh';
import { Plus, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { EvaluationCard } from './EvaluationCard';
import { EvaluationForm } from './EvaluationForm';

export function EvaluationListing() {
  const [evaluations, setEvaluations] = useState<PerformanceEvaluation[]>([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState<
    PerformanceEvaluation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<
    PerformanceEvaluation | undefined
  >();

  useEffect(() => {
    loadEvaluations();
  }, []);

  const filterEvaluations = useCallback(() => {
    let filtered = [...evaluations];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        e =>
          e.periodo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.personnel_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.estado === statusFilter);
    }

    // Filtro por resultado
    if (resultFilter !== 'all') {
      filtered = filtered.filter(e => e.resultado_global === resultFilter);
    }

    setFilteredEvaluations(filtered);
  }, [evaluations, searchTerm, statusFilter, resultFilter]);

  useEffect(() => {
    filterEvaluations();
  }, [filterEvaluations]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await EvaluationService.getAll();
      setEvaluations(data);
    } catch (err) {
      console.error('Error al cargar evaluaciones:', err);
      setError('Error al cargar las evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEvaluation(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (evaluation: PerformanceEvaluation) => {
    setEditingEvaluation(evaluation);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: Partial<PerformanceEvaluation>) => {
    try {
      if (editingEvaluation) {
        await EvaluationService.update(editingEvaluation.id, data);
      } else {
        await EvaluationService.create(
          data as Omit<
            PerformanceEvaluation,
            'id' | 'created_at' | 'updated_at'
          >
        );
      }
      setIsDialogOpen(false);
      loadEvaluations();
    } catch (err) {
      console.error('Error al guardar evaluación:', err);
      setError('Error al guardar la evaluación');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta evaluación?')) return;

    try {
      await EvaluationService.delete(id);
      loadEvaluations();
    } catch (err) {
      console.error('Error al eliminar evaluación:', err);
      setError('Error al eliminar la evaluación');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando evaluaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Evaluaciones de Desempeño</h2>
            <p className="text-gray-500">
              Gestión de evaluaciones de competencias
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Evaluación
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por período o empleado..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="borrador">Borrador</SelectItem>
              <SelectItem value="publicado">Publicado</SelectItem>
              <SelectItem value="cerrado">Cerrado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={resultFilter} onValueChange={setResultFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Resultado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los resultados</SelectItem>
              <SelectItem value="Apto">Apto</SelectItem>
              <SelectItem value="No Apto">No Apto</SelectItem>
              <SelectItem value="Requiere Capacitación">
                Requiere Capacitación
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold">{evaluations.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Aptos</p>
            <p className="text-2xl font-bold">
              {evaluations.filter(e => e.resultado_global === 'Apto').length}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Requieren Capacitación</p>
            <p className="text-2xl font-bold">
              {
                evaluations.filter(
                  e => e.resultado_global === 'Requiere Capacitación'
                ).length
              }
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">No Aptos</p>
            <p className="text-2xl font-bold">
              {evaluations.filter(e => e.resultado_global === 'No Apto').length}
            </p>
          </div>
        </div>

        {/* Lista de Evaluaciones */}
        {filteredEvaluations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron evaluaciones</p>
            <Button onClick={handleCreate} className="mt-4">
              Crear Primera Evaluación
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvaluations.map(evaluation => (
              <EvaluationCard
                key={evaluation.id}
                evaluation={evaluation}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Dialog para Crear/Editar */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvaluation ? 'Editar' : 'Nueva'} Evaluación
              </DialogTitle>
            </DialogHeader>
            <EvaluationForm
              evaluation={editingEvaluation}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
