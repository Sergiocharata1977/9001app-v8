'use client';

import type { Audit } from '@/types/audits';
import { AuditCard } from './AuditCard';

interface AuditListProps {
  audits: Audit[];
}

export function AuditList({ audits }: AuditListProps) {
  if (audits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-2">No hay auditorías registradas</p>
        <p className="text-sm text-gray-400">
          Crea una nueva auditoría para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {audits.map(audit => (
        <AuditCard key={audit.id} audit={audit} />
      ))}
    </div>
  );
}
