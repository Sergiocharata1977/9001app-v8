'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Settings, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  if (!user) return null;

  // Get first letter of email for avatar
  const avatarLetter = user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl"
        aria-label="Menú de usuario"
      >
        {avatarLetter}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.email}
            </p>
            <p className="text-xs text-gray-500 mt-1">Usuario activo</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => handleNavigation('/mi-contexto')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-3 transition-colors"
            >
              <User className="w-4 h-4 text-emerald-600" />
              Mi Contexto
            </button>

            <button
              onClick={() => handleNavigation('/perfil')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-3 transition-colors"
            >
              <Settings className="w-4 h-4 text-emerald-600" />
              Mi Perfil
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200 pt-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
