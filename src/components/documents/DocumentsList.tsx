'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Document, DocumentStatus } from '@/types/documents';
import { Plus, Search, Download, Edit, Trash2, List, Grid } from 'lucide-react';
import { DocumentFormDialog } from './DocumentFormDialog';

export function DocumentsList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const response = await fetch(`/api/documents?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;

    try {
      console.log('[Component] Eliminando documento:', id);
      
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      console.log('[Component] Respuesta:', response.status, response.statusText);

      if (response.ok) {
        console.log('[Component] Documento eliminado, actualizando lista...');
        await fetchDocuments();
        console.log('[Component] Lista actualizada');
      } else {
        const errorData = await response.json();
        console.error('[Component] Error del servidor:', errorData);
        alert(`Error al eliminar: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('[Component] Error eliminando documento:', error);
      alert('Error al eliminar el documento');
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}/file?userId=current-user`);
      if (response.ok) {
        const data = await response.json();
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: DocumentStatus) => {
    const variants: Record<DocumentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      borrador: 'secondary',
      en_revision: 'outline',
      aprobado: 'default',
      publicado: 'default',
      obsoleto: 'destructive',
    };

    return (
      <Badge variant={variants[status]}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-0 shadow-sm shadow-green-100 focus:shadow-md focus:shadow-green-200"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="borrador">Borrador</SelectItem>
            <SelectItem value="en_revision">En Revisión</SelectItem>
            <SelectItem value="aprobado">Aprobado</SelectItem>
            <SelectItem value="publicado">Publicado</SelectItem>
            <SelectItem value="obsoleto">Obsoleto</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="procedimiento">Procedimiento</SelectItem>
            <SelectItem value="instruccion">Instrucción</SelectItem>
            <SelectItem value="formato">Formato</SelectItem>
            <SelectItem value="registro">Registro</SelectItem>
            <SelectItem value="politica">Política</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={() => {
          setEditingDocument(null);
          setIsFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Documento
        </Button>
      </div>

      {/* Vista Lista o Tarjetas */}
      {loading ? (
        <div className="text-center py-8">Cargando documentos...</div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocuments.length === 0 ? (
            <div className="col-span-full text-center py-8">
              No se encontraron documentos
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-lg shadow-md shadow-green-100 hover:shadow-lg hover:shadow-green-200 cursor-pointer transition-all duration-200 p-4"
                onClick={() => {
                  window.location.href = `/documentos/${doc.id}`;
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{doc.title}</h3>
                    <p className="text-xs text-gray-500">{doc.code}</p>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    {getStatusBadge(doc.status)}
                  </div>
                </div>
                
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span className="capitalize">{doc.type}</span>
                    <span>v{doc.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{doc.download_count} descargas</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                  {doc.file_path && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(doc.id)}
                      title="Descargar"
                      className="flex-1"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingDocument(doc);
                      setIsFormOpen(true);
                    }}
                    title="Editar"
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    title="Eliminar"
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-lg shadow-md shadow-green-100">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Versión</TableHead>
                <TableHead>Descargas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No se encontraron documentos
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc) => (
                  <TableRow 
                    key={doc.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      window.location.href = `/documentos/${doc.id}`;
                    }}
                  >
                    <TableCell className="font-medium">{doc.code}</TableCell>
                    <TableCell>{doc.title}</TableCell>
                    <TableCell className="capitalize">{doc.type}</TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell>{doc.version}</TableCell>
                    <TableCell>{doc.download_count}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        {doc.file_path && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(doc.id)}
                            title="Descargar archivo"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingDocument(doc);
                            setIsFormOpen(true);
                          }}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog de formulario */}
      <DocumentFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        document={editingDocument}
        onSuccess={() => {
          setIsFormOpen(false);
          setEditingDocument(null);
          fetchDocuments();
        }}
      />
    </div>
  );
}
