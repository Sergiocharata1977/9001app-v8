'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Calendar,
  User,
  Edit,
  Eye,
  FileText,
  Target,
  CheckCircle
} from 'lucide-react';
import type { Finding } from '@/types/findings';

interface FindingCardProps {
  finding: Finding;
  onClick?: () => void;
  onView?: (finding: Finding) => void;
  onEdit?: (finding: Finding) => void;
}

export function FindingCard({ finding, onClick, onView, onEdit }: FindingCardProps) {
  // Función para obtener iniciales del título del hallazgo
  const getInitials = (title: string) => {
    if (!title) return 'HA';
    return title.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2);
  };

  // Función para obtener color del estado
  const getEstadoColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_analysis': return 'bg-orange-100 text-orange-800';
      case 'action_planned': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener color de severidad
  const getSeveridadColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'major': return 'bg-orange-100 text-orange-800';
      case 'minor': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener color del tipo
  const getTipoColor = (findingType: string) => {
    switch (findingType) {
      case 'non_conformity': return 'bg-red-100 text-red-800';
      case 'observation': return 'bg-blue-100 text-blue-800';
      case 'improvement_opportunity': return 'bg-green-100 text-green-800';
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
      aria-label={`Ver detalles de ${finding.title}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Icono del hallazgo */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white font-semibold text-lg">
            {getInitials(finding.title)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{finding.title}</h3>
            <p className="text-sm text-gray-600">{finding.findingNumber}</p>
            <p className="text-xs text-gray-500 font-mono">ID: {finding.id}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{finding.description}</p>

      <div className="space-y-2 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Fecha: {new Date(finding.identifiedDate).toLocaleDateString('es-ES')}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Responsable: {finding.responsiblePersonName || 'Sin asignar'}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Origen: {finding.sourceName}</span>
        </div>
        {finding.actionsCount > 0 && (
          <div className="flex items-center gap-2 text-blue-600">
            <Target className="h-4 w-4" />
            <span>{finding.actionsCount} acciones</span>
          </div>
        )}
        {finding.isVerified && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Verificado</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className={getEstadoColor(finding.status)}>
          {finding.status.replace('_', ' ')}
        </Badge>
        <Badge className={getSeveridadColor(finding.severity)}>
          {finding.severity}
        </Badge>
        <Badge className={getTipoColor(finding.findingType)}>
          {finding.findingType.replace('_', ' ')}
        </Badge>
        {finding.isRecurrent && (
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            Recurrente
          </Badge>
        )}
      </div>

      <div className="mt-4 pt-4">
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            className="flex-1 flex items-center justify-center gap-2"
            onClick={() => onView?.(finding)}
            aria-label={`Ver detalles de ${finding.title}`}
          >
            <Eye className="h-4 w-4" />
            Ver Detalles
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit?.(finding)}
            aria-label={`Editar ${finding.title}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
