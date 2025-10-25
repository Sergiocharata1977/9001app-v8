import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Briefcase, Edit, Trash2, Eye, Target, Download, Building2, UserCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PositionCard } from './PositionCard';
import { PositionForm } from './PositionForm';
import { Position, PositionFormData } from '@/types/rrhh';
import { PositionService } from '@/services/rrhh/PositionService';

interface PositionListingProps {
  onViewPosition?: (position: Position) => void;
  onEditPosition?: (position: Position) => void;
  onNewPosition?: () => void;
}

export function PositionListing({
  onViewPosition,
  onEditPosition,
  onNewPosition,
}: PositionListingProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await PositionService.getAll();
      setPositions(data);
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los puestos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredPositions = useMemo(() => {
    return positions.filter((position) => {
      const matchesSearch =
        position.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.descripcion_responsabilidades?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.requisitos_experiencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.requisitos_formacion?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [positions, searchTerm]);

  const handleNewPosition = useCallback(() => {
    setSelectedPosition(null);
    setShowForm(true);
    onNewPosition?.();
  }, [onNewPosition]);

  const handleFormSuccess = useCallback(async (data: PositionFormData) => {
    try {
      if (selectedPosition) {
        await PositionService.update(selectedPosition.id, data);
      } else {
        await PositionService.create(data);
      }
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Error al guardar puesto:', error);
      toast({
        title: 'Error',
        description: `No se pudo guardar el puesto: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    }
  }, [selectedPosition, fetchData, toast]);

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
  }, []);

  const handleEditPosition = useCallback((position: Position) => {
    setSelectedPosition(position);
    setShowForm(true);
    onEditPosition?.(position);
  }, [onEditPosition]);

  const handleDeleteClick = useCallback((position: Position) => {
    setPositionToDelete(position);
    setShowDeleteAlert(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (positionToDelete) {
      try {
        await PositionService.delete(positionToDelete.id);
        toast({
          title: 'Éxito',
          description: `Puesto "${positionToDelete.nombre}" eliminado.`,
        });
        fetchData();
      } catch (error) {
        console.error('Error deleting position:', error);
        toast({
          title: 'Error',
          description: `No se pudo eliminar el puesto: ${error instanceof Error ? error.message : String(error)}`,
          variant: 'destructive',
        });
      } finally {
        setShowDeleteAlert(false);
        setPositionToDelete(null);
      }
    }
  }, [positionToDelete, fetchData, toast]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteAlert(false);
    setPositionToDelete(null);
  }, []);

  const handleViewDetails = useCallback((position: Position) => {
    setSelectedPosition(position);
    setShowDetails(true);
    onViewPosition?.(position);
  }, [onViewPosition]);
  
  const handleCardClick = useCallback((position: Position) => {
    // Navegar a la página de detalle del puesto
    router.push(`/dashboard/rrhh/puestos/${position.id}`);
  }, [router]);

  const handleCloseDetails = useCallback(() => {
    setShowDetails(false);
    setSelectedPosition(null);
  }, []);

  const handleSeedData = useCallback(async () => {
    try {
      const response = await fetch('/api/seed/rrhh/fresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Datos sembrados exitosamente:', result);
        // Recargar datos después del seed
        await fetchData();
        toast({
          title: 'Éxito',
          description: 'Datos de prueba agregados exitosamente',
        });
      } else {
        const error = await response.json();
        console.error('Error al sembrar datos:', error);
        toast({
          title: 'Error',
          description: 'Error al agregar datos de prueba',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error al sembrar datos:', error);
      toast({
        title: 'Error',
        description: 'Error al agregar datos de prueba',
        variant: 'destructive',
      });
    }
  }, [fetchData, toast]);

  const stats = useMemo(() => {
    const total = positions.length;
    const activos = positions.length; // Todos los puestos están activos por defecto
    const departamentos = new Set(positions.map(p => p.departamento_id).filter(Boolean)).size;
    
    return { total, activos, departamentos };
  }, [positions]);

  const renderContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 border-0 shadow-md">
              <CardContent className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (filteredPositions.length === 0) {
      return (
        <div className="text-center p-8">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No hay puestos registrados</h3>
          <p className="mt-2 text-sm text-gray-600">
            Empieza creando un nuevo puesto o importa datos de prueba.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button onClick={handleNewPosition}>
              <Plus className="mr-2 h-4 w-4" /> Crear Puesto
            </Button>
            <Button variant="outline" onClick={handleSeedData} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Datos de Prueba
            </Button>
          </div>
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPositions.map((position) => (
            <PositionCard
              key={position.id}
              position={position}
              onEdit={handleEditPosition}
              onDelete={handleDeleteClick}
              onView={handleViewDetails}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      );
    }

    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-900">Puesto</th>
                  <th className="text-left p-4 font-medium text-gray-900">Departamento</th>
                  <th className="text-left p-4 font-medium text-gray-900">Responsable</th>
                  <th className="text-left p-4 font-medium text-gray-900">Estado</th>
                  <th className="text-left p-4 font-medium text-gray-900">Fecha Creación</th>
                  <th className="text-left p-4 font-medium text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPositions.map((position) => (
                  <tr
                    key={position.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleCardClick(position)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardClick(position);
                      }
                    }}
                    aria-label={`Ver detalles de ${position.nombre}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{position.nombre}</p>
                          <p className="text-sm text-gray-600">{position.descripcion_responsabilidades || 'Sin descripción'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{position.departamento_id || 'N/A'}</td>
                    <td className="p-4 text-gray-600">{position.reporta_a_id || 'N/A'}</td>
                    <td className="p-4">
                      <Badge className="bg-emerald-100 text-emerald-800">
                        Activo
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-600">
                      {position.created_at ? new Date(position.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Opciones para ${position.nombre}`}
                            >
                              <Target className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(position)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditPosition(position)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(position)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }, [filteredPositions, isLoading, viewMode, handleNewPosition, handleEditPosition, handleDeleteClick, handleViewDetails, handleCardClick, handleSeedData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Puestos</h1>
          <p className="text-gray-600 mt-2">Administra los puestos de trabajo de la organización</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleNewPosition} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Puesto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Puestos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold">{stats.activos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Departamentos</p>
                <p className="text-2xl font-bold">{stats.departamentos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar puestos por nombre, descripción, requisitos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Más Filtros
        </Button>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
          <TabsList>
            <TabsTrigger value="grid">Tarjetas</TabsTrigger>
            <TabsTrigger value="list">Tabla</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {renderContent}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <PositionForm
              initialData={selectedPosition}
              onSubmit={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {showDetails && selectedPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xl">
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedPosition.nombre}</h2>
                      <Badge className="bg-emerald-100 text-emerald-800">
                        Activo
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleCloseDetails}>Cerrar</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Información del Puesto</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                        <dd className="text-base mt-1">{selectedPosition.descripcion_responsabilidades || 'Sin descripción'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Departamento</dt>
                        <dd className="text-base mt-1">{selectedPosition.departamento_id || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Reporta a</dt>
                        <dd className="text-base mt-1">{selectedPosition.reporta_a_id || 'N/A'}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Requisitos</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Experiencia</dt>
                        <dd className="text-base mt-1">{selectedPosition.requisitos_experiencia || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Formación</dt>
                        <dd className="text-base mt-1">{selectedPosition.requisitos_formacion || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Fecha de Creación</dt>
                        <dd className="text-base mt-1">
                          {selectedPosition.created_at ? new Date(selectedPosition.created_at).toLocaleDateString() : 'N/A'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Alerta de confirmación de eliminación */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el puesto{' '}
              <span className="font-semibold">{positionToDelete?.nombre}</span> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}