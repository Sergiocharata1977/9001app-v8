'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function CrearUsuarioPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'operario' as 'operario' | 'jefe' | 'gerente' | 'admin',
    activo: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Implementar creación de usuario
      console.log('Crear usuario:', formData);

      toast({
        title: 'Éxito',
        description: 'Usuario creado correctamente',
      });

      router.push('/admin/usuarios/lista');
    } catch (err) {
      console.error('Error creating user:', err);
      toast({
        title: 'Error',
        description: 'No se pudo crear el usuario',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg shadow-emerald-500/10 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="sm"
            className="shadow-sm hover:shadow-emerald-500/20 hover:border-emerald-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Usuario</h1>
            <p className="text-sm text-gray-600">
              Crea un nuevo usuario en el sistema
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={formData.email}
              onChange={e =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="shadow-sm focus:shadow-emerald-500/20 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={e =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              minLength={6}
              className="shadow-sm focus:shadow-emerald-500/20 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={e =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              minLength={6}
              className="shadow-sm focus:shadow-emerald-500/20 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol">Rol</Label>
            <Select
              value={formData.rol}
              onValueChange={(value: typeof formData.rol) =>
                setFormData({ ...formData, rol: value })
              }
            >
              <SelectTrigger className="shadow-sm focus:shadow-emerald-500/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operario">Operario</SelectItem>
                <SelectItem value="jefe">Jefe</SelectItem>
                <SelectItem value="gerente">Gerente</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={e =>
                setFormData({ ...formData, activo: e.target.checked })
              }
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <Label htmlFor="activo" className="cursor-pointer">
              Usuario activo
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 shadow-sm"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Crear Usuario
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
