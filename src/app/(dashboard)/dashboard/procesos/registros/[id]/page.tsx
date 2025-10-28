'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  User,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Tipos para el tablero Kanban
interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface KanbanList {
  id: string;
  title: string;
  cards: KanbanCard[];
  color: string;
}

interface ProcessRecord {
  id: string;
  name: string;
  description: string;
  processDefinitionName: string;
  status: 'activo' | 'pausado' | 'completado';
  createdAt: string;
  lists: KanbanList[];
}

export default function ProcessRecordKanbanPage() {
  const params = useParams();
  const recordId = params.id as string;
  
  const [processRecord, setProcessRecord] = useState<ProcessRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  // Datos de prueba
  useEffect(() => {
    const mockData: ProcessRecord = {
      id: recordId,
      name: 'Implementación ISO 9001 Q3',
      description: 'Registro de proceso para implementación de ISO 9001 en el tercer trimestre',
      processDefinitionName: 'Gestión de Calidad',
      status: 'activo',
      createdAt: '2024-01-15',
      lists: [
        {
          id: 'list-1',
          title: 'Pendiente',
          color: 'bg-gray-100',
          cards: [
            {
              id: 'card-1',
              title: 'Revisar documentación ISO 9001',
              description: 'Revisar toda la documentación existente del sistema de gestión',
              assignedTo: 'Juan Pérez',
              dueDate: '2024-02-15',
              priority: 'high',
              tags: ['documentación', 'revisión'],
              status: 'pending',
              createdAt: '2024-01-15',
              updatedAt: '2024-01-20'
            },
            {
              id: 'card-2',
              title: 'Capacitación del equipo',
              description: 'Organizar capacitación sobre nuevos procedimientos',
              assignedTo: 'María García',
              dueDate: '2024-02-20',
              priority: 'medium',
              tags: ['capacitación', 'equipo'],
              status: 'pending',
              createdAt: '2024-01-16',
              updatedAt: '2024-01-18'
            }
          ]
        },
        {
          id: 'list-2',
          title: 'En Progreso',
          color: 'bg-blue-100',
          cards: [
            {
              id: 'card-3',
              title: 'Implementar procedimientos',
              description: 'Implementar nuevos procedimientos de calidad',
              assignedTo: 'Carlos López',
              dueDate: '2024-02-10',
              priority: 'high',
              tags: ['implementación', 'procedimientos'],
              status: 'in-progress',
              createdAt: '2024-01-10',
              updatedAt: '2024-01-22'
            },
            {
              id: 'card-4',
              title: 'Auditoría interna',
              description: 'Realizar auditoría interna del sistema',
              assignedTo: 'Ana Martínez',
              dueDate: '2024-02-25',
              priority: 'medium',
              tags: ['auditoría', 'interna'],
              status: 'in-progress',
              createdAt: '2024-01-12',
              updatedAt: '2024-01-21'
            },
            {
              id: 'card-5',
              title: 'Actualizar manual de calidad',
              description: 'Actualizar el manual de calidad con nuevos procesos',
              assignedTo: 'Pedro Rodríguez',
              dueDate: '2024-02-28',
              priority: 'low',
              tags: ['manual', 'actualización'],
              status: 'in-progress',
              createdAt: '2024-01-14',
              updatedAt: '2024-01-19'
            }
          ]
        },
        {
          id: 'list-3',
          title: 'Completado',
          color: 'bg-green-100',
          cards: [
            {
              id: 'card-6',
              title: 'Análisis de riesgos',
              description: 'Completar análisis de riesgos del proceso',
              assignedTo: 'Laura Sánchez',
              dueDate: '2024-01-30',
              priority: 'high',
              tags: ['análisis', 'riesgos'],
              status: 'completed',
              createdAt: '2024-01-05',
              updatedAt: '2024-01-30'
            },
            {
              id: 'card-7',
              title: 'Reunión de kick-off',
              description: 'Realizar reunión de inicio del proyecto',
              assignedTo: 'Roberto Díaz',
              dueDate: '2024-01-15',
              priority: 'medium',
              tags: ['reunión', 'kick-off'],
              status: 'completed',
              createdAt: '2024-01-10',
              updatedAt: '2024-01-15'
            }
          ]
        }
      ]
    };

    setTimeout(() => {
      setProcessRecord(mockData);
      setLoading(false);
    }, 1000);
  }, [recordId]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Sin prioridad';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-3 w-3" />;
      case 'medium': return <Clock className="h-3 w-3" />;
      case 'low': return <CheckCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedCard(cardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetListId: string) => {
    e.preventDefault();
    
    if (!draggedCard || !processRecord) return;

    // Aquí implementarías la lógica de mover la tarjeta entre listas
    console.log(`Moviendo tarjeta ${draggedCard} a lista ${targetListId}`);
    
    setDraggedCard(null);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="flex gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-1">
                <div className="h-12 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="h-24 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!processRecord) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/procesos/registros">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al listado
              </Button>
            </Link>
          </div>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Registro de proceso no encontrado
              </h3>
              <p className="text-gray-500 mb-6">
                El registro de proceso que buscas no existe o ha sido eliminado.
              </p>
              <Link href="/dashboard/procesos/registros">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al listado
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/procesos/registros">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al listado
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {processRecord.name}
            </h1>
            <p className="text-gray-600 mt-1">
              {processRecord.description}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <Badge className="bg-blue-100 text-blue-800">
                {processRecord.processDefinitionName}
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                {processRecord.status === 'activo' ? 'Activo' : 
                 processRecord.status === 'pausado' ? 'Pausado' : 'Completado'}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <MoreHorizontal className="h-4 w-4 mr-2" />
            Configurar
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarjeta
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {processRecord.lists.map((list) => (
          <Card key={list.id} className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{list.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{list.cards.length}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${list.color} flex items-center justify-center`}>
                  <span className="text-lg font-semibold text-gray-700">
                    {list.cards.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tablero Kanban */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {processRecord.lists.map((list) => (
          <div key={list.id} className="shrink-0 w-80">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {list.title}
                  </CardTitle>
                  <Badge className="bg-gray-100 text-gray-600">
                    {list.cards.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent 
                className="space-y-3 min-h-96"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, list.id)}
              >
                {list.cards.map((card) => (
                  <Card 
                    key={card.id} 
                    className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                    draggable
                    onDragStart={(e) => handleDragStart(e, card.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
                            {card.title}
                          </h4>
                          <Badge className={getPriorityColor(card.priority)}>
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(card.priority)}
                              {getPriorityText(card.priority)}
                            </div>
                          </Badge>
                        </div>
                        
                        {card.description && (
                          <p className="text-sm text-gray-600">
                            {card.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {card.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          {card.assignedTo && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {card.assignedTo}
                            </div>
                          )}
                          {card.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(card.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full border-dashed border-2 border-gray-300 hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar tarjeta
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

