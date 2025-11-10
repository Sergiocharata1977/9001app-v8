'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Audit } from '@/types/audits';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { AuditStatusBadge } from './AuditStatusBadge';

interface AuditListProps {
  audits: Audit[];
  onRefresh: () => void;
}

export function AuditList({ audits }: AuditListProps) {
  const router = useRouter();

  if (audits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay auditorías registradas</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Auditor Líder</TableHead>
            <TableHead>Fecha Planificada</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha de Creación</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {audits.map(audit => (
            <TableRow
              key={audit.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/auditorias/${audit.id}`)}
            >
              <TableCell className="font-medium">{audit.title}</TableCell>
              <TableCell>{audit.leadAuditor}</TableCell>
              <TableCell>
                {format(new Date(audit.plannedDate), 'PP', { locale: es })}
              </TableCell>
              <TableCell>
                <AuditStatusBadge status={audit.status} />
              </TableCell>
              <TableCell>
                {format(new Date(audit.createdAt), 'PP', { locale: es })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
