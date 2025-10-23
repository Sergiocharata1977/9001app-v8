'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DepartmentFormData, departmentFormSchema } from '@/lib/validations/rrhh';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface DepartmentFormProps {
  initialData?: DepartmentFormData;
  onSubmit: (data: DepartmentFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function DepartmentForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}: DepartmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      responsible_user_id: '',
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  const handleFormSubmit = async (data: DepartmentFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Departamento *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Ingrese el nombre del departamento"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Ingrese una descripción del departamento"
          rows={3}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="responsible_user_id">ID Usuario Responsable</Label>
        <Input
          id="responsible_user_id"
          {...register('responsible_user_id')}
          placeholder="Ingrese el ID del usuario responsable"
          className={errors.responsible_user_id ? 'border-red-500' : ''}
        />
        {errors.responsible_user_id && (
          <p className="text-sm text-red-500">{errors.responsible_user_id.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_active"
          checked={isActive}
          onCheckedChange={(checked) => setValue('is_active', checked as boolean)}
        />
        <Label htmlFor="is_active">Departamento activo</Label>
      </div>

      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting || isLoading ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}