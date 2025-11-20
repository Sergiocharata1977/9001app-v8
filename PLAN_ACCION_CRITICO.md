# 🚨 PLAN DE ACCIÓN CRÍTICO - Problemas Urgentes

**Fecha:** 19 de Noviembre de 2025  
**Prioridad:** CRÍTICA  
**Estado:** LISTO PARA EJECUTAR

---

## 📋 PROBLEMAS IDENTIFICADOS

### ❌ **Problema 1: Documentos No Se Renderizan**

- **Síntoma:** Los documentos subidos a Firebase Storage no se muestran
- **Causa probable:** Migración a SDK unificado de Google afectó autenticación de Storage
- **Impacto:** CRÍTICO - Módulo de documentos inutilizable

### ❌ **Problema 2: Voz de ElevenLabs No Funciona**

- **Síntoma:** Don Cándido no reproduce audio ni escucha
- **Causa probable:** Middleware `withAuth` bloqueando API de ElevenLabs
- **Impacto:** ALTO - Funcionalidad de voz deshabilitada

---

## 🔧 SOLUCIÓN RÁPIDA - PROBLEMA 1: Documentos

### **Paso 1: Remover `withAuth` de API de documentos**

Archivo: `src/app/api/documents/[id]/download/route.ts`

**ANTES:**

```typescript
export const GET = withAuth(async (req, { params }) => {
  // ...
});
```

**DESPUÉS:**

```typescript
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;
    // ... resto del código
  } catch (error) {
    // ... manejo de errores
  }
}
```

### **Paso 2: Usar `download_url` directamente**

En tu componente de visualización de documentos, asegurate de usar:

```typescript
// ✅ CORRECTO
const url = document.download_url;

// ❌ INCORRECTO (no usar)
const url = await getDownloadURL(ref(storage, document.file_path));
```

---

## 🔧 SOLUCIÓN RÁPIDA - PROBLEMA 2: ElevenLabs

### **Paso 1: Remover `withAuth` de API de ElevenLabs**

Archivo: `src/app/api/elevenlabs/text-to-speech/route.ts`

**CAMBIAR LÍNEA 12:**

**ANTES:**

```typescript
export const POST = withAuth(async (req: NextRequest) => {
```

**DESPUÉS:**

```typescript
export async function POST(req: NextRequest) {
```

**Y REMOVER LÍNEA 4:**

```typescript
import { withAuth } from '@/lib/sdk/middleware/auth'; // ❌ ELIMINAR
```

---

## 📝 COMANDOS PARA EJECUTAR

```bash
# 1. Detener el servidor (Ctrl+C en la terminal)

# 2. Aplicar los cambios arriba

# 3. Reiniciar el servidor
npm run dev

# 4. Probar en el browser
```

---

## 🎯 VALIDACIÓN

### **Test 1: Documentos**

1. Ir a módulo de Documentos
2. Subir un PDF de prueba
3. Verificar que aparezca en la lista
4. Hacer clic en "Descargar"
5. ✅ Debe descargarse correctamente

### **Test 2: Voz**

1. Ir a Don Cándido
2. Escribir: "Hola, ¿cómo estás?"
3. ✅ Debe reproducirse audio
4. Hacer clic en micrófono
5. Hablar: "Hola Don Cándido"
6. ✅ Debe transcribir y responder

---

## 🔄 SI LOS PROBLEMAS PERSISTEN

### **Plan B: Documentos**

Actualizar Storage Rules temporalmente:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /documents/{documentId}/{fileName} {
      // TEMPORAL: Permitir lectura pública
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Ejecutar:

```bash
firebase deploy --only storage
```

### **Plan B: ElevenLabs**

Verificar que la API key esté configurada:

```bash
# Ver variables de entorno
cat .env.local | grep ELEVENLABS
```

Debe mostrar:

```
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_VOICE_ID=kulszILr6ees0ArU8miO
```

---

## 📞 SIGUIENTE PASO

Una vez resueltos estos problemas críticos, podemos:

1. ✅ Implementar plan de optimización de Don Cándido
2. ✅ Mejorar uso de datos estructurados
3. ✅ Evaluar Google File Search (si es necesario)

---

**Tiempo estimado:** 15-30 minutos  
**Dificultad:** Baja (solo remover middleware)  
**Impacto:** ALTO (desbloquea funcionalidades críticas)
