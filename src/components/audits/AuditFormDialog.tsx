'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AuditFormSchema, type AuditFormInput } from '@/lib/validations/audits';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface AuditFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AuditFormInput) => Promise<void>;
  initialData?: AuditFormInput;
  mode: 'create' | 'edit';
}

export function AuditFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: AuditFormDialogProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(AuditFormSchema),
    defaultValues: initialData,
  });

  const onSubmitForm = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      await onSubmit(data as AuditFormInput);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create'
              ? 'Planificar Nueva Auditoría'
              : 'Editar Auditoría'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Ej: Auditoría Interna ISO 9001:2015"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción de la auditoría..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="plannedDate">Fecha Planificada *</Label>
            <Input
              id="plannedDate"
              type="date"
              {...register('plannedDate', {
                setValueAs: v => {
                  if (!v) return undefined;
                  // Crear fecha en zona horaria local
                  const date = new Date(v + 'T00:00:00');
                  return date;
                },
              })}
              defaultValue={
                initialData?.plannedDate
                  ? new Date(initialData.plannedDate)
                      .toISOString()
                      .split('T')[0]
                  : ''
              }
            />
            {errors.plannedDate && (
              <p className="text-sm text-red-500 mt-1">
                {errors.plannedDate.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="leadAuditor">Auditor Líder *</Label>
            <Input
              id="leadAuditor"
              {...register('leadAuditor')}
              placeholder="Nombre del auditor líder"
            />
            {errors.leadAuditor && (
              <p className="text-sm text-red-500 mt-1">
                {errors.leadAuditor.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? 'Guardando...'
                : mode === 'create'
                  ? 'Crear Auditoría'
                  : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
