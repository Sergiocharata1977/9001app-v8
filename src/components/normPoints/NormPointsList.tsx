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
import { NormPoint } from '@/types/normPoints';
import { Plus, Search, Edit, Trash2, List, Grid } from 'lucide-react';
import { NormPointFormDialog } from './NormPointFormDialog';

export function NormPointsList() {
  const [normPoints, setNormPoints] = useState<NormPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [chapterFilter, setChapterFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNormPoint, setEditingNormPoint] = useState<NormPoint | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');

  useEffect(() => {
    fetchNormPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterFilter, priorityFilter]);

  const fetchNormPoints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (chapterFilter !== 'all') params.append('chapter', chapterFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);

      const response = await fetch(`/api/norm-points?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setNormPoints(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching norm points:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este punto de norma?')) return;

    try {
      const response = await fetch(`/api/norm-points/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchNormPoints();
      }
    } catch (error) {
      console.error('Error deleting norm point:', error);
    }
  };

  const filteredNormPoints = normPoints.filter((np) =>
    np.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    np.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityBadge = (priority: 'alta' | 'media' | 'baja') => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      alta: 'destructive',
      media: 'default',
      baja: 'secondary',
    };

    return (
      <Badge variant={variants[priority]}>
        {priority}
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
            placeholder="Buscar puntos de norma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-0 shadow-sm shadow-green-100 focus:shadow-md focus:shadow-green-200"
          />
        </div>

        <Select value={chapterFilter} onValueChange={setChapterFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Capítulo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los capítulos</SelectItem>
            <SelectItem value="4">Capítulo 4</SelectItem>
            <SelectItem value="5">Capítulo 5</SelectItem>
            <SelectItem value="6">Capítulo 6</SelectItem>
            <SelectItem value="7">Capítulo 7</SelectItem>
            <SelectItem value="8">Capítulo 8</SelectItem>
            <SelectItem value="9">Capítulo 9</SelectItem>
            <SelectItem value="10">Capítulo 10</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las prioridades</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="baja">Baja</SelectItem>
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

        <Button
          variant="outline"
          onClick={async () => {
            if (confirm('¿Cargar todos los puntos de ISO 9001:2015? (Solo se crearán los que no existan)')) {
              try {
                const response = await fetch('/api/seed/iso-9001', { method: 'POST' });
                const data = await response.json();
                alert(`${data.message}\nCreados: ${data.created}\nOmitidos: ${data.skipped}`);
                fetchNormPoints();
              } catch {
                alert('Error al cargar puntos ISO 9001');
              }
            }
          }}
        >
          📘 Cargar ISO 9001
        </Button>

        <Button onClick={() => {
          setEditingNormPoint(null);
          setIsFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Punto
        </Button>
      </div>

      {/* Vista Lista o Tarjetas */}
      {loading ? (
        <div className="text-center py-8">Cargando puntos de norma...</div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredNormPoints.length === 0 ? (
            <div className="col-span-full text-center py-8">
              No se encontraron puntos de norma
            </div>
          ) : (
            filteredNormPoints.map((np) => (
              <div
                key={np.id}
                className="bg-white rounded-lg shadow-md shadow-green-100 hover:shadow-lg hover:shadow-green-200 cursor-pointer transition-all duration-200 p-4"
                onClick={() => {
                  window.location.href = `/puntos-norma/${np.id}`;
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-blue-600">{np.code}</span>
                      {np.is_mandatory && (
                        <Badge variant="destructive" className="text-xs">Obligatorio</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm">{np.title}</h3>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="capitalize">{np.tipo_norma.replace('_', ' ')}</span>
                    {np.chapter && (
                      <Badge variant="outline" className="text-xs">Cap. {np.chapter}</Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Prioridad:</span>
                    {getPriorityBadge(np.priority)}
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingNormPoint(np);
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
                    onClick={() => handleDelete(np.id)}
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
                <TableHead>Capítulo</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Obligatorio</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNormPoints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No se encontraron puntos de norma
                  </TableCell>
                </TableRow>
              ) : (
                filteredNormPoints.map((np) => (
                  <TableRow 
                    key={np.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      window.location.href = `/puntos-norma/${np.id}`;
                    }}
                  >
                    <TableCell className="font-medium">{np.code}</TableCell>
                    <TableCell>{np.title}</TableCell>
                    <TableCell className="capitalize">{np.tipo_norma.replace('_', ' ')}</TableCell>
                    <TableCell>{np.chapter || '-'}</TableCell>
                    <TableCell>{getPriorityBadge(np.priority)}</TableCell>
                    <TableCell>
                      {np.is_mandatory ? (
                        <Badge variant="destructive">Sí</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingNormPoint(np);
                            setIsFormOpen(true);
                          }}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(np.id)}
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
      <NormPointFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        normPoint={editingNormPoint}
        onSuccess={() => {
          setIsFormOpen(false);
          setEditingNormPoint(null);
          fetchNormPoints();
        }}
      />
    </div>
  );
}
