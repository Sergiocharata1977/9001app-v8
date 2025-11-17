'use client';

import { AuditAdvancedFilters, type AuditFiltersState } from '@/components/audits/AuditAdvancedFilters';
import { AuditExportButton } from '@/components/audits/AuditExportButton';
import { AuditFormDialog } from '@/components/audits/AuditFormDialog';
import { AuditKanban } from '@/components/audits/AuditKanban';
import { AuditList } from '@/components/audits/AuditList';
import { Button } from '@/components/ui/button';
import type { Audit, AuditFormData } from '@/types/audits';
import { LayoutGrid, List, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type ViewMode = 'kanban' | 'list';

export default function AuditsPage() {
  const router = useRouter();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [filteredAudits, setFilteredAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [filters, setFilters] = useState<AuditFiltersState>({});

  useEffect(() => {
    fetchAudits();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [audits, filters]);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sdk/audits');
      const result = await response.json();
      
      if (result.success && result.data) {
        setAudits(result.data);
      } else {
        setAudits([]);
      }
    } catch (error) {
      console.error('Error fetching audits:', error);
      setAudits([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...audits];

    // Apply search filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        audit =>
          audit.title.toLowerCase().includes(searchLower) ||
          audit.auditNumber.toLowerCase().includes(searchLower) ||
          audit.scope.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(audit => filters.status?.includes(audit.status));
    }

    // Apply type filter
    if (filters.auditType && filters.auditType.length > 0) {
      filtered = filtered.filter(audit => filters.auditType?.includes(audit.auditType));
    }

    // Apply year filter
    if (filters.year) {
      filtered = filtered.filter(audit => {
        const auditYear = audit.createdAt?.toDate?.().getFullYear?.() || new Date(audit.createdAt).getFullYear();
        return auditYear === filters.year;
      });
    }

    setFilteredAudits(filtered);
  };

  const handleCreateAudit = () => {
    router.push('/auditorias/crear');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando auditorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Auditorías</h1>
          <p className="text-gray-600 mt-1">
            Gestión de auditorías internas ISO 9001
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded ${
                viewMode === 'kanban'
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-gray-200'
              }`}
              title="Vista Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
              title="Vista Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <AuditExportButton audits={filteredAudits} />

          <Button onClick={() => setShowFormDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Auditoría
          </Button>
        </div>
      </div>

      {/* Filters */}
      <AuditAdvancedFilters
        onFiltersChange={setFilters}
        isLoading={loading}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{filteredAudits.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Planificadas</p>
          <p className="text-2xl font-bold text-gray-900">
            {filteredAudits.filter(a => a.status === 'planned').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">En Progreso</p>
          <p className="text-2xl font-bold text-blue-600">
            {filteredAudits.filter(a => a.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Completadas</p>
          <p className="text-2xl font-bold text-green-600">
            {filteredAudits.filter(a => a.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {filteredAudits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No hay auditorías que coincidan con los filtros</p>
          </div>
        ) : viewMode === 'kanban' ? (
          <AuditKanban audits={filteredAudits} />
        ) : (
          <AuditList audits={filteredAudits} />
        )}
      </div>

      {/* Audit Form Dialog */}
      <AuditFormDialog
        open={showFormDialog}
        onClose={() => setShowFormDialog(false)}
        onSubmit={handleCreateAudit}
      />
    </div>
  );
}
