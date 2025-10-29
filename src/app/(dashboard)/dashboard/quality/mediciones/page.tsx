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
  Activity,
  Plus,
  Search,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { Measurement } from '@/types/quality';

export default function MedicionesListing() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const fetchMeasurements = async () => {
    try {
      const response = await fetch('/api/quality/measurements');
      if (response.ok) {
        const data = await response.json();
        setMeasurements(data);
      }
    } catch (error) {
      console.error('Error fetching measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMeasurements = measurements.filter(measurement => {
    const matchesSearch =
      measurement.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      measurement.measurement_method
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      measurement.data_source.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || measurement.validation_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validado':
        return 'bg-green-100 text-green-800';
      case 'rechazado':
        return 'bg-red-100 text-red-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'validado':
        return 'Validado';
      case 'rechazado':
        return 'Rechazado';
      case 'pendiente':
        return 'Pendiente';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validado':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rechazado':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando mediciones...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Mediciones de Calidad
          </h1>
          <p className="text-gray-600 mt-1">
            Registro y validación de valores medidos
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/quality/mediciones/new">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Medición
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
                  placeholder="Buscar mediciones..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado de Validación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="validado">Validado</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Measurements List */}
      <div className="space-y-4">
        {filteredMeasurements.map(measurement => (
          <Card
            key={measurement.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-2xl font-bold text-blue-600">
                      {measurement.value}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID Indicador: {measurement.indicator_id}
                    </div>
                    <Badge
                      className={getStatusColor(measurement.validation_status)}
                    >
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(measurement.validation_status)}
                        <span>
                          {getStatusText(measurement.validation_status)}
                        </span>
                      </div>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Fecha de Medición:</span>
                      <div>
                        {new Date(
                          measurement.measurement_date
                        ).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Método:</span>
                      <div>{measurement.measurement_method}</div>
                    </div>
                    <div>
                      <span className="font-medium">Fuente:</span>
                      <div>{measurement.data_source}</div>
                    </div>
                    <div>
                      <span className="font-medium">Medido por:</span>
                      <div>{measurement.measured_by}</div>
                    </div>
                    {measurement.validated_by && (
                      <div>
                        <span className="font-medium">Validado por:</span>
                        <div>{measurement.validated_by}</div>
                      </div>
                    )}
                    {measurement.validation_date && (
                      <div>
                        <span className="font-medium">Fecha Validación:</span>
                        <div>
                          {new Date(
                            measurement.validation_date
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {measurement.notes && (
                    <div className="mt-3">
                      <span className="font-medium text-sm">
                        Observaciones:
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {measurement.notes}
                      </p>
                    </div>
                  )}

                  {measurement.validation_notes && (
                    <div className="mt-3">
                      <span className="font-medium text-sm">
                        Notas de Validación:
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {measurement.validation_notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/dashboard/quality/mediciones/${measurement.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/dashboard/quality/mediciones/${measurement.id}/edit`}
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMeasurements.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron mediciones
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza registrando tu primera medición de calidad'}
            </p>
            <Button asChild>
              <Link href="/dashboard/quality/mediciones/new">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Medición
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
