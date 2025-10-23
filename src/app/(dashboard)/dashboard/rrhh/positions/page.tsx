'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Position, PositionFilters, PaginatedResponse } from '@/types/rrhh';
import { PositionService } from '@/services/rrhh/PositionService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';

export default function PositionsPage() {
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PositionFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadPositions = async () => {
    try {
      setLoading(true);
      const result: PaginatedResponse<Position> = await PositionService.getPaginated(
        { ...filters, search: searchTerm || undefined },
        { page: pagination.page, limit: pagination.limit }
      );
      setPositions(result.data);
      setPagination({
        ...pagination,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      });
    } catch (error) {
      console.error('Error loading positions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPositions();
  }, [filters, pagination.page, pagination.limit]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadPositions();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este puesto?')) {
      try {
        await PositionService.delete(id);
        loadPositions();
      } catch (error) {
        console.error('Error deleting position:', error);
        alert('Error al eliminar el puesto');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Puestos</h1>
                <p className="text-gray-600">
                  Definición de puestos y responsabilidades
                </p>
              </div>
              <Button onClick={() => router.push('/dashboard/rrhh/positions/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Puesto
              </Button>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Búsqueda y Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar por nombre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch}>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Positions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Puestos</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Cargando puestos...</p>
                  </div>
                ) : positions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No se encontraron puestos</p>
                    <Button 
                      className="mt-4"
                      onClick={() => router.push('/dashboard/test-firestore')}
                    >
                      Crear Datos de Prueba
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Creado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {positions.map((position) => (
                        <TableRow key={position.id}>
                          <TableCell className="font-medium">
                            {position.nombre}
                          </TableCell>
                          <TableCell>
                            {position.descripcion_responsabilidades || '-'}
                          </TableCell>
                          <TableCell>
                            {position.departamento_id || '-'}
                          </TableCell>
                          <TableCell>
                            {new Date(position.created_at).toLocaleDateString('es-ES')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/dashboard/rrhh/positions/${position.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/dashboard/rrhh/positions/${position.id}/edit`)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(position.id!)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

