'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Audit } from '@/types/audits';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { AuditStatusBadge } from './AuditStatusBadge';

interface AuditKanbanProps {
  audits: Audit[];
  onRefresh: () => void;
}

export function AuditKanban({ audits }: AuditKanbanProps) {
  const router = useRouter();

  const plannedAudits = audits.filter(a => a.status === 'planned');
  const inProgressAudits = audits.filter(a => a.status === 'in_progress');
  const completedAudits = audits.filter(a => a.status === 'completed');

  const renderColumn = (title: string, columnAudits: Audit[]) => (
    <div className="flex-1 min-w-[300px]">
      <h3 className="font-semibold mb-4 text-lg">{title}</h3>
      <div className="space-y-3">
        {columnAudits.map(audit => (
          <Card
            key={audit.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/auditorias/${audit.id}`)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{audit.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {audit.description}
              </p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {format(new Date(audit.plannedDate), 'PP', { locale: es })}
                </span>
                <AuditStatusBadge status={audit.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                Auditor: {audit.leadAuditor}
              </p>
            </CardContent>
          </Card>
        ))}
        {columnAudits.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay auditorías
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {renderColumn('Planificadas', plannedAudits)}
      {renderColumn('En Progreso', inProgressAudits)}
      {renderColumn('Completadas', completedAudits)}
    </div>
  );
}
