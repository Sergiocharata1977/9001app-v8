'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserContextService } from '@/services/context/UserContextService';
import { UserContext } from '@/types/context';
import { InformacionPersonalCard } from '@/components/context/InformacionPersonalCard';
import { ProcesosAsignadosCard } from '@/components/context/ProcesosAsignadosCard';
import { ObjetivosCalidadCard } from '@/components/context/ObjetivosCalidadCard';
import { IndicadoresCard } from '@/components/context/IndicadoresCard';
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error al cargar contexto</h2>
          <p className="text-red-700">{error.message}</p>
          <Button 
            onClick={() => router.back()} 
            className="mt-4"
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">
            Contexto no disponible
          </h2>
          <p className="text-yellow-700">
            No se pudo cargar la información de contexto del usuario.
          </p>
          <Button 
            onClick={() => router.back()} 
            className="mt-4"
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
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar Asignaciones
        </Button>
      </div>

      {/* Cards de contexto - Reutilizando componentes */}
      <InformacionPersonalCard contexto={contexto} />
      <ProcesosAsignadosCard
        procesos={contexto.procesos}
        processRecords={contexto.processRecords}
      />
      <ObjetivosCalidadCard objetivos={contexto.objetivos} />
      <IndicadoresCard indicadores={contexto.indicadores} />

      {/* Sección adicional: Actividad reciente (placeholder) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📊</span>
          <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
        </div>
        <p className="text-gray-600">
          Próximamente: Historial de sesiones con Don Cándido, consultas realizadas, etc.
        </p>
      </div>
    </div>
  );
}
