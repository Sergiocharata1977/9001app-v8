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
import type { AuditFormData } from '@/types/audits';
import { useState } from 'react';

interface AuditFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AuditFormData) => Promise<void>;
  initialData?: Partial<AuditFormData>;
}

export function AuditFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
}: AuditFormDialogProps) {
  const [formData, setFormData] = useState<Partial<AuditFormData>>(
    initialData || {}
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData as AuditFormData);
      onClose();
    } catch (error) {
      console.error('Error submitting audit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Auditoría' : 'Nueva Auditoría'}
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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="auditType">Tipo de Auditoría</Label>
              <Select
                value={formData.auditType}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    auditType: value as AuditFormData['auditType'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Interna</SelectItem>
                  <SelectItem value="external">Externa</SelectItem>
                  <SelectItem value="supplier">Proveedor</SelectItem>
                  <SelectItem value="customer">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="auditScope">Alcance</Label>
              <Select
                value={formData.auditScope}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    auditScope: value as AuditFormData['auditScope'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar alcance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Completa</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="follow_up">Seguimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plannedDate">Fecha Planificada</Label>
              <Input
                id="plannedDate"
                type="date"
                value={formData.plannedDate || ''}
                onChange={e =>
                  setFormData({ ...formData, plannedDate: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="duration">Duración (horas)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="leadAuditorName">Auditor Líder</Label>
            <Input
              id="leadAuditorName"
              value={formData.leadAuditorName || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  leadAuditorName: e.target.value,
                  leadAuditorId: 'temp-id',
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
