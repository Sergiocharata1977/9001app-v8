'use client';

import type { Audit, AuditStatus } from '@/types/audits';
import { AUDIT_STATUS_LABELS } from '@/types/audits';
import { AuditCard } from './AuditCard';

interface AuditKanbanProps {
  audits: Audit[];
}

const COLUMNS: AuditStatus[] = ['planned', 'in_progress', 'completed'];

export function AuditKanban({ audits }: AuditKanbanProps) {
  const auditsByStatus = COLUMNS.reduce(
    (acc, status) => {
      acc[status] = audits.filter(audit => audit.status === status);
      return acc;
    },
    {} as Record<AuditStatus, Audit[]>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map(status => (
        <div key={status} className="flex flex-col">
          {/* Column Header */}
          <div className="bg-gray-50 rounded-t-lg p-3 border-b-2 border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {AUDIT_STATUS_LABELS[status]}
              </h3>
              <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                {auditsByStatus[status].length}
              </span>
            </div>
          </div>

          {/* Column Content */}
          <div className="flex-1 bg-gray-50 rounded-b-lg p-3 space-y-3 min-h-[200px]">
            {auditsByStatus[status].length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No hay auditorías
              </p>
            ) : (
              auditsByStatus[status].map(audit => (
                <AuditCard key={audit.id} audit={audit} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
