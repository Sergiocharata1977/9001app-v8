'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FindingCard } from './FindingCard';
import type { Finding } from '@/types/findings';

interface FindingKanbanProps {
  findings: Finding[];
  onRefresh: () => void;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  findings: Finding[];
}

export const FindingKanban: React.FC<FindingKanbanProps> = ({ findings, onRefresh }) => {
  const columns: KanbanColumn[] = useMemo(() => {
    const groupedFindings = findings.reduce((acc, finding) => {
      if (!acc[finding.status]) {
        acc[finding.status] = [];
      }
      acc[finding.status].push(finding);
      return acc;
    }, {} as Record<string, Finding[]>);

    return [
      {
        id: 'open',
        title: 'Abierto',
        color: 'bg-red-100 text-red-800',
        findings: groupedFindings.open || [],
      },
      {
        id: 'in_analysis',
        title: 'En Análisis',
        color: 'bg-orange-100 text-orange-800',
        findings: groupedFindings.in_analysis || [],
      },
      {
        id: 'action_planned',
        title: 'Acción Planificada',
        color: 'bg-yellow-100 text-yellow-800',
        findings: groupedFindings.action_planned || [],
      },
      {
        id: 'in_progress',
        title: 'En Progreso',
        color: 'bg-blue-100 text-blue-800',
        findings: groupedFindings.in_progress || [],
      },
      {
        id: 'closed',
        title: 'Cerrado',
        color: 'bg-green-100 text-green-800',
        findings: groupedFindings.closed || [],
      },
    ];
  }, [findings]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {columns.map((column) => (
        <Card key={column.id} className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span>{column.title}</span>
              <Badge className={column.color}>
                {column.findings.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {column.findings.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No hay hallazgos en esta etapa
              </div>
            ) : (
              column.findings.map((finding) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  onClick={() => {
                    // Handle card click - navigate to detail
                    console.log('Navigate to finding detail:', finding.id);
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