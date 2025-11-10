'use client';

import { FindingFormDialog } from '@/components/findings/FindingFormDialog';
import { FindingKanban } from '@/components/findings/FindingKanban';
import { FindingList } from '@/components/findings/FindingList';
import { FindingStats } from '@/components/findings/FindingStats';
import { LayoutGrid, List, Plus } from 'lucide-react';
import { useState } from 'react';

type ViewMode = 'list' | 'kanban';

export default function HallazgosPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setShowDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hallazgos</h1>
          <p className="text-gray-600 mt-1">
            Gestión de hallazgos con 4 fases: Registro, Acción Inmediata,
            Ejecución y Análisis
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
              Lista
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </button>
          </div>

          {/* New Finding Button */}
          <button
            onClick={() => setShowDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Hallazgo
          </button>
        </div>
      </div>

      {/* Stats */}
      <FindingStats key={`stats-${refreshKey}`} />

      {/* Content - List or Kanban */}
      {viewMode === 'list' ? (
        <FindingList key={`list-${refreshKey}`} />
      ) : (
        <FindingKanban key={`kanban-${refreshKey}`} />
      )}

      {/* Dialog */}
      <FindingFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
