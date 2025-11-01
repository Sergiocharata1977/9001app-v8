'use client';

import { AnalisisFODA } from '@/types/analisis-foda';
import { Filter, Plus, Target } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AnalisisFODAPage() {
  const [analisis, setAnalisis] = useState<AnalisisFODA[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadAnalisis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadAnalisis = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ organization_id: 'default-org' });
      if (filter !== 'all') params.append('estado', filter);

      const response = await fetch(`/api/analisis-foda?${params}`);
      const data = await response.json();
      setAnalisis(data);
    } catch (error) {
      console.error('Error loading analisis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const colors = {
      en_proceso: 'bg-yellow-100 text-yellow-800',
      completado: 'bg-green-100 text-green-800',
      archivado: 'bg-gray-100 text-gray-800',
    };
    return colors[estado as keyof typeof colors] || colors.en_proceso;
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      organizacional: 'Organizacional',
      proceso: 'Proceso',
      departamento: 'Departamento',
      proyecto: 'Proyecto',
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Análisis FODA</h1>
          <p className="text-gray-600 mt-1">
            Fortalezas, Oportunidades, Debilidades y Amenazas
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={20} />
          Nuevo Análisis
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
            <option value="all">Todos</option>
            <option value="en_proceso">En Proceso</option>
            <option value="completado">Completados</option>
            <option value="archivado">Archivados</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando análisis...</p>
        </div>
      ) : analisis.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Target size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No hay análisis FODA
          </h3>
          <p className="text-gray-500">
            Comienza creando tu primer análisis estratégico
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {analisis.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-gray-500">
                      {item.codigo}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {getTipoLabel(item.tipo_analisis)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadge(item.estado)}`}
                    >
                      {item.estado.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.titulo}
                  </h3>
                  {item.descripcion && (
                    <p className="text-gray-600 mb-3">{item.descripcion}</p>
                  )}
                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">
                        {item.fortalezas.length}
                      </div>
                      <div className="text-xs text-green-600">Fortalezas</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">
                        {item.oportunidades.length}
                      </div>
                      <div className="text-xs text-blue-600">Oportunidades</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-700">
                        {item.debilidades.length}
                      </div>
                      <div className="text-xs text-yellow-600">Debilidades</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-700">
                        {item.amenazas.length}
                      </div>
                      <div className="text-xs text-red-600">Amenazas</div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>
                      Fecha:{' '}
                      {new Date(item.fecha_analisis).toLocaleDateString()}
                    </span>
                    {item.responsable_nombre && (
                      <span>Responsable: {item.responsable_nombre}</span>
                    )}
                    {item.participantes.length > 0 && (
                      <span>{item.participantes.length} participantes</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Ver Matriz
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
