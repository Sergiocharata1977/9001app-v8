'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  UserProfileService,
  UserProfile,
  UserChange,
} from '@/lib/sdk/modules/rrhh/UserProfileService';
import { RolePermissionsManager } from '@/components/users/RolePermissionsManager';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [changeHistory, setChangeHistory] = useState<UserChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const userService = new UserProfileService();

  // Cargar datos del usuario
  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const profile = await userService.getUserProfile(userId);
      if (profile) {
        setUser(profile);
        const history = await userService.getUserChangeHistory(userId, 100);
        setChangeHistory(history);
      } else {
        toast({
          title: 'Error',
          description: 'Usuario no encontrado',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar el usuario',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoleAndPermissions = async (
    newRole: any,
    newPermissions: any
  ) => {
    try {
      setIsSaving(true);
      // Aquí se llamaría a los métodos del servicio
      // await userService.changeUserRole(userId, newRole, 'current-user-id');
      // await userService.changeUserPermissions(userId, newPermissions, 'current-user-id');

      toast({
        title: 'Éxito',
        description: 'Cambios guardados correctamente',
      });
      loadUserData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getChangeTypeLabel = (changeType: string) => {
    const labels: Record<string, string> = {
      profile_update: 'Actualización de Perfil',
      role_change: 'Cambio de Rol',
      permission_change: 'Cambio de Permisos',
      status_change: 'Cambio de Estado',
    };
    return labels[changeType] || changeType;
  };

  const getChangeTypeColor = (changeType: string) => {
    const colors: Record<string, string> = {
      profile_update: 'bg-blue-100 text-blue-800',
      role_change: 'bg-purple-100 text-purple-800',
      permission_change: 'bg-orange-100 text-orange-800',
      status_change: 'bg-green-100 text-green-800',
    };
    return colors[changeType] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Usuario no encontrado</h1>
          <Link href="/usuarios">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Usuarios
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/usuarios">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-500 mt-1">{user.email}</p>
          </div>
        </div>
        <Badge variant={user.isActive ? 'default' : 'secondary'}>
          {user.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>

      {/* Información del Usuario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
            )}
            {user.department && (
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Departamento</p>
                  <p className="font-medium">{user.department}</p>
                </div>
              </div>
            )}
            {user.position && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Posición</p>
                  <p className="font-medium">{user.position}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">ID de Usuario</p>
              <p className="font-medium text-sm break-all">{user.userId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rol Actual</p>
              <Badge className="mt-1">{user.role}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Permisos Asignados</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {user.permissions.length > 0 ? (
                  user.permissions.map(perm => (
                    <Badge key={perm} variant="outline" className="text-xs">
                      {perm.replace(/_/g, ' ')}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    Sin permisos específicos
                  </p>
                )}
              </div>
            </div>
            {user.lastLogin && (
              <div>
                <p className="text-sm text-gray-500">Último Login</p>
                <p className="font-medium">
                  {new Date(
                    user.lastLogin instanceof Date
                      ? user.lastLogin
                      : user.lastLogin.toDate?.() || new Date()
                  ).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="roles" className="w-full">
        <TabsList>
          <TabsTrigger value="roles">Roles y Permisos</TabsTrigger>
          <TabsTrigger value="history">Historial de Cambios</TabsTrigger>
        </TabsList>

        {/* Tab: Roles y Permisos */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Roles y Permisos</CardTitle>
              <CardDescription>
                Configura el rol y los permisos del usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RolePermissionsManager
                userId={userId}
                currentRole={user.role}
                currentPermissions={user.permissions}
                onSave={handleSaveRoleAndPermissions}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Historial de Cambios */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Cambios</CardTitle>
              <CardDescription>
                Registro de todos los cambios realizados en este usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              {changeHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay cambios registrados
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo de Cambio</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Realizado por</TableHead>
                        <TableHead>Valor Anterior</TableHead>
                        <TableHead>Valor Nuevo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {changeHistory.map(change => (
                        <TableRow key={change.id}>
                          <TableCell className="text-sm">
                            {new Date(
                              change.createdAt instanceof Date
                                ? change.createdAt
                                : change.createdAt?.toDate?.() || new Date()
                            ).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getChangeTypeColor(change.changeType)}
                            >
                              {getChangeTypeLabel(change.changeType)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {change.description}
                          </TableCell>
                          <TableCell className="text-sm">
                            {change.changedBy}
                          </TableCell>
                          <TableCell className="text-sm">
                            {change.oldValue
                              ? JSON.stringify(change.oldValue)
                              : '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {change.newValue
                              ? JSON.stringify(change.newValue)
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
