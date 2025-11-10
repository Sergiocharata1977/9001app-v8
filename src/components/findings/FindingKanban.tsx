'use client';

import { FindingCard } from '@/components/findings/FindingCard';
import type { Finding, FindingStatus } from '@/types/findings';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const KANBAN_COLUMNS: {
  status: FindingStatus;
  label: string;
  color: string;
}[] = [
  {
    status: 'registrado',
    label: 'Registrados',
    color: 'bg-gray-100 border-gray-300',
  },
  {
    status: 'accion_planificada',
    label: 'Acción Planificada',
    color: 'bg-blue-100 border-blue-300',
  },
  {
    status: 'accion_ejecutada',
    label: 'Acción Ejecutada',
    color: 'bg-yellow-100 border-yellow-300',
  },
  {
    status: 'analisis_completado',
    label: 'Análisis Completado',
    color: 'bg-purple-100 border-purple-300',
  },
  {
    status: 'cerrado',
    label: 'Cerrados',
    color: 'bg-green-100 border-green-300',
  },
];

export function FindingKanban() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFindings();
  }, []);

  const fetchFindings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/findings');

      if (!response.ok) {
        throw new Error('Error al cargar los hallazgos');
      }

      const data = await response.json();
      // Filtrar hallazgos válidos
      const validFindings = (data.findings || []).filter(
        (f: Finding) => f.registration && f.findingNumber && f.isActive
      );
      setFindings(validFindings);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar los hallazgos'
      );
    } finally {
      setLoading(false);
    }
  };

  const getFindingsByStatus = (status: FindingStatus) => {
    return findings.filter(finding => finding.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map(column => {
        const columnFindings = getFindingsByStatus(column.status);

        return (
          <div key={column.status} className="flex-shrink-0 w-80">
            {/* Column Header */}
            <div
              className={`${column.color} border-2 rounded-t-lg px-4 py-3 font-semibold`}
            >
              <div className="flex items-center justify-between">
                <span>{column.label}</span>
                <span className="bg-white px-2 py-1 rounded-full text-sm">
                  {columnFindings.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className="bg-gray-50 border-2 border-t-0 border-gray-200 rounded-b-lg p-4 min-h-[500px] space-y-3">
              {columnFindings.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No hay hallazgos
                </p>
              ) : (
                columnFindings.map(finding => (
                  <FindingCard key={finding.id} finding={finding} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
