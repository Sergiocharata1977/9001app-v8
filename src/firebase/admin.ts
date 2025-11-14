// Placeholder para Firebase Admin SDK
// Por ahora, usaremos autenticación simplificada del lado del cliente

export const auth = {
  verifyIdToken: async (token: string) => {
    // TODO: Implementar verificación real con Firebase Admin SDK
    // Por ahora, retornamos un objeto mock para desarrollo
    return {
      uid: 'mock-user-id',
      email: 'user@example.com',
      role: 'user',
    };
  },
  getUser: async (uid: string) => {
    // TODO: Implementar obtención de usuario real
    return {
      uid,
      displayName: 'Usuario',
      photoURL: null,
      email: 'user@example.com',
    };
  },
  verifySessionCookie: async (cookie: string, checkRevoked: boolean) => {
    // TODO: Implementar verificación de sesión real
    return {
      uid: 'mock-user-id',
      email: 'user@example.com',
      role: 'user',
    };
  },
};
