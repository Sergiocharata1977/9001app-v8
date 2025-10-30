'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import type { EffectivenessVerification } from '@/types/actions';
import { useState } from 'react';

interface EffectivenessVerificationFormProps {
  actionId: string;
  onSubmit: (data: EffectivenessVerification) => Promise<void>;
  onCancel?: () => void;
}

export function EffectivenessVerificationForm({
  actionId,
  onSubmit,
  onCancel,
}: EffectivenessVerificationFormProps) {
  const [formData, setFormData] = useState<EffectivenessVerification>({
    responsiblePersonId: '',
    responsiblePersonName: '',
    verificationExecutionDate: new Date().toISOString().split('T')[0],
    method: '',
    criteria: '',
    isEffective: false,
    result: '',
    evidence: '',
    comments: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting verification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificación de Efectividad (Fase 3: Control)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="responsiblePersonName">
              Responsable de Verificación
            </Label>
            <Input
              id="responsiblePersonName"
              value={formData.responsiblePersonName}
              onChange={e =>
                setFormData({
                  ...formData,
                  responsiblePersonName: e.target.value,
                  responsiblePersonId: 'temp-id',
                })
              }
              placeholder="Nombre del responsable"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="verificationCommitmentDate">
                Fecha Compromiso
              </Label>
              <Input
                id="verificationCommitmentDate"
                type="date"
                value={formData.verificationCommitmentDate || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    verificationCommitmentDate: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="verificationExecutionDate">Fecha Ejecución</Label>
              <Input
                id="verificationExecutionDate"
                type="date"
                value={formData.verificationExecutionDate || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    verificationExecutionDate: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="method">Método de Verificación</Label>
            <Select
              value={formData.method}
              onValueChange={value =>
                setFormData({ ...formData, method: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inspection">Inspección</SelectItem>
                <SelectItem value="audit">Auditoría</SelectItem>
                <SelectItem value="measurement">Medición</SelectItem>
                <SelectItem value="testing">Pruebas</SelectItem>
                <SelectItem value="observation">Observación</SelectItem>
                <SelectItem value="review">Revisión Documental</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="criteria">Criterio de Efectividad</Label>
            <Textarea
              id="criteria"
              value={formData.criteria}
              onChange={e =>
                setFormData({ ...formData, criteria: e.target.value })
              }
              placeholder="¿Qué criterios se usaron para determinar si la acción fue efectiva?"
              rows={2}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isEffective"
              checked={formData.isEffective}
              onCheckedChange={checked =>
                setFormData({ ...formData, isEffective: checked as boolean })
              }
            />
            <Label htmlFor="isEffective" className="font-medium">
              La acción fue efectiva
            </Label>
          </div>

          <div>
            <Label htmlFor="result">Resultado de la Verificación</Label>
            <Textarea
              id="result"
              value={formData.result}
              onChange={e =>
                setFormData({ ...formData, result: e.target.value })
              }
              placeholder="Describa los resultados obtenidos de la verificación..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="evidence">Evidencia</Label>
            <Textarea
              id="evidence"
              value={formData.evidence}
              onChange={e =>
                setFormData({ ...formData, evidence: e.target.value })
              }
              placeholder="Describa la evidencia que respalda la verificación..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="comments">Comentarios Adicionales</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={e =>
                setFormData({ ...formData, comments: e.target.value })
              }
              placeholder="Comentarios opcionales..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Verificación'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
