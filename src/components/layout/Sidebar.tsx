'use client';

import { DonCandidoChat } from '@/components/ia/DonCandidoChat';
import Logo from '@/components/ui/Logo';
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  Bot,
  Briefcase,
  Building,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Home,
  Kanban,
  MessageSquare,
  Search,
  Settings,
  Shield,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Workflow,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
  children?: MenuItem[];
}

const navigation: MenuItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Módulo Calidad', href: '/dashboard/calidad', icon: Award },
  {
    name: 'Mejora',
    href: '/dashboard/mejoras',
    icon: Zap,
    children: [
      { name: 'Auditorías', href: '/auditorias', icon: Search },
      { name: 'Hallazgos', href: '/hallazgos', icon: AlertTriangle },
      { name: 'Acciones', href: '/acciones', icon: CheckCircle },
      {
        name: 'Detección Personal',
        href: '/dashboard/deteccion-personal',
        icon: Users,
      },
      {
        name: 'Satisfacción de Partes',
        href: '/dashboard/satisfaccion-partes',
        icon: MessageSquare,
      },
    ],
  },
  { name: 'Documentos', href: '/documentos', icon: FileText },
  { name: 'Puntos de Norma', href: '/puntos-norma', icon: BookOpen },
  { name: 'CRM', href: '/dashboard/crm', icon: Briefcase },
  {
    name: 'RRHH',
    href: '/dashboard/rrhh',
    icon: Users,
    children: [
      { name: 'Dashboard RRHH', href: '/dashboard/rrhh', icon: BarChart3 },
      {
        name: 'Departamentos',
        href: '/dashboard/rrhh/departments',
        icon: Building,
      },
      { name: 'Puestos', href: '/dashboard/rrhh/positions', icon: Briefcase },
      { name: 'Personal', href: '/dashboard/rrhh/personnel', icon: UserCheck },
      {
        name: 'Capacitaciones',
        href: '/dashboard/rrhh/trainings',
        icon: GraduationCap,
      },
      {
        name: 'Evaluaciones',
        href: '/dashboard/rrhh/evaluations',
        icon: FileText,
      },
      { name: 'Kanban', href: '/dashboard/rrhh/kanban', icon: Workflow },
    ],
  },
  {
    name: 'Procesos',
    href: '/dashboard/procesos',
    icon: FileSpreadsheet,
    children: [
      { name: 'Definiciones', href: '/dashboard/procesos', icon: FileText },
      {
        name: 'Registros',
        href: '/dashboard/procesos/registros',
        icon: Kanban,
      },
    ],
  },
  {
    name: 'Calidad',
    href: '/dashboard/quality',
    icon: Award,
    children: [
      { name: 'Dashboard', href: '/dashboard/quality', icon: BarChart3 },
      { name: 'Objetivos', href: '/dashboard/quality/objetivos', icon: Target },
      {
        name: 'Indicadores',
        href: '/dashboard/quality/indicadores',
        icon: Activity,
      },
      {
        name: 'Mediciones',
        href: '/dashboard/quality/mediciones',
        icon: TrendingUp,
      },
    ],
  },
  {
    name: 'Administración',
    href: '/admin',
    icon: Shield,
    children: [
      { name: 'Asignar Personal', href: '/admin/usuarios', icon: Users },
      {
        name: 'Gestión Usuarios',
        href: '/admin/usuarios/lista',
        icon: Settings,
      },
    ],
  },
  { name: 'Test Firestore', href: '/dashboard/test-firestore', icon: Settings },
];

// Componente para renderizar iconos de manera segura
const SafeIcon = memo(
  ({
    Icon,
    className,
    isMounted,
  }: {
    Icon: React.ComponentType<{ className?: string }>;
    className?: string;
    isMounted: boolean;
  }) => {
    if (!isMounted) {
      return (
        <div
          className={className}
          style={{ width: '1.25rem', height: '1.25rem' }}
        />
      );
    }
    return <Icon className={className} />;
  }
);
SafeIcon.displayName = 'SafeIcon';

