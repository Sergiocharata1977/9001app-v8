'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AuditTeamMember } from '@/types/audits';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

interface AuditTeamSelectorProps {
  team: AuditTeamMember[];
  onChange: (team: AuditTeamMember[]) => void;
}

export function AuditTeamSelector({ team, onChange }: AuditTeamSelectorProps) {
  const [newMember, setNewMember] = useState<Partial<AuditTeamMember>>({});

  const addMember = () => {
    if (newMember.auditorName && newMember.role) {
      onChange([
        ...team,
        {
          auditorId: `temp-${Date.now()}`,
          auditorName: newMember.auditorName,
          role: newMember.role,
        },
      ]);
      setNewMember({});
    }
  };

  const removeMember = (index: number) => {
    onChange(team.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Label>Equipo Auditor</Label>

      <div className="space-y-2">
        {team.map((member, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 border rounded"
          >
            <span className="flex-1">{member.auditorName}</span>
            <span className="text-sm text-muted-foreground">{member.role}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeMember(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Nombre del auditor"
          value={newMember.auditorName || ''}
          onChange={e =>
            setNewMember({ ...newMember, auditorName: e.target.value })
          }
        />
        <Select
          value={newMember.role}
          onValueChange={value =>
            setNewMember({
              ...newMember,
              role: value as AuditTeamMember['role'],
            })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lead">Líder</SelectItem>
            <SelectItem value="assistant">Asistente</SelectItem>
            <SelectItem value="observer">Observador</SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" onClick={addMember}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
