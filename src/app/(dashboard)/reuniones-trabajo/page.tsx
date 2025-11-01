'use client';

import { ReunionTrabajo } from '@/types/reuniones-trabajo';
import { Calendar, Filter, Plus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ReunionesTrabajoPage() {
  const [reuniones, setReuniones] = useState<ReunionTrabajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadReuniones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadReuniones = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ organization_id: 'default-org' });
      if (filter !== 'all') params.append('estado', filter);

      const response = await fetch(`/api/reuniones-trabajo?${params}`);
      const data = await response.json();
      setReuniones(data);
    } catch (error) {
      console.error('Error loading reuniones:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const colors = {
      planificada: 'bg-blue-100 text-blue-800',
      realizada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800',
      aplazada: 'bg-yellow-100 text-yellow-800',
    };
    return colors[estado as keyof typeof colors] || colors.planificada;
  };

  const getTipoBadge = (tipo: string) => {
    const labels = {
      management_review: 'Revisión Gerencial',
      proceso: 'Proceso',
      departamental: 'Departamental',
      general: 'General',
      auditoria: 'Auditoría',
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Reuniones de Trabajo</h1>
          <p className="text-gray-600 mt-1">Gestión de reuniones y actas</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={20} />
          Nueva Reunión
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
            <option value="planificada">Planificadas</option>
            <option value="realizada">Realizadas</option>
            <option value="cancelada">Canceladas</option>
            <option value="aplazada">Aplazadas</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reuniones...</p>
        </div>
      ) : reuniones.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No hay reuniones
          </h3>
          <p className="text-gray-500">
            Comienza planificando tu primera reunión
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reuniones.map(reunion => (
            <div
              key={reunion.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {getTipoBadge(reunion.tipo)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadge(reunion.estado)}`}
                    >
                      {reunion.estado.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {reunion.titulo}
                  </h3>
                  <div className="flex gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{new Date(reunion.fecha).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{reunion.participantes.length} participantes</span>
                    </div>
                    {reunion.duracion_minutos && (
                      <span>{reunion.duracion_minutos} min</span>
                    )}
                  </div>
                  {reunion.lugar && (
                    <p className="text-sm text-gray-500">
                      📍 {reunion.lugar} ({reunion.modalidad})
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Ver Detalles
                </button>
                <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                  Editar
                </button>
                {reunion.acta_url && (
                  <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                    Ver Acta
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
