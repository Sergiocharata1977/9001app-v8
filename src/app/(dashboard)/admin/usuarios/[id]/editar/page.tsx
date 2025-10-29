'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function EditarAsignacionesPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const userId = params.id as string;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Cargar datos del usuario
    console.log('Cargar usuario:', userId);
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implementar actualización de asignaciones
      console.log('Actualizar asignaciones para usuario:', userId);

      toast({
        title: 'Éxito',
        description: 'Asignaciones actualizadas correctamente',
      });

      router.push(`/admin/usuarios/${userId}`);
    } catch (err) {
      console.error('Error updating assignments:', err);
      toast({
        title: 'Error',
        description: 'No se pudieron actualizar las asignaciones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg shadow-emerald-500/10 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="sm"
            className="shadow-sm hover:shadow-emerald-500/20 hover:border-emerald-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Editar Asignaciones
            </h1>
            <p className="text-sm text-gray-600">
              Asigna procesos, objetivos e indicadores al usuario
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Procesos */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 shadow-lg shadow-blue-500/20">
            <h2 className="text-lg font-bold text-blue-900 mb-4">
              Procesos Asignados
            </h2>
            <p className="text-blue-700">
              TODO: Multi-select de procesos disponibles
            </p>
          </div>

          {/* Objetivos */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 shadow-lg shadow-green-500/20">
            <h2 className="text-lg font-bold text-green-900 mb-4">
              Objetivos de Calidad
            </h2>
            <p className="text-green-700">
              TODO: Multi-select de objetivos disponibles
            </p>
          </div>

          {/* Indicadores */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 shadow-lg shadow-purple-500/20">
            <h2 className="text-lg font-bold text-purple-900 mb-4">
              Indicadores
            </h2>
            <p className="text-purple-700">
              TODO: Multi-select de indicadores disponibles
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 shadow-sm"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
