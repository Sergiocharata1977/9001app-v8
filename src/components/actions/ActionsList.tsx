'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Action, ActionFilters } from '@/types/actions';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ActionCard } from './ActionCard';

interface ActionsListProps {
  onCreateAction: () => void;
  onViewAction: (id: string) => void;
}

export function ActionsList({
  onCreateAction,
  onViewAction,
}: ActionsListProps) {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ActionFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchActions();
  }, [filters]);

  const fetchActions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.actionType) params.append('actionType', filters.actionType);
      if (filters.priority) params.append('priority', filters.priority);

      const response = await fetch(`/api/actions?${params}`, {
        headers: { authorization: 'Bearer token' },
      });
      const data = await response.json();
      setActions(data.actions || []);
    } catch (error) {
      console.error('Error fetching actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActions = actions.filter(
    action =>
      action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.actionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Acciones</h2>
        <Button onClick={onCreateAction}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Acción
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar acciones..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filters.status}
          onValueChange={value => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="planned">Planificada</SelectItem>
            <SelectItem value="in_progress">En Progreso</SelectItem>
            <SelectItem value="completed">Completada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActions.map(action => (
            <ActionCard
              key={action.id}
              action={action}
              onClick={() => onViewAction(action.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
