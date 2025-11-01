'use client';

import { Politica } from '@/types/politicas';
import { FileText, Filter, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PoliticasPage() {
  const [politicas, setPoliticas] = useState<Politica[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadPoliticas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadPoliticas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ organization_id: 'default-org' });
      if (filter !== 'all') params.append('estado', filter);

      const response = await fetch(`/api/politicas?${params}`);
      const data = await response.json();
      setPoliticas(data);
    } catch (error) {
      console.error('Error loading politicas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const colors = {
      vigente: 'bg-green-100 text-green-800',
      borrador: 'bg-gray-100 text-gray-800',
      en_revision: 'bg-yellow-100 text-yellow-800',
      obsoleta: 'bg-red-100 text-red-800',
    };
    return colors[estado as keyof typeof colors] || colors.borrador;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Políticas de Calidad</h1>
          <p className="text-gray-600 mt-1">
            Gestión de políticas del sistema de calidad
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={20} />
          Nueva Política
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-500" />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">Todas</option>
            <option value="vigente">Vigentes</option>
            <option value="borrador">Borradores</option>
            <option value="en_revision">En Revisión</option>
            <option value="obsoleta">Obsoletas</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando políticas...</p>
        </div>
      ) : politicas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No hay políticas
          </h3>
          <p className="text-gray-500">
            Comienza creando tu primera política de calidad
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {politicas.map(politica => (
            <div
              key={politica.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-gray-500">
                      {politica.codigo}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadge(politica.estado)}`}
                    >
                      {politica.estado.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {politica.titulo}
                  </h3>
                  <p className="text-gray-600 mb-3">{politica.descripcion}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Versión {politica.version}</span>
                    {politica.fecha_aprobacion && (
                      <span>
                        Aprobada:{' '}
                        {new Date(
                          politica.fecha_aprobacion
                        ).toLocaleDateString()}
                      </span>
                    )}
                    {politica.aprobador_nombre && (
                      <span>Por: {politica.aprobador_nombre}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Ver Detalles
                </button>
                <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
