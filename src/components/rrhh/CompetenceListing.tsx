'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Competence, CompetenceCategory } from '@/types/rrhh';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  onCreate?: () => void;
  onEdit?: (competence: Competence) => void;
  refreshTrigger?: number;
}

export function CompetenceListing({ onCreate, onEdit, refreshTrigger }: Props) {
  const [competences, setCompetences] = useState<Competence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    CompetenceCategory | 'all'
  >('all');

  useEffect(() => {
    loadCompetences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchTerm, refreshTrigger]);

  const loadCompetences = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedCategory !== 'all') {
        params.append('categoria', selectedCategory);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const url = `/api/rrhh/competencias?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Error al cargar competencias');
      }

      const data = await response.json();

      // Asegurarse de que data es un array
      if (Array.isArray(data)) {
        setCompetences(data);
      } else {
        console.error('La respuesta no es un array:', data);
        setCompetences([]);
      }
    } catch (error) {
      console.error('Error al cargar competencias:', error);
      setCompetences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadCompetences();
  };

  const handleDelete = async (competenceId: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta competencia?')) {
      return;
    }

    try {
      const response = await fetch(`/api/rrhh/competencias/${competenceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadCompetences(); // Recargar lista
      } else {
        const error = await response.json();
        alert(error.error || 'Error al eliminar competencia');
      }
    } catch (error) {
      console.error('Error al eliminar competencia:', error);
      alert('Error al eliminar competencia');
    }
  };

  const getCategoryColor = (categoria: CompetenceCategory) => {
    switch (categoria) {
      case 'tecnica':
        return 'bg-blue-500';
      case 'blanda':
        return 'bg-green-500';
      case 'seguridad':
        return 'bg-red-500';
      case 'iso_9001':
        return 'bg-purple-500';
      case 'otra':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryLabel = (categoria: CompetenceCategory) => {
    switch (categoria) {
      case 'tecnica':
        return 'Técnica';
      case 'blanda':
        return 'Blanda';
      case 'seguridad':
        return 'Seguridad';
      case 'iso_9001':
        return 'ISO 9001';
      case 'otra':
        return 'Otra';
      default:
        return categoria;
    }
  };

  if (loading) {
    return <div>Cargando competencias...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Competencias</CardTitle>
        <div className="flex gap-4 items-center">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Buscar competencias..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <Select
            value={selectedCategory}
            onValueChange={(value: CompetenceCategory | 'all') =>
              setSelectedCategory(value)
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="tecnica">Técnica</SelectItem>
              <SelectItem value="blanda">Blanda</SelectItem>
              <SelectItem value="seguridad">Seguridad</SelectItem>
              <SelectItem value="iso_9001">ISO 9001</SelectItem>
              <SelectItem value="otra">Otra</SelectItem>
            </SelectContent>
          </Select>

          {onCreate && (
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Competencia
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competences.map(competence => (
              <TableRow key={competence.id}>
                <TableCell className="font-medium">
                  {competence.nombre}
                </TableCell>
                <TableCell>
                  <Badge className={getCategoryColor(competence.categoria)}>
                    {getCategoryLabel(competence.categoria)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {competence.descripcion}
                </TableCell>
                <TableCell>{competence.fuente}</TableCell>
                <TableCell>
                  <Badge variant={competence.activo ? 'default' : 'secondary'}>
                    {competence.activo ? 'Activa' : 'Inactiva'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit?.(competence)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(competence.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {competences.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron competencias
          </div>
        )}
      </CardContent>
    </Card>
  );
}
