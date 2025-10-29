'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Document, DocumentStatus } from '@/types/documents';
import {
  ArrowLeft,
  Download,
  Edit,
  Trash2,
  FileText,
  Calendar,
  User,
  Tag,
  Clock,
  Archive,
} from 'lucide-react';

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchDocument(params.id as string);
    }
  }, [params.id]);

  const fetchDocument = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDocument(data);
      } else {
        console.error('Error fetching document');
        router.push('/documentos');
      }
    } catch (error) {
      console.error('Error:', error);
      router.push('/documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;
    try {
      const response = await fetch(
        `/api/documents/${document.id}/file?userId=current-user`
      );
      if (response.ok) {
        const data = await response.json();
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDelete = async () => {
    if (!document) return;
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;

    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/documentos');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    const config: Record<
      DocumentStatus,
      {
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        label: string;
      }
    > = {
      borrador: { variant: 'secondary', label: '✏️ Borrador' },
      en_revision: { variant: 'outline', label: '👀 En Revisión' },
      aprobado: { variant: 'default', label: '✅ Aprobado' },
      publicado: { variant: 'default', label: '🌐 Publicado' },
      obsoleto: { variant: 'destructive', label: '🗑️ Obsoleto' },
    };

    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      manual: '📘 Manual',
      procedimiento: '📋 Procedimiento',
      instruccion: '📝 Instrucción',
      formato: '📄 Formato',
      registro: '📊 Registro',
      politica: '⚖️ Política',
      otro: '📁 Otro',
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Documento no encontrado</p>
          <Button onClick={() => router.push('/documentos')} className="mt-4">
            Volver a Documentos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/documentos')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Documentos
        </Button>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {document.title}
                  </h1>
                  <p className="text-sm text-gray-500">{document.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                {getStatusBadge(document.status)}
                <Badge variant="outline">{getTypeLabel(document.type)}</Badge>
                <Badge variant="outline">v{document.version}</Badge>
              </div>
            </div>

            <div className="flex gap-2">
              {document.file_path && (
                <Button onClick={handleDownload} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar
                </Button>
              )}
              <Button
                onClick={() => router.push(`/documentos/${document.id}/edit`)}
                variant="outline"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button onClick={handleDelete} variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </div>

          {document.description && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{document.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Información Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Información General */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5 text-blue-600" />
            Información General
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Código
              </label>
              <p className="text-gray-900">{document.code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Tipo</label>
              <p className="text-gray-900">{getTypeLabel(document.type)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Estado
              </label>
              <div className="mt-1">{getStatusBadge(document.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Versión
              </label>
              <p className="text-gray-900">{document.version}</p>
            </div>
            {document.category && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Categoría
                </label>
                <p className="text-gray-900">{document.category}</p>
              </div>
            )}
          </div>
        </div>

        {/* Fechas */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Fechas
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Fecha de Creación
              </label>
              <p className="text-gray-900">
                {new Date(document.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            {document.effective_date && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Fecha Efectiva
                </label>
                <p className="text-gray-900">
                  {new Date(document.effective_date).toLocaleDateString(
                    'es-ES',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }
                  )}
                </p>
              </div>
            )}
            {document.review_date && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Fecha de Revisión
                </label>
                <p className="text-gray-900">
                  {new Date(document.review_date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
            {document.approved_at && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Fecha de Aprobación
                </label>
                <p className="text-gray-900">
                  {new Date(document.approved_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Archivo y Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Archivo */}
        {document.file_path && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Archive className="h-5 w-5 text-blue-600" />
              Archivo Adjunto
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Tipo de Archivo
                </label>
                <p className="text-gray-900">{document.mime_type || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Tamaño
                </label>
                <p className="text-gray-900">
                  {document.file_size
                    ? `${(document.file_size / 1024 / 1024).toFixed(2)} MB`
                    : 'N/A'}
                </p>
              </div>
              <Button onClick={handleDownload} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Descargar Archivo
              </Button>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Estadísticas
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Descargas
              </label>
              <p className="text-2xl font-bold text-blue-600">
                {document.download_count}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Última Actualización
              </label>
              <p className="text-gray-900">
                {new Date(document.updated_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Keywords */}
      {document.keywords && document.keywords.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Palabras Clave</h2>
          <div className="flex flex-wrap gap-2">
            {document.keywords.map((keyword, index) => (
              <Badge key={index} variant="outline">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
