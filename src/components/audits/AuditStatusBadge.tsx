'use client';

import { Badge } from '@/components/ui/badge';
import type { Audit } from '@/types/audits';

interface AuditStatusBadgeProps {
  status: Audit['status'];
}

const statusConfig = {
  planned: { label: 'Planificada', variant: 'secondary' as const },
  in_progress: { label: 'En Progreso', variant: 'default' as const },
  completed: { label: 'Completada', variant: 'success' as const },
  cancelled: { label: 'Cancelada', variant: 'destructive' as const },
  postponed: { label: 'Pospuesta', variant: 'outline' as const },
};

export function AuditStatusBadge({ status }: AuditStatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
