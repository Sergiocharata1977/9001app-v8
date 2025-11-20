# 🚀 Quick Start - Testing del SDK

## Paso 1: Configurar Variables de Entorno

1. Copia el archivo de ejemplo:

   ```bash
   copy .env.example .env.local
   ```

2. Completa las credenciales de Firebase Admin SDK en `.env.local`:

   ```env
   FIREBASE_PROJECT_ID=tu-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk@tu-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

3. **¿Cómo obtener las credenciales?**
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Selecciona tu proyecto
   - Ve a Project Settings (⚙️) > Service Accounts
   - Click en "Generate New Private Key"
   - Copia los valores del JSON descargado a tu `.env.local`

## Paso 2: Iniciar el Servidor

```bash
npm run dev
```

## Paso 3: Probar desde el Frontend

1. **Inicia sesión** en tu aplicación con un usuario de Firebase

2. **Navega a la página de testing**:

   ```
   http://localhost:3000/test-sdk
   ```

3. **Ejecuta las pruebas**:
   - Click en "Get Token" para obtener tu token
   - Click en "Test GET" para probar autenticación básica
   - Click en "Test POST" para probar permisos de rol

## Paso 4: Probar con Thunder Client (Opcional)

### Instalar Thunder Client

1. Abre VS Code
2. Ve a Extensions (Ctrl+Shift+X)
3. Busca "Thunder Client"
4. Instala la extensión

### Crear Requests

**Request 1: Get Token**

```
Method: GET
URL: http://localhost:3000/api/test/get-token
Headers:
  Authorization: Bearer TU_TOKEN_AQUI
```

**Request 2: Test Authentication**

```
Method: GET
URL: http://localhost:3000/api/test/sdk
Headers:
  Authorization: Bearer TU_TOKEN_AQUI
```

**Request 3: Test Role Permission**

```
Method: POST
URL: http://localhost:3000/api/test/sdk
Headers:
  Authorization: Bearer TU_TOKEN_AQUI
  Content-Type: application/json
Body (JSON):
{
  "testData": "Hello from Thunder Client",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## ✅ Resultados Esperados

### Test GET (Authentication) - Debe retornar:

```json
{
  "success": true,
  "message": "SDK is working correctly!",
  "user": {
    "uid": "user-id",
    "email": "user@example.com",
    "role": "empleado",
    "organizationId": "org-123",
    "permissions": []
  }
}
```

### Test POST (Role Permission) - Si tienes rol admin/gerente:

```json
{
  "success": true,
  "message": "POST request successful! You have the required role.",
  "user": {
    "uid": "user-id",
    "email": "user@example.com",
    "role": "gerente"
  },
  "receivedData": {
    "testData": "Hello from Thunder Client"
  }
}
```

### Test POST - Si NO tienes rol admin/gerente:

```json
{
  "success": false,
  "error": "Access denied. Required role: admin or gerente. Your role: empleado",
  "code": "FORBIDDEN"
}
```

## 🐛 Problemas Comunes

### Error: "Missing required Firebase Admin SDK credentials"

**Solución:**

1. Verifica que `.env.local` existe
2. Verifica que las variables están correctamente configuradas
3. Reinicia el servidor: `Ctrl+C` y luego `npm run dev`

### Error: "No user logged in"

**Solución:**

1. Asegúrate de estar logueado en la aplicación
2. Verifica que el contexto de autenticación está funcionando
3. Revisa la consola del navegador para errores de Firebase Auth

### Error: "Token has expired"

**Solución:**

1. Los tokens de Firebase expiran después de 1 hora
2. Obtén un nuevo token haciendo click en "Get Token" nuevamente
3. O refresca la página para obtener un nuevo token automáticamente

### Error: "User does not belong to any organization"

**Solución:**
Tu usuario necesita tener `organizationId` en sus custom claims. Puedes asignarlo con:

```typescript
import { setUserOrganization } from '@/lib/sdk/helpers/customClaims';
await setUserOrganization('user-id', 'org-123');
```

### Error: "Required role: admin or gerente"

**Solución:**
Tu usuario necesita tener el rol correcto. Puedes asignarlo con:

```typescript
import { setUserRole } from '@/lib/sdk/helpers/customClaims';
await setUserRole('user-id', 'gerente');
```

## 📊 Verificar en la Consola del Servidor

Deberías ver logs como:

```
✅ Firebase Admin SDK initialized successfully
   Project ID: tu-project-id
   Storage Bucket: tu-project.appspot.com
✅ Auth success: user@example.com (gerente) - org-123
📝 SDK test endpoint accessed
```

## 🎯 Checklist de Validación

- [ ] Servidor corriendo sin errores
- [ ] Variables de entorno configuradas
- [ ] Usuario logueado en la aplicación
- [ ] Página /test-sdk carga correctamente
- [ ] "Get Token" funciona y muestra el token
- [ ] "Test GET" retorna 200 con información del usuario
- [ ] "Test POST" retorna 201 (si tienes rol correcto) o 403 (si no)
- [ ] Logs visibles en la consola del servidor

## 🎉 ¡Listo!

Si todos los tests pasan, tu SDK está funcionando correctamente y puedes proceder a:

- Migrar módulos específicos (Auditorías, Documentos, etc.)
- Implementar nuevos endpoints
- Crear tests automatizados

---

**¿Necesitas ayuda?** Revisa el archivo `SDK_TESTING_GUIDE.md` para más detalles.
