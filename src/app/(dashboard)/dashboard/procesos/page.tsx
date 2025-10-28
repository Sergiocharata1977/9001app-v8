'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Calendar, Users, BarChart3, Trash2, FileText } from 'lucide-react';
import Link from 'next/link';

// Tipos para las definiciones de procesos
interface ProcessDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  responsible: string;
  department: string;
  version: string;
  status: 'activo' | 'inactivo';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export default function ProcessDefinitionsPage() {
  const router = useRouter();
  const [processDefinitions, setProcessDefinitions] = useState<ProcessDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [filterCategory, setFilterCategory] = useState<'all' | 'calidad' | 'auditoria' | 'mejora' | 'documentos' | 'no-conformidades' | 'riesgos' | 'rrhh' | 'compras'>('all');

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
        await fetchDefinitions();
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
          setProcessDefinitions([]);
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

  // Cargar definiciones desde la API
  const fetchDefinitions = async () => {
    try {
      const response = await fetch('/api/processes/definitions');
      if (response.ok) {
        const result = await response.json();
        setProcessDefinitions(result.data || []);
      }
    } catch (error) {
      console.error('Error al cargar definiciones:', error);
    }
  };

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchDefinitions();
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Filtrar definiciones
  const filteredDefinitions = processDefinitions.filter(definition => {
    const matchesSearch = definition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         definition.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || definition.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'calidad': return 'bg-blue-100 text-blue-800';
      case 'auditoria': return 'bg-green-100 text-green-800';
      case 'mejora': return 'bg-purple-100 text-purple-800';
      case 'documentos': return 'bg-yellow-100 text-yellow-800';
      case 'no-conformidades': return 'bg-red-100 text-red-800';
      case 'riesgos': return 'bg-orange-100 text-orange-800';
      case 'rrhh': return 'bg-pink-100 text-pink-800';
      case 'compras': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'calidad': return 'Calidad';
      case 'auditoria': return 'Auditoría';
      case 'mejora': return 'Mejora';
      case 'documentos': return 'Documentos';
      case 'no-conformidades': return 'No Conformidades';
      case 'riesgos': return 'Riesgos';
      case 'rrhh': return 'RRHH';
      case 'compras': return 'Compras';
      default: return 'General';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Definiciones de Procesos</h1>
            <p className="text-gray-600 mt-2">
              Gestiona las definiciones de procesos del sistema ISO 9001
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
    <div className="p-6">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Definiciones de Procesos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona las definiciones de procesos del sistema ISO 9001
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/procesos/registros">
            <Button variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white">
              <FileText className="h-4 w-4 mr-2" />
              Ver Registros
            </Button>
          </Link>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Definición
          </Button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar definiciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 shadow-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Todas las categorías</option>
                <option value="calidad">Calidad</option>
                <option value="auditoria">Auditoría</option>
                <option value="mejora">Mejora</option>
                <option value="documentos">Documentos</option>
                <option value="no-conformidades">No Conformidades</option>
                <option value="riesgos">Riesgos</option>
                <option value="rrhh">RRHH</option>
                <option value="compras">Compras</option>
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
          {filteredDefinitions.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay definiciones de procesos
                </h3>
                <p className="text-gray-500 mb-6">
                  Crea tu primera definición de proceso para comenzar
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Definición
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
              {filteredDefinitions.map((definition) => (
                <Card 
                  key={definition.id} 
                  className="border-0 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  onClick={() => router.push(`/dashboard/procesos/${definition.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {definition.name}
                      </CardTitle>
                      <Badge className={getCategoryColor(definition.category)}>
                        {getCategoryText(definition.category)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {definition.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-2" />
                        {definition.responsible}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(definition.createdAt).toLocaleDateString()}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Versión: {definition.version}</span>
                        <Badge className={definition.status === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {definition.status === 'activo' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>

                      <div className="text-center text-sm text-emerald-600 font-medium group-hover:text-emerald-700 transition-colors">
                        Click para ver detalles →
                      </div>
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
                        Definición
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Responsable
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
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
                    {filteredDefinitions.map((definition) => (
                      <tr 
                        key={definition.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/dashboard/procesos/${definition.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{definition.name}</div>
                            <div className="text-sm text-gray-500">{definition.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getCategoryColor(definition.category)}>
                            {getCategoryText(definition.category)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {definition.responsible}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={definition.status === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {definition.status === 'activo' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(definition.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                          Click para ver →
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
    </div>
  );
}