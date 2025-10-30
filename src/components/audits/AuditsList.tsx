'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Audit, AuditFilters } from '@/types/audits';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AuditCard } from './AuditCard';

interface AuditsListProps {
  onCreateAudit: () => void;
  onViewAudit: (id: string) => void;
}

export function AuditsList({ onCreateAudit, onViewAudit }: AuditsListProps) {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAudits();
  }, [filters]);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.auditType) params.append('auditType', filters.auditType);
      if (filters.year) params.append('year', filters.year.toString());

      const response = await fetch(`/api/audits?${params}`, {
        headers: { authorization: 'Bearer token' },
      });
      const data = await response.json();
      setAudits(data.audits || []);
    } catch (error) {
      console.error('Error fetching audits:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAudits = audits.filter(
    audit =>
      audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.auditNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Auditorías</h2>
        <Button onClick={onCreateAudit}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Auditoría
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar auditorías..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filters.status}
          onValueChange={value => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="planned">Planificada</SelectItem>
            <SelectItem value="in_progress">En Progreso</SelectItem>
            <SelectItem value="completed">Completada</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.auditType}
          onValueChange={value => setFilters({ ...filters, auditType: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="internal">Interna</SelectItem>
            <SelectItem value="external">Externa</SelectItem>
            <SelectItem value="supplier">Proveedor</SelectItem>
            <SelectItem value="customer">Cliente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAudits.map(audit => (
            <AuditCard
              key={audit.id}
              audit={audit}
              onClick={() => onViewAudit(audit.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
