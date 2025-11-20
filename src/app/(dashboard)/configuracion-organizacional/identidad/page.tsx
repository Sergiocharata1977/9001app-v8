'use client';

import { OrganizationalConfig } from '@/types/organizational-config';
import { Building, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function IdentidadOrganizacionalPage() {
  const [config, setConfig] = useState<OrganizationalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/organizational-config');
      
      if (response.status === 404) {
        // No existe configuración, inicializar vacía
        setConfig(null);
      } else if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else {
        throw new Error('Error al cargar configuración');
      }
    } catch (err) {
      setError('Error al cargar la configuración organizacional');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/organizational-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          created_by: 'current-user-id', // TODO: Obtener del contexto de auth
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar configuración');
      }

      alert('Configuración guardada exitosamente');
      await loadConfig();
    } catch (err) {
      setError('Error al guardar la configuración');
      console.error(err);
    } finally {
      setSaving(false);
    }
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
          <Building className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Identidad Organizacional
          </h1>
        </div>
        <p className="text-gray-600">
          Define la identidad, misión, visión y valores de tu organización
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Información Básica */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Información Básica
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Organización *
              </label>
              <input
                type="text"
                value={config?.nombre_organizacion || ''}
                onChange={(e) =>
                  setConfig(prev => prev ? { ...prev, nombre_organizacion: e.target.value } : null)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Ej: Acme Corporation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sector/Industria *
              </label>
              <input
                type="text"
                value={config?.sector_industria || ''}
                onChange={(e) =>
                  setConfig(prev => prev ? { ...prev, sector_industria: e.target.value } : null)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Ej: Manufactura, Servicios, Tecnología"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción de la Empresa *
              </label>
              <textarea
                value={config?.descripcion_empresa || ''}
                onChange={(e) =>
                  setConfig(prev => prev ? { ...prev, descripcion_empresa: e.target.value } : null)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Describe brevemente tu organización..."
              />
            </div>
          </div>
        </div>

        {/* Métricas de Empleados */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Métricas de Empleados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad Total de Empleados *
              </label>
              <input
                type="number"
                value={config?.cantidad_empleados_total || 0}
                onChange={(e) =>
                  setConfig(prev => prev ? { ...prev, cantidad_empleados_total: parseInt(e.target.value) } : null)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empleados con Acceso al Sistema *
              </label>
              <input
                type="number"
                value={config?.cantidad_empleados_con_acceso || 0}
                onChange={(e) =>
                  setConfig(prev => prev ? { ...prev, cantidad_empleados_con_acceso: parseInt(e.target.value) } : null)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Misión */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Misión</h2>
          <textarea
            value={config?.mision || ''}
            onChange={(e) =>
              setConfig(prev => prev ? { ...prev, mision: e.target.value } : null)
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="¿Cuál es el propósito fundamental de tu organización?"
          />
        </div>

        {/* Visión */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Visión</h2>
          <textarea
            value={config?.vision || ''}
            onChange={(e) =>
              setConfig(prev => prev ? { ...prev, vision: e.target.value } : null)
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="¿Hacia dónde se dirige tu organización en el futuro?"
          />
        </div>

        {/* Política de Calidad */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Política de Calidad
          </h2>
          <textarea
            value={config?.politica_calidad?.declaracion || ''}
            onChange={(e) =>
              setConfig(prev => prev ? {
                ...prev,
                politica_calidad: {
                  ...prev.politica_calidad,
                  declaracion: e.target.value,
                  compromisos: prev.politica_calidad?.compromisos || [],
                }
              } : null)
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Declaración de la política de calidad de tu organización..."
          />
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving || !config}
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
                Guardar Configuración
              </>
            )}
          </button>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Esta información será utilizada por la IA para proporcionar
          asesoramiento contextualizado sobre ISO 9001 específico para tu organización.
        </p>
      </div>
    </div>
  );
}
