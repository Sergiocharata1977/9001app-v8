'use client';

import type { Finding } from '@/types/findings';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FindingCard } from './FindingCard';

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
  const router = useRouter();
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

  const handleViewFinding = (finding: Finding) => {
    router.push(`/hallazgos/${finding.id}`);
  };

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
    <div className="space-y-4">
      {findings.map(finding => (
        <FindingCard key={finding.id} finding={finding} />
      ))}
    </div>
  );
}
