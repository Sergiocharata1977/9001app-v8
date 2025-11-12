import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Briefcase,
  Building2,
  User,
  Award,
  Calendar,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Position } from '@/types/rrhh';

interface PositionCardProps {
  position: Position;
  onEdit?: (position: Position) => void;
  onDelete?: (position: Position) => void;
  onView?: (position: Position) => void;
  onCardClick?: (position: Position) => void;
}

export function PositionCard({
  position,
  onEdit,
  onDelete,
  onView,
  onCardClick,
}: PositionCardProps) {
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  const handleCardClick = () => {
    onCardClick?.(position);
  };

  return (
    <Card
      className="bg-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 rounded-xl cursor-pointer border-0"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Ver detalles de ${position.nombre}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{position.nombre}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {position.id}
                </Badge>
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={e => e.stopPropagation()}
                aria-label={`Opciones para ${position.nombre}`}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(position)}>
                <Eye className="w-4 h-4 mr-2" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(position)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(position)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="font-medium text-sm text-gray-900">Descripción</p>
            <p className="text-sm text-gray-600 line-clamp-2">
              {position.descripcion_responsabilidades || 'Sin descripción'}
            </p>
          </div>

          {position.departamento_id && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Departamento: {position.departamento_id}
              </span>
            </div>
          )}

          {position.reporta_a_id && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Reporta a: {position.reporta_a_id}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Badge className="bg-emerald-100 text-emerald-800">Activo</Badge>
            <div className="text-right">
              <p className="text-xs text-gray-500">Creado</p>
              <p className="text-sm font-medium">
                {formatDate(position.created_at)}
              </p>
            </div>
          </div>

          {position.requisitos_experiencia && (
            <div className="pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Experiencia</span>
                <span className="text-sm font-medium text-gray-900 line-clamp-1">
                  {position.requisitos_experiencia}
                </span>
              </div>
            </div>
          )}

          {position.requisitos_formacion && (
            <div className="pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Formación</span>
                <span className="text-sm font-medium text-gray-900 line-clamp-1">
                  {position.requisitos_formacion}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
