'use client';

import { useState, useEffect } from 'react';
import UnifiedKanban from '@/components/ui/unified-kanban';
import type { KanbanItem, KanbanColumn } from '@/types/rrhh';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function RRHHKanbanPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      id: 'todo',
      title: 'Por Hacer',
      color: '#6B7280',
      maxItems: 10,
      allowDrop: true,
      order: 1
    },
    {
      id: 'in-progress',
      title: 'En Progreso',
      color: '#3B82F6',
      maxItems: 8,
      allowDrop: true,
      order: 2
    },
    {
      id: 'review',
      title: 'En Revisión',
      color: '#F59E0B',
      maxItems: 6,
      allowDrop: true,
      order: 3
    },
    {
      id: 'done',
      title: 'Completado',
      color: '#10B981',
      maxItems: 20,
      allowDrop: true,
      order: 4
    }
  ]);

  const [items, setItems] = useState<KanbanItem[]>([
    {
      id: '1',
      title: 'Revisar políticas de RRHH',
      description: 'Actualizar manual de empleados',
      columnId: 'todo',
      priority: 'high',
      tags: ['políticas', 'documentación'],
      assignee: 'Juan Pérez',
      dueDate: '2024-01-15',
      progress: 0
    },
    {
      id: '2',
      title: 'Capacitación en seguridad',
      description: 'Organizar curso de seguridad laboral',
      columnId: 'in-progress',
      priority: 'medium',
      tags: ['capacitación', 'seguridad'],
      assignee: 'María García',
      dueDate: '2024-01-20',
      progress: 60
    },
    {
      id: '3',
      title: 'Evaluación de desempeño',
      description: 'Completar evaluaciones trimestrales',
      columnId: 'review',
      priority: 'critical',
      tags: ['evaluación', 'desempeño'],
      assignee: 'Carlos López',
      dueDate: '2024-01-10',
      progress: 90
    },
    {
      id: '4',
      title: 'Contratación nuevo personal',
      description: 'Proceso de selección completado',
      columnId: 'done',
      priority: 'low',
      tags: ['contratación'],
      assignee: 'Ana Martínez',
      dueDate: '2024-01-05',
      progress: 100
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleItemMove = (itemId: string, sourceColumnId: string, targetColumnId: string, newIndex: number) => {
    setItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.id === itemId) {
          return { ...item, columnId: targetColumnId };
        }
        return item;
      });
      return updatedItems;
    });
    
    console.log(`Moved item ${itemId} from ${sourceColumnId} to ${targetColumnId} at index ${newIndex}`);
  };

  const handleItemClick = (item: KanbanItem) => {
    console.log('Clicked item:', item);
    // Aquí puedes abrir un modal de detalles
  };

  const handleItemEdit = (item: KanbanItem) => {
    console.log('Edit item:', item);
    // Aquí puedes abrir un modal de edición
  };

  const handleItemDelete = (item: KanbanItem) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${item.title}"?`)) {
      setItems(prevItems => prevItems.filter(i => i.id !== item.id));
    }
  };

  const handleAddItem = () => {
    const newItem: KanbanItem = {
      id: Date.now().toString(),
      title: 'Nueva tarea',
      description: 'Descripción de la nueva tarea',
      columnId: 'todo',
      priority: 'medium',
      tags: ['nuevo'],
      assignee: 'Usuario Actual',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 0
    };
    
    setItems(prevItems => [...prevItems, newItem]);
  };

  return (
    <div className="p-6">
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kanban RRHH</h1>
              <p className="text-gray-600">Gestión visual de tareas y procesos de recursos humanos</p>
            </div>
            <Button onClick={handleAddItem} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Tarea
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Por Hacer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {items.filter(item => item.columnId === 'todo').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">En Progreso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {items.filter(item => item.columnId === 'in-progress').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">En Revisión</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {items.filter(item => item.columnId === 'review').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {items.filter(item => item.columnId === 'done').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tablero Kanban */}
        <Card>
          <CardHeader>
            <CardTitle>Tablero de Tareas RRHH</CardTitle>
          </CardHeader>
          <CardContent>
            <UnifiedKanban
              columns={columns}
              items={items}
              onItemMove={handleItemMove}
              onItemClick={handleItemClick}
              onItemEdit={handleItemEdit}
              onItemDelete={handleItemDelete}
              loading={loading}
              error={error}
              readOnly={false}
              showActions={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

