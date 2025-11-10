'use client';

import { formatDate } from '@/lib/utils';
import {
  Action,
  ACTION_PRIORITY_COLORS,
  ACTION_PRIORITY_LABELS,
  ACTION_STATUS_COLORS,
  ACTION_STATUS_LABELS,
  ACTION_TYPE_COLORS,
  ACTION_TYPE_LABELS,
} from '@/types/actions';
import { AlertCircle, Calendar, CheckCircle, Clock, User } from 'lucide-react';
import Link from 'next/link';

interface ActionCardProps {
  action: Action;
}

export function ActionCard({ action }: ActionCardProps) {
  // Helper para convertir fechas
  const toDate = (
    timestamp: Date | { toDate?: () => Date; seconds?: number } | string | null
  ): Date => {
    if (!timestamp) return new Date();
    if (timestamp instanceof Date) return timestamp;
    if (
      typeof timestamp === 'object' &&
      'toDate' in timestamp &&
      typeof timestamp.toDate === 'function'
    ) {
      return timestamp.toDate();
    }
    if (
      typeof timestamp === 'object' &&
      'seconds' in timestamp &&
      timestamp.seconds
    ) {
      return new Date(timestamp.seconds * 1000);
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    return new Date();
  };

  const plannedDate = toDate(action.planning.plannedDate);

  const isOverdue =
    plannedDate < new Date() &&
    action.status !== 'completada' &&
    action.status !== 'cancelada';

  const isVerified = action.controlExecution !== null;
  const isEffective = action.controlExecution?.isEffective === true;

  return (
    <Link href={`/acciones/${action.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-gray-200 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-gray-500">
                {action.actionNumber}
              </span>
              {isOverdue && (
                <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                  <AlertCircle className="w-3 h-3" />
                  Vencida
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {action.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {action.description}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ACTION_TYPE_COLORS[action.actionType]}`}
          >
            {ACTION_TYPE_LABELS[action.actionType]}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ACTION_PRIORITY_COLORS[action.priority]}`}
          >
            {ACTION_PRIORITY_LABELS[action.priority]}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ACTION_STATUS_COLORS[action.status]}`}
          >
            {ACTION_STATUS_LABELS[action.status]}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Progreso</span>
            <span className="text-xs font-semibold text-gray-900">
              {action.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${action.progress}%` }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-4 h-4" />
            <span>{action.planning.responsiblePersonName}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Planificada: {formatDate(plannedDate)}</span>
          </div>
          {action.processName && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{action.processName}</span>
            </div>
          )}
        </div>

        {/* Verification Status */}
        {isVerified && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div
              className={`flex items-center gap-2 text-sm ${
                isEffective ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {isEffective
                  ? 'Verificada - Efectiva'
                  : 'Verificada - No Efectiva'}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
