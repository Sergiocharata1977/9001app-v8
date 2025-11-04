'use client';

import { ProcessDefinitionFormDialog } from '@/components/processRecords/ProcessDefinitionFormDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProcessDefinition } from '@/types/processRecords';
import {
  ArrowLeft,
  CheckCircle2,
  Edit,
  ExternalLink,
  FileText,
  ListOrdered,
  Maximize2,
  Target,
  Users,
  XCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function ProcessDefinitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const definitionId = params.id as string;

  const [definition, setDefinition] = useState<
    | (ProcessDefinition & {
        documento?: {
          id: string;
          title?: string;
          nombre?: string;
          code?: string;
          codigo?: string;
        };
        puesto?: {
          id: string;
          title: string;
          department?: string;
        };
      })
    | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const loadDefinition = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/process-definitions/${definitionId}`);
      if (response.ok) {
        const data = await response.json();
        setDefinition(data);
      }
    } catch (error) {
      console.error('Error loading definition:', error);
    } finally {
      setLoading(false);
    }
  }, [definitionId]);

  useEffect(() => {
    loadDefinition();
  }, [loadDefinition]);

  const handleEditSuccess = () => {
    loadDefinition();
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!definition) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Definición no encontrada
          </h3>
          <p className="text-gray-500 mb-4">
            La definición de proceso que buscas no existe
          </p>
          <Button onClick={() => router.push('/dashboard/procesos')}>
            Volver a Procesos
          </Button>
        </div>
      </div>
    );
  }

  const getCategoryColor = (categoria: string) => {
    const colors: Record<string, string> = {
      calidad: 'bg-blue-100 text-blue-800',
      auditoria: 'bg-purple-100 text-purple-800',
      mejora: 'bg-green-100 text-green-800',
      rrhh: 'bg-yellow-100 text-yellow-800',
      produccion: 'bg-orange-100 text-orange-800',
      ventas: 'bg-pink-100 text-pink-800',
      logistica: 'bg-indigo-100 text-indigo-800',
      compras: 'bg-teal-100 text-teal-800',
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {definition.nombre}
              </h1>
              <Badge className={getCategoryColor(definition.categoria)}>
                {definition.categoria}
              </Badge>
              {definition.activo ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Activo
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-800">
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactivo
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mt-1">Código: {definition.codigo}</p>
          </div>
        </div>
        <Button
          onClick={() => setEditDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Layout 70/30 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 70% - Contenido Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-600">
                    Código
                  </div>
                  <div className="text-gray-900 mt-1">{definition.codigo}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">
                    Nombre
                  </div>
                  <div className="text-gray-900 mt-1">{definition.nombre}</div>
                </div>
                {definition.puesto && (
                  <div>
                    <div className="text-sm font-medium text-gray-600">
                      Puesto Responsable
                    </div>
                    <div className="text-gray-900 mt-1">
                      {definition.puesto.title}
                      {definition.puesto.department && (
                        <span className="text-gray-500 text-sm ml-2">
                          ({definition.puesto.department})
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-gray-600">
                    Descripción
                  </div>
                  <div className="text-gray-900 mt-1">
                    {definition.descripcion}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Objetivo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Objetivo del Proceso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900 whitespace-pre-wrap">
                {definition.objetivo}
              </div>
            </CardContent>
          </Card>

          {/* Alcance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Maximize2 className="h-5 w-5" />
                Alcance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900 whitespace-pre-wrap">
                {definition.alcance}
              </div>
            </CardContent>
          </Card>

          {/* Funciones Involucradas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Funciones Involucradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {definition.funciones_involucradas &&
                definition.funciones_involucradas.length > 0 ? (
                  definition.funciones_involucradas.map((func, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-sm py-1 px-3"
                    >
                      {func}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    No hay funciones asignadas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Etapas por Defecto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListOrdered className="h-5 w-5" />
                Etapas por Defecto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                {definition.etapas_default &&
                definition.etapas_default.length > 0 ? (
                  <ol className="list-decimal list-inside space-y-2">
                    {definition.etapas_default.map((etapa, index) => (
                      <li key={index} className="text-gray-900">
                        {etapa}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No hay etapas definidas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 30% - Relaciones */}
        <div className="space-y-6">
          {/* Puesto Responsable - ARRIBA DE TODO */}
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" />
                Puesto Responsable
              </CardTitle>
            </CardHeader>
            <CardContent>
              {definition.puesto ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {definition.puesto.title}
                    </div>
                    {definition.puesto.department && (
                      <div className="text-xs text-gray-500 mt-1">
                        📍 {definition.puesto.department}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      router.push(
                        `/dashboard/rrhh/positions/${definition.puesto_responsable_id}`
                      )
                    }
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Ver Detalles del Puesto
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Sin Asignar</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documento de Origen */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Documento de Origen
              </CardTitle>
            </CardHeader>
            <CardContent>
              {definition.documento ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {definition.documento.title ||
                        definition.documento.nombre}
                    </div>
                    {(definition.documento.code ||
                      definition.documento.codigo) && (
                      <div className="text-xs text-gray-500 mt-1">
                        📄{' '}
                        {definition.documento.code ||
                          definition.documento.codigo}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      router.push(
                        `/documentos/${definition.documento_origen_id}`
                      )
                    }
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Ver Documento
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Sin Asignar</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Registros Activos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Registros Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-emerald-600">0</p>
                <p className="text-sm text-gray-500 mt-1">
                  registros en proceso
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600">Creado</div>
                  <div className="text-gray-900">
                    {definition.created_at instanceof Date
                      ? definition.created_at.toLocaleDateString('es-ES')
                      : new Date(
                          definition.created_at.seconds * 1000
                        ).toLocaleDateString('es-ES')}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Última actualización</div>
                  <div className="text-gray-900">
                    {definition.updated_at instanceof Date
                      ? definition.updated_at.toLocaleDateString('es-ES')
                      : new Date(
                          definition.updated_at.seconds * 1000
                        ).toLocaleDateString('es-ES')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <ProcessDefinitionFormDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={handleEditSuccess}
        editData={definition}
      />
    </div>
  );
}
