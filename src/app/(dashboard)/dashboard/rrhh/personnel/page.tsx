'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Personnel, PersonnelFilters, PaginatedResponse } from '@/types/rrhh';
import { PersonnelService } from '@/services/rrhh/PersonnelService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';

export default function PersonnelPage() {
  const router = useRouter();
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PersonnelFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadPersonnel = async () => {
    try {
      setLoading(true);
      const result: PaginatedResponse<Personnel> = await PersonnelService.getPaginated(
        { ...filters, search: searchTerm || undefined },
        { page: pagination.page, limit: pagination.limit }
      );
      setPersonnel(result.data);
      setPagination({
        ...pagination,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      });
    } catch (error) {
      console.error('Error loading personnel:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersonnel();
  }, [filters, pagination.page, pagination.limit]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadPersonnel();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este personal?')) {
      try {
        await PersonnelService.delete(id);
        loadPersonnel();
      } catch (error) {
        console.error('Error deleting personnel:', error);
        alert('Error al eliminar el personal');
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await PersonnelService.toggleStatus(id);
      loadPersonnel();
    } catch (error) {
      console.error('Error toggling personnel status:', error);
      alert('Error al cambiar el estado del personal');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Personal</h1>
                <p className="text-gray-600">
                  Gestión completa del personal de la organización
                </p>
              </div>
              <Button onClick={() => router.push('/dashboard/rrhh/personnel/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Personal
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
                      placeholder="Buscar por nombre, email..."
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

            {/* Personnel Table */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Personal</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Cargando personal...</p>
                  </div>
                ) : personnel.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No se encontró personal</p>
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
                        <TableHead>Email</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Legajo</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {personnel.map((person) => (
                        <TableRow key={person.id}>
                          <TableCell className="font-medium">
                            {person.nombres} {person.apellidos}
                          </TableCell>
                          <TableCell>{person.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {person.tipo_personal}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={person.estado === 'Activo' ? 'default' : 'secondary'}>
                              {person.estado}
                            </Badge>
                          </TableCell>
                          <TableCell>{person.numero_legajo || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/dashboard/rrhh/personnel/${person.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/dashboard/rrhh/personnel/${person.id}/edit`)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleActive(person.id!)}
                              >
                                {person.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(person.id!)}
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

