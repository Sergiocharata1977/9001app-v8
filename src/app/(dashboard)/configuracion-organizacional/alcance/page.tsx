'use client';

import { SGCScope } from '@/types/sgc-scope';
import { Loader2, Plus, Save, Target, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AlcanceSGCPage() {
  const [scope, setScope] = useState<SGCScope | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadScope();
  }, []);

  const loadScope = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sgc-scope');
      
      if (response.status === 404) {
        // Inicializar estructura vacía
        setScope({
          id: '',
          descripcion_alcance: '',
          limites_sgc: '',
          productos_servicios_cubiertos: [],
          procesos_incluidos: [],
          procesos_excluidos: [],
          ubicaciones_cubiertas: [],
          requisitos_no_aplicables: [],
          version: 1,
          estado: 'borrador',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'current-user',
        });
      } else if (response.ok) {
        const data = await response.json();
        setScope(data);
      }
    } catch (err) {
      setError('Error al cargar el alcance del SGC');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!scope) return;

    try {
      setSaving(true);
      setError(null);

      const isNew = !scope.id;
      const response = await fetch('/api/sgc-scope', {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...scope,
          created_by: 'current-user-id',
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar alcance del SGC');
      }

      alert('Alcance del SGC guardado exitosamente');
      await loadScope();
    } catch (err) {
      setError('Error al guardar el alcance del SGC');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addProductoServicio = () => {
    if (!scope) return;
    setScope({
      ...scope,
      productos_servicios_cubiertos: [
        ...scope.productos_servicios_cubiertos,
        { nombre: '', descripcion: '', tipo: 'producto' },
      ],
    });
  };

  const removeProductoServicio = (index: number) => {
    if (!scope) return;
    setScope({
      ...scope,
      productos_servicios_cubiertos: scope.productos_servicios_cubiertos.filter((_, i) => i !== index),
    });
  };

  const addUbicacion = () => {
    if (!scope) return;
    setScope({
      ...scope,
      ubicaciones_cubiertas: [
        ...scope.ubicaciones_cubiertas,
        { nombre: '', tipo: 'sede_principal' },
      ],
    });
  };

  const removeUbicacion = (index: number) => {
    if (!scope) return;
    setScope({
      ...scope,
      ubicaciones_cubiertas: scope.ubicaciones_cubiertas.filter((_, i) => i !== index),
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
          <Target className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Alcance del SGC
          </h1>
        </div>
        <p className="text-gray-600">
          Define el alcance del Sistema de Gestión de Calidad (Cláusula 4.3 ISO 9001)
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Descripción del Alcance */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Descripción del Alcance
          </h2>
          <textarea
            value={scope?.descripcion_alcance || ''}
            onChange={(e) =>
              setScope(prev => prev ? { ...prev, descripcion_alcance: e.target.value } : null)
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Describe el alcance general del SGC..."
          />
        </div>

        {/* Límites del SGC */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Límites del SGC
          </h2>
          <textarea
            value={scope?.limites_sgc || ''}
            onChange={(e) =>
              setScope(prev => prev ? { ...prev, limites_sgc: e.target.value } : null)
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Define los límites del sistema de gestión..."
          />
        </div>

        {/* Productos y Servicios Cubiertos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Productos y Servicios Cubiertos
            </h2>
            <button
              onClick={addProductoServicio}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          </div>

          <div className="space-y-3">
            {scope?.productos_servicios_cubiertos.map((ps, index) => (
              <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-md">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={ps.nombre}
                    onChange={(e) => {
                      const updated = [...scope.productos_servicios_cubiertos];
                      updated[index].nombre = e.target.value;
                      setScope({ ...scope, productos_servicios_cubiertos: updated });
                    }}
                    placeholder="Nombre"
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <select
                    value={ps.tipo}
                    onChange={(e) => {
                      const updated = [...scope.productos_servicios_cubiertos];
                      updated[index].tipo = e.target.value as 'producto' | 'servicio';
                      setScope({ ...scope, productos_servicios_cubiertos: updated });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="producto">Producto</option>
                    <option value="servicio">Servicio</option>
                  </select>
                  <input
                    type="text"
                    value={ps.descripcion}
                    onChange={(e) => {
                      const updated = [...scope.productos_servicios_cubiertos];
                      updated[index].descripcion = e.target.value;
                      setScope({ ...scope, productos_servicios_cubiertos: updated });
                    }}
                    placeholder="Descripción"
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <button
                  onClick={() => removeProductoServicio(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Ubicaciones Cubiertas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Ubicaciones Cubiertas
            </h2>
            <button
              onClick={addUbicacion}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          </div>

          <div className="space-y-3">
            {scope?.ubicaciones_cubiertas.map((ub, index) => (
              <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-md">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={ub.nombre}
                    onChange={(e) => {
                      const updated = [...scope.ubicaciones_cubiertas];
                      updated[index].nombre = e.target.value;
                      setScope({ ...scope, ubicaciones_cubiertas: updated });
                    }}
                    placeholder="Nombre de la ubicación"
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <select
                    value={ub.tipo}
                    onChange={(e) => {
                      const updated = [...scope.ubicaciones_cubiertas];
                      updated[index].tipo = e.target.value as any;
                      setScope({ ...scope, ubicaciones_cubiertas: updated });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="sede_principal">Sede Principal</option>
                    <option value="sucursal">Sucursal</option>
                    <option value="planta">Planta</option>
                    <option value="almacen">Almacén</option>
                    <option value="oficina">Oficina</option>
                  </select>
                  <input
                    type="text"
                    value={ub.direccion || ''}
                    onChange={(e) => {
                      const updated = [...scope.ubicaciones_cubiertas];
                      updated[index].direccion = e.target.value;
                      setScope({ ...scope, ubicaciones_cubiertas: updated });
                    }}
                    placeholder="Dirección (opcional)"
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <button
                  onClick={() => removeUbicacion(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving || !scope}
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
                Guardar Alcance
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
