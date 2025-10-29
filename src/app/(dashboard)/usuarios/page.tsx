'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Shield,
  Loader2,
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  personnel_id: string;
  rol: string;
  activo: boolean;
}

export default function UsuariosPage() {
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const checkUserExists = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/ia/context?userId=${authUser?.uid}&light=true`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.contexto?.user) {
          setUserData(data.contexto.user);
        }
      }
    } catch (err) {
      console.error('Error checking user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      checkUserExists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  const handleCreateUser = async () => {
    if (!authUser) return;

    try {
      setCreating(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: authUser.uid,
          email: authUser.email,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear usuario');
      }

      const data = await response.json();
      setUserData(data.user);
      setSuccess('¡Usuario creado exitosamente! Ya puedes usar Don Cándido.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setCreating(false);
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
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Configuración de Usuario
        </h1>

        {/* Auth User Info */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Cuenta de Firebase Auth
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span className="font-medium">UID:</span>
              <code className="bg-white px-2 py-1 rounded text-xs">
                {authUser?.uid}
              </code>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="font-medium">Email:</span>
              <span>{authUser?.email}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* User Status */}
        {userData ? (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800 font-medium">
                Tu usuario está configurado correctamente
              </AlertDescription>
            </Alert>

            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">
                Información del Usuario
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium text-gray-900">{userData.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Rol:</span>
                  <p className="font-medium text-gray-900 capitalize">
                    {userData.rol}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Estado:</span>
                  <p className="font-medium text-gray-900">
                    {userData.activo ? (
                      <span className="text-green-600">Activo</span>
                    ) : (
                      <span className="text-red-600">Inactivo</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Personnel ID:</span>
                  <p className="font-medium text-gray-900">
                    {userData.personnel_id || (
                      <span className="text-gray-400 italic">No asignado</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>✓ Todo listo!</strong> Ya puedes usar Don Cándido desde
                el botón en el sidebar.
              </p>
              {!userData.personnel_id && (
                <p className="text-sm text-blue-700 mt-2">
                  💡 Para obtener respuestas más personalizadas, contacta al
                  administrador para que te asigne un personnel.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Tu usuario aún no está configurado en el sistema
              </AlertDescription>
            </Alert>

            <div className="p-6 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-700 mb-6">
                Para usar Don Cándido, necesitas crear tu perfil de usuario en
                el sistema.
              </p>

              <button
                onClick={handleCreateUser}
                disabled={creating}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creando usuario...
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5" />
                    Crear Mi Usuario
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
