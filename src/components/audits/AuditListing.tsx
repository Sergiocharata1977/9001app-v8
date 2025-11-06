'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AuditService } from '@/services/audits/AuditService';
import { Audit, AuditFormData } from '@/types/audits';
import {
  Edit,
  Eye,
  Filter,
  Grid,
  Kanban,
  List,
  Plus,
  Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AuditCard } from './AuditCard';
import { AuditFormDialog } from './AuditFormDialog';
import { AuditKanban } from './AuditKanban';

export const AuditListing: React.FC = () => {
  const router = useRouter();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);

  // Cargar datos
  const fetchAudits = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Cargando datos de auditorías...');
      const data = await AuditService.getAll();
      console.log('Datos de auditorías cargados:', data);
      setAudits(data || []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(
        'Error al cargar los datos. Por favor, intenta de nuevo más tarde.'
      );
      setAudits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  // Filtrar auditorías
  const filteredAudits = useMemo(() => {
    if (!searchTerm.trim()) return audits;

    const searchLower = searchTerm.toLowerCase();
    return audits.filter(
      audit =>
        audit.title?.toLowerCase().includes(searchLower) ||
        audit.auditNumber?.toLowerCase().includes(searchLower) ||
        audit.leadAuditorName?.toLowerCase().includes(searchLower)
    );
  }, [audits, searchTerm]);

  // Handlers
  const handleView = useCallback(
    (audit: Audit) => {
      router.push(`/auditorias/${audit.id}`);
    },
    [router]
  );

  const handleEdit = useCallback((audit: Audit) => {
    setSelectedAudit(audit);
    setShowForm(true);
  }, []);

  const handleNew = useCallback(() => {
    setSelectedAudit(null);
    setShowForm(true);
  }, []);

  const handleFormSuccess = useCallback(
    async (data: AuditFormData) => {
      try {
        if (selectedAudit) {
          // Actualizar auditoría existente
          await AuditService.update(selectedAudit.id, data, 'current-user-id'); // TODO: Get actual user ID
        } else {
          // Crear nueva auditoría
          await AuditService.create(data, 'current-user-id'); // TODO: Get actual user ID
        }
        setShowForm(false);
        fetchAudits(); // Recargar datos
      } catch (error) {
        console.error('Error al guardar auditoría:', error);
      }
    },
    [selectedAudit, fetchAudits]
  );

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
  }, []);

  // Función para obtener color del estado
  const getEstadoColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

    if (filteredAudits.length === 0) {
      return (
        <div className="text-center py-12">
          <Kanban className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm
              ? 'No se encontraron auditorías'
              : 'No hay auditorías registradas'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'No se encontraron resultados que coincidan con tu búsqueda.'
              : 'Comienza agregando la primera auditoría.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button
                onClick={handleNew}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva Auditoría
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (viewMode === 'kanban') {
      return <AuditKanban audits={filteredAudits} onRefresh={fetchAudits} />;
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAudits.map(audit => (
            <AuditCard
              key={audit.id}
              audit={audit}
              onClick={() => handleView(audit)}
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
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Planificada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auditor Líder
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredAudits.map(audit => (
                  <tr
                    key={audit.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleView(audit)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleView(audit);
                      }
                    }}
                    aria-label={`Ver detalles de ${audit.title}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {audit.auditNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {audit.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {audit.auditType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getEstadoColor(audit.status)}>
                        {audit.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(audit.plannedDate).toLocaleDateString(
                          'es-ES'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {audit.leadAuditorName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div
                        className="flex justify-end space-x-2"
                        onClick={e => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleView(audit)}
                          aria-label={`Ver detalles de ${audit.title}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(audit)}
                          aria-label={`Editar ${audit.title}`}
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
  }, [
    loading,
    filteredAudits,
    viewMode,
    searchTerm,
    handleNew,
    handleView,
    handleEdit,
    fetchAudits,
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gestión de Auditorías
          </h2>
          <p className="text-gray-600">
            Administra las auditorías del sistema de calidad
          </p>
        </div>
        <Button onClick={handleNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Auditoría
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
                placeholder="Buscar auditorías..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
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
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="mr-2 h-4 w-4" />
              Tarjetas
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="mr-2 h-4 w-4" />
              Tabla
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <Kanban className="mr-2 h-4 w-4" />
              Kanban
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-96">{renderContent}</div>

      {/* Modal de formulario */}
      {showForm && (
        <AuditFormDialog
          open={showForm}
          onClose={handleFormCancel}
          onSubmit={handleFormSuccess}
          initialData={selectedAudit || undefined}
        />
      )}
    </div>
  );
};
