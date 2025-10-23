'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Grid, List, Plus, Search, Filter, Building2, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DepartmentCard } from './DepartmentCard';
import { DepartmentForm } from './DepartmentForm';
import { Department, DepartmentFormData } from '@/types/rrhh';
import { DepartmentService } from '@/services/rrhh/DepartmentService';

interface DepartmentListingProps {
  onViewDepartment?: (department: Department) => void;
  onEditDepartment?: (department: Department) => void;
  onNewDepartment?: () => void;
}

export const DepartmentListing: React.FC<DepartmentListingProps> = ({
  onViewDepartment,
  onEditDepartment,
  onNewDepartment
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Cargar datos
  const fetchData = useCallback(async () => {
    setLoadingData(true);
    setLocalError(null);

    try {
      console.log('Cargando datos de departamentos...');
      const data = await DepartmentService.getAll();
      console.log('Datos de departamentos cargados:', data);
      setDepartments(data || []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setLocalError('Error al cargar los datos. Por favor, intenta de nuevo más tarde.');
      setDepartments([]);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrar departamentos
  const filteredDepartments = useMemo(() => {
    if (!searchTerm.trim()) return departments;

    const searchLower = searchTerm.toLowerCase();
    return departments.filter(dept =>
      dept.name?.toLowerCase().includes(searchLower) ||
      dept.description?.toLowerCase().includes(searchLower)
    );
  }, [departments, searchTerm]);

  // Handlers
  const handleView = useCallback((dept: Department) => {
    setSelectedDepartment(dept);
    setShowDetails(true);
    onViewDepartment?.(dept);
  }, [onViewDepartment]);

  const handleEdit = useCallback((dept: Department) => {
    setSelectedDepartment(dept);
    setShowForm(true);
    onEditDepartment?.(dept);
  }, [onEditDepartment]);

  const handleDelete = useCallback((dept: Department) => {
    setDepartmentToDelete(dept);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!departmentToDelete) return;

    try {
      await DepartmentService.delete(departmentToDelete.id);
      setDepartments(prev => prev.filter(d => d.id !== departmentToDelete.id));
    } catch (err) {
      console.error('Error al eliminar departamento:', err);
    } finally {
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    }
  }, [departmentToDelete]);

  const handleNewDepartment = useCallback(() => {
    setSelectedDepartment(null);
    setShowForm(true);
    onNewDepartment?.();
  }, [onNewDepartment]);

  const handleFormSuccess = useCallback(async (data: DepartmentFormData) => {
    try {
      if (selectedDepartment) {
        // Actualizar departamento existente
        await DepartmentService.update(selectedDepartment.id, data);
      } else {
        // Crear nuevo departamento
        await DepartmentService.create(data);
      }
      setShowForm(false);
      fetchData(); // Recargar datos
    } catch (error) {
      console.error('Error al guardar departamento:', error);
    }
  }, [selectedDepartment, fetchData]);

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setShowDetails(false);
  }, []);

  // Función para obtener color del estado
  const getEstadoColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  // Renderizar contenido
  const renderContent = useMemo(() => {
    if (loadingData) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
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

    if (filteredDepartments.length === 0) {
      return (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'No se encontraron departamentos' : 'No hay departamentos registrados'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'No se encontraron resultados que coincidan con tu búsqueda.'
              : 'Comienza agregando el primer departamento.'
            }
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button onClick={handleNewDepartment} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Departamento
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map(dept => (
            <DepartmentCard
              key={dept.id}
              department={dept}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      );
    }

    // Vista de tabla (lista)
    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDepartments.map(dept => (
                  <tr key={dept.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {dept.name}
                        </div>
                        {dept.responsible_user_id && (
                          <div className="text-sm text-gray-500">
                            Responsable: {dept.responsible_user_id}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {dept.description || 'Sin descripción'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getEstadoColor(dept.is_active)}>
                        {dept.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleView(dept)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(dept)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(dept)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
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
  }, [filteredDepartments, loadingData, searchTerm, viewMode, handleView, handleEdit, handleDelete, handleNewDepartment]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Departamentos</h2>
          <p className="text-gray-600">Administra los departamentos de la organización</p>
        </div>
        <Button onClick={handleNewDepartment} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Departamento
        </Button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar departamentos..."
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
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {renderContent}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <DepartmentForm
              initialData={selectedDepartment}
              onSubmit={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {showDetails && selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xl">
                      {selectedDepartment.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedDepartment.name}</h2>
                      <Badge className={getEstadoColor(selectedDepartment.is_active)}>
                        {selectedDepartment.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleCloseDetails}>Cerrar</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Información General</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                        <dd className="text-base mt-1">{selectedDepartment.description || 'Sin descripción'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Responsable</dt>
                        <dd className="text-base mt-1">{selectedDepartment.responsible_user_id || 'Sin asignar'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Fecha de Creación</dt>
                        <dd className="text-base mt-1">{new Date(selectedDepartment.created_at).toLocaleDateString('es-ES')}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Detalles Adicionales</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Última Actualización</dt>
                        <dd className="text-base mt-1">{new Date(selectedDepartment.updated_at).toLocaleDateString('es-ES')}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">ID</dt>
                        <dd className="text-base mt-1 font-mono">{selectedDepartment.id}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t flex justify-end gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      handleCloseDetails();
                      handleDelete(selectedDepartment);
                    }}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                  <Button 
                    onClick={() => {
                      handleCloseDetails();
                      handleEdit(selectedDepartment);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Dialog de confirmación para eliminar */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">¿Estás completamente seguro?</h3>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. Se eliminará permanentemente el departamento{' '}
              <span className="font-semibold">
                {departmentToDelete?.name}
              </span>.
            </p>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Sí, eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

