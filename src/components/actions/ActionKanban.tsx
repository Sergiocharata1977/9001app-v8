'use client';

import { ActionCard } from '@/components/actions/ActionCard';
import type { Action, ActionStatus } from '@/types/actions';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const KANBAN_COLUMNS: {
  status: ActionStatus;
  label: string;
  color: string;
}[] = [
  {
    status: 'planificada',
    label: 'Planificadas',
    color: 'border-slate-300 bg-slate-50',
  },
  {
    status: 'ejecutada',
    label: 'Ejecutadas',
    color: 'border-blue-300 bg-blue-50',
  },
  {
    status: 'en_control',
    label: 'En Control',
    color: 'border-amber-300 bg-amber-50',
  },
  {
    status: 'completada',
    label: 'Completadas',
    color: 'border-emerald-300 bg-emerald-50',
  },
];

export function ActionKanban() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/actions');

      if (!response.ok) {
        throw new Error('Error al cargar las acciones');
      }

      const data = await response.json();
      setActions(data.actions || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar las acciones'
      );
    } finally {
      setLoading(false);
    }
  };

  const getActionsByStatus = (status: ActionStatus) => {
    return actions.filter(
      action => action.status === status && action.isActive
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {KANBAN_COLUMNS.map(column => {
        const columnActions = getActionsByStatus(column.status);

        return (
          <div key={column.status} className="flex flex-col">
            {/* Column Header */}
            <div
              className={`border-t-4 ${column.color} bg-white shadow-sm rounded-t-lg px-4 py-3 flex items-center justify-between mb-2`}
            >
              <h3 className="font-semibold text-slate-900">{column.label}</h3>
              <span className="bg-slate-100 px-2 py-1 rounded-full text-xs font-medium text-slate-600">
                {columnActions.length}
              </span>
            </div>

            {/* Column Content */}
            <div className="flex-1 bg-slate-50/50 rounded-b-lg p-2 space-y-3 min-h-[400px] max-h-[calc(100vh-300px)] overflow-y-auto">
              {columnActions.length === 0 ? (
                <div className="text-center text-slate-400 text-sm py-8 border-2 border-dashed border-slate-200 rounded-lg m-2">
                  No hay acciones
                </div>
              ) : (
                columnActions.map(action => (
                  <ActionCard key={action.id} action={action} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
