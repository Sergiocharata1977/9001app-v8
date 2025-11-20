# Análisis: Rediseño del Sistema de Auditorías

## Fecha: 10 de noviembre de 2025

---

## 📋 Objetivo del Rediseño

Simplificar el sistema de auditorías para que sea un **ABM básico** enfocado en:

1. Verificar que todos los puntos de la norma ISO 9001 estén aplicados
2. Listar puntos de norma y marcar cuáles están implementados
3. Preparar la estructura para futuras relaciones con hallazgos, procesos y documentos
4. **SIN relaciones activas** en esta fase

---

## 🔍 Análisis del Sistema Actual vs Requisitos Nuevos

### ✅ Lo que YA está bien y se mantiene:

1. **Estructura de colección Firestore** (`audits`)
2. **Estados de auditoría**: `planned`, `in_progress`, `completed`
3. **Vistas múltiples**: Kanban, Lista, Tarjeta
4. **Formulario de planificación** básico
5. **Vista single sin tabs**
6. **Puntos de norma hardcodeados** desde `iso9001-norm-points.ts`
7. **Operaciones CRUD** completas

### ❌ Lo que hay que CAMBIAR:

| Campo Actual               | Problema                          | Solución Nueva                                                   |
| -------------------------- | --------------------------------- | ---------------------------------------------------------------- |
| `processes: string[]`      | Se usa como texto libre           | Mantener como array pero preparar para IDs futuros               |
| `normPointCodes: string[]` | Solo guarda códigos seleccionados | **CAMBIAR**: Guardar TODOS los puntos con estado de verificación |
| `findings: string`         | Texto libre de hallazgos          | **ELIMINAR**: Los hallazgos se crearán desde otra pantalla       |
| `leadAuditor: string`      | Texto libre                       | Mantener pero preparar para ID de usuario                        |
| `description: string`      | Campo genérico                    | **CAMBIAR** a `scope` (alcance de la auditoría)                  |

### 🆕 Campos NUEVOS a agregar:

| Campo                         | Tipo      | Descripción                                       |
| ----------------------------- | --------- | ------------------------------------------------- |
| `auditNumber`                 | string    | Número único de auditoría (ej: AUD-2025-001)      |
| `executionDate`               | Timestamp | Fecha real de ejecución (diferente a plannedDate) |
| `scope`                       | string    | Alcance de la auditoría (reemplaza description)   |
| `normPointsVerification`      | array     | Array de objetos con verificación de cada punto   |
| `openingMeeting`              | object    | Datos de reunión de apertura                      |
| `closingMeeting`              | object    | Datos de reunión de cierre                        |
| `reportDelivery`              | object    | Datos de entrega del informe                      |
| `previousActionsVerification` | string    | Texto sobre verificación de acciones previas      |

---

## 📊 Nueva Estructura de Datos

### Modelo de Auditoría Rediseñado:

```typescript
interface Audit {
  // Identificación
  id: string;
  auditNumber: string; // NUEVO: AUD-2025-001

  // Planificación
  title: string;
  scope: string; // NUEVO: Reemplaza description
  plannedDate: Timestamp;
  executionDate: Timestamp | null; // NUEVO
  leadAuditor: string; // Mantener como string por ahora
  leadAuditorId: string | null; // NUEVO: Preparar para futuro

  // Estado
  status: 'planned' | 'in_progress' | 'completed';

  // Verificación de Puntos de Norma (CAMBIO IMPORTANTE)
  normPointsVerification: NormPointVerification[];

  // Procesos (mantener simple)
  processes: string[]; // Mantener como array de strings
  processIds: string[] | null; // NUEVO: Preparar para futuro

  // Reuniones y Documentación (NUEVO)
  openingMeeting: OpeningMeeting | null;
  closingMeeting: ClosingMeeting | null;
  reportDelivery: ReportDelivery | null;
  previousActionsVerification: string | null;

  // Observaciones generales
  observations: string | null; // NUEVO

  // Metadatos
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  createdByName: string;
  isActive: boolean;
}

interface NormPointVerification {
  normPointCode: string; // "4.1", "5.2", etc.
  normPointId: string | null; // Preparar para futuro
  isVerified: boolean; // ¿Está implementado?
  processes: string[]; // Procesos donde se aplica (texto libre)
  processIds: string[] | null; // Preparar para futuro
  observations: string | null; // Observaciones específicas del punto
}

interface OpeningMeeting {
  date: Timestamp;
  participants: Participant[];
  notes: string | null;
}

interface ClosingMeeting {
  date: Timestamp;
  participants: Participant[];
  notes: string | null;
}

interface Participant {
  name: string;
  role: string;
  userId: string | null; // Preparar para futuro
}

interface ReportDelivery {
  date: Timestamp;
  deliveredBy: string;
  receivedBy: string[];
  notes: string | null;
}
```

