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
import type { RootCauseAnalysis } from '@/types/findings';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

interface RootCauseAnalysisFormProps {
  findingId: string;
  initialData?: RootCauseAnalysis;
  onSubmit: (data: RootCauseAnalysis) => Promise<void>;
  onCancel?: () => void;
}

export function RootCauseAnalysisForm({
  findingId,
  initialData,
  onSubmit,
  onCancel,
}: RootCauseAnalysisFormProps) {
  const [formData, setFormData] = useState<RootCauseAnalysis>(
    initialData || {
      method: '',
      rootCause: '',
      contributingFactors: [],
      analysis: '',
    }
  );
  const [newFactor, setNewFactor] = useState('');
  const [loading, setLoading] = useState(false);

  const addFactor = () => {
    if (newFactor.trim()) {
      setFormData({
        ...formData,
        contributingFactors: [
          ...(formData.contributingFactors || []),
          newFactor.trim(),
        ],
      });
      setNewFactor('');
    }
  };

  const removeFactor = (index: number) => {
    setFormData({
      ...formData,
      contributingFactors: formData.contributingFactors?.filter(
        (_, i) => i !== index
      ),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting root cause analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de Causa Raíz</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="method">Método de Análisis</Label>
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
                <SelectItem value="5-whys">5 Por Qué</SelectItem>
                <SelectItem value="ishikawa">Diagrama de Ishikawa</SelectItem>
                <SelectItem value="fault-tree">Árbol de Fallas</SelectItem>
                <SelectItem value="pareto">Análisis de Pareto</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="rootCause">Causa Raíz Identificada</Label>
            <Textarea
              id="rootCause"
              value={formData.rootCause}
              onChange={e =>
                setFormData({ ...formData, rootCause: e.target.value })
              }
              placeholder="Describa la causa raíz del problema..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label>Factores Contribuyentes</Label>
            <div className="space-y-2">
              {formData.contributingFactors?.map((factor, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 border rounded"
                >
                  <span className="flex-1 text-sm">{factor}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFactor(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Agregar factor contribuyente..."
                value={newFactor}
                onChange={e => setNewFactor(e.target.value)}
                onKeyPress={e =>
                  e.key === 'Enter' && (e.preventDefault(), addFactor())
                }
              />
              <Button type="button" onClick={addFactor}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="analysis">Análisis Detallado</Label>
            <Textarea
              id="analysis"
              value={formData.analysis}
              onChange={e =>
                setFormData({ ...formData, analysis: e.target.value })
              }
              placeholder="Describa el análisis completo realizado..."
              rows={5}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Análisis'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
