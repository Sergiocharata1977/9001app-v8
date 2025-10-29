'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserContextService } from '@/services/context/UserContextService';
import { UserContext } from '@/types/context';
import { InformacionPersonalCard } from '@/components/context/InformacionPersonalCard';
import { ProcesosAsignadosCard } from '@/components/context/ProcesosAsignadosCard';
import { ObjetivosCalidadCard } from '@/components/context/ObjetivosCalidadCard';
import { IndicadoresCard } from '@/components/context/IndicadoresCard';
import { UserPersonnelSelector } from '@/components/users/UserPersonnelSelector';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';

export default function DetalleUsuarioPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [contexto, setContexto] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadUserContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadUserContext = async () => {
    try {
      setLoading(true);
      const userContext = await UserContextService.getUserFullContext(userId);
      setContexto(userContext);
    } catch (err) {
      console.error('Error loading user context:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información del usuario...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 rounded-lg p-6 shadow-lg shadow-red-500/20">
          <h2 className="text-lg font-semibold text-red-900 mb-2">
            Error al cargar contexto
          </h2>
          <p className="text-red-700">{error.message}</p>
          <Button
            onClick={() => router.back()}
            className="mt-4 shadow-sm"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  if (!contexto) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 rounded-lg p-6 shadow-lg shadow-yellow-500/20">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">
            Contexto no disponible
          </h2>
          <p className="text-yellow-700">
            No se pudo cargar la información de contexto del usuario.
          </p>
          <Button
            onClick={() => router.back()}
            className="mt-4 shadow-sm"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const userName = contexto.personnel
    ? `${contexto.personnel.nombres} ${contexto.personnel.apellidos}`
    : contexto.user.email;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header con botones de acción */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
              className="shadow-sm hover:shadow-emerald-500/20 hover:border-emerald-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Contexto de {userName}
            </h1>
          </div>
          <p className="text-gray-600">
            Vista completa del contexto y responsabilidades del usuario
          </p>
        </div>

        <Button
          onClick={() => router.push(`/admin/usuarios/${userId}/editar`)}
          className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar Asignaciones
        </Button>
      </div>

      {/* Selector de Personal */}
      <UserPersonnelSelector
        userId={userId}
        currentPersonnelId={contexto.user.personnel_id}
        onUpdate={loadUserContext}
      />

      {/* Cards de contexto - Reutilizando componentes */}
      <InformacionPersonalCard contexto={contexto} />
      <ProcesosAsignadosCard
        procesos={contexto.procesos}
        processRecords={contexto.processRecords}
      />
      <ObjetivosCalidadCard objetivos={contexto.objetivos} />
      <IndicadoresCard indicadores={contexto.indicadores} />

      {/* Sección adicional: Actividad reciente (placeholder) */}
      <div className="bg-white rounded-lg shadow-lg shadow-emerald-500/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📊</span>
          <h2 className="text-xl font-bold text-gray-900">
            Actividad Reciente
          </h2>
        </div>
        <p className="text-gray-600">
          Próximamente: Historial de sesiones con Don Cándido, consultas
          realizadas, etc.
        </p>
      </div>
    </div>
  );
}
