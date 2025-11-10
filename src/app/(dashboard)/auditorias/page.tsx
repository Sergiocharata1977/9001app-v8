'use client';

import { AuditCard } from '@/components/audits/AuditCard';
import { AuditFormDialog } from '@/components/audits/AuditFormDialog';
import { AuditKanban } from '@/components/audits/AuditKanban';
import { AuditList } from '@/components/audits/AuditList';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AuditFormInput } from '@/lib/validations/audits';
import type { Audit } from '@/types/audits';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuditoriasPage() {
  const router = useRouter();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'card'>(
    'kanban'
  );

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const response = await fetch('/api/audits');
      const data = await response.json();
      setAudits(data.audits);
    } catch (error) {
      console.error('Error fetching audits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: AuditFormInput) => {
    try {
      // Convertir la fecha a ISO string para serialización
      const payload = {
        ...data,
        plannedDate: data.plannedDate.toISOString(),
      };

      const response = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error response:', error);
        alert(
          `Error al crear auditoría: ${error.error || 'Error desconocido'}`
        );
        return;
      }

      const result = await response.json();
      await fetchAudits(); // Refrescar la lista antes de navegar
      router.push(`/auditorias/${result.id}`);
    } catch (error) {
      console.error('Error creating audit:', error);
      alert('Error al crear auditoría. Por favor intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando auditorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Auditorías</h1>
          <p className="text-muted-foreground">
            Gestión de auditorías ISO 9001:2015
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Auditoría
        </Button>
      </div>

      <Tabs
        value={viewMode}
        onValueChange={v => setViewMode(v as 'kanban' | 'list' | 'card')}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="card">Tarjetas</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <AuditKanban audits={audits} onRefresh={fetchAudits} />
        </TabsContent>

        <TabsContent value="list">
          <AuditList audits={audits} onRefresh={fetchAudits} />
        </TabsContent>

        <TabsContent value="card">
          <AuditCard audits={audits} onRefresh={fetchAudits} />
        </TabsContent>
      </Tabs>

      <AuditFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
        mode="create"
      />
    </div>
  );
}
