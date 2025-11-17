'use client';

import { useState, useEffect } from 'react';
import { UserProfileService, UserProfile, UserRole } from '@/lib/sdk/modules/rrhh/UserProfileService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

  const userService = new UserProfileService();

  // Cargar usuarios
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await userService.getAllUsers(false);
      setUsers(allUsers);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Cambiar rol
  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    try {
      await userService.changeUserRole(userId, newRole, 'current-user-id');
      toast({
        title: 'Éxito',
        description: 'Rol actualizado correctamente',
      });
      loadUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el rol',
        variant: 'destructive',
      });
    }
  };

  // Cambiar estado
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await userService.toggleUserStatus(userId, !currentStatus, 'current-user-id');
      toast({
        title: 'Éxito',
        description: `Usuario ${!currentStatus ? 'activado' : 'desactivado'}`,
      });
      loadUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cambiar el estado',
        variant: 'destructive',
      });
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) return;

    try {
      await userService.deleteUserProfile(userId);
      toast({
        title: 'Éxito',
        description: 'Usuario eliminado correctamente',
      });
      loadUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario',
        variant: 'destructive',
      });
    }
  };

  // Obtener color de rol
  const getRoleColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      admin: 'bg-red-100 text-red-800',
      auditor: 'bg-blue-100 text-blue-800',
      manager: 'bg-purple-100 text-purple-800',
      user: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800',
    };
    return colors[role];
  };

  // Estadísticas
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    admins: users.filter(u => u.role === 'admin').length,
    auditors: users.filter(u => u.role === 'auditor').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-gray-500 mt-1">Administra los usuarios del sistema</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsEditMode(false)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? 'Modifica los datos del usuario'
                  : 'Crea un nuevo usuario en el sistema'}
              </DialogDescription>
            </DialogHeader>
            {/* Formulario aquí */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Auditores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.auditors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Buscar</label>
              <Input
                placeholder="Email, nombre o apellido..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Rol</label>
              <Select value={roleFilter} onValueChange={v => setRoleFilter(v as UserRole | 'all')}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="auditor">Auditor</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Estado</label>
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Gestiona los usuarios del sistema y sus permisos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={role => handleChangeRole(user.userId, role as UserRole)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="auditor">Auditor</SelectItem>
                            <SelectItem value="manager">Gerente</SelectItem>
                            <SelectItem value="user">Usuario</SelectItem>
                            <SelectItem value="viewer">Visualizador</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(user.userId, user.isActive)}
                        >
                          {user.isActive ? (
                            <>
                              <Eye className="h-4 w-4 mr-1 text-green-600" />
                              Activo
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 mr-1 text-red-600" />
                              Inactivo
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin
                          ? new Date(
                              user.lastLogin instanceof Date
                                ? user.lastLogin
                                : user.lastLogin.toDate?.() || new Date()
                            ).toLocaleDateString()
                          : 'Nunca'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditMode(true);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.userId)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
