'use client';

import { Loader2, Plus, Save, Scale, X } from 'lucide-react';
import { useState } from 'react';

interface LegalRequirement {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  tipo: 'ley' | 'decreto' | 'resolucion' | 'norma_tecnica' | 'permiso' | 'licencia' | 'certificacion';
  estado_cumplimiento: 'cumple' | 'cumple_parcial' | 'no_cumple' | 'no_aplica';
  responsable_cumplimiento: string;
  fecha_vigencia: string;
}

export default function RequisitosLegalesPage() {
  const [requirements, setRequirements] = useState<LegalRequirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const addRequirement = () => {
    const newReq: LegalRequirement = {
      id: `req-${Date.now()}`,
      codigo: '',
      titulo: '',
      descripcion: '',
      tipo: 'ley',
      estado_cumplimiento: 'cumple',
      responsable_cumplimiento: '',
      fecha_vigencia: new Date().toISOString().split('T')[0],
    };
    setRequirements([...requirements, newReq]);
  };

  const removeRequirement = (id: string) => {
    setRequirements(requirements.filter(r => r.id !== id));
  };

  const updateRequirement = (id: string, field: keyof LegalRequirement, value: any) => {
    setRequirements(requirements.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    // TODO: Implementar guardado en API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert('Requisitos legales guardados exitosamente');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Scale className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Requisitos Legales y Reglamentarios
          </h1>
        </div>
        <p className="text-gray-600">
          Gestiona la normativa aplicable y el cumplimiento legal de tu organización
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Requisitos Identificados
          </h2>
          <button
            onClick={addRequirement}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Agregar Requisito
          </button>
        </div>

        {requirements.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <Scale className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay requisitos legales registrados
            </h3>
            <p className="text-gray-600 mb-4">
              Comienza agregando los requisitos legales y reglamentarios aplicables a tu organización
            </p>
            <button
              onClick={addRequirement}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Agregar Primer Requisito
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requirements.map((req) => (
              <div key={req.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código
                    </label>
                    <input
                      type="text"
                      value={req.codigo}
                      onChange={(e) => updateRequirement(req.id, 'codigo', e.target.value)}
                      placeholder="Ej: LEY-123/2024"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      value={req.tipo}
                      onChange={(e) => updateRequirement(req.id, 'tipo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="ley">Ley</option>
                      <option value="decreto">Decreto</option>
                      <option value="resolucion">Resolución</option>
                      <option value="norma_tecnica">Norma Técnica</option>
                      <option value="permiso">Permiso</option>
                      <option value="licencia">Licencia</option>
                      <option value="certificacion">Certificación</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={req.titulo}
                    onChange={(e) => updateRequirement(req.id, 'titulo', e.target.value)}
                    placeholder="Título del requisito legal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={req.descripcion}
                    onChange={(e) => updateRequirement(req.id, 'descripcion', e.target.value)}
                    rows={2}
                    placeholder="Describe el requisito y su aplicabilidad..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado de Cumplimiento
                    </label>
                    <select
                      value={req.estado_cumplimiento}
                      onChange={(e) => updateRequirement(req.id, 'estado_cumplimiento', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="cumple">Cumple</option>
                      <option value="cumple_parcial">Cumple Parcialmente</option>
                      <option value="no_cumple">No Cumple</option>
                      <option value="no_aplica">No Aplica</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Vigencia
                    </label>
                    <input
                      type="date"
                      value={req.fecha_vigencia}
                      onChange={(e) => updateRequirement(req.id, 'fecha_vigencia', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Responsable
                    </label>
                    <input
                      type="text"
                      value={req.responsable_cumplimiento}
                      onChange={(e) => updateRequirement(req.id, 'responsable_cumplimiento', e.target.value)}
                      placeholder="Nombre del responsable"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => removeRequirement(req.id)}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <X className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {requirements.length > 0 && (
          <div className="flex justify-end mt-6 pt-4 border-t">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Requisitos
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Nota informativa */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Los requisitos legales deben revisarse periódicamente para
          asegurar el cumplimiento continuo. Establece recordatorios para verificaciones regulares.
        </p>
      </div>
    </div>
  );
}
