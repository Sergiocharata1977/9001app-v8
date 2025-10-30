'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Grid, List, Kanban, Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionCard } from './ActionCard';
import { ActionKanban } from './ActionKanban';
import { ActionFormDialog } from './ActionFormDialog';
import { Action, ActionFormData } from '@/types/actions';
import { ActionService } from '@/services/actions/ActionService';

export const ActionListing: React.FC = () => {
  const router = useRouter();
  const [actions, setActions] = useState<Action[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  // Cargar datos
  const fetchActions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Cargando datos de acciones...');
      const data = await ActionService.getAll();
      console.log('Datos de acciones cargados:', data);
      setActions(data || []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intenta de nuevo más tarde.');
      setActions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  // Filtrar acciones
  const filteredActions = useMemo(() => {
    if (!searchTerm.trim()) return actions;

    const searchLower = searchTerm.toLowerCase();
    return actions.filter(action =>
      action.title?.toLowerCase().includes(searchLower) ||
      action.actionNumber?.toLowerCase().includes(searchLower) ||
      action.description?.toLowerCase().includes(searchLower) ||
      action.responsiblePersonName?.toLowerCase().includes(searchLower) ||
      action.findingNumber?.toLowerCase().includes(searchLower)
    );
  }, [actions, searchTerm]);

  // Handlers
  const handleView = useCallback((action: Action) => {
    router.push(`/dashboard/acciones/${action.id}`);
  }, [router]);

  const handleEdit = useCallback((action: Action) => {
    setSelectedAction(action);
    setShowForm(true);
  }, []);

  const handleNew = useCallback(() => {
    setSelectedAction(null);
    setShowForm(true);
  }, []);

  const handleFormSuccess = useCallback(async (data: ActionFormData) => {
    try {
      if (selectedAction) {
        // Actualizar acción existente
        await ActionService.update(selectedAction.id, data, 'current-user-id'); // TODO: Get actual user ID
      } else {
        // Crear nueva acción
        await ActionService.create(data, 'current-user-id'); // TODO: Get actual user ID
      }
      setShowForm(false);
      fetchActions(); // Recargar datos
    } catch (error) {
      console.error('Error al guardar acción:', error);
    }
  }, [selectedAction, fetchActions]);

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
  }, []);

  // Función para obtener color del estado
  const getEstadoColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener color de prioridad
  const getPrioridadColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener color del tipo
  const getTipoColor = (actionType: string) => {
    switch (actionType) {
      case 'corrective': return 'bg-red-100 text-red-800';
      case 'preventive': return 'bg-blue-100 text-blue-800';
      case 'improvement': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Renderizar contenido
  const renderContent = useMemo(() => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (filteredActions.length === 0) {
      return (
        <div className="text-center py-12">
          <Kanban className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'No se encontraron acciones' : 'No hay acciones registradas'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'No se encontraron resultados que coincidan con tu búsqueda.'
              : 'Comienza agregando la primera acción.'
            }
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button onClick={handleNew} className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Acción
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (viewMode === 'kanban') {
      return <ActionKanban actions={filteredActions} onRefresh={fetchActions} />;
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredActions.map(action => (
            <ActionCard
              key={action.id}
              action={action}
              onClick={() => handleView(action)}
            />
          ))}
        </div>
      );
    }

    // Vista de tabla (lista)
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Límite
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progreso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredActions.map(action => (
                  <tr
                    key={action.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleView(action)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleView(action);
                      }
                    }}
                    aria-label={`Ver detalles de ${action.title}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {action.actionNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {action.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getTipoColor(action.actionType)}>
                        {action.actionType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getPrioridadColor(action.priority)}>
                        {action.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getEstadoColor(action.status)}>
                        {action.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {action.responsiblePersonName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(action.plannedEndDate).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {action.progress}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleView(action)}
                          aria-label={`Ver detalles de ${action.title}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(action)}
                          aria-label={`Editar ${action.title}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
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
  }, [loading, filteredActions, viewMode, searchTerm, handleNew, handleView, handleEdit, fetchActions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Acciones</h2>
          <p className="text-gray-600">Administra las acciones correctivas, preventivas y de mejora</p>
        </div>
        <Button onClick={handleNew} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Acción
        </Button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white shadow-md rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar acciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="mr-2 h-4 w-4" />
              Tarjetas
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="mr-2 h-4 w-4" />
              Tabla
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("kanban")}
            >
              <Kanban className="mr-2 h-4 w-4" />
              Kanban
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {renderContent}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <ActionFormDialog
          initialData={selectedAction || undefined}
          onSubmit={handleFormSuccess}
          open={showForm}
          onClose={handleFormCancel}
        />
      )}
    </div>
  );
};