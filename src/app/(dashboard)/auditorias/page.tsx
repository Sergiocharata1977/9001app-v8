'use client';

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
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [showFormDialog, setShowFormDialog] = useState(false);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/audits');
      const data = await response.json();
      setAudits(data.audits || []);
    } catch (error) {
      console.error('Error fetching audits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAudit = async (data: AuditFormData) => {
    try {
      const response = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al crear la auditoría');
      }

      const result = await response.json();
      await fetchAudits();
      router.push(`/auditorias/${result.id}`);
    } catch (error) {
      console.error('Error creating audit:', error);
      throw error;
    }
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

          <Button onClick={() => setShowFormDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Auditoría
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{audits.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Planificadas</p>
          <p className="text-2xl font-bold text-gray-900">
            {audits.filter(a => a.status === 'planned').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">En Progreso</p>
          <p className="text-2xl font-bold text-blue-600">
            {audits.filter(a => a.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Completadas</p>
          <p className="text-2xl font-bold text-green-600">
            {audits.filter(a => a.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {viewMode === 'kanban' ? (
          <AuditKanban audits={audits} />
        ) : (
          <AuditList audits={audits} />
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
