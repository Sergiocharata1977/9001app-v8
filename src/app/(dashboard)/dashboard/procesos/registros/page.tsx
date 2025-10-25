'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Calendar, Users, BarChart3, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Tipos para los registros de procesos
interface ProcessRecord {
  id: string;
  name: string;
  description: string;
  processDefinitionId: string;
  processDefinitionName: string;
  status: 'activo' | 'pausado' | 'completado';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  kanbanStats: {
    totalCards: number;
    pendingCards: number;
    inProgressCards: number;
    completedCards: number;
  };
}

export default function ProcessRecordsPage() {
  const [processRecords, setProcessRecords] = useState<ProcessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [filterStatus, setFilterStatus] = useState<'all' | 'activo' | 'pausado' | 'completado'>('all');

  // Funciones para manejar datos de prueba
  const handleSeedData = async () => {
    try {
      const response = await fetch('/api/processes/seed-massive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Datos de procesos sembrados exitosamente:', result);
        // Recargar datos después del seed
        setProcessRecords(result.data || []);
        alert(`Datos de procesos agregados exitosamente:\n\n- ${result.data.definitionsCreated} definiciones\n- ${result.data.recordsCreated} registros\n- ${result.data.kanbanBoardsCreated} tableros Kanban`);
      } else {
        const error = await response.json();
        console.error('Error al sembrar datos:', error);
        alert('Error al agregar datos de prueba');
      }
    } catch (error) {
      console.error('Error al sembrar datos:', error);
      alert('Error al agregar datos de prueba');
    }
  };

  const handleCheckData = async () => {
    try {
      const response = await fetch('/api/processes/check', {
        method: 'GET',
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Datos en Firebase:', result);
        alert(`Datos encontrados:\n- Definiciones: ${result.data.processDefinitions.count}\n- Registros: ${result.data.processRecords.count}\n- Listas Kanban: ${result.data.kanbanLists.count}\n- Tarjetas: ${result.data.kanbanCards.count}`);
      } else {
        const error = await response.json();
        console.error('Error al verificar datos:', error);
        alert('Error al verificar datos');
      }
    } catch (error) {
      console.error('Error al verificar datos:', error);
      alert('Error al verificar datos');
    }
  };

  const handleClearData = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar todos los datos de procesos?')) {
      try {
        const response = await fetch('/api/processes/seed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'clear' })
        });

        if (response.ok) {
          console.log('Datos eliminados exitosamente');
          setProcessRecords([]);
          alert('Datos eliminados exitosamente');
        } else {
          const error = await response.json();
          console.error('Error al eliminar datos:', error);
          alert('Error al eliminar datos');
        }
      } catch (error) {
        console.error('Error al eliminar datos:', error);
        alert('Error al eliminar datos');
      }
    }
  };

  // Datos de prueba
  useEffect(() => {
    const mockData: ProcessRecord[] = [
      {
        id: '1',
        name: 'Implementación ISO 9001 Q3',
        description: 'Registro de proceso para implementación de ISO 9001 en el tercer trimestre',
        processDefinitionId: 'proc-1',
        processDefinitionName: 'Gestión de Calidad',
        status: 'activo',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        createdBy: 'admin@empresa.com',
        kanbanStats: {
          totalCards: 12,
          pendingCards: 3,
          inProgressCards: 5,
          completedCards: 4
        }
      },
      {
        id: '2',
        name: 'Auditoría Interna 2024',
        description: 'Proceso de auditoría interna del sistema de gestión',
        processDefinitionId: 'proc-2',
        processDefinitionName: 'Auditorías',
        status: 'pausado',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-18',
        createdBy: 'auditor@empresa.com',
        kanbanStats: {
          totalCards: 8,
          pendingCards: 2,
          inProgressCards: 3,
          completedCards: 3
        }
      },
      {
        id: '3',
        name: 'Mejora Continua',
        description: 'Proceso de mejora continua del sistema',
        processDefinitionId: 'proc-3',
        processDefinitionName: 'Mejora Continua',
        status: 'completado',
        createdAt: '2024-01-05',
        updatedAt: '2024-01-25',
        createdBy: 'mejora@empresa.com',
        kanbanStats: {
          totalCards: 15,
          pendingCards: 0,
          inProgressCards: 0,
          completedCards: 15
        }
      }
    ];

    setTimeout(() => {
      setProcessRecords(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrar registros
  const filteredRecords = processRecords.filter(record => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'pausado': return 'bg-yellow-100 text-yellow-800';
      case 'completado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'activo': return 'Activo';
      case 'pausado': return 'Pausado';
      case 'completado': return 'Completado';
      default: return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Registros de Procesos</h1>
            <p className="text-gray-600 mt-2">
              Gestiona los registros de procesos con tableros Kanban
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Registros de Procesos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona los registros de procesos con tableros Kanban
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Registro
        </Button>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar registros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 shadow-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="pausado">Pausado</option>
                <option value="completado">Completado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista de Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'cards' | 'list')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cards">Vista de Tarjetas</TabsTrigger>
          <TabsTrigger value="list">Vista de Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay registros de procesos
                </h3>
                <p className="text-gray-500 mb-6">
                  Crea tu primer registro de proceso para comenzar a gestionar con Kanban
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Registro
                  </Button>
                  <Button onClick={handleSeedData} variant="outline" className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Datos de Prueba
                  </Button>
                  <Button onClick={handleCheckData} variant="outline" className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Search className="h-4 w-4 mr-2" />
                    Verificar Datos
                  </Button>
                  <Button onClick={handleClearData} variant="outline" className="bg-red-600 hover:bg-red-700 text-white">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpiar Datos
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecords.map((record) => (
                <Card key={record.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {record.name}
                      </CardTitle>
                      <Badge className={getStatusColor(record.status)}>
                        {getStatusText(record.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {record.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-2" />
                        {record.processDefinitionName}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="text-lg font-semibold text-gray-900">{record.kanbanStats.pendingCards}</div>
                          <div className="text-xs text-gray-500">Pendientes</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2">
                          <div className="text-lg font-semibold text-blue-600">{record.kanbanStats.inProgressCards}</div>
                          <div className="text-xs text-blue-500">En Progreso</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2">
                          <div className="text-lg font-semibold text-green-600">{record.kanbanStats.completedCards}</div>
                          <div className="text-xs text-green-500">Completadas</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Creado: {new Date(record.createdAt).toLocaleDateString()}</span>
                        <span>Total: {record.kanbanStats.totalCards}</span>
                      </div>

                      <Link href={`/dashboard/procesos/registros/${record.id}`}>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                          Abrir Tablero Kanban
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Proceso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progreso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Creado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{record.name}</div>
                            <div className="text-sm text-gray-500">{record.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.processDefinitionName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(record.status)}>
                            {getStatusText(record.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-emerald-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${(record.kanbanStats.completedCards / record.kanbanStats.totalCards) * 100}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {record.kanbanStats.completedCards}/{record.kanbanStats.totalCards}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link href={`/dashboard/procesos/registros/${record.id}`}>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                              Abrir Kanban
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  );
}

