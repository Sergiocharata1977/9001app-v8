'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  User,
  AlertCircle,
  Edit,
  Eye,
  FileText,
  Users
} from 'lucide-react';
import type { Audit } from '@/types/audits';

interface AuditCardProps {
  audit: Audit;
  onClick?: () => void;
  onView?: (audit: Audit) => void;
  onEdit?: (audit: Audit) => void;
}

export function AuditCard({ audit, onClick, onView, onEdit }: AuditCardProps) {
  // Función para obtener iniciales del título de auditoría
  const getInitials = (title: string) => {
    if (!title) return 'AU';
    return title.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2);
  };

  // Función para obtener color del estado
  const getEstadoColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener color del tipo
  const getTipoColor = (auditType: string) => {
    switch (auditType) {
      case 'internal': return 'bg-purple-100 text-purple-800';
      case 'external': return 'bg-indigo-100 text-indigo-800';
      case 'supplier': return 'bg-cyan-100 text-cyan-800';
      case 'customer': return 'bg-teal-100 text-teal-800';
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
      aria-label={`Ver detalles de ${audit.title}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Icono del auditoría */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
            {getInitials(audit.title)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{audit.title}</h3>
            <p className="text-sm text-gray-600">{audit.auditNumber}</p>
            <p className="text-xs text-gray-500 font-mono">ID: {audit.id}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{audit.description || 'Sin descripción'}</p>

      <div className="space-y-2 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Fecha: {new Date(audit.plannedDate).toLocaleDateString('es-ES')}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Auditor: {audit.leadAuditorName}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Alcance: {audit.auditScope}</span>
        </div>
        {audit.findingsCount > 0 && (
          <div className="flex items-center gap-2 text-orange-600">
            <AlertCircle className="h-4 w-4" />
            <span>{audit.findingsCount} hallazgos</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className={getEstadoColor(audit.status)}>
          {audit.status.replace('_', ' ')}
        </Badge>
        <Badge className={getTipoColor(audit.auditType)}>
          {audit.auditType}
        </Badge>
        {audit.findingsCount > 0 && (
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            {audit.findingsCount} hallazgos
          </Badge>
        )}
      </div>

      <div className="mt-4 pt-4">
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            className="flex-1 flex items-center justify-center gap-2"
            onClick={() => onView?.(audit)}
            aria-label={`Ver detalles de ${audit.title}`}
          >
            <Eye className="h-4 w-4" />
            Ver Detalles
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit?.(audit)}
            aria-label={`Editar ${audit.title}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
