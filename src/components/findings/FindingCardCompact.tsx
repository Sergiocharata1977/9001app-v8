'use client';

import { formatDate } from '@/lib/utils';
import type { Finding } from '@/types/findings';
import { FINDING_STATUS_COLORS, FINDING_STATUS_LABELS } from '@/types/findings';
import { Calendar } from 'lucide-react';
import Link from 'next/link';

interface FindingCardCompactProps {
  finding: Finding;
}

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
  return new Date();
};

export function FindingCardCompact({ finding }: FindingCardCompactProps) {
  const createdDate = toDate(finding.createdAt);

  return (
    <Link href={`/hallazgos/${finding.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-3 border border-gray-200 cursor-pointer">
        <div className="flex items-center justify-between gap-3">
          {/* Número y Nombre */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gray-500">
                {finding.findingNumber}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  FINDING_STATUS_COLORS[finding.status]
                }`}
              >
                {FINDING_STATUS_LABELS[finding.status]}
              </span>
            </div>
            <h3 className="font-medium text-gray-900 truncate text-sm">
              {finding.registration?.name || 'Sin nombre'}
            </h3>
          </div>

          {/* Fecha */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(createdDate)}</span>
          </div>
        </div>

        {/* Descripción corta */}
        {finding.registration?.description && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-1">
            {finding.registration.description}
          </p>
        )}

        {/* Progreso */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progreso</span>
            <span>{finding.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all"
              style={{ width: `${finding.progress}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
