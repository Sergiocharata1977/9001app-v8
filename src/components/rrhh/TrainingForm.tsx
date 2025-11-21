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
import { Training } from '@/types/rrhh';
import { useState } from 'react';
import { CompetenceSelector } from './CompetenceSelector';

interface TrainingFormProps {
  training?: Training;
  onSubmit: (data: Partial<Training>) => void;
  onCancel: () => void;
}

export function TrainingForm({
  training,
  onSubmit,
  onCancel,
}: TrainingFormProps) {
  const [formData, setFormData] = useState<Partial<Training>>({
    tema: training?.tema || '',
    descripcion: training?.descripcion || '',
    fecha_inicio: training?.fecha_inicio || new Date(),
    fecha_fin: training?.fecha_fin || new Date(),
    horas: training?.horas || 0,
    modalidad: training?.modalidad || 'presencial',
    proveedor: training?.proveedor || '',
    costo: training?.costo || 0,
    estado: training?.estado || 'planificada',
    participantes: training?.participantes || [],
    competenciasDesarrolladas: training?.competenciasDesarrolladas || [],
    evaluacionPosterior: training?.evaluacionPosterior || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof Training, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tema */}
      <div>
        <Label htmlFor="tema">Tema *</Label>
        <Input
          id="tema"
          value={formData.tema}
          onChange={e => handleChange('tema', e.target.value)}
          required
          placeholder="Ej: Capacitación en ISO 9001"
        />
      </div>

      {/* Descripción */}
      <div>
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={e => handleChange('descripcion', e.target.value)}
          placeholder="Descripción detallada de la capacitación"
          rows={3}
        />
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fecha_inicio">Fecha Inicio *</Label>
          <Input
            id="fecha_inicio"
            type="date"
            value={
              formData.fecha_inicio instanceof Date
                ? formData.fecha_inicio.toISOString().split('T')[0]
                : ''
            }
            onChange={e =>
              handleChange('fecha_inicio', new Date(e.target.value))
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="fecha_fin">Fecha Fin *</Label>
          <Input
            id="fecha_fin"
            type="date"
            value={
              formData.fecha_fin instanceof Date
                ? formData.fecha_fin.toISOString().split('T')[0]
                : ''
            }
            onChange={e => handleChange('fecha_fin', new Date(e.target.value))}
            required
          />
        </div>
      </div>

      {/* Horas y Modalidad */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="horas">Horas</Label>
          <Input
            id="horas"
            type="number"
            value={formData.horas}
            onChange={e => handleChange('horas', parseInt(e.target.value))}
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="modalidad">Modalidad *</Label>
          <Select
            value={formData.modalidad}
            onValueChange={value => handleChange('modalidad', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="presencial">Presencial</SelectItem>
              <SelectItem value="virtual">Virtual</SelectItem>
              <SelectItem value="mixta">Mixta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Proveedor y Costo */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="proveedor">Proveedor</Label>
          <Input
            id="proveedor"
            value={formData.proveedor}
            onChange={e => handleChange('proveedor', e.target.value)}
            placeholder="Nombre del proveedor"
          />
        </div>
        <div>
          <Label htmlFor="costo">Costo</Label>
          <Input
            id="costo"
            type="number"
            value={formData.costo}
            onChange={e => handleChange('costo', parseFloat(e.target.value))}
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Estado */}
      <div>
        <Label htmlFor="estado">Estado *</Label>
        <Select
          value={formData.estado}
          onValueChange={value => handleChange('estado', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planificada">Planificada</SelectItem>
            <SelectItem value="en_curso">En Curso</SelectItem>
            <SelectItem value="completada">Completada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Competencias Desarrolladas */}
      <div>
        <Label>Competencias que Desarrolla</Label>
        <CompetenceSelector
          selectedIds={formData.competenciasDesarrolladas || []}
          onSelectionChange={(competences: string[]) =>
            handleChange('competenciasDesarrolladas', competences)
          }
          organizationId="" // TODO: Obtener del contexto
        />
      </div>

      {/* Evaluación Posterior */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="evaluacionPosterior"
          checked={formData.evaluacionPosterior}
          onCheckedChange={checked =>
            handleChange('evaluacionPosterior', checked)
          }
        />
        <Label htmlFor="evaluacionPosterior" className="cursor-pointer">
          Requiere evaluación posterior a la capacitación
        </Label>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          {training ? 'Actualizar' : 'Crear'} Capacitación
        </Button>
      </div>
    </form>
  );
}
