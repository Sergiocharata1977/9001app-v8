'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Textarea } from '@/components/ui/textarea';
import { FindingFormSchema } from '@/lib/validations/findings';
import type { FindingFormData } from '@/types/findings';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface FindingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: Partial<FindingFormData>;
}

export function FindingFormDialog({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: FindingFormDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FindingFormData>({
    resolver: zodResolver(FindingFormSchema),
    defaultValues: initialData || {},
  });

  const onSubmit = async (data: FindingFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/findings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userName: 'Usuario',
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear hallazgo');
      }

      const { id } = await response.json();

      alert('Hallazgo creado exitosamente');
      reset();
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }

      router.push(`/hallazgos/${id}`);
    } catch (error) {
      console.error('Error creating finding:', error);
      alert('Error al crear el hallazgo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Hallazgo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          {/* Información General */}
          <div className="space-y-4">
            <SectionHeader title="Información General" description="Detalles básicos del hallazgo" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Origen *</Label>
                <Input
                  id="origin"
                  {...register('origin')}
                  placeholder="Ej: Auditoría Interna"
                  className="bg-slate-50 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.origin && (
                  <p className="text-sm text-red-600">{errors.origin.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Nombre del hallazgo"
                  className="bg-slate-50 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descripción detallada del hallazgo"
                rows={4}
                className="bg-slate-50 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Contexto */}
          <div className="space-y-4">
            <SectionHeader title="Contexto del Proceso" description="Información del proceso relacionado" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="processId">ID Proceso *</Label>
                <Input
                  id="processId"
                  {...register('processId')}
                  placeholder="ID del proceso"
                  className="bg-slate-50 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.processId && (
                  <p className="text-sm text-red-600">{errors.processId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="processName">Nombre del Proceso *</Label>
                <Input
                  id="processName"
                  {...register('processName')}
                  placeholder="Nombre del proceso"
                  className="bg-slate-50 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.processName && (
                  <p className="text-sm text-red-600">{errors.processName.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Hallazgo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
