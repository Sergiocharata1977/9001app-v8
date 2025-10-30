'use client';

import { Badge } from '@/components/ui/badge';
import type { Finding } from '@/types/findings';

interface FindingStatusBadgeProps {
  status: Finding['status'];
}

const statusConfig = {
  open: { label: 'Abierto', variant: 'destructive' as const },
  in_analysis: { label: 'En Análisis', variant: 'default' as const },
  action_planned: {
    label: 'Acción Planificada',
    variant: 'secondary' as const,
  },
  in_progress: { label: 'En Progreso', variant: 'default' as const },
  closed: { label: 'Cerrado', variant: 'success' as const },
};

export function FindingStatusBadge({ status }: FindingStatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
