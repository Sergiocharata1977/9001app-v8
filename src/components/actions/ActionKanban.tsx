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
    color: 'bg-gray-100 border-gray-300',
  },
  {
    status: 'ejecutada',
    label: 'Ejecutadas',
    color: 'bg-blue-100 border-blue-300',
  },
  {
    status: 'en_control',
    label: 'En Control',
    color: 'bg-yellow-100 border-yellow-300',
  },
  {
    status: 'completada',
    label: 'Completadas',
    color: 'bg-green-100 border-green-300',
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
              className={`${column.color} border-2 rounded-t-lg px-4 py-3 flex items-center justify-between`}
            >
              <h3 className="font-semibold text-gray-900">{column.label}</h3>
              <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-700">
                {columnActions.length}
              </span>
            </div>

            {/* Column Content */}
            <div className="flex-1 bg-gray-50 border-2 border-t-0 border-gray-200 rounded-b-lg p-3 space-y-3 min-h-[400px] max-h-[calc(100vh-300px)] overflow-y-auto">
              {columnActions.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
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