---

## 🎯 Cambios en la UI

### 1. Formulario de Planificación (Alta)

**Campos actuales a mantener:**

- ✅ Título
- ✅ Fecha planificada
- ✅ Auditor líder

**Campos a cambiar:**

- ❌ Description → ✅ Scope (Alcance)

**Campos nuevos:**

- ✅ Número de auditoría (auto-generado)

### 2. Vista de Ejecución (Single Page)

**Secciones actuales a ELIMINAR:**

- ❌ Campo de texto "Hallazgos" (se crearán desde otra pantalla)

**Secciones actuales a MODIFICAR:**

- 🔄 **Puntos de la Norma**: En lugar de checkboxes simples, mostrar:
  - Checkbox de verificación
  - Campo de procesos relacionados (texto libre)
  - Campo de observaciones por punto

**Secciones NUEVAS a agregar:**

- ✅ **Fecha de Ejecución** (cuando se inicia)
- ✅ **Verificación de Acciones Previas** (textarea)
- ✅ **Reunión de Apertura**:
  - Fecha
  - Lista de participantes (nombre + función)
  - Notas
- ✅ **Reunión de Cierre**:
  - Fecha
  - Lista de participantes (nombre + función)
  - Notas
- ✅ **Entrega del Informe**:
  - Fecha
  - Entregado por
  - Recibido por (lista)
  - Notas

### 3. Vistas de Listado

**Mantener:**

- ✅ Kanban por estado
- ✅ Lista
- ✅ Tarjetas

**Agregar en las tarjetas:**

- ✅ Número de auditoría
- ✅ Alcance (en lugar de descripción)
- ✅ Fecha de ejecución (si existe)

---

## 🔄 Flujo de Trabajo Rediseñado

### Fase 1: Planificación

1. Usuario crea auditoría con datos básicos
2. Sistema genera número único (AUD-2025-001)
3. Estado: `planned`

### Fase 2: Inicio de Ejecución

1. Usuario hace clic en "Iniciar Ejecución"
2. Sistema cambia estado a `in_progress`
3. Sistema registra `executionDate`
4. Se habilitan campos de ejecución

### Fase 3: Ejecución

1. Usuario registra **Reunión de Apertura**
2. Usuario registra **Verificación de Acciones Previas**
3. Usuario verifica **cada punto de la norma**:
   - Marca si está implementado
   - Indica en qué procesos
   - Agrega observaciones
4. Usuario registra **Reunión de Cierre**
5. Usuario registra **Entrega del Informe**

### Fase 4: Completar

1. Usuario hace clic en "Completar Auditoría"
2. Sistema valida que se hayan verificado todos los puntos
3. Estado: `completed`

---

## 📝 Cambios en Validaciones

### Validaciones NUEVAS:

1. **Al completar auditoría**:
   - Todos los puntos de norma deben estar verificados (marcados como sí o no)
   - Debe existir fecha de ejecución
   - Debe existir reunión de apertura
   - Debe existir reunión de cierre

