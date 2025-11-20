'use client';

import { OrganizationalContext } from '@/types/organizational-context';
import { Globe, Loader2, Plus, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ContextoOrganizacionalPage() {
  const [context, setContext] = useState<OrganizationalContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContext();
  }, []);

  const loadContext = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/organizational-context');
      
      if (response.status === 404) {
        // Inicializar estructura vacía
        setContext({
          id: '',
          cuestiones_externas: [],
          cuestiones_internas: [],
          fecha_analisis: new Date().toISOString().split('T')[0],
          responsable_analisis: '',
          frecuencia_revision: 'semestral',
          estado: 'vigente',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'current-user',
        });
      } else if (response.ok) {
        const data = await response.json();
        setContext(data);
      }
    } catch (err) {
      setError('Error al cargar el contexto organizacional');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!context) return;

    try {
      setSaving(true);
      setError(null);

      const isNew = !context.id;
      const response = await fetch('/api/organizational-context', {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...context,
          created_by: 'current-user-id',
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar contexto');
      }

      alert('Contexto organizacional guardado exitosamente');
      await loadContext();
    } catch (err) {
      setError('Error al guardar el contexto organizacional');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addCuestionExterna = () => {
    if (!context) return;
    setContext({
      ...context,
      cuestiones_externas: [
        ...context.cuestiones_externas,
        {
          tipo: 'economico',
          descripcion: '',
          impacto: 'neutral',
          nivel_impacto: 'medio',
          ambito: 'nacional',
        },
      ],
    });
  };

  const removeCuestionExterna = (index: number) => {
    if (!context) return;
    setContext({
      ...context,
      cuestiones_externas: context.cuestiones_externas.filter((_, i) => i !== index),
    });
  };

  const addCuestionInterna = () => {
    if (!context) return;
    setContext({
      ...context,
      cuestiones_internas: [
        ...context.cuestiones_internas,
        {
          tipo: 'valores',
          descripcion: '',
          estado_actual: '',
          fortaleza_debilidad: 'fortaleza',
        },
      ],
    });
  };

  const removeCuestionInterna = (index: number) => {
    if (!context) return;
    setContext({
      ...context,
      cuestiones_internas: context.cuestiones_internas.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Globe className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Contexto Organizacional
          </h1>
        </div>
        <p className="text-gray-600">
          Cuestiones externas e internas que afectan al SGC (Cláusula 4.1 ISO 9001)
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Información General */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Análisis *
            </label>
            <input
              type="date"
              value={context?.fecha_analisis.split('T')[0] || ''}
              onChange={(e) =>
                setContext(prev => prev ? { ...prev, fecha_analisis: e.target.value } : null)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frecuencia de Revisión *
            </label>
            <select
              value={context?.frecuencia_revision || 'semestral'}
              onChange={(e) =>
                setContext(prev => prev ? { ...prev, frecuencia_revision: e.target.value as any } : null)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="trimestral">Trimestral</option>
              <option value="semestral">Semestral</option>
              <option value="anual">Anual</option>
            </select>
          </div>
        </div>

        {/* Cuestiones Externas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Cuestiones Externas
            </h2>
            <button
              onClick={addCuestionExterna}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          </div>

          <div className="space-y-3">
            {context?.cuestiones_externas.map((ce, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <select
                    value={ce.tipo}
                    onChange={(e) => {
                      const updated = [...context.cuestiones_externas];
                      updated[index].tipo = e.target.value as any;
                      setContext({ ...context, cuestiones_externas: updated });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="economico">Económico</option>
                    <option value="tecnologico">Tecnológico</option>
                    <option value="competitivo">Competitivo</option>
                    <option value="mercado">Mercado</option>
                    <option value="cultural">Cultural</option>
                    <option value="social">Social</option>
                    <option value="legal">Legal</option>
                    <option value="ambiental">Ambiental</option>
                  </select>

                  <select
                    value={ce.ambito}
                    onChange={(e) => {
                      const updated = [...context.cuestiones_externas];
                      updated[index].ambito = e.target.value as any;
                      setContext({ ...context, cuestiones_externas: updated });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="internacional">Internacional</option>
                    <option value="nacional">Nacional</option>
                    <option value="regional">Regional</option>
                    <option value="local">Local</option>
                  </select>
                </div>

                <textarea
                  value={ce.descripcion}
                  onChange={(e) => {
                    const updated = [...context.cuestiones_externas];
                    updated[index].descripcion = e.target.value;
                    setContext({ ...context, cuestiones_externas: updated });
                  }}
                  placeholder="Describe la cuestión externa..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
                />

                <div className="flex gap-3 items-center">
                  <select
                    value={ce.impacto}
                    onChange={(e) => {
                      const updated = [...context.cuestiones_externas];
                      updated[index].impacto = e.target.value as any;
                      setContext({ ...context, cuestiones_externas: updated });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="positivo">Impacto Positivo</option>
                    <option value="negativo">Impacto Negativo</option>
                    <option value="neutral">Impacto Neutral</option>
                  </select>

                  <select
                    value={ce.nivel_impacto}
                    onChange={(e) => {
                      const updated = [...context.cuestiones_externas];
                      updated[index].nivel_impacto = e.target.value as any;
                      setContext({ ...context, cuestiones_externas: updated });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="bajo">Nivel Bajo</option>
                    <option value="medio">Nivel Medio</option>
                    <option value="alto">Nivel Alto</option>
                  </select>

                  <button
                    onClick={() => removeCuestionExterna(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cuestiones Internas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Cuestiones Internas
            </h2>
            <button
              onClick={addCuestionInterna}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          </div>

          <div className="space-y-3">
            {context?.cuestiones_internas.map((ci, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <select
                    value={ci.tipo}
                    onChange={(e) => {
                      const updated = [...context.cuestiones_internas];
                      updated[index].tipo = e.target.value as any;
                      setContext({ ...context, cuestiones_internas: updated });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="valores">Valores</option>
                    <option value="cultura">Cultura</option>
                    <option value="conocimientos">Conocimientos</option>
                    <option value="desempeño">Desempeño</option>
                    <option value="recursos">Recursos</option>
                    <option value="capacidades">Capacidades</option>
                    <option value="estructura">Estructura</option>
                  </select>

                  <select
                    value={ci.fortaleza_debilidad}
                    onChange={(e) => {
                      const updated = [...context.cuestiones_internas];
                      updated[index].fortaleza_debilidad = e.target.value as any;
                      setContext({ ...context, cuestiones_internas: updated });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="fortaleza">Fortaleza</option>
                    <option value="debilidad">Debilidad</option>
                  </select>
                </div>

                <textarea
                  value={ci.descripcion}
                  onChange={(e) => {
                    const updated = [...context.cuestiones_internas];
                    updated[index].descripcion = e.target.value;
                    setContext({ ...context, cuestiones_internas: updated });
                  }}
                  placeholder="Describe la cuestión interna..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
                />

                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={ci.estado_actual}
                    onChange={(e) => {
                      const updated = [...context.cuestiones_internas];
                      updated[index].estado_actual = e.target.value;
                      setContext({ ...context, cuestiones_internas: updated });
                    }}
                    placeholder="Estado actual"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />

                  <button
                    onClick={() => removeCuestionInterna(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving || !context}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Contexto
              </>
            )}
          </button>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Este análisis de contexto puede vincularse con tu Análisis FODA
          para una visión integral de la organización.
        </p>
      </div>
    </div>
  );
}
