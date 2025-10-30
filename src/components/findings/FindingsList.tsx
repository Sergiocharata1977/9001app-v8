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
import type { Finding, FindingFilters } from '@/types/findings';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FindingCard } from './FindingCard';

interface FindingsListProps {
  onCreateFinding: () => void;
  onViewFinding: (id: string) => void;
}

export function FindingsList({
  onCreateFinding,
  onViewFinding,
}: FindingsListProps) {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FindingFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFindings();
  }, [filters]);

  const fetchFindings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.source) params.append('source', filters.source);
      if (filters.status) params.append('status', filters.status);
      if (filters.severity) params.append('severity', filters.severity);

      const response = await fetch(`/api/findings?${params}`, {
        headers: { authorization: 'Bearer token' },
      });
      const data = await response.json();
      setFindings(data.findings || []);
    } catch (error) {
      console.error('Error fetching findings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFindings = findings.filter(
    finding =>
      finding.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finding.findingNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Hallazgos</h2>
        <Button onClick={onCreateFinding}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Hallazgo
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar hallazgos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filters.severity}
          onValueChange={value => setFilters({ ...filters, severity: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Severidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="critical">Crítica</SelectItem>
            <SelectItem value="major">Mayor</SelectItem>
            <SelectItem value="minor">Menor</SelectItem>
            <SelectItem value="low">Baja</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={value => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Abierto</SelectItem>
            <SelectItem value="in_analysis">En Análisis</SelectItem>
            <SelectItem value="in_progress">En Progreso</SelectItem>
            <SelectItem value="closed">Cerrado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFindings.map(finding => (
            <FindingCard
              key={finding.id}
              finding={finding}
              onClick={() => onViewFinding(finding.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
