'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PositionFormData, positionFormSchema } from '@/lib/validations/rrhh';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Position } from '@/types/rrhh';

interface PositionFormProps {
  initialData?: Position | null;
  onSubmit: (data: PositionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PositionForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: PositionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PositionFormData>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: initialData || {
      nombre: '',
      descripcion_responsabilidades: '',
      requisitos_experiencia: '',
      requisitos_formacion: '',
      departamento_id: '',
      reporta_a_id: '',
    },
  });

  const handleFormSubmit = async (data: PositionFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Puesto' : 'Crear Puesto'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Información Básica
            </h3>
            <div>
              <Label htmlFor="nombre">Nombre del Puesto</Label>
              <Input
                id="nombre"
                {...register('nombre')}
                placeholder="Ej. Analista de Datos"
                className={errors.nombre ? 'border-red-500' : ''}
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.nombre.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="descripcion_responsabilidades">
                Descripción de Responsabilidades
              </Label>
              <Textarea
                id="descripcion_responsabilidades"
                {...register('descripcion_responsabilidades')}
                placeholder="Describe las responsabilidades principales del puesto"
                className={
                  errors.descripcion_responsabilidades ? 'border-red-500' : ''
                }
                rows={4}
              />
              {errors.descripcion_responsabilidades && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.descripcion_responsabilidades.message}
                </p>
              )}
            </div>
          </div>

          {/* Requisitos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Requisitos</h3>
            <div>
              <Label htmlFor="requisitos_experiencia">
                Requisitos de Experiencia
              </Label>
              <Textarea
                id="requisitos_experiencia"
                {...register('requisitos_experiencia')}
                placeholder="Ej. 3 años de experiencia en análisis de datos"
                className={
                  errors.requisitos_experiencia ? 'border-red-500' : ''
                }
                rows={3}
              />
              {errors.requisitos_experiencia && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.requisitos_experiencia.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="requisitos_formacion">
                Requisitos de Formación
              </Label>
              <Textarea
                id="requisitos_formacion"
                {...register('requisitos_formacion')}
                placeholder="Ej. Título universitario en Ingeniería, Administración o afín"
                className={errors.requisitos_formacion ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.requisitos_formacion && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.requisitos_formacion.message}
                </p>
              )}
            </div>
          </div>

          {/* Organización */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Organización</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="departamento_id">ID del Departamento</Label>
                <Input
                  id="departamento_id"
                  {...register('departamento_id')}
                  placeholder="ID del departamento"
                  className={errors.departamento_id ? 'border-red-500' : ''}
                />
                {errors.departamento_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.departamento_id.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="reporta_a_id">Reporta a (ID)</Label>
                <Input
                  id="reporta_a_id"
                  {...register('reporta_a_id')}
                  placeholder="ID del supervisor"
                  className={errors.reporta_a_id ? 'border-red-500' : ''}
                />
                {errors.reporta_a_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.reporta_a_id.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading || isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || isSubmitting}>
              {isLoading || isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
