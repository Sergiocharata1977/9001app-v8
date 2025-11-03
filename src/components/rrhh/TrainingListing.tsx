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
import { TrainingService } from '@/services/rrhh/TrainingService';
import { Training } from '@/types/rrhh';
import { Plus, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { TrainingCard } from './TrainingCard';
import { TrainingForm } from './TrainingForm';

export function TrainingListing() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [filteredTrainings, setFilteredTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<
    Training | undefined
  >();

  useEffect(() => {
    loadTrainings();
  }, []);

  const filterTrainings = useCallback(() => {
    let filtered = [...trainings];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        t =>
          t.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.estado === statusFilter);
    }

    // Filtro por modalidad
    if (modalityFilter !== 'all') {
      filtered = filtered.filter(t => t.modalidad === modalityFilter);
    }

    setFilteredTrainings(filtered);
  }, [trainings, searchTerm, statusFilter, modalityFilter]);

  useEffect(() => {
    filterTrainings();
  }, [filterTrainings]);

  const loadTrainings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TrainingService.getAll();
      setTrainings(data);
    } catch (err) {
      console.error('Error al cargar capacitaciones:', err);
      setError('Error al cargar las capacitaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTraining(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (training: Training) => {
    setEditingTraining(training);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: Partial<Training>) => {
    try {
      if (editingTraining) {
        await TrainingService.update(editingTraining.id, data);
      } else {
        await TrainingService.create(
          data as Omit<Training, 'id' | 'created_at' | 'updated_at'>
        );
      }
      setIsDialogOpen(false);
      loadTrainings();
    } catch (err) {
      console.error('Error al guardar capacitación:', err);
      setError('Error al guardar la capacitación');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta capacitación?')) return;

    try {
      await TrainingService.delete(id);
      loadTrainings();
    } catch (err) {
      console.error('Error al eliminar capacitación:', err);
      setError('Error al eliminar la capacitación');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando capacitaciones...</p>
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
            <h2 className="text-2xl font-bold">Capacitaciones</h2>
            <p className="text-gray-500">
              Gestión de capacitaciones y formación
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Capacitación
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
                placeholder="Buscar por tema o descripción..."
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
              <SelectItem value="planificada">Planificada</SelectItem>
              <SelectItem value="en_curso">En Curso</SelectItem>
              <SelectItem value="completada">Completada</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>

          <Select value={modalityFilter} onValueChange={setModalityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Modalidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las modalidades</SelectItem>
              <SelectItem value="presencial">Presencial</SelectItem>
              <SelectItem value="virtual">Virtual</SelectItem>
              <SelectItem value="mixta">Mixta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold">{trainings.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">En Curso</p>
            <p className="text-2xl font-bold">
              {trainings.filter(t => t.estado === 'en_curso').length}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Planificadas</p>
            <p className="text-2xl font-bold">
              {trainings.filter(t => t.estado === 'planificada').length}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Completadas</p>
            <p className="text-2xl font-bold">
              {trainings.filter(t => t.estado === 'completada').length}
            </p>
          </div>
        </div>

        {/* Lista de Capacitaciones */}
        {filteredTrainings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron capacitaciones</p>
            <Button onClick={handleCreate} className="mt-4">
              Crear Primera Capacitación
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrainings.map(training => (
              <TrainingCard
                key={training.id}
                training={training}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Dialog para Crear/Editar */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTraining ? 'Editar' : 'Nueva'} Capacitación
              </DialogTitle>
            </DialogHeader>
            <TrainingForm
              training={editingTraining}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
