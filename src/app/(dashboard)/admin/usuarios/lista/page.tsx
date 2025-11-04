'use client';

import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/components/ui/use-toast';
import { UserService } from '@/services/auth/UserService';
import { PersonnelService } from '@/services/rrhh/PersonnelService';
import { User } from '@/types/auth';
import { Personnel } from '@/types/rrhh';
import {
  ArrowLeft,
  CheckCircle,
  Edit,
  Eye,
  Search,
  Trash2,
  UserCog,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ListaUsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [filterRole, setFilterRole] = useState<'all' | User['rol']>('all');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, personnelData] = await Promise.all([
        UserService.getAll(),
        PersonnelService.getAll(),
      ]);
      setUsers(usersData);
      setPersonnel(personnelData);
    } catch (err) {
      console.error('Error loading data:', err);
      toast({
        title: 'Error',
        description: 'No se pudo cargar los datos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await UserService.setActive(userId, !currentStatus);
      toast({
        title: 'Éxito',
        description: `Usuario ${!currentStatus ? 'activado' : 'desactivado'} correctamente`,
      });
      await loadData();
    } catch (err) {
      console.error('Error toggling status:', err);
      toast({
        title: 'Error',
        description: 'No se pudo cambiar el estado del usuario',
        variant: 'destructive',
      });
    }
  };

  const changeUserRole = async (userId: string, newRole: User['rol']) => {
    try {
      await UserService.updateRole(userId, newRole);
      toast({
        title: 'Éxito',
        description: 'Rol actualizado correctamente',
      });
      await loadData();
    } catch (err) {
      console.error('Error changing role:', err);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el rol',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.activo) ||
      (filterStatus === 'inactive' && !user.activo);
    const matchesRole = filterRole === 'all' || user.rol === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getPersonnelName = (personnelId: string | null) => {
    if (!personnelId) return 'Sin asignar';
    const p = personnel.find(per => per.id === personnelId);
    return p ? `${p.nombres} ${p.apellidos}` : 'No encontrado';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg shadow-emerald-500/10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <UserCog className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Usuarios
              </h1>
              <p className="text-sm text-gray-600">
                Administra todos los usuarios del sistema
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="shadow-sm hover:shadow-slate-500/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <Button
              onClick={() => router.push('/admin/usuarios/crear')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Crear Usuario
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-lg shadow-blue-500/20">
            <p className="text-sm text-blue-600 font-medium">Total</p>
            <p className="text-2xl font-bold text-blue-900">{users.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg shadow-lg shadow-green-500/20">
            <p className="text-sm text-green-600 font-medium">Activos</p>
            <p className="text-2xl font-bold text-green-900">
              {users.filter(u => u.activo).length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg shadow-lg shadow-orange-500/20">
            <p className="text-sm text-orange-600 font-medium">Con Personal</p>
            <p className="text-2xl font-bold text-orange-900">
              {users.filter(u => u.personnel_id).length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg shadow-lg shadow-purple-500/20">
            <p className="text-sm text-purple-600 font-medium">Sin Personal</p>
            <p className="text-2xl font-bold text-purple-900">
              {users.filter(u => !u.personnel_id).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 shadow-sm focus:shadow-emerald-500/20 focus:ring-emerald-500"
            />
          </div>

          <Select
            value={filterStatus}
            onValueChange={(value: 'all' | 'active' | 'inactive') =>
              setFilterStatus(value)
            }
          >
            <SelectTrigger className="shadow-sm focus:shadow-emerald-500/20">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterRole}
            onValueChange={(value: 'all' | User['rol']) => setFilterRole(value)}
          >
            <SelectTrigger className="shadow-sm focus:shadow-emerald-500/20">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="operario">Operario</SelectItem>
              <SelectItem value="jefe">Jefe</SelectItem>
              <SelectItem value="gerente">Gerente</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg overflow-hidden shadow-lg shadow-slate-200/50">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Personal</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-emerald-50/50 transition-all hover:shadow-md"
                  onClick={() => router.push(`/admin/usuarios/${user.id}`)}
                >
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.rol}
                      onValueChange={(value: User['rol']) =>
                        changeUserRole(user.id, value)
                      }
                    >
                      <SelectTrigger
                        className="w-32 shadow-sm"
                        onClick={e => e.stopPropagation()}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operario">Operario</SelectItem>
                        <SelectItem value="jefe">Jefe</SelectItem>
                        <SelectItem value="gerente">Gerente</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {getPersonnelName(user.personnel_id)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.activo ? (
                      <Badge className="bg-green-100 text-green-800 shadow-sm shadow-green-500/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 shadow-sm shadow-red-500/20">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactivo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="shadow-sm hover:shadow-emerald-500/20 hover:border-emerald-500"
                        onClick={e => {
                          e.stopPropagation();
                          router.push(`/admin/usuarios/${user.id}`);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shadow-sm hover:shadow-blue-500/20 hover:border-blue-500"
                        onClick={e => {
                          e.stopPropagation();
                          router.push(`/admin/usuarios/${user.id}/editar`);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={user.activo ? 'destructive' : 'default'}
                        className={
                          user.activo
                            ? 'shadow-sm shadow-red-500/20'
                            : 'shadow-sm shadow-green-500/20 bg-green-600 hover:bg-green-700'
                        }
                        onClick={e => {
                          e.stopPropagation();
                          toggleUserStatus(user.id, user.activo);
                        }}
                      >
                        {user.activo ? (
                          <Trash2 className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron usuarios</p>
          </div>
        )}
      </div>
    </div>
  );
}
