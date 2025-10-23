# Prompt para Solución Sistemática de Errores de Build - Next.js 16

## 🎯 Objetivo
Solucionar errores de build de Next.js 16 de forma sistemática, uno por uno, ejecutando build después de cada corrección para verificar que funciona.

## 📋 Contexto del Proyecto
- **Framework**: Next.js 16.0.0 con Turbopack
- **Tipo**: Sistema ISO 9001 con módulo RRHH
- **Tecnologías**: TypeScript, Firebase, Tailwind CSS, Shadcn/ui
- **Estructura**: App Router con rutas API

## 🚨 Error Actual Identificado
```
Type error: Type 'typeof import(".../route")' does not satisfy the constraint 'RouteHandlerConfig<"/api/rrhh/departments/[id]">'.
Types of property 'GET' are incompatible.
Type '(request: NextRequest, { params }: { params: { id: string; }; }) => Promise<NextResponse<Department> | NextResponse<{ error: string; }>>' is not assignable to type 
'(request: NextRequest, context: { params: Promise<{ id: string; }>; }) => void | Response | Promise<void | Response>'.
```

## 🔧 Problema Específico
En Next.js 16, los `params` en las rutas API dinámicas ahora son una **Promise** y deben ser manejados con `await`.

## 📁 Archivos a Corregir
Buscar y corregir TODOS los archivos de rutas API que tengan parámetros dinámicos:

### Patrón de búsqueda:
- `src/app/api/**/[id]/route.ts`
- `src/app/api/**/[slug]/route.ts`
- Cualquier archivo que tenga `{ params }: { params: { id: string } }`

### Archivos específicos a revisar:
1. `src/app/api/rrhh/departments/[id]/route.ts`
2. `src/app/api/rrhh/personnel/[id]/route.ts`
3. `src/app/api/rrhh/positions/[id]/route.ts`
4. `src/app/api/rrhh/trainings/[id]/route.ts`
5. `src/app/api/rrhh/evaluations/[id]/route.ts`

## 🛠️ Solución Requerida

### Antes (Next.js 15):
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  // ... resto del código
}
```

### Después (Next.js 16):
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ... resto del código
}
```

## 📝 Proceso Sistemático

### Paso 1: Identificar archivos problemáticos
```bash
# Buscar archivos con parámetros dinámicos
find src/app/api -name "route.ts" -exec grep -l "params.*:" {} \;
```

### Paso 2: Corregir cada archivo
Para cada archivo encontrado:

1. **Abrir el archivo**
2. **Cambiar la signatura de la función**:
   - De: `{ params }: { params: { id: string } }`
   - A: `{ params }: { params: Promise<{ id: string }> }`
3. **Agregar await a params**:
   - De: `const { id } = params;`
   - A: `const { id } = await params;`
4. **Verificar que todas las funciones** (GET, POST, PUT, DELETE) estén corregidas

### Paso 3: Ejecutar build después de cada corrección
```bash
npm run build
```

### Paso 4: Si hay error, identificar el siguiente archivo problemático
- Leer el mensaje de error completo
- Identificar el archivo específico
- Aplicar la misma corrección
- Repetir hasta que el build sea exitoso

## 🔍 Patrones de Búsqueda Adicionales

### Buscar en el código:
```typescript
// Patrón 1: Parámetros simples
{ params }: { params: { id: string } }

// Patrón 2: Parámetros múltiples
{ params }: { params: { id: string; slug: string } }

// Patrón 3: Parámetros opcionales
{ params }: { params: { id?: string } }
```

### Reemplazar con:
```typescript
// Patrón 1: Parámetros simples
{ params }: { params: Promise<{ id: string }> }

// Patrón 2: Parámetros múltiples
{ params }: { params: Promise<{ id: string; slug: string }> }

// Patrón 3: Parámetros opcionales
{ params }: { params: Promise<{ id?: string }> }
```

## ⚠️ Consideraciones Importantes

1. **NO cambiar** archivos que no tengan parámetros dinámicos
2. **Verificar** que todas las funciones en el archivo estén corregidas
3. **Mantener** la lógica de negocio intacta
4. **Ejecutar build** después de cada corrección
5. **Leer cuidadosamente** los mensajes de error para identificar el siguiente archivo

## 🎯 Resultado Esperado
- Build exitoso sin errores de TypeScript
- Todas las rutas API funcionando correctamente
- Compatibilidad completa con Next.js 16

## 📋 Checklist de Verificación
- [ ] Identificar todos los archivos con parámetros dinámicos
- [ ] Corregir signatura de funciones
- [ ] Agregar await a params
- [ ] Ejecutar build después de cada corrección
- [ ] Verificar que no hay errores de TypeScript
- [ ] Confirmar que todas las rutas API funcionan

## 🚀 Comando Final
```bash
npm run build
```

**El build debe completarse exitosamente sin errores.**

---

**Instrucciones**: Ejecuta este proceso paso a paso, corrigiendo un archivo a la vez y ejecutando build después de cada corrección. No pases al siguiente archivo hasta que el build actual sea exitoso.
