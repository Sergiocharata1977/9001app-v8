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
import type { AuditFormData } from '@/types/audits';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface AuditFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AuditFormData) => Promise<void>;
  initialData?: Partial<AuditFormData>;
  mode?: 'create' | 'edit';
}

export function AuditFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: AuditFormDialogProps) {
  const [formData, setFormData] = useState<Partial<AuditFormData>>(
    initialData || {
      title: '',
      auditType: 'complete',
      scope: '',
      plannedDate: new Date(),
      leadAuditor: '',
      selectedNormPoints: [],
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData as AuditFormData);
      onClose();
      // Reset form
      setFormData({
        title: '',
        auditType: 'complete',
        scope: '',
        plannedDate: new Date(),
        leadAuditor: '',
        selectedNormPoints: [],
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al guardar la auditoría'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        aria-describedby="audit-form-description"
      >
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nueva Auditoría' : 'Editar Auditoría'}
          </DialogTitle>
        </DialogHeader>
        <p id="audit-form-description" className="sr-only">
          Formulario para {mode === 'create' ? 'crear' : 'editar'} una auditoría
          interna ISO 9001
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <SectionHeader 
              title="Información Básica" 
              description="Detalles generales de la auditoría"
            />

            <div>
              <Label htmlFor="title">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={e =>
                  setFormData({ ...formData, title: e.target.value })
                }
                maxLength={200}
                placeholder="Ej: Auditoría Interna 2025"
                required
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="auditType">
                  Tipo de Auditoría <span className="text-red-500">*</span>
                </Label>
                <select
                  id="auditType"
                  value={formData.auditType}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      auditType: e.target.value as 'complete' | 'partial',
                    })
                  }
                  className="w-full h-10 mt-1.5 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="complete">Auditoría Completa</option>
                  <option value="partial">Auditoría Parcial</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {formData.auditType === 'complete'
                    ? 'Se verificarán todos los puntos de la norma ISO 9001:2015'
                    : 'Seleccione los puntos específicos a auditar'}
                </p>
              </div>

              <div>
                <Label htmlFor="leadAuditor">
                  Auditor Líder <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="leadAuditor"
                  value={formData.leadAuditor || ''}
                  onChange={e =>
                    setFormData({ ...formData, leadAuditor: e.target.value })
                  }
                  placeholder="Ej: Juan Pérez"
                  required
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="scope">
                Alcance <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="scope"
                value={formData.scope || ''}
                onChange={e =>
                  setFormData({ ...formData, scope: e.target.value })
                }
                rows={3}
                maxLength={500}
                placeholder="Describe el alcance de la auditoría..."
                required
                className="mt-1.5 resize-none"
              />
            </div>

            <div>
              <Label htmlFor="plannedDate">
                Fecha Planificada <span className="text-red-500">*</span>
              </Label>
              <Input
                id="plannedDate"
                type="date"
                value={
                  formData.plannedDate
                    ? new Date(formData.plannedDate)
                        .toISOString()
                        .split('T')[0]
                    : ''
                }
                onChange={e =>
                  setFormData({
                    ...formData,
                    plannedDate: new Date(e.target.value),
                  })
                }
                required
                className="mt-1.5 w-full md:w-1/2"
              />
            </div>
          </div>

          {/* TODO: Agregar selector de puntos de norma si es parcial */}
          {formData.auditType === 'partial' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> El selector de puntos de norma estará
                disponible próximamente. Por ahora, cree la auditoría como
                completa.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : mode === 'create' ? (
                'Crear Auditoría'
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
