'use client';

import { AuditWizard } from '@/components/audits/AuditWizard';
import { Button } from '@/components/ui/button';
import type { AuditFormData } from '@/types/audits';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateAuditPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleCreateAudit = async (data: AuditFormData) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/sdk/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la auditoría');
      }

      const result = await response.json();

      if (result.success && result.data?.id) {
        router.push(`/auditorias/${result.data.id}`);
      } else {
        throw new Error('Error inesperado al crear la auditoría');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al crear la auditoría';
      setError(message);
      console.error('Error creating audit:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Auditoría</h1>
          <p className="text-gray-600 mt-1">
            Cree una nueva auditoría interna ISO 9001
          </p>
        </div>

        <Button
          onClick={() => router.push('/auditorias')}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Wizard */}
      <div className="bg-white rounded-lg shadow p-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Creando auditoría...</p>
            </div>
          </div>
        ) : (
          <AuditWizard onSubmit={handleCreateAudit} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