2. **Reunión de apertura/cierre**:
   - Al menos 1 participante
   - Fecha requerida

3. **Entrega de informe**:
   - Fecha requerida
   - Entregado por requerido
   - Al menos 1 receptor

---

## 🗂️ Archivos a Modificar

### 1. Types

- ✅ `src/types/audits.ts` - Actualizar interfaces

### 2. Validations

- ✅ `src/lib/validations/audits.ts` - Actualizar schemas Zod

### 3. Services

- ✅ `src/services/audits/AuditService.ts` - Actualizar lógica de negocio

### 4. API Routes

- ✅ `src/app/api/audits/route.ts` - Actualizar endpoints
- ✅ `src/app/api/audits/[id]/route.ts`
- ✅ `src/app/api/audits/[id]/execution/route.ts` - NUEVO
- ✅ `src/app/api/audits/[id]/status/route.ts`

### 5. Components

- ✅ `src/components/audits/AuditFormDialog.tsx` - Actualizar formulario
- ✅ `src/components/audits/AuditCard.tsx` - Actualizar tarjeta
- ✅ `src/components/audits/NormPointVerificationForm.tsx` - NUEVO
- ✅ `src/components/audits/MeetingForm.tsx` - NUEVO
- ✅ `src/components/audits/ReportDeliveryForm.tsx` - NUEVO

### 6. Pages

- ✅ `src/app/(dashboard)/auditorias/[id]/page.tsx` - Rediseñar completamente
- ✅ `src/app/(dashboard)/auditorias/page.tsx` - Actualizar listado

---

## 🚀 Plan de Implementación

### Sprint 1: Estructura de Datos

1. Actualizar `types/audits.ts`
2. Actualizar `validations/audits.ts`
3. Actualizar `AuditService.ts`
4. Migrar datos existentes (script)

### Sprint 2: API

1. Actualizar endpoints existentes
2. Crear nuevos endpoints
3. Probar con Postman/Thunder Client

### Sprint 3: Componentes Nuevos

1. `NormPointVerificationForm`
2. `MeetingForm`
3. `ReportDeliveryForm`

### Sprint 4: Actualizar UI

1. Actualizar formulario de planificación
2. Rediseñar página de ejecución
3. Actualizar tarjetas y listados

### Sprint 5: Testing y Ajustes

1. Pruebas de flujo completo
2. Ajustes de UX
3. Documentación

---

## ⚠️ Consideraciones Importantes

1. **Migración de datos**: Las auditorías existentes necesitarán migración
2. **Backward compatibility**: Considerar auditorías antiguas
3. **Performance**: Verificar que la carga de todos los puntos de norma no sea lenta
4. **UX**: La página de ejecución será más larga, considerar scroll y navegación
5. **Validaciones**: Ser estrictos al completar pero flexibles durante ejecución

---

## 🔮 Preparación para Futuras Fases

### Campos preparados para relaciones futuras:

- `leadAuditorId` → Relación con usuarios
- `processIds` → Relación con procesos
- `normPointId` en verificaciones → Relación con puntos de norma en Firestore
- `userId` en participantes → Relación con usuarios

### Relaciones que se agregarán después:

1. **Fase 2**: Auditoría → Hallazgos (crear hallazgos desde auditoría)
2. **Fase 3**: Auditoría → Procesos (selector en lugar de texto)
3. **Fase 4**: Auditoría → Puntos de Norma (desde Firestore)
4. **Fase 5**: Auditoría → Documentos (adjuntar evidencias)

---

## ✅ Confirmación Requerida

Antes de proceder con la implementación, confirmar:

1. ¿La estructura de `NormPointVerification` es correcta?
2. ¿Las secciones de reuniones y entrega de informe son necesarias?
3. ¿Eliminar completamente el campo de hallazgos?
4. ¿Mantener procesos como texto libre o ya relacionar?
5. ¿Algún campo adicional del documento de auditoría que falta?
