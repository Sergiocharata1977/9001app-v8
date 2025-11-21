'use client';

import type { CalendarEvent } from '@/types/calendar';
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    GraduationCap,
    Users,
} from 'lucide-react';

interface EventCardProps {
  event: CalendarEvent;
  variant?: 'compact' | 'detailed';
  onClick?: () => void;
}

const eventTypeConfig = {
  audit: {
    icon: CheckCircle,
    color: 'blue',
    label: 'Auditoría',
  },
  document_expiry: {
    icon: FileText,
    color: 'orange',
    label: 'Vencimiento Documento',
  },
  action_deadline: {
    icon: AlertTriangle,
    color: 'red',
    label: 'Acción',
  },
  finding_deadline: {
    icon: AlertTriangle,
    color: 'amber',
    label: 'Hallazgo',
  },
  training: {
    icon: GraduationCap,
    color: 'green',
    label: 'Capacitación',
  },
  evaluation: {
    icon: CheckCircle,
    color: 'purple',
    label: 'Evaluación',
  },
  meeting: {
    icon: Users,
    color: 'indigo',
    label: 'Reunión',
  },
  general: {
    icon: Calendar,
    color: 'gray',
    label: 'General',
  },
};

const priorityConfig = {
  low: {
    color: 'gray',
    label: 'Baja',
  },
  medium: {
    color: 'yellow',
    label: 'Media',
  },
  high: {
    color: 'orange',
    label: 'Alta',
  },
  critical: {
    color: 'red',
    label: 'Crítica',
  },
};

export function EventCard({
  event,
  variant = 'compact',
  onClick,
}: EventCardProps) {
  const config = eventTypeConfig[event.type];
  const Icon = config.icon;
  const priorityInfo = priorityConfig[event.priority];

  const formatTime = (
    timestamp: Date | { toDate: () => Date } | { seconds: number; nanoseconds: number } | string | number
  ) => {
    let date: Date;
    
    // Verificar si tiene método toDate (Timestamp de Firestore)
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
      date = timestamp.toDate();
    }
    // Verificar si tiene propiedad seconds (Timestamp serializado)
    else if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
      const ts = timestamp as { seconds: number; nanoseconds: number };
      date = new Date(ts.seconds * 1000);
    }
    // String o número
    else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp);
    }
    // Ya es un Date
    else {
      date = timestamp as Date;
    }
    
    // Validar que date sea válido
    if (!date || isNaN(date.getTime())) {
      return '--:--';
    }
    
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = () => {
    const now = new Date();
    let eventDate: Date;
    
    // Verificar si tiene método toDate (Timestamp de Firestore)
    if (
      event.date &&
      typeof event.date === 'object' &&
      'toDate' in event.date
    ) {
      eventDate = event.date.toDate();
    }
    // Verificar si tiene propiedad seconds (Timestamp serializado)
    else if (
      event.date &&
      typeof event.date === 'object' &&
      'seconds' in event.date
    ) {
      const ts = event.date as { seconds: number; nanoseconds: number };
      eventDate = new Date(ts.seconds * 1000);
    }
    // String o número
    else if (
      typeof event.date === 'string' ||
      typeof event.date === 'number'
    ) {
      eventDate = new Date(event.date);
    }
    // Ya es un Date
    else {
      eventDate = event.date as Date;
    }
    
    // Validar que eventDate sea válido
    if (!eventDate || isNaN(eventDate.getTime())) {
      return false;
    }
    
    return eventDate < now && event.status !== 'completed';
  };

  const overdueStatus = isOverdue();

  // Clases de estilo por tipo de evento
  const getTypeStyles = () => {
    if (overdueStatus) {
      return {
        border: 'border-red-500',
        bg: 'bg-red-50',
        icon: 'text-red-600',
        badge: 'text-red-700 bg-red-100',
      };
    }

    const styles = {
      audit: {
        border: 'border-blue-500',
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        badge: 'text-blue-700 bg-blue-100',
      },
      document_expiry: {
        border: 'border-amber-500',
        bg: 'bg-amber-50',
        icon: 'text-amber-600',
        badge: 'text-amber-700 bg-amber-100',
      },
      action_deadline: {
        border: 'border-red-500',
        bg: 'bg-red-50',
        icon: 'text-red-600',
        badge: 'text-red-700 bg-red-100',
      },
      training: {
        border: 'border-emerald-500',
        bg: 'bg-emerald-50',
        icon: 'text-emerald-600',
        badge: 'text-emerald-700 bg-emerald-100',
      },
      finding_deadline: {
        border: 'border-amber-500',
        bg: 'bg-amber-50',
        icon: 'text-amber-600',
        badge: 'text-amber-700 bg-amber-100',
      },
      evaluation: {
        border: 'border-purple-500',
        bg: 'bg-purple-50',
        icon: 'text-purple-600',
        badge: 'text-purple-700 bg-purple-100',
      },
      meeting: {
        border: 'border-indigo-500',
        bg: 'bg-indigo-50',
        icon: 'text-indigo-600',
        badge: 'text-indigo-700 bg-indigo-100',
      },
      general: {
        border: 'border-gray-500',
        bg: 'bg-gray-50',
        icon: 'text-gray-600',
        badge: 'text-gray-700 bg-gray-100',
      },
    };

    return styles[event.type] || styles.general;
  };

  const getPriorityStyles = () => {
    const styles = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700',
    };
    return styles[event.priority] || styles.low;
  };

  const typeStyles = getTypeStyles();
  const priorityStyles = getPriorityStyles();

  if (variant === 'compact') {
    return (
      <div
        onClick={onClick}
        className={`p-2 mb-1 rounded border-l-4 cursor-pointer hover:bg-gray-100 transition-colors ${typeStyles.border} ${typeStyles.bg}`}
      >
        <div className="flex items-start gap-2">
          <Icon className={`h-3 w-3 ${typeStyles.icon} mt-0.5 shrink-0`} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 line-clamp-1">
              {event.title}
            </p>
            {event.responsibleUserName && (
              <p className="text-[10px] text-gray-500 truncate">
                {event.responsibleUserName}
              </p>
            )}
          </div>
          {overdueStatus && (
            <span className="shrink-0 text-[10px] font-bold text-red-600 bg-red-200 px-1.5 py-0.5 rounded">
              !
            </span>
          )}
          {!overdueStatus && event.priority === 'critical' && (
            <span className="shrink-0 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-lg transition-all ${typeStyles.border} bg-white shadow`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Icon className={`h-5 w-5 ${typeStyles.icon}`} />
          <span
            className={`text-xs font-medium ${typeStyles.badge} px-2 py-1 rounded`}
          >
            {config.label}
          </span>
          {overdueStatus && (
            <span className="text-xs font-bold text-red-600 bg-red-200 px-2 py-1 rounded animate-pulse">
              VENCIDO
            </span>
          )}
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${priorityStyles}`}
        >
          {priorityInfo.label}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        {event.title}
      </h3>

      {event.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {event.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatTime(event.date)}</span>
        </div>
        {event.responsibleUserName && (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span className="truncate">{event.responsibleUserName}</span>
          </div>
        )}
      </div>

      {event.sourceRecordNumber && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {event.sourceRecordNumber}
          </span>
        </div>
      )}
    </div>
  );
}
