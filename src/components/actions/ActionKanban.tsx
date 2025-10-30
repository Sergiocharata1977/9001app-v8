'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionCard } from './ActionCard';
import type { Action } from '@/types/actions';

interface ActionKanbanProps {
  actions: Action[];
  onRefresh: () => void;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  actions: Action[];
}

export const ActionKanban: React.FC<ActionKanbanProps> = ({ actions, onRefresh }) => {
  const columns: KanbanColumn[] = useMemo(() => {
    const groupedActions = actions.reduce((acc, action) => {
      if (!acc[action.status]) {
        acc[action.status] = [];
      }
      acc[action.status].push(action);
      return acc;
    }, {} as Record<string, Action[]>);

    return [
      {
        id: 'planned',
        title: 'Planificada',
        color: 'bg-gray-100 text-gray-800',
        actions: groupedActions.planned || [],
      },
      {
        id: 'in_progress',
        title: 'En Progreso',
        color: 'bg-blue-100 text-blue-800',
        actions: groupedActions.in_progress || [],
      },
      {
        id: 'completed',
        title: 'Completada',
        color: 'bg-yellow-100 text-yellow-800',
        actions: groupedActions.completed || [],
      },
      {
        id: 'cancelled',
        title: 'Cancelada',
        color: 'bg-red-100 text-red-800',
        actions: groupedActions.cancelled || [],
      },
      {
        id: 'on_hold',
        title: 'En Espera',
        color: 'bg-orange-100 text-orange-800',
        actions: groupedActions.on_hold || [],
      },
    ];
  }, [actions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {columns.map((column) => (
        <Card key={column.id} className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span>{column.title}</span>
              <Badge className={column.color}>
                {column.actions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {column.actions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No hay acciones en esta etapa
              </div>
            ) : (
              column.actions.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  onClick={() => {
                    // Handle card click - navigate to detail
                    console.log('Navigate to action detail:', action.id);
                  }}
                />
              ))
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};