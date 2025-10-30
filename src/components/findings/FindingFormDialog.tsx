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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { FindingFormData } from '@/types/findings';
import { useState } from 'react';

interface FindingFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FindingFormData) => Promise<void>;
  initialData?: Partial<FindingFormData>;
}

export function FindingFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
}: FindingFormDialogProps) {
  const [formData, setFormData] = useState<Partial<FindingFormData>>(
    initialData || {}
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData as FindingFormData);
      onClose();
    } catch (error) {
      console.error('Error submitting finding:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Hallazgo' : 'Nuevo Hallazgo'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="source">Fuente</Label>
              <Select
                value={formData.source}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    source: value as FindingFormData['source'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar fuente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="audit">Auditoría</SelectItem>
                  <SelectItem value="employee">Empleado</SelectItem>
                  <SelectItem value="customer">Cliente</SelectItem>
                  <SelectItem value="inspection">Inspección</SelectItem>
                  <SelectItem value="supplier">Proveedor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="severity">Severidad</Label>
              <Select
                value={formData.severity}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    severity: value as FindingFormData['severity'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar severidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="major">Mayor</SelectItem>
                  <SelectItem value="minor">Menor</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="findingType">Tipo</Label>
              <Select
                value={formData.findingType}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    findingType: value as FindingFormData['findingType'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="non_conformity">No Conformidad</SelectItem>
                  <SelectItem value="observation">Observación</SelectItem>
                  <SelectItem value="improvement_opportunity">
                    Oportunidad de Mejora
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    category: value as FindingFormData['category'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quality">Calidad</SelectItem>
                  <SelectItem value="safety">Seguridad</SelectItem>
                  <SelectItem value="environment">Medio Ambiente</SelectItem>
                  <SelectItem value="process">Proceso</SelectItem>
                  <SelectItem value="equipment">Equipo</SelectItem>
                  <SelectItem value="documentation">Documentación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="evidence">Evidencia</Label>
            <Textarea
              id="evidence"
              value={formData.evidence || ''}
              onChange={e =>
                setFormData({ ...formData, evidence: e.target.value })
              }
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
