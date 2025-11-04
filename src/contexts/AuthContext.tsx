'use client';

import { UserSyncNotification } from '@/components/auth/UserSyncNotification';
import { onAuthChange } from '@/firebase/auth';
import { auth } from '@/firebase/config';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSyncNotification, setShowSyncNotification] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange(async user => {
      setUser(user);

      // If user is logged in, ensure they exist in Firestore
      if (user) {
        try {
          const response = await fetch('/api/users/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
            }),
          });

          if (response.ok) {
            console.log(
              '[AuthContext] User record created/verified in Firestore'
            );
            // Show sync notification for new users
            const data = await response.json();
            if (data.message === 'Usuario creado exitosamente') {
              setShowSyncNotification(true);
            }
          } else if (response.status === 409) {
            // User already exists, this is fine
            console.log('[AuthContext] User already exists in Firestore');
          } else {
            console.error(
              '[AuthContext] Failed to create user record:',
              await response.text()
            );
          }
        } catch (error) {
          console.error('[AuthContext] Error creating user record:', error);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
      <UserSyncNotification
        show={showSyncNotification}
        onComplete={() => setShowSyncNotification(false)}
      />
    </AuthContext.Provider>
  );
};
