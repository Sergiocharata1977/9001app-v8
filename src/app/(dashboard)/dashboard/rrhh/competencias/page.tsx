'use client';

import { CompetenceForm } from '@/components/rrhh/CompetenceForm';
import { CompetenceListing } from '@/components/rrhh/CompetenceListing';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Competence, CompetenceFormData } from '@/types/rrhh';
import { useState } from 'react';

export default function CompetenciasPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCompetence, setEditingCompetence] = useState<Competence | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  const handleCreate = async (data: CompetenceFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/rrhh/competencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear competencia');
      }

      toast({
        title: 'Éxito',
        description: 'Competencia creada correctamente',
      });

      setShowCreateDialog(false);
      setRefreshTrigger(prev => prev + 1); // Trigger reload
    } catch (error) {
      console.error('Error al crear competencia:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al crear competencia',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: CompetenceFormData) => {
    if (!editingCompetence) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/rrhh/competencias/${editingCompetence.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar competencia');
      }

      toast({
        title: 'Éxito',
        description: 'Competencia actualizada correctamente',
      });

      setEditingCompetence(null);
      setRefreshTrigger(prev => prev + 1); // Trigger reload
    } catch (error) {
      console.error('Error al actualizar competencia:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error al actualizar competencia',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (competence: Competence) => {
    setEditingCompetence(competence);
  };

  const handleCancel = () => {
    setShowCreateDialog(false);
    setEditingCompetence(null);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Competencias</h1>
        <p className="text-gray-600 mt-2">
          Administra el catálogo maestro de competencias requeridas para los
          puestos de trabajo
        </p>
      </div>

      <CompetenceListing
        onCreate={() => setShowCreateDialog(true)}
        onEdit={handleEdit}
        refreshTrigger={refreshTrigger}
      />

      {/* Dialog para crear */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nueva Competencia</DialogTitle>
          </DialogHeader>
          <CompetenceForm
            onSubmit={handleCreate}
            onCancel={handleCancel}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para editar */}
      <Dialog
        open={!!editingCompetence}
        onOpenChange={() => setEditingCompetence(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Competencia</DialogTitle>
          </DialogHeader>
          {editingCompetence && (
            <CompetenceForm
              initialData={editingCompetence}
              onSubmit={handleUpdate}
              onCancel={handleCancel}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
