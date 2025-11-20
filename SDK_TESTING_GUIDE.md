# Guía de Testing del SDK Unificado

Esta guía te ayudará a probar la infraestructura del SDK desde el frontend y con herramientas de testing de APIs.

## 📋 Pre-requisitos

1. **Configurar variables de entorno**
   - Copia `.env.example` a `.env.local`
   - Completa las credenciales de Firebase Admin SDK
   - Asegúrate de tener las credenciales del cliente también

2. **Iniciar el servidor de desarrollo**

   ```bash
   npm run dev
   ```

3. **Tener un usuario autenticado en Firebase**
   - Necesitas un token de Firebase Auth válido para probar

## 🧪 Métodos de Testing

### Opción 1: Testing desde el Frontend (React)

#### 1. Crear un componente de prueba

Crea `src/app/test-sdk/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Ajusta según tu contexto

export default function TestSDKPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testGet = async () => {
    setLoading(true);
    setError(null);

    try {
      // Obtener token del usuario actual
      const token = await user?.getIdToken();

      const response = await fetch('/api/test/sdk', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testPost = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await user?.getIdToken();

      const response = await fetch('/api/test/sdk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testData: 'Hello from frontend!',
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">SDK Testing</h1>

      <div className="space-y-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Authentication</h2>
          <button
            onClick={testGet}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test GET (Auth Only)'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Role Permission</h2>
          <button
            onClick={testPost}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test POST (Requires Admin/Gerente)'}
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Este endpoint requiere rol de admin o gerente
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <h3 className="text-red-800 font-semibold">Error:</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 p-4 rounded">
            <h3 className="text-green-800 font-semibold mb-2">Result:</h3>
            <pre className="bg-white p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
```

#### 2. Navegar a la página de prueba

Visita: `http://localhost:3000/test-sdk`

---

### Opción 2: Testing con Thunder Client (VS Code)

1. **Instalar Thunder Client**
   - Extensión de VS Code para testing de APIs
   - Busca "Thunder Client" en extensiones

2. **Obtener tu token de Firebase**

   Opción A - Desde la consola del navegador:

   ```javascript
   // En la consola del navegador (cuando estés logueado)
   firebase
     .auth()
     .currentUser.getIdToken()
     .then(token => console.log(token));
   ```

   Opción B - Crear endpoint temporal:

   ```typescript
   // src/app/api/test/get-token/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { withAuth } from '@/lib/sdk/middleware/auth';

   export const GET = withAuth(async req => {
     return NextResponse.json({
       message: 'Copy the token from your Authorization header',
       user: req.user,
     });
   });
   ```

3. **Crear requests en Thunder Client**

   **Request 1: Test GET (Authentication)**

   ```
   Method: GET
   URL: http://localhost:3000/api/test/sdk
   Headers:
     Authorization: Bearer YOUR_FIREBASE_TOKEN_HERE
   ```

   **Request 2: Test POST (Role Permission)**

   ```
   Method: POST
   URL: http://localhost:3000/api/test/sdk
   Headers:
     Authorization: Bearer YOUR_FIREBASE_TOKEN_HERE
     Content-Type: application/json
   Body (JSON):
   {
     "testData": "Hello from Thunder Client",
     "timestamp": "2024-01-01T00:00:00Z"
   }
   ```

---

### Opción 3: Testing con cURL

```bash
# 1. Obtener tu token (desde la consola del navegador o endpoint)
TOKEN="tu_firebase_token_aqui"

# 2. Test GET - Authentication
curl -X GET http://localhost:3000/api/test/sdk \
  -H "Authorization: Bearer $TOKEN"

# 3. Test POST - Role Permission
curl -X POST http://localhost:3000/api/test/sdk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"testData":"Hello from cURL","timestamp":"2024-01-01T00:00:00Z"}'

# 4. Test sin token (debe fallar con 401)
curl -X GET http://localhost:3000/api/test/sdk

# 5. Test con token inválido (debe fallar con 401)
curl -X GET http://localhost:3000/api/test/sdk \
  -H "Authorization: Bearer invalid_token"
```

