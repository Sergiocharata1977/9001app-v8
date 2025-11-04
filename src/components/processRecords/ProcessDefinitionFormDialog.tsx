'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { processDefinitionSchema } from '@/lib/validations/processRecords';
import {
  ProcessDefinition,
  ProcessDefinitionFormData,
} from '@/types/processRecords';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProcessDefinitionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: ProcessDefinition | null;
}

export function ProcessDefinitionFormDialog({
  open,
  onClose,
  onSuccess,
  editData,
}: ProcessDefinitionFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<
    Array<{
      id: string;
      title?: string;
      nombre?: string;
      code?: string;
      codigo?: string;
    }>
  >([]);
  const [positions, setPositions] = useState<
    Array<{ id: string; title: string; department?: string }>
  >([]);
  const [formData, setFormData] = useState<ProcessDefinitionFormData>({
    codigo: '',
    nombre: '',
    descripcion: '',
    objetivo: '',
    alcance: '',
    funciones_involucradas: [],
    categoria: 'calidad',
    documento_origen_id: '',
    puesto_responsable_id: '',
    etapas_default: ['Planificación', 'Ejecución', 'Verificación', 'Cierre'],
    activo: true,
  });
  const [stageInput, setStageInput] = useState('');
  const [functionInput, setFunctionInput] = useState('');

  const isEditing = !!editData;

  // Load documents and positions for selectors
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load documents
        const docsResponse = await fetch('/api/documents');
        if (docsResponse.ok) {
          const docs = await docsResponse.json();
          setDocuments(docs);
        }

        // Load positions
        const positionsResponse = await fetch('/api/positions');
        if (positionsResponse.ok) {
          const pos = await positionsResponse.json();
          setPositions(pos);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    if (open) {
      loadData();
    }
  }, [open]);

  // Load edit data
  useEffect(() => {
    if (editData && open) {
      setFormData({
        codigo: editData.codigo || '',
        nombre: editData.nombre || '',
        descripcion: editData.descripcion || '',
        objetivo: editData.objetivo || '',
        alcance: editData.alcance || '',
        funciones_involucradas: editData.funciones_involucradas || [],
        categoria: editData.categoria || 'calidad',
        documento_origen_id: editData.documento_origen_id || '',
        puesto_responsable_id: editData.puesto_responsable_id || '',
        etapas_default: editData.etapas_default || [
          'Planificación',
          'Ejecución',
          'Verificación',
          'Cierre',
        ],
        activo: editData.activo ?? true,
      });
    } else if (!editData && open) {
      // Reset form for new creation
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        objetivo: '',
        alcance: '',
        funciones_involucradas: [],
        categoria: 'calidad',
        documento_origen_id: '',
        puesto_responsable_id: '',
        etapas_default: [
          'Planificación',
          'Ejecución',
          'Verificación',
          'Cierre',
        ],
        activo: true,
      });
    }
  }, [editData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      const validatedData = processDefinitionSchema.parse(formData);

      const url = isEditing
        ? `/api/process-definitions/${editData!.id}`
        : '/api/process-definitions';

      const method = isEditing ? 'PATCH' : 'POST';

      const body = isEditing
        ? validatedData
        : { ...validatedData, action: 'create' };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(
          `Error al ${isEditing ? 'actualizar' : 'crear'} definición`
        );
      }

      // Reset form
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        objetivo: '',
        alcance: '',
        funciones_involucradas: [],
        categoria: 'calidad',
        documento_origen_id: '',
        puesto_responsable_id: '',
        etapas_default: [
          'Planificación',
          'Ejecución',
          'Verificación',
          'Cierre',
        ],
        activo: true,
      });
      setStageInput('');
      setFunctionInput('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(
        `Error ${isEditing ? 'updating' : 'creating'} process definition:`,
        error
      );
      alert(
        `Error al ${isEditing ? 'actualizar' : 'crear'} la definición de proceso`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStage = () => {
    if (
      stageInput.trim() &&
      !formData.etapas_default.includes(stageInput.trim())
    ) {
      setFormData({
        ...formData,
        etapas_default: [...formData.etapas_default, stageInput.trim()],
      });
      setStageInput('');
    }
  };

  const handleRemoveStage = (stage: string) => {
    setFormData({
      ...formData,
      etapas_default: formData.etapas_default.filter(s => s !== stage),
    });
  };

  const handleAddFunction = () => {
    if (
      functionInput.trim() &&
      !formData.funciones_involucradas.includes(functionInput.trim())
    ) {
      setFormData({
        ...formData,
        funciones_involucradas: [
          ...formData.funciones_involucradas,
          functionInput.trim(),
        ],
      });
      setFunctionInput('');
    }
  };

  const handleRemoveFunction = (func: string) => {
    setFormData({
      ...formData,
      funciones_involucradas: formData.funciones_involucradas.filter(
        f => f !== func
      ),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {isEditing
                ? 'Editar Definición de Proceso'
                : 'Nueva Definición de Proceso'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Código */}
          <div>
            <Label htmlFor="codigo">Código *</Label>
            <Input
              id="codigo"
              value={formData.codigo}
              onChange={e =>
                setFormData({ ...formData, codigo: e.target.value })
              }
              placeholder="Ej. PROC-001"
              required
            />
          </div>

          {/* Nombre */}
          <div>
            <Label htmlFor="nombre">Nombre del Proceso *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={e =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Ej. Gestión de Calidad"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="descripcion">Descripción *</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={e =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              placeholder="Describe el proceso..."
              rows={3}
              required
            />
          </div>

          {/* Puesto Responsable */}
          <div>
            <Label htmlFor="puesto_responsable">
              Puesto Responsable (Opcional)
            </Label>
            <p className="text-sm text-gray-500 mb-2">
              El puesto responsable del proceso (incluye departamento y
              personal)
            </p>
            <select
              id="puesto_responsable"
              value={formData.puesto_responsable_id}
              onChange={e =>
                setFormData({
                  ...formData,
                  puesto_responsable_id: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Sin puesto asignado</option>
              {positions.map(pos => (
                <option key={pos.id} value={pos.id}>
                  {pos.title}
                  {pos.department && ` - ${pos.department}`}
                </option>
              ))}
            </select>
          </div>

          {/* Objetivo */}
          <div>
            <Label htmlFor="objetivo">Objetivo *</Label>
            <Textarea
              id="objetivo"
              value={formData.objetivo}
              onChange={e =>
                setFormData({ ...formData, objetivo: e.target.value })
              }
              placeholder="Objetivo del proceso..."
              rows={3}
              required
            />
          </div>

          {/* Alcance */}
          <div>
            <Label htmlFor="alcance">Alcance *</Label>
            <Textarea
              id="alcance"
              value={formData.alcance}
              onChange={e =>
                setFormData({ ...formData, alcance: e.target.value })
              }
              placeholder="Alcance del proceso..."
              rows={3}
              required
            />
          </div>

          {/* Funciones Involucradas */}
          <div>
            <Label htmlFor="funciones">Funciones Involucradas *</Label>
            <p className="text-sm text-gray-500 mb-2">
              Funciones o áreas involucradas en el proceso
            </p>
            <div className="flex gap-2 mb-2">
              <Input
                id="funciones"
                value={functionInput}
                onChange={e => setFunctionInput(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFunction();
                  }
                }}
                placeholder="Agregar función"
              />
              <Button
                type="button"
                onClick={handleAddFunction}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.funciones_involucradas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.funciones_involucradas.map((func, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {func}
                    <button
                      type="button"
                      onClick={() => handleRemoveFunction(func)}
                      className="hover:text-red-600 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Categoría */}
          <div>
            <Label htmlFor="categoria">Categoría *</Label>
            <select
              id="categoria"
              value={formData.categoria}
              onChange={e =>
                setFormData({ ...formData, categoria: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="calidad">Calidad</option>
              <option value="auditoria">Auditoría</option>
              <option value="mejora">Mejora</option>
              <option value="rrhh">RRHH</option>
              <option value="produccion">Producción</option>
              <option value="ventas">Ventas</option>
              <option value="logistica">Logística</option>
              <option value="compras">Compras</option>
            </select>
          </div>

          {/* Documento Origen */}
          <div>
            <Label htmlFor="documento_origen">
              Documento de Origen (Opcional)
            </Label>
            <select
              id="documento_origen"
              value={formData.documento_origen_id}
              onChange={e =>
                setFormData({
                  ...formData,
                  documento_origen_id: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Sin documento</option>
              {documents.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.title || doc.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Etapas por defecto */}
          <div>
            <Label htmlFor="etapas">Etapas por Defecto</Label>
            <p className="text-sm text-gray-500 mb-2">
              Estas etapas se crearán automáticamente en cada nuevo registro
            </p>
            <div className="flex gap-2 mb-2">
              <Input
                id="etapas"
                value={stageInput}
                onChange={e => setStageInput(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddStage();
                  }
                }}
                placeholder="Agregar etapa"
              />
              <Button type="button" onClick={handleAddStage} variant="outline">
                Agregar
              </Button>
            </div>
            {formData.etapas_default.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.etapas_default.map((stage, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-sm"
                  >
                    {stage}
                    <button
                      type="button"
                      onClick={() => handleRemoveStage(stage)}
                      className="hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Estado */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={e =>
                setFormData({ ...formData, activo: e.target.checked })
              }
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <Label htmlFor="activo" className="cursor-pointer">
              Proceso activo
            </Label>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting
                ? isEditing
                  ? 'Actualizando...'
                  : 'Creando...'
                : isEditing
                  ? 'Actualizar Definición'
                  : 'Crear Definición'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
