'use client';

import { FindingImmediateActionExecutionForm } from '@/components/findings/FindingImmediateActionExecutionForm';
import { FindingImmediateActionPlanningForm } from '@/components/findings/FindingImmediateActionPlanningForm';
import { FindingRootCauseAnalysisForm } from '@/components/findings/FindingRootCauseAnalysisForm';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { Finding } from '@/types/findings';
import { FINDING_STATUS_COLORS, FINDING_STATUS_LABELS } from '@/types/findings';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Helper para convertir fechas de Firestore
const toDate = (
  timestamp: Date | { toDate?: () => Date; seconds?: number } | string | null
): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (
    typeof timestamp === 'object' &&
    'toDate' in timestamp &&
    typeof timestamp.toDate === 'function'
  ) {
    return timestamp.toDate();
  }
  if (
    typeof timestamp === 'object' &&
    'seconds' in timestamp &&
    timestamp.seconds
  ) {
    return new Date(timestamp.seconds * 1000);
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return new Date();
};

export default function FindingDetailPage() {
  const params = useParams();
  const [finding, setFinding] = useState<Finding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchFinding();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchFinding = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/findings/${params.id}`);

      if (!response.ok) {
        throw new Error('Hallazgo no encontrado');
      }

      const data = await response.json();
      setFinding(data.finding);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar el hallazgo'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    if (!finding) return;

    if (!confirm('¿Está seguro de cerrar este hallazgo?')) return;

    try {
      const response = await fetch(`/api/findings/${finding.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: 'Usuario' }),
      });

      if (!response.ok) {
        throw new Error('Error al cerrar hallazgo');
      }

      alert('Hallazgo cerrado exitosamente');
      fetchFinding();
    } catch (error) {
      console.error('Error closing finding:', error);
      alert('Error al cerrar el hallazgo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !finding) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Hallazgo no encontrado'}
        </div>
        <Link
          href="/hallazgos"
          className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a hallazgos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/hallazgos"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {finding.findingNumber}
            </h1>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${FINDING_STATUS_COLORS[finding.status]}`}
            >
              {FINDING_STATUS_LABELS[finding.status]}
            </span>
          </div>
          <p className="text-gray-600">{finding.registration.name}</p>
        </div>

        {/* Botón Cerrar */}
        {finding.status === 'analisis_completado' && (
          <Button onClick={handleClose} variant="outline">
            Cerrar Hallazgo
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso</span>
          <span className="text-2xl font-bold text-gray-900">
            {finding.progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all"
            style={{ width: `${finding.progress}%` }}
          />
        </div>
      </div>

      {/* Fase 1: Registro del Hallazgo */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
          Fase 1: Registro del Hallazgo
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Origen</label>
            <p className="text-gray-900 mt-1">{finding.registration.origin}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Nombre</label>
            <p className="text-gray-900 mt-1">{finding.registration.name}</p>
          </div>

          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-500">
              Descripción
            </label>
            <p className="text-gray-900 mt-1">
              {finding.registration.description}
            </p>
          </div>

          {finding.registration.processName && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Proceso Involucrado
              </label>
              <p className="text-gray-900 mt-1">
                {finding.registration.processName}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fase 2: Planificación de Acción Inmediata - Formulario o Vista */}
      {finding.immediateActionPlanning ? (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
            Fase 2: Planificación de Acción Inmediata
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Responsable de la Acción
              </label>
              <p className="text-gray-900 mt-1">
                {finding.immediateActionPlanning.responsiblePersonName}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Fecha Programada
              </label>
              <p className="text-gray-900 mt-1">
                {formatDate(
                  toDate(finding.immediateActionPlanning.plannedDate)
                )}
              </p>
            </div>

            {finding.immediateActionPlanning.comments && (
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">
                  Comentarios
                </label>
                <p className="text-gray-900 mt-1">
                  {finding.immediateActionPlanning.comments}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        finding.status === 'registrado' && (
          <FindingImmediateActionPlanningForm
            findingId={finding.id}
            onSuccess={fetchFinding}
          />
        )
      )}

      {/* Fase 3: Ejecución de Acción Inmediata - Formulario o Vista */}
      {finding.immediateActionExecution ? (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
            Fase 3: Ejecución de Acción Inmediata
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Fecha de Ejecución
              </label>
              <p className="text-gray-900 mt-1">
                {formatDate(
                  toDate(finding.immediateActionExecution.executionDate)
                )}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Ejecutado por
              </label>
              <p className="text-gray-900 mt-1">
                {finding.immediateActionExecution.executedByName}
              </p>
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-500">
                Corrección Realizada
              </label>
              <p className="text-gray-900 mt-1">
                {finding.immediateActionExecution.correction}
              </p>
            </div>
          </div>
        </div>
      ) : (
        finding.status === 'accion_planificada' &&
        finding.immediateActionPlanning && (
          <FindingImmediateActionExecutionForm
            findingId={finding.id}
            onSuccess={fetchFinding}
          />
        )
      )}

      {/* Fase 4: Análisis de Causa Raíz - Formulario o Vista */}
      {finding.rootCauseAnalysis ? (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
            Fase 4: Análisis de Causa Raíz
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Análisis
              </label>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                {finding.rootCauseAnalysis.analysis}
              </p>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium text-gray-700">
                ¿Requiere Acción?
              </label>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  finding.rootCauseAnalysis.requiresAction
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {finding.rootCauseAnalysis.requiresAction ? 'Sí' : 'No'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                Analizado por: {finding.rootCauseAnalysis.analyzedByName}
              </div>
              <div>
                Fecha:{' '}
                {formatDate(toDate(finding.rootCauseAnalysis.analyzedDate))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        finding.status === 'accion_ejecutada' &&
        finding.immediateActionExecution && (
          <FindingRootCauseAnalysisForm
            findingId={finding.id}
            onSuccess={fetchFinding}
          />
        )
      )}

      {/* Metadatos */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <div className="grid grid-cols-2 gap-2">
          <div>
            Creado por: {finding.createdByName} el{' '}
            {formatDate(toDate(finding.createdAt))}
          </div>
          {finding.updatedBy && (
            <div>
              Actualizado por: {finding.updatedByName} el{' '}
              {formatDate(toDate(finding.updatedAt))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
