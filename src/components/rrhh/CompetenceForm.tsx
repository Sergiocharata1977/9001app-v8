'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { CompetenceCategory, CompetenceFormData } from '@/types/rrhh';
import { useState } from 'react';

interface Props {
  initialData?: Partial<CompetenceFormData>;
  onSubmit: (data: CompetenceFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function CompetenceForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
}: Props) {
  const [formData, setFormData] = useState<CompetenceFormData>({
    nombre: initialData?.nombre || '',
    categoria: initialData?.categoria || 'tecnica',
    descripcion: initialData?.descripcion || '',
    fuente: initialData?.fuente || 'interna',
    referenciaNorma: initialData?.referenciaNorma || '',
    activo: initialData?.activo ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      // Aquí se manejarían errores específicos si fuera necesario
    }
  };

  const handleChange = (field: keyof CompetenceFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre de la Competencia *</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={e => handleChange('nombre', e.target.value)}
            placeholder="Ej: Trabajo en equipo"
            required
          />
          {errors.nombre && (
            <p className="text-sm text-red-600">{errors.nombre}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria">Categoría *</Label>
          <Select
            value={formData.categoria}
            onValueChange={(value: CompetenceCategory) =>
              handleChange('categoria', value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tecnica">Técnica</SelectItem>
              <SelectItem value="blanda">Blanda</SelectItem>
              <SelectItem value="seguridad">Seguridad</SelectItem>
              <SelectItem value="iso_9001">ISO 9001</SelectItem>
              <SelectItem value="otra">Otra</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción *</Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={e => handleChange('descripcion', e.target.value)}
          placeholder="Describa detalladamente qué implica esta competencia"
          rows={3}
          required
        />
        {errors.descripcion && (
          <p className="text-sm text-red-600">{errors.descripcion}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="fuente">Fuente *</Label>
        <Select
          value={formData.fuente}
          onValueChange={value => handleChange('fuente', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar fuente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="interna">Interna</SelectItem>
            <SelectItem value="iso_9001">ISO 9001</SelectItem>
            <SelectItem value="cliente">Cliente</SelectItem>
            <SelectItem value="legal">Legal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="referenciaNorma">Referencia a Norma (Opcional)</Label>
        <Input
          id="referenciaNorma"
          value={formData.referenciaNorma}
          onChange={e => handleChange('referenciaNorma', e.target.value)}
          placeholder="Ej: ISO 9001:2015 7.2"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="activo"
          checked={formData.activo}
          onCheckedChange={checked => handleChange('activo', checked)}
        />
        <Label htmlFor="activo">Competencia activa</Label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
