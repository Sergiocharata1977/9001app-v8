'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuditCard } from './AuditCard';
import type { Audit } from '@/types/audits';

interface AuditKanbanProps {
  audits: Audit[];
  onRefresh: () => void;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  audits: Audit[];
}

export const AuditKanban: React.FC<AuditKanbanProps> = ({ audits, onRefresh }) => {
  const columns: KanbanColumn[] = useMemo(() => {
    const groupedAudits = audits.reduce((acc, audit) => {
      if (!acc[audit.status]) {
        acc[audit.status] = [];
      }
      acc[audit.status].push(audit);
      return acc;
    }, {} as Record<string, Audit[]>);

    return [
      {
        id: 'planned',
        title: 'Planificada',
        color: 'bg-blue-100 text-blue-800',
        audits: groupedAudits.planned || [],
      },
      {
        id: 'in_progress',
        title: 'En Progreso',
        color: 'bg-yellow-100 text-yellow-800',
        audits: groupedAudits.in_progress || [],
      },
      {
        id: 'completed',
        title: 'Completada',
        color: 'bg-green-100 text-green-800',
        audits: groupedAudits.completed || [],
      },
      {
        id: 'cancelled',
        title: 'Cancelada',
        color: 'bg-gray-100 text-gray-800',
        audits: groupedAudits.cancelled || [],
      },
    ];
  }, [audits]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => (
        <Card key={column.id} className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span>{column.title}</span>
              <Badge className={column.color}>
                {column.audits.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {column.audits.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No hay auditorías en esta etapa
              </div>
            ) : (
              column.audits.map((audit) => (
                <AuditCard
                  key={audit.id}
                  audit={audit}
                  onClick={() => {
                    // Handle card click - navigate to detail
                    console.log('Navigate to audit detail:', audit.id);
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
