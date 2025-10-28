'use client';

import { useState, useEffect } from 'react';
import { UserService } from '@/services/auth/UserService';
import { PersonnelService } from '@/services/rrhh/PersonnelService';
import { User } from '@/types/auth';
import { Personnel } from '@/types/rrhh';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Search, UserCog, Shield, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export default function ListaUsuariosPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [personnel, setPersonnel] = useState<Personnel[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
	const [filterRole, setFilterRole] = useState<'all' | User['rol']>('all');
	const { toast } = useToast();
	const router = useRouter();

	useEffect(() => {
		loadData();
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
	};

	const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
		try {
			await UserService.setActive(userId, !currentStatus);
			toast({
				title: 'Éxito',
				description: `Usuario ${!currentStatus ? 'activado' : 'desactivado'} correctamente`,
			});
			await loadData();
		} catch (error) {
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
		} catch (error) {
			toast({
				title: 'Error',
				description: 'No se pudo actualizar el rol',
				variant: 'destructive',
			});
		}
	};

	const filteredUsers = users.filter((user) => {
		const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus =
			filterStatus === 'all' ||
			(filterStatus === 'active' && user.activo) ||
			(filterStatus === 'inactive' && !user.activo);
		const matchesRole = filterRole === 'all' || user.rol === filterRole;
		return matchesSearch && matchesStatus && matchesRole;
	});

	const getPersonnelName = (personnelId: string | null) => {
		if (!personnelId) return 'Sin asignar';
		const p = personnel.find((per) => per.id === personnelId);
		return p ? `${p.nombres} ${p.apellidos}` : 'No encontrado';
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				{/* Header */}
				<div className="flex items-center gap-3 mb-6">
					<UserCog className="w-8 h-8 text-blue-600" />
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							Gestión de Usuarios
						</h1>
						<p className="text-sm text-gray-600">
							Administra todos los usuarios del sistema
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
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>

					<Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
						<SelectTrigger>
							<SelectValue placeholder="Estado" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todos</SelectItem>
							<SelectItem value="active">Activos</SelectItem>
							<SelectItem value="inactive">Inactivos</SelectItem>
						</SelectContent>
					</Select>

					<Select value={filterRole} onValueChange={(value: any) => setFilterRole(value)}>
						<SelectTrigger>
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

				{/* Stats */}
				<div className="grid grid-cols-4 gap-4 mb-6">
					<div className="bg-blue-50 p-4 rounded-lg">
						<p className="text-sm text-blue-600 font-medium">Total</p>
						<p className="text-2xl font-bold text-blue-900">{users.length}</p>
					</div>
					<div className="bg-green-50 p-4 rounded-lg">
						<p className="text-sm text-green-600 font-medium">Activos</p>
						<p className="text-2xl font-bold text-green-900">
							{users.filter((u) => u.activo).length}
						</p>
					</div>
					<div className="bg-orange-50 p-4 rounded-lg">
						<p className="text-sm text-orange-600 font-medium">Con Personal</p>
						<p className="text-2xl font-bold text-orange-900">
							{users.filter((u) => u.personnel_id).length}
						</p>
					</div>
					<div className="bg-purple-50 p-4 rounded-lg">
						<p className="text-sm text-purple-600 font-medium">Sin Personal</p>
						<p className="text-2xl font-bold text-purple-900">
							{users.filter((u) => !u.personnel_id).length}
						</p>
					</div>
				</div>

				{/* Table */}
				<div className="border rounded-lg overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Email</TableHead>
								<TableHead>Rol</TableHead>
								<TableHead>Personal</TableHead>
								<TableHead>Estado</TableHead>
								<TableHead>Acciones</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredUsers.map((user) => (
								<TableRow 
									key={user.id}
									className="cursor-pointer hover:bg-gray-50 transition-colors"
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
											<SelectTrigger className="w-32">
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
											<Badge className="bg-green-100 text-green-800">
												<CheckCircle className="w-3 h-3 mr-1" />
												Activo
											</Badge>
										) : (
											<Badge className="bg-red-100 text-red-800">
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
												onClick={(e) => {
													e.stopPropagation();
													router.push(`/admin/usuarios/${user.id}`);
												}}
											>
												<Eye className="w-4 h-4 mr-1" />
												Ver
											</Button>
											<Button
												size="sm"
												variant={user.activo ? 'destructive' : 'default'}
												onClick={(e) => {
													e.stopPropagation();
													toggleUserStatus(user.id, user.activo);
												}}
											>
												{user.activo ? 'Desactivar' : 'Activar'}
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
