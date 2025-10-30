'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Grid, List, Kanban, Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FindingCard } from './FindingCard';
import { FindingKanban } from './FindingKanban';
import { FindingFormDialog } from './FindingFormDialog';
import { Finding, FindingFormData } from '@/types/findings';
import { FindingService } from '@/services/findings/FindingService';

export const FindingListing: React.FC = () => {
  const router = useRouter();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  // Cargar datos
  const fetchFindings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Cargando datos de hallazgos...');
      const data = await FindingService.getAll();
      console.log('Datos de hallazgos cargados:', data);
      setFindings(data || []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intenta de nuevo más tarde.');
      setFindings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFindings();
  }, [fetchFindings]);

  // Filtrar hallazgos
  const filteredFindings = useMemo(() => {
    if (!searchTerm.trim()) return findings;

    const searchLower = searchTerm.toLowerCase();
    return findings.filter(finding =>
      finding.title?.toLowerCase().includes(searchLower) ||
      finding.findingNumber?.toLowerCase().includes(searchLower) ||
      finding.description?.toLowerCase().includes(searchLower) ||
      finding.sourceName?.toLowerCase().includes(searchLower)
    );
  }, [findings, searchTerm]);

  // Handlers
  const handleView = useCallback((finding: Finding) => {
    router.push(`/dashboard/hallazgos/${finding.id}`);
  }, [router]);

  const handleEdit = useCallback((finding: Finding) => {
    setSelectedFinding(finding);
    setShowForm(true);
  }, []);

  const handleNew = useCallback(() => {
    setSelectedFinding(null);
    setShowForm(true);
  }, []);

  const handleFormSuccess = useCallback(async (data: FindingFormData) => {
    try {
      if (selectedFinding) {
        // Actualizar hallazgo existente
        await FindingService.update(selectedFinding.id, data, 'current-user-id'); // TODO: Get actual user ID
      } else {
        // Crear nuevo hallazgo
        await FindingService.create(data, 'current-user-id'); // TODO: Get actual user ID
      }
      setShowForm(false);
      fetchFindings(); // Recargar datos
    } catch (error) {
      console.error('Error al guardar hallazgo:', error);
    }
  }, [selectedFinding, fetchFindings]);

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
  }, []);

  // Función para obtener color del estado
  const getEstadoColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_analysis': return 'bg-orange-100 text-orange-800';
      case 'action_planned': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener color de severidad
  const getSeveridadColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'major': return 'bg-orange-100 text-orange-800';
      case 'minor': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
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

    if (filteredFindings.length === 0) {
      return (
        <div className="text-center py-12">
          <Kanban className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'No se encontraron hallazgos' : 'No hay hallazgos registrados'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'No se encontraron resultados que coincidan con tu búsqueda.'
              : 'Comienza agregando el primer hallazgo.'
            }
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button onClick={handleNew} className="bg-red-600 hover:bg-red-700">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Hallazgo
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (viewMode === 'kanban') {
      return <FindingKanban findings={filteredFindings} onRefresh={fetchFindings} />;
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFindings.map(finding => (
            <FindingCard
              key={finding.id}
              finding={finding}
              onClick={() => handleView(finding)}
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
                    Severidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredFindings.map(finding => (
                  <tr
                    key={finding.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleView(finding)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleView(finding);
                      }
                    }}
                    aria-label={`Ver detalles de ${finding.title}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {finding.findingNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {finding.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {finding.findingType.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getSeveridadColor(finding.severity)}>
                        {finding.severity}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getEstadoColor(finding.status)}>
                        {finding.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {finding.sourceName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(finding.identifiedDate).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleView(finding)}
                          aria-label={`Ver detalles de ${finding.title}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(finding)}
                          aria-label={`Editar ${finding.title}`}
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
  }, [loading, filteredFindings, viewMode, searchTerm, handleNew, handleView, handleEdit, fetchFindings]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Hallazgos</h2>
          <p className="text-gray-600">Administra los hallazgos del sistema de calidad</p>
        </div>
        <Button onClick={handleNew} className="bg-red-600 hover:bg-red-700">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Hallazgo
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
                placeholder="Buscar hallazgos..."
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
        <FindingFormDialog
          open={showForm}
          initialData={selectedFinding || undefined}
          onSubmit={handleFormSuccess}
          onClose={handleFormCancel}
        />
      )}
    </div>
  );
};