---

## 🔍 Casos de Prueba

### ✅ Casos que DEBEN funcionar:

1. **GET con token válido**
   - Debe retornar 200
   - Debe incluir información del usuario
   - Debe mostrar role, email, organizationId

2. **POST con token válido y rol correcto (admin/gerente)**
   - Debe retornar 201
   - Debe incluir los datos enviados
   - Debe confirmar el rol

### ❌ Casos que DEBEN fallar:

1. **GET sin token**
   - Debe retornar 401
   - Error: "No authorization header provided"

2. **GET con token inválido**
   - Debe retornar 401
   - Error: "Invalid or expired token"

3. **POST con rol incorrecto (empleado, jefe, auditor)**
   - Debe retornar 403
   - Error: "Required role: admin or gerente"

4. **Exceder rate limit (más de 50 requests por minuto en POST)**
   - Debe retornar 429
   - Error: "Rate limit exceeded"

---

## 📊 Verificar Logs

Los logs del servidor mostrarán:

```
✅ Firebase Admin SDK initialized successfully
✅ Auth success: user@example.com (gerente) - org-123
📝 SDK test endpoint accessed
```

---

## 🐛 Troubleshooting

### Error: "Missing required Firebase Admin SDK credentials"

**Solución:**

1. Verifica que `.env.local` existe
2. Verifica que las variables están configuradas:
   ```
   FIREBASE_PROJECT_ID=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
3. Reinicia el servidor: `npm run dev`

### Error: "Token has expired"

**Solución:**

1. Obtén un nuevo token
2. Los tokens de Firebase expiran después de 1 hora
3. Usa `getIdToken(true)` para forzar refresh

### Error: "User does not belong to any organization"

**Solución:**

1. El usuario necesita tener `organizationId` en sus custom claims
2. Usa el helper `setUserOrganization()` para asignarlo:
   ```typescript
   import { setUserOrganization } from '@/lib/sdk/helpers/customClaims';
   await setUserOrganization(userId, 'org-123');
   ```

### Error: "Required role: admin or gerente"

**Solución:**

1. El usuario necesita tener el rol correcto en custom claims
2. Usa el helper `setUserRole()`:
   ```typescript
   import { setUserRole } from '@/lib/sdk/helpers/customClaims';
   await setUserRole(userId, 'gerente');
   ```

---

## 🎯 Próximos Pasos

Una vez que estos tests básicos funcionen:

1. ✅ La autenticación está funcionando
2. ✅ Los middlewares están aplicándose correctamente
3. ✅ El manejo de errores funciona
4. ✅ El rate limiting está activo

Puedes proceder a:

- Migrar módulos específicos (Auditorías, Documentos, etc.)
- Crear más endpoints de prueba
- Implementar tests automatizados

---

## 📝 Checklist de Validación

- [ ] Servidor de desarrollo corriendo
- [ ] Variables de entorno configuradas
- [ ] Usuario autenticado en Firebase
- [ ] Token obtenido correctamente
- [ ] GET request exitoso (200)
- [ ] POST request exitoso con rol correcto (201)
- [ ] POST request fallido con rol incorrecto (403)
- [ ] Request sin token fallido (401)
- [ ] Logs visibles en consola del servidor
- [ ] Rate limiting funcionando (429 después de muchos requests)

---

## 💡 Tips

1. **Usa Thunder Client Collections**: Guarda tus requests en una colección para reutilizarlos
2. **Variables de entorno en Thunder Client**: Usa `{{token}}` para no copiar el token cada vez
3. **Inspecciona Network Tab**: En DevTools puedes ver exactamente qué se envía
4. **Revisa los logs del servidor**: Mucha información útil se imprime en la consola

---

¿Necesitas ayuda con algún paso específico? ¡Pregunta!
