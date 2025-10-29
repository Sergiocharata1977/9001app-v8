'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NormPoint } from '@/types/normPoints';
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Link as LinkIcon,
} from 'lucide-react';

export default function NormPointDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [normPoint, setNormPoint] = useState<NormPoint | null>(null);
  const [relatedDocuments, setRelatedDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchNormPoint(params.id as string);
      fetchRelatedDocuments(params.id as string);
    }
  }, [params.id]);

  const fetchNormPoint = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/norm-points/${id}`);
      if (response.ok) {
        const data = await response.json();
        setNormPoint(data);
      } else {
        console.error('Error fetching norm point');
        router.push('/puntos-norma');
      }
    } catch (error) {
      console.error('Error:', error);
      router.push('/puntos-norma');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedDocuments = async (normPointId: string) => {
    try {
      const response = await fetch(`/api/documents?norm_point_id=${normPointId}`);
      if (response.ok) {
        const data = await response.json();
        setRelatedDocuments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching related documents:', error);
    }
  };

  const handleDelete = async () => {
    if (!normPoint) return;
    if (!confirm('¿Estás seguro de eliminar este punto de norma?')) return;

    try {
      const response = await fetch(`/api/norm-points/${normPoint.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/puntos-norma');
      }
    } catch (error) {
      console.error('Error deleting norm point:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando punto de norma...</p>
        </div>
      </div>
    );
  }

  if (!normPoint) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Punto de norma no encontrado</p>
          <Button onClick={() => router.push('/puntos-norma')} className="mt-4">
            Volver a Puntos de Norma
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
          onClick={() => router.push('/puntos-norma')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Puntos de Norma
        </Button>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {normPoint.code}
                  </h1>
                  <p className="text-lg text-gray-700 mt-1">{normPoint.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                {normPoint.is_mandatory ? (
                  <Badge variant="destructive">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Obligatorio
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Opcional
                  </Badge>
                )}
                <Badge variant="outline">Capítulo {normPoint.chapter}</Badge>
                {normPoint.category && (
                  <Badge variant="outline">{normPoint.category}</Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => router.push(`/puntos-norma/${normPoint.id}/edit`)}
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
        </div>
      </div>

      {/* Descripción */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-600" />
          Descripción
        </h2>
        <p className="text-gray-700 whitespace-pre-wrap">{normPoint.description}</p>
      </div>

      {/* Requisito */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Requisito</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{normPoint.requirement}</p>
      </div>

      {/* Documentos Relacionados */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-green-600" />
          Documentos Relacionados
          <Badge variant="outline">{relatedDocuments.length}</Badge>
        </h2>
        {relatedDocuments.length > 0 ? (
          <div className="space-y-2">
            {relatedDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/documentos/${doc.id}`)}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{doc.title}</p>
                    <p className="text-sm text-gray-500">{doc.code}</p>
                  </div>
                </div>
                <Badge variant="outline">{doc.type}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No hay documentos relacionados con este punto de norma
          </p>
        )}
      </div>

      {/* Información Adicional */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <label className="font-medium text-gray-500">Capítulo</label>
            <p className="text-gray-900">{normPoint.chapter}</p>
          </div>
          <div>
            <label className="font-medium text-gray-500">Código</label>
            <p className="text-gray-900">{normPoint.code}</p>
          </div>
          <div>
            <label className="font-medium text-gray-500">Tipo</label>
            <p className="text-gray-900">
              {normPoint.is_mandatory ? 'Obligatorio' : 'Opcional'}
            </p>
          </div>
          {normPoint.category && (
            <div>
              <label className="font-medium text-gray-500">Categoría</label>
              <p className="text-gray-900">{normPoint.category}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
