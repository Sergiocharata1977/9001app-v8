'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { VerificationData } from '@/types/findings';
import { useState } from 'react';

interface FindingVerificationFormProps {
  findingId: string;
  onSubmit: (data: VerificationData) => Promise<void>;
  onCancel?: () => void;
}

export function FindingVerificationForm({
  findingId,
  onSubmit,
  onCancel,
}: FindingVerificationFormProps) {
  const [formData, setFormData] = useState<VerificationData>({
    verifiedBy: '',
    verificationDate: new Date().toISOString().split('T')[0],
    verificationEvidence: '',
    verificationComments: '',
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
        <CardTitle>Verificación de Hallazgo (Fase 3: Control)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="verifiedBy">Verificado Por</Label>
            <Input
              id="verifiedBy"
              value={formData.verifiedBy}
              onChange={e =>
                setFormData({ ...formData, verifiedBy: e.target.value })
              }
              placeholder="Nombre del verificador"
              required
            />
          </div>

          <div>
            <Label htmlFor="verificationDate">Fecha de Verificación</Label>
            <Input
              id="verificationDate"
              type="date"
              value={formData.verificationDate}
              onChange={e =>
                setFormData({ ...formData, verificationDate: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="verificationEvidence">
              Evidencia de Verificación
            </Label>
            <Textarea
              id="verificationEvidence"
              value={formData.verificationEvidence}
              onChange={e =>
                setFormData({
                  ...formData,
                  verificationEvidence: e.target.value,
                })
              }
              placeholder="Describa la evidencia que demuestra que el hallazgo ha sido resuelto..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="verificationComments">
              Comentarios Adicionales
            </Label>
            <Textarea
              id="verificationComments"
              value={formData.verificationComments}
              onChange={e =>
                setFormData({
                  ...formData,
                  verificationComments: e.target.value,
                })
              }
              placeholder="Comentarios opcionales sobre la verificación..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar y Cerrar Hallazgo'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
