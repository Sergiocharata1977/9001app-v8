'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  User,
  Edit,
  Eye,
  Target,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import type { Action } from '@/types/actions';

interface ActionCardProps {
  action: Action;
  onClick?: () => void;
  onView?: (action: Action) => void;
  onEdit?: (action: Action) => void;
}

export function ActionCard({ action, onClick, onView, onEdit }: ActionCardProps) {
  // Función para obtener iniciales del título de la acción
  const getInitials = (title: string) => {
    if (!title) return 'AC';
    return title.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2);
  };

  // Función para obtener color del estado
  const getEstadoColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener color de prioridad
  const getPrioridadColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener color del tipo
  const getTipoColor = (actionType: string) => {
    switch (actionType) {
      case 'corrective': return 'bg-red-100 text-red-800';
      case 'preventive': return 'bg-blue-100 text-blue-800';
      case 'improvement': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCardClick = () => {
    onClick?.();
  };

  return (
    <Card
      className="bg-white shadow-md p-6 hover:shadow-lg hover:scale-[1.02] cursor-pointer transition-all duration-200 rounded-xl border-0"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Ver detalles de ${action.title}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Icono de la acción */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-semibold text-lg">
            {getInitials(action.title)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{action.title}</h3>
            <p className="text-sm text-gray-600">{action.actionNumber}</p>
            <p className="text-xs text-gray-500 font-mono">ID: {action.id}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{action.description}</p>

      <div className="space-y-2 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Fecha límite: {new Date(action.plannedEndDate).toLocaleDateString('es-ES')}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Responsable: {action.responsiblePersonName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          <span>Hallazgo: {action.findingNumber}</span>
        </div>
        {action.effectivenessVerification?.isEffective && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Efectiva</span>
          </div>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Progreso</span>
          <span className="text-sm text-gray-500">{action.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${action.progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className={getEstadoColor(action.status)}>
          {action.status.replace('_', ' ')}
        </Badge>
        <Badge className={getPrioridadColor(action.priority)}>
          {action.priority}
        </Badge>
        <Badge className={getTipoColor(action.actionType)}>
          {action.actionType}
        </Badge>
      </div>

      <div className="mt-4 pt-4">
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            className="flex-1 flex items-center justify-center gap-2"
            onClick={() => onView?.(action)}
            aria-label={`Ver detalles de ${action.title}`}
          >
            <Eye className="h-4 w-4" />
            Ver Detalles
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit?.(action)}
            aria-label={`Editar ${action.title}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
