'use client';

import type { Finding } from '@/types/findings';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FindingCardCompact } from './FindingCardCompact';

interface FindingListProps {
  filters?: {
    status?: string;
    processId?: string;
    year?: number;
    search?: string;
    requiresAction?: boolean;
  };
}

export function FindingList({ filters }: FindingListProps) {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFindings = async () => {
      try {
        setIsLoading(true);

        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.processId) params.append('processId', filters.processId);
        if (filters?.year) params.append('year', filters.year.toString());
        if (filters?.search) params.append('search', filters.search);
        if (filters?.requiresAction !== undefined)
          params.append('requiresAction', filters.requiresAction.toString());

        const response = await fetch(`/api/findings?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Error al cargar hallazgos');
        }

        const data = await response.json();
        // Filtrar hallazgos válidos (con estructura correcta)
        const validFindings = data.findings.filter(
          (f: Finding) => f.registration && f.findingNumber
        );
        setFindings(validFindings);
      } catch (error) {
        console.error('Error loading findings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFindings();
  }, [filters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (findings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se encontraron hallazgos</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {findings.map(finding => (
        <FindingCardCompact key={finding.id} finding={finding} />
      ))}
    </div>
  );
}
