import { Badge } from '@/components/ui/badge';
import type { AuditStatus } from '@/types/audits';

interface AuditStatusBadgeProps {
  status: AuditStatus;
}

export function AuditStatusBadge({ status }: AuditStatusBadgeProps) {
  const config: Record<
    AuditStatus,
    {
      variant: 'default' | 'secondary' | 'outline';
      label: string;
      icon: string;
    }
  > = {
    planned: { variant: 'secondary', label: 'Planificada', icon: '📋' },
    in_progress: { variant: 'default', label: 'En Progreso', icon: '🔄' },
    completed: { variant: 'outline', label: 'Completada', icon: '✅' },
  };

  const { variant, label, icon } = config[status];

  return (
    <Badge variant={variant}>
      {icon} {label}
    </Badge>
  );
}
