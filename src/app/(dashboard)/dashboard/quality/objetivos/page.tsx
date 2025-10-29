'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Target,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { QualityObjective } from '@/types/quality';

export default function ObjetivosListing() {
  const [objectives, setObjectives] = useState<QualityObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchObjectives();
  }, []);

  const fetchObjectives = async () => {
    try {
      const response = await fetch('/api/quality/objectives');
      if (response.ok) {
        const data = await response.json();
        setObjectives(data);
      }
    } catch (error) {
      console.error('Error fetching objectives:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredObjectives = objectives.filter(objective => {
    const matchesSearch =
      objective.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      objective.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      objective.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || objective.status === statusFilter;
    const matchesType = typeFilter === 'all' || objective.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo':
        return 'bg-blue-100 text-blue-800';
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'atrasado':
        return 'bg-red-100 text-red-800';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'activo':
        return 'Activo';
      case 'completado':
        return 'Completado';
      case 'atrasado':
        return 'Atrasado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'estrategico':
        return 'Estratégico';
      case 'tactico':
        return 'Táctico';
      case 'operativo':
        return 'Operativo';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando objetivos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Objetivos de Calidad
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión de objetivos SMART vinculados a procesos
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/quality/objetivos/new">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Objetivo
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar objetivos..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="estrategico">Estratégico</SelectItem>
                <SelectItem value="tactico">Táctico</SelectItem>
                <SelectItem value="operativo">Operativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Objectives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredObjectives.map(objective => (
          <Card
            key={objective.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{objective.code}</CardTitle>
                  <CardDescription className="mt-1">
                    {getTypeText(objective.type)}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(objective.status)}>
                  {getStatusText(objective.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-medium text-gray-900 mb-2">
                {objective.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {objective.description}
              </p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progreso</span>
                  <span>{objective.progress_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${objective.progress_percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Meta info */}
              <div className="text-sm text-gray-500 space-y-1 mb-4">
                <div>
                  Meta: {objective.target_value} {objective.unit}
                </div>
                <div>
                  Actual: {objective.current_value} {objective.unit}
                </div>
                <div>
                  Vence: {new Date(objective.due_date).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/quality/objetivos/${objective.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/dashboard/quality/objetivos/${objective.id}/edit`}
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredObjectives.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron objetivos
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza creando tu primer objetivo de calidad'}
            </p>
            <Button asChild>
              <Link href="/dashboard/quality/objetivos/new">
                <Plus className="h-4 w-4 mr-2" />
                Crear Objetivo
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
