'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Audit } from '@/types/audits';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AuditStatusBadge } from './AuditStatusBadge';

interface AuditCardProps {
  audits: Audit[];
  onRefresh: () => void;
}

export function AuditCard({ audits }: AuditCardProps) {
  const router = useRouter();

  if (audits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay auditorías registradas</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {audits.map(audit => (
        <Card
          key={audit.id}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push(`/auditorias/${audit.id}`)}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{audit.title}</CardTitle>
              <AuditStatusBadge status={audit.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {audit.description || 'Sin descripción'}
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                {format(new Date(audit.plannedDate), 'PP', { locale: es })}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="h-4 w-4 mr-2" />
                {audit.leadAuditor}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
