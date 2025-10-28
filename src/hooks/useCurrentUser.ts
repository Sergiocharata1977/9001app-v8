// Hook for getting current user with context

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { User } from '@/types/auth';
import { UserContext } from '@/types/context';

interface UseCurrentUserOptions {
  includeContext?: boolean;  // Load full context (default: false)
}

interface UseCurrentUserReturn {
  usuario: User | null;
  contexto: UserContext | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useCurrentUser(
  options: UseCurrentUserOptions = {}
): UseCurrentUserReturn {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [contexto, setContexto] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadUser = async (userId: string, email: string | null) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user from users collection
      const response = await fetch(`/api/ia/context?userId=${userId}&light=true`);
      
      if (!response.ok) {
        // User doesn't exist in Firestore, create it automatically
        if (response.status === 404 && email) {
          console.log('[useCurrentUser] User not found in Firestore, creating...');
          
          const createResponse = await fetch('/api/users/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: userId, email })
          });

          if (createResponse.ok) {
            const createData = await createResponse.json();
            setUsuario(createData.user);
            console.log('[useCurrentUser] User created successfully');
            return;
          }
        }
        
        throw new Error('Failed to load user');
      }

      const data = await response.json();
      
      if (data.contexto) {
        setUsuario(data.contexto.user);

        // Load full context if requested
        if (options.includeContext) {
          const fullResponse = await fetch(`/api/ia/context?userId=${userId}`);
          if (fullResponse.ok) {
            const fullData = await fullResponse.json();
            setContexto(fullData.contexto);
          }
        }
      }
    } catch (err) {
      console.error('[useCurrentUser] Error loading user:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Subscribe to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (authUser: FirebaseUser | null) => {
      if (authUser) {
        await loadUser(authUser.uid, authUser.email);
      } else {
        setUsuario(null);
        setContexto(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.includeContext]);

  const refresh = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await loadUser(currentUser.uid, currentUser.email);
    }
  };

  return {
    usuario,
    contexto,
    loading,
    error,
    refresh
  };
}
