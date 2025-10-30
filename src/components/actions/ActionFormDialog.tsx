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
import type { ActionFormData } from '@/types/actions';
import { useState } from 'react';

interface ActionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ActionFormData) => Promise<void>;
  initialData?: Partial<ActionFormData>;
  findingId?: string;
  findingNumber?: string;
}

export function ActionFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  findingId,
  findingNumber,
}: ActionFormDialogProps) {
  const [formData, setFormData] = useState<Partial<ActionFormData>>(
    initialData || {
      findingId: findingId || '',
      findingNumber: findingNumber || '',
      sourceType: 'finding',
      sourceId: findingId || '',
    }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData as ActionFormData);
      onClose();
    } catch (error) {
      console.error('Error submitting action:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Acción' : 'Nueva Acción'}
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
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="actionType">Tipo de Acción</Label>
              <Select
                value={formData.actionType}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    actionType: value as ActionFormData['actionType'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrective">Correctiva</SelectItem>
                  <SelectItem value="preventive">Preventiva</SelectItem>
                  <SelectItem value="improvement">Mejora</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Select
                value={formData.priority}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    priority: value as ActionFormData['priority'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plannedStartDate">Fecha Inicio</Label>
              <Input
                id="plannedStartDate"
                type="date"
                value={formData.plannedStartDate || ''}
                onChange={e =>
                  setFormData({ ...formData, plannedStartDate: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="plannedEndDate">Fecha Fin</Label>
              <Input
                id="plannedEndDate"
                type="date"
                value={formData.plannedEndDate || ''}
                onChange={e =>
                  setFormData({ ...formData, plannedEndDate: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="responsiblePersonName">Responsable</Label>
            <Input
              id="responsiblePersonName"
              value={formData.responsiblePersonName || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  responsiblePersonName: e.target.value,
                  responsiblePersonId: 'temp-id',
                })
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
