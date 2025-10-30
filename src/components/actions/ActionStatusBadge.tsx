'use client';

import { Badge } from '@/components/ui/badge';
import type { Action } from '@/types/actions';

interface ActionStatusBadgeProps {
  status: Action['status'] | 'pending' | 'in_progress' | 'completed';
}

const statusConfig = {
  planned: { label: 'Planificada', variant: 'secondary' as const },
  in_progress: { label: 'En Progreso', variant: 'default' as const },
  completed: { label: 'Completada', variant: 'success' as const },
  cancelled: { label: 'Cancelada', variant: 'destructive' as const },
  on_hold: { label: 'En Espera', variant: 'outline' as const },
  pending: { label: 'Pendiente', variant: 'secondary' as const },
};

export function ActionStatusBadge({ status }: ActionStatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
