'use client';

import { NewsFeed } from '@/components/news/feed/NewsFeed';
import { NewsGrid } from '@/components/news/layout/NewsGrid';
import { NewsHeader } from '@/components/news/layout/NewsHeader';
import { NewsRightSidebar } from '@/components/news/layout/NewsRightSidebar';
import { NewsSidebar } from '@/components/news/layout/NewsSidebar';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NoticiasPage() {
  const [user, setUser] = useState<{
    uid: string;
    displayName: string;
    photoURL?: string;
    role: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();

        const unsubscribe = auth.onAuthStateChanged(async firebaseUser => {
          if (!firebaseUser) {
            router.push('/login');
            return;
          }

          // Obtener custom claims para el rol
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const role = (idTokenResult.claims.role as string) || 'user';

          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Usuario',
            photoURL: firebaseUser.photoURL ?? undefined,
            role,
          });
          setIsLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            Cargando Centro de Noticias...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'admin';
  const organizationId = 'default-org'; // Hardcoded por ahora (single-tenant)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Mock data for sidebar
  const mockStats = {
    totalPosts: 156,
    totalComments: 423,
    totalReactions: 892,
    activeUsers: 47,
  };

  const mockCategories = [
    { id: '1', name: 'Calidad', count: 23, color: '#059669' },
    { id: '2', name: 'Procesos', count: 18, color: '#dc2626' },
    { id: '3', name: 'Auditorías', count: 12, color: '#d97706' },
    { id: '4', name: 'Mejora Continua', count: 31, color: '#2563eb' },
  ];

  const mockRecentPosts = [
    {
      id: '1',
      title: 'Nueva política de calidad implementada',
      author: 'María González',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: 'Resultados de la auditoría interna',
      author: 'Carlos Rodríguez',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: '3',
      title: 'Capacitación ISO 9001:2015',
      author: 'Ana López',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
  ];

  const mockEvents = [
    {
      id: '1',
      title: 'Auditoría Interna',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      location: 'Sala de Conferencias A',
      category: 'Auditoría',
    },
    {
      id: '2',
      title: 'Capacitación ISO 9001',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      location: 'Aula Virtual',
      category: 'Capacitación',
    },
    {
      id: '3',
      title: 'Reunión de Mejora Continua',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: 'Sala de Juntas',
      category: 'Mejora',
    },
    {
      id: '4',
      title: 'Revisión de Procesos',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      location: 'Oficina Principal',
      category: 'Procesos',
    },
  ];

  const mockAlerts = [
    {
      id: '1',
      title: 'Actualización de Procedimiento',
      description:
        'Se ha actualizado el procedimiento de control de calidad versión 2.1',
      severity: 'info' as const,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: 'Auditoría Programada',
      description:
        'Favor de revisar antes del viernes los documentos de auditoría a la versión 2.1',
      severity: 'warning' as const,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      title: 'Actualización de Procedimiento',
      description:
        'Se ha actualizado el procedimiento de control de calidad versión 2.1',
      severity: 'info' as const,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ];

  return (
    <NewsGrid
      header={
        <NewsHeader
          onCreatePost={() => {
            /* Handle create post */
          }}
          onSearch={query => console.log('Search:', query)}
          onToggleFilters={() => setFiltersOpen(!filtersOpen)}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          notificationCount={3}
          isMobile={isMobile}
        />
      }
      leftSidebar={
        <NewsSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          stats={mockStats}
          categories={mockCategories}
          recentPosts={mockRecentPosts}
        />
      }
      content={
        <NewsFeed
          organizationId={organizationId}
          currentUserId={user.uid}
          currentUserName={user.displayName}
          currentUserPhotoURL={user.photoURL}
          isAdmin={isAdmin}
        />
      }
      rightSidebar={
        <NewsRightSidebar
          events={mockEvents}
          alerts={mockAlerts}
          onEventClick={eventId => console.log('Event clicked:', eventId)}
          onAlertClick={alertId => console.log('Alert clicked:', alertId)}
        />
      }
      isLeftSidebarCollapsed={sidebarCollapsed}
    />
  );
}
