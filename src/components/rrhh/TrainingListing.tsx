'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="space-y-6">
      <PageHeader
        title="Capacitaciones"
        description="Gestión de capacitaciones y formación"
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'RRHH', href: '/dashboard/rrhh' },
          { label: 'Capacitaciones' },
        ]}
        actions={
          <Button 
            onClick={handleCreate}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Capacitación
          </Button>
        }
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por tema o descripción..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-slate-50 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-slate-50 border-slate-200">
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
          <SelectTrigger className="w-full sm:w-48 bg-slate-50 border-slate-200">
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
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 font-medium">Total</p>
            <p className="text-2xl font-bold text-slate-900">{trainings.length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 font-medium">En Curso</p>
            <p className="text-2xl font-bold text-emerald-600">
              {trainings.filter(t => t.estado === 'en_curso').length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 font-medium">Planificadas</p>
            <p className="text-2xl font-bold text-amber-600">
              {trainings.filter(t => t.estado === 'planificada').length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 font-medium">Completadas</p>
            <p className="text-2xl font-bold text-slate-600">
              {trainings.filter(t => t.estado === 'completada').length}
            </p>
          </CardContent>
        </Card>
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
  );
}
