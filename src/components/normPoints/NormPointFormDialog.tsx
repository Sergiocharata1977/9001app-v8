'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { NormPoint, NormType, NormCategory } from '@/types/normPoints';
import { X } from 'lucide-react';

interface NormPointFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  normPoint?: NormPoint | null;
  onSuccess: () => void;
}

export function NormPointFormDialog({
  open,
  onOpenChange,
  normPoint,
  onSuccess,
}: NormPointFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    code: string;
    title: string;
    description: string;
    requirement: string;
    tipo_norma: NormType;
    chapter?: number;
    category?: NormCategory;
    is_mandatory: boolean;
    priority: 'alta' | 'media' | 'baja';
    created_by: string;
    updated_by: string;
  }>({
    code: '',
    title: '',
    description: '',
    requirement: '',
    tipo_norma: 'iso_9001',
    chapter: 4,
    is_mandatory: false,
    priority: 'media',
    created_by: 'current-user',
    updated_by: 'current-user',
  });

  useEffect(() => {
    if (normPoint) {
      setFormData({
        code: normPoint.code,
        title: normPoint.title,
        description: normPoint.description,
        requirement: normPoint.requirement,
        tipo_norma: normPoint.tipo_norma,
        chapter: normPoint.chapter,
        category: normPoint.category,
        is_mandatory: normPoint.is_mandatory,
        priority: normPoint.priority,
        created_by: normPoint.created_by,
        updated_by: 'current-user',
      });
    } else {
      setFormData({
        code: '',
        title: '',
        description: '',
        requirement: '',
        tipo_norma: 'iso_9001',
        chapter: 4,
        is_mandatory: false,
        priority: 'media',
        created_by: 'current-user',
        updated_by: 'current-user',
      });
    }
  }, [normPoint, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = normPoint
        ? `/api/norm-points/${normPoint.id}`
        : '/api/norm-points';
      const method = normPoint ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving norm point:', error);
      alert('Error al guardar el punto de norma');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {normPoint ? 'Editar Punto de Norma' : 'Nuevo Punto de Norma'}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <Label htmlFor="code">Código *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              placeholder="4.1"
              required
            />
          </div>

          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="requirement">Requisito *</Label>
            <Textarea
              id="requirement"
              value={formData.requirement}
              onChange={e =>
                setFormData({ ...formData, requirement: e.target.value })
              }
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo_norma">Tipo de Norma *</Label>
              <Select
                value={formData.tipo_norma}
                onValueChange={value =>
                  setFormData({ ...formData, tipo_norma: value as NormType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iso_9001">ISO 9001</SelectItem>
                  <SelectItem value="iso_14001">ISO 14001</SelectItem>
                  <SelectItem value="iso_45001">ISO 45001</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="otra">Otra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.tipo_norma.startsWith('iso_') && (
              <div>
                <Label htmlFor="chapter">Capítulo</Label>
                <Select
                  value={formData.chapter?.toString() || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, chapter: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="9">9</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Prioridad *</Label>
              <Select
                value={formData.priority}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    priority: value as typeof formData.priority,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Checkbox
                id="is_mandatory"
                checked={formData.is_mandatory}
                onCheckedChange={checked =>
                  setFormData({ ...formData, is_mandatory: checked as boolean })
                }
              />
              <Label htmlFor="is_mandatory" className="cursor-pointer">
                Obligatorio
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : normPoint ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
