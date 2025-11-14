'use client';

import { NewsFeed } from '@/components/news/NewsFeed';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NoticiasPage() {
  const [user, setUser] = useState<{ uid: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'admin';
  const organizationId = 'default-org'; // Hardcoded por ahora (single-tenant)

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Noticias</h1>
        <p className="text-muted-foreground mt-1">
          Mantente al día con las novedades de la organización
        </p>
      </div>

      <NewsFeed
        organizationId={organizationId}
        currentUserId={user.uid}
        isAdmin={isAdmin}
      />
    </div>
  );
}