export const Sidebar = memo(function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(
    new Set(['RRHH', 'Procesos'])
  );
  const [isMounted, setIsMounted] = useState(false);
  const [mostrarDonCandido, setMostrarDonCandido] = useState(false);
  const pathname = usePathname();

  // Evitar errores de hidratación renderizando solo en el cliente
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Asegurar que los menús estén expandidos cuando se está en sus rutas
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pathname.startsWith('/dashboard/rrhh')) {
        setExpandedMenus(prev => new Set([...prev, 'RRHH']));
      }
      if (pathname.startsWith('/dashboard/procesos')) {
        setExpandedMenus(prev => new Set([...prev, 'Procesos']));
      }
      if (pathname.startsWith('/dashboard/quality')) {
        setExpandedMenus(prev => new Set([...prev, 'Calidad']));
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Optimización: Memoizar función de toggle para evitar recreación
  const toggleMenu = useCallback((menuName: string) => {
    // Usar requestAnimationFrame para animación más suave
    requestAnimationFrame(() => {
      setExpandedMenus(prev => {
        const newSet = new Set(prev);
        if (newSet.has(menuName)) {
          newSet.delete(menuName);
        } else {
          newSet.add(menuName);
        }
        return newSet;
      });
    });
  }, []);

  // Optimización: Memoizar cálculo de menús activos
  const activeMenus = useMemo(() => {
    const active = new Set<string>();
    navigation.forEach(item => {
      if (
        pathname === item.href ||
        item.children?.some(child => pathname === child.href)
      ) {
        active.add(item.name);
      }
    });
    return active;
  }, [pathname]);

  // Optimización: Función de verificación usando el set memoizado
  const isMenuActive = useCallback(
    (item: MenuItem): boolean => {
      return activeMenus.has(item.name);
    },
    [activeMenus]
  );

  return (
    <div className="w-64 flex-shrink-0">
      <div
        className={`sidebar-container bg-slate-800 text-white h-screen flex flex-col transition-[width] duration-200 ease-in-out overflow-hidden mx-4 my-4 rounded-lg ${collapsed ? 'w-16' : 'w-56'}`}
        style={{
          position: 'relative',
          zIndex: 1,
          background: '#1e293b',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            {collapsed ? (
              <Logo variant="light" size="md" showText={false} />
            ) : (
              <Logo variant="light" size="md" showText={true} />
            )}
          </div>
        </div>

        {/* Collapse Button */}
        <div className="flex justify-end p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-slate-700 transition-colors"
          >
            {collapsed ? (
              <SafeIcon
                Icon={ChevronRight}
                className="h-5 w-5"
                isMounted={isMounted}
              />
            ) : (
              <SafeIcon
                Icon={ChevronLeft}
                className="h-5 w-5"
                isMounted={isMounted}
              />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 scrollbar-hide">
          <div className="space-y-1">
            {navigation.map(item => {
              const isActive = isMenuActive(item);
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedMenus.has(item.name);

              return (
                <div key={item.name}>
                  {hasChildren ? (
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'text-white hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <SafeIcon
                        Icon={item.icon}
                        className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5 flex-shrink-0`}
                        isMounted={isMounted}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.name}</span>
                          {isExpanded ? (
                            <SafeIcon
                              Icon={ChevronUp}
                              className="h-4 w-4"
                              isMounted={isMounted}
                            />
                          ) : (
                            <SafeIcon
                              Icon={ChevronDown}
                              className="h-4 w-4"
                              isMounted={isMounted}
                            />
                          )}
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'text-white hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <SafeIcon
                        Icon={item.icon}
                        className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5 flex-shrink-0`}
                        isMounted={isMounted}
                      />
                      {!collapsed && item.name}
                    </Link>
                  )}

                  {/* Submenú */}
                  {hasChildren && isExpanded && !collapsed && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children!.map(child => {
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={`group flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                              isChildActive
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'text-white hover:bg-slate-600 hover:text-white'
                            }`}
                          >
                            <SafeIcon
                              Icon={child.icon}
                              className="mr-2 h-4 w-4 flex-shrink-0"
                              isMounted={isMounted}
                            />
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Mi Contexto Link */}
        {!collapsed && (
          <div className="px-4 pb-2">
            <Link
              href="/mi-contexto"
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                pathname === '/mi-contexto'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Mi Contexto</span>
            </Link>
          </div>
        )}

        {/* Don Cándido Button */}
        {!collapsed && (
          <div className="px-4 pb-2">
            <button
              onClick={() => setMostrarDonCandido(true)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                mostrarDonCandido
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-green-700 text-white hover:bg-green-600'
              }`}
            >
              <Bot className="h-5 w-5" />
              <span>Don Cándido</span>
              {mostrarDonCandido && (
                <span className="ml-auto w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
              )}
            </button>
          </div>
        )}

        {!collapsed && (
          <div className="p-4 border-t border-slate-700 mt-auto bg-slate-800">
            <Link href="/usuarios" className="block">
              <div className="bg-slate-700 rounded-lg p-3 hover:bg-slate-600 transition-colors cursor-pointer group">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                      <SafeIcon
                        Icon={Users}
                        className="h-4 w-4 text-white"
                        isMounted={isMounted}
                      />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-white">Usuario</p>
                    <p className="text-xs text-slate-400">Administrador</p>
                  </div>
                  <div className="flex-shrink-0">
                    <SafeIcon
                      Icon={Settings}
                      className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors"
                      isMounted={isMounted}
                    />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Don Cándido Chat Component */}
      {mostrarDonCandido && (
        <DonCandidoChat
          onClose={() => setMostrarDonCandido(false)}
          modulo={pathname.split('/')[2]}
        />
      )}
    </div>
  );
});
