'use client';

import { formatDate } from '@/lib/utils';
import type { Audit } from '@/types/audits';
import { AUDIT_TYPE_LABELS, getAuditProgress } from '@/types/audits';
import { Calendar, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { AuditStatusBadge } from './AuditStatusBadge';

interface AuditCardProps {
  audit: Audit;
}

// Helper para convertir fechas de Firestore
const toDate = (timestamp: unknown): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (
    typeof timestamp === 'object' &&
    timestamp !== null &&
    'toDate' in timestamp &&
    typeof timestamp.toDate === 'function'
  ) {
    return timestamp.toDate();
  }
  if (
    typeof timestamp === 'object' &&
    timestamp !== null &&
    'seconds' in timestamp &&
    typeof timestamp.seconds === 'number'
  ) {
    return new Date(timestamp.seconds * 1000);
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return new Date();
};

export function AuditCard({ audit }: AuditCardProps) {
  const plannedDate = toDate(audit.plannedDate);
  const progress = getAuditProgress(audit);

  // Determinar color de borde según estado
  const getBorderColor = () => {
    switch (audit.status) {
      case 'planned':
        return 'border-blue-200';
      case 'in_progress':
        return 'border-yellow-200';
      case 'completed':
        return 'border-green-200';
      default:
        return 'border-gray-200';
    }
  };

  // Determinar color de barra de progreso según estado
  const getProgressColor = () => {
    switch (audit.status) {
      case 'planned':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Link href={`/auditorias/${audit.id}`}>
      <div className={`bg-white rounded-lg shadow hover:shadow-lg transition-all p-4 border-2 ${getBorderColor()} cursor-pointer`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-gray-500">
                {audit.auditNumber}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-600">
                {AUDIT_TYPE_LABELS[audit.auditType]}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
              {audit.title}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-2">{audit.scope}</p>
          </div>
        </div>

        {/* Badge de Estado */}
        <div className="mb-3">
          <AuditStatusBadge status={audit.status} />
        </div>

        {/* Barra de Progreso - Siempre visible */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">
              {audit.status === 'planned' ? 'Estado' : 'Progreso'}
            </span>
            <span className="text-xs font-semibold text-gray-900">
              {audit.status === 'planned'
                ? 'Pendiente'
                : `${progress}%`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`${getProgressColor()} h-2 rounded-full transition-all`}
              style={{
                width: audit.status === 'planned' ? '0%' : `${progress}%`
              }}
            />
          </div>
        </div>

        {/* Info en Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Columna 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="w-3 h-3 shrink-0" />
              <span className="truncate">{formatDate(plannedDate)}</span>
            </div>
            {audit.normPointsVerification.length > 0 && (
              <div className="flex items-center gap-1 text-gray-600">
                <FileText className="w-3 h-3 shrink-0" />
                <span className="truncate">
                  {
                    audit.normPointsVerification.filter(
                      v => v.conformityStatus !== null
                    ).length
                  }
                  /{audit.normPointsVerification.length} puntos
                </span>
              </div>
            )}
          </div>

          {/* Columna 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-gray-600">
              <User className="w-3 h-3 shrink-0" />
              <span className="truncate">{audit.leadAuditor}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
