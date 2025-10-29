'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserService } from '@/services/auth/UserService';
import { PersonnelService } from '@/services/rrhh/PersonnelService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Shield,
  Loader2,
  UserCog,
} from 'lucide-react';
import { User as UserType } from '@/types/auth';
import { Personnel } from '@/types/rrhh';
import { useToast } from '@/components/ui/use-toast';

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [assigning, setAssigning] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersData, personnelData] = await Promise.all([
        UserService.getUsersWithoutPersonnel(),
        PersonnelService.getAll(),
      ]);
      setUsers(usersData);
      setPersonnel(personnelData.filter(p => p.estado === 'Activo'));
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar los datos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssign = async (userId: string) => {
    const personnelId = assignments[userId];
    if (!personnelId) {
      toast({
        title: 'Error',
        description: 'Selecciona un personal',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAssigning(prev => ({ ...prev, [userId]: true }));
      await UserService.assignPersonnel(userId, personnelId);

      toast({
        title: 'Éxito',
        description: 'Personal asignado correctamente',
      });

      // Reload data
      await loadData();
      // Clear assignment
      setAssignments(prev => {
        const newAssignments = { ...prev };
        delete newAssignments[userId];
        return newAssignments;
      });
    } catch (error) {
      console.error('Error assigning personnel:', error);
      toast({
        title: 'Error',
        description: 'No se pudo asignar el personal',
        variant: 'destructive',
      });
    } finally {
      setAssigning(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <UserCog className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Administración de Usuarios
            </h1>
            <p className="text-sm text-gray-600">
              Asigna personal a los usuarios del sistema
            </p>
          </div>
        </div>

        {users.length === 0 ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              Todos los usuarios tienen personal asignado
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Hay {users.length} usuario(s) sin personal asignado
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {users.map(user => (
                <div
                  key={user.id}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          {user.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          <span>Rol: {user.rol}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>
                            ID: {user.id?.substring(0, 8) || 'N/A'}...
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={assignments[user.id] || ''}
                        onValueChange={value =>
                          setAssignments(prev => ({
                            ...prev,
                            [user.id]: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-[300px]">
                          <SelectValue placeholder="Seleccionar personal..." />
                        </SelectTrigger>
                        <SelectContent>
                          {personnel.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.nombres} {p.apellidos}
                              {p.puesto && ` - ${p.puesto}`}
                              {p.departamento && ` (${p.departamento})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        onClick={() => handleAssign(user.id)}
                        disabled={!assignments[user.id] || assigning[user.id]}
                        size="sm"
                      >
                        {assigning[user.id] ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Asignando...
                          </>
                        ) : (
                          'Asignar'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Nota:</strong> Al asignar un personal, el rol del usuario
            se actualizará automáticamente según el tipo de personal (gerencial
            → gerente, supervisor → jefe, operativo → operario).
          </p>
        </div>
      </div>
    </div>
  );
}
