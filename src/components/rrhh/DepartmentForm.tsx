'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DepartmentFormData, departmentFormSchema } from '@/lib/validations/rrhh';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Department } from '@/types/rrhh';

interface DepartmentFormProps {
  initialData?: Department | null;
  onSubmit: (data: DepartmentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DepartmentForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: DepartmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description || '',
      responsible_user_id: initialData.responsible_user_id || '',
      is_active: initialData.is_active
    } : {
      name: '',
      description: '',
      responsible_user_id: '',
      is_active: true
    }
  });

  const handleFormSubmit = async (data: DepartmentFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Editar Departamento' : 'Nuevo Departamento'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nombre del departamento"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="responsible_user_id">ID Usuario Responsable</Label>
              <Input
                id="responsible_user_id"
                {...register('responsible_user_id')}
                placeholder="ID del usuario responsable"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción del departamento"
              rows={3}
            />
          </div>


          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="is_active">Departamento activo</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
