'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useState } from 'react';

interface CorrectionData {
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  commitmentDate?: string;
  closureDate?: string;
}

interface ImmediateCorrectionFormProps {
  findingId: string;
  currentCorrection?: CorrectionData;
  onSubmit: (correction: CorrectionData) => Promise<void>;
}

export function ImmediateCorrectionForm({
  currentCorrection,
  onSubmit,
}: ImmediateCorrectionFormProps) {
  const [correction, setCorrection] = useState<CorrectionData>(
    currentCorrection || { description: '', status: 'pending' }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(correction);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Corrección Inmediata</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Descripción</Label>
            <Textarea
              value={correction.description}
              onChange={e =>
                setCorrection({ ...correction, description: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label>Estado</Label>
            <Select
              value={correction.status}
              onValueChange={value =>
                setCorrection({
                  ...correction,
                  status: value as CorrectionData['status'],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha Compromiso</Label>
              <Input
                type="date"
                value={correction.commitmentDate || ''}
                onChange={e =>
                  setCorrection({
                    ...correction,
                    commitmentDate: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Fecha Cierre</Label>
              <Input
                type="date"
                value={correction.closureDate || ''}
                onChange={e =>
                  setCorrection({ ...correction, closureDate: e.target.value })
                }
              />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
