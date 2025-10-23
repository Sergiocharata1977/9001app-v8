# Proyecto RRHH — Requerimientos y Prompt para IA

## Objetivo
Construir un módulo de Recursos Humanos en Next.js (App Router, TypeScript) con ABM para Departamentos, Puestos, Personal, Capacitaciones y Evaluaciones, usando Tailwind + Shadcn UI para la UI, Mongoose (MongoDB) para persistencia y Zod para validación.

**Índice**
- Modelos existentes (y campos)
- Modelos propuestos (Capacitaciones y Evaluaciones)
- Requerimientos funcionales
- Requerimientos técnicos
- Prompt para IA
- Observaciones y notas (Schema y Zod)
- Semillas de datos

---

## Modelos Existentes

### Department (models/Department.ts)
- Campos:
  - `name` (string, requerido, máx 100)
  - `description` (string, opcional, máx 500)
  - `responsible_user_id` (ObjectId, ref `User`, opcional)
  - `organization_id` (string, requerido, default `'org-001'`)
  - `is_active` (boolean, default `true`)
  - `created_at`, `updated_at` (timestamps automáticos)
- Índices:
  - Único: `organization_id + name`
  - Index: `organization_id + is_active`

### Position (models/Position.ts)
- Campos:
  - `id` (string, requerido, único)
  - `nombre` (string, requerido, máx 100)
  - `descripcion_responsabilidades` (string, opcional, máx 1000)
  - `requisitos_experiencia` (string, opcional, máx 500)
  - `requisitos_formacion` (string, opcional, máx 500)
  - `departamento_id` (string, opcional)
  - `reporta_a_id` (string, opcional)
  - `organization_id` (string, requerido, index)
  - `created_at`, `updated_at` (Date, default `Date.now`)
- Índices:
  - Único: `organization_id + id`
  - Index: `departamento_id`, `reporta_a_id`
- Middleware:
  - `pre('save')` para actualizar `updated_at`

### Personnel (models/Personnel.ts)
- Campos:
  - `id` (string, requerido, único)
  - `organization_id` (string, requerido, default `'org-002'`, index)
  - `nombres` (string, requerido, máx 50)
  - `apellidos` (string, requerido, máx 50)
  - `email` (string, requerido, patrón email)
  - `telefono` (string, opcional, máx 20)
  - `documento_identidad` (string, opcional, máx 20)
  - `fecha_nacimiento` (Date, opcional)
  - `nacionalidad` (string, opcional, máx 50)
  - `direccion` (string, opcional, máx 200)
  - `telefono_emergencia` (string, opcional, máx 20)
  - `fecha_contratacion` (Date, opcional)
  - `numero_legajo` (string, opcional, máx 20)
  - `estado` (string, default `'Activo'`)
  - `created_at`, `updated_at` (Date, default `Date.now`)
  - `meta_mensual` (number, default 0, min 0)
  - `comision_porcentaje` (number, default 0, min 0, max 100)
  - `supervisor_id` (string, opcional)
  - `especialidad_ventas` (string, opcional, máx 100)
  - `fecha_inicio_ventas` (Date, opcional)
  - `tipo_personal` (enum: `administrativo | ventas | técnico | supervisor | gerencial`, default `'administrativo'`)
  - `zona_venta` (string, opcional, máx 50)
- Índices:
  - Único: `organization_id + id`, `organization_id + email`
  - Index: `organization_id + estado`, `supervisor_id`, `tipo_personal`
- Métodos de instancia:
  - `getFullName()`, `activate()`, `deactivate()`
- Nota:
  - Hay un index declarado sobre `departamento_id`, pero el campo no existe en el schema. Ajustar (agregar campo o remover index).

---

## Modelos Propuestos

### Capacitaciones (Training)
- Campos:
  - `id` (string, requerido, único)
  - `organization_id` (string, requerido, index)
  - `tema` (string, requerido, máx 150)
  - `descripcion` (string, opcional, máx 1000)
  - `fecha_inicio` (Date, requerido)
  - `fecha_fin` (Date, requerido)
  - `horas` (number, opcional, min 0)
  - `modalidad` (enum: `presencial | virtual | mixta`)
  - `proveedor` (string, opcional, máx 150)
  - `costo` (number, opcional, min 0)
  - `estado` (enum: `planificada | en_curso | completada | cancelada`, default `planificada`)
  - `certificado_url` (string, opcional)
  - `participantes` (array de `personnel_id`)
  - `created_at`, `updated_at`
- Índices:
  - Único: `organization_id + id`
  - Index: `organization_id + tema + fecha_inicio`, `organization_id + estado`

### Evaluaciones de Personal (PerformanceEvaluation)
- Campos:
  - `id` (string, requerido, único)
  - `organization_id` (string, requerido, index)
  - `personnel_id` (string/ObjectId, requerido)
  - `periodo` (string, ejemplo `2025-Q1` o rango)
  - `fecha_evaluacion` (Date, requerido)
  - `evaluador_id` (string/ObjectId, requerido)
  - `competencias` (array de objetos):
    - `{ nombre: string, puntaje: number 0–5, comentario?: string }`
  - `resultado_global` (enum: `bajo | medio | alto | excelente`)
  - `comentarios_generales` (string, opcional, máx 1000)
  - `plan_mejora` (string, opcional, máx 1000)
  - `estado` (enum: `borrador | publicado | cerrado`, default `borrador`)
  - `created_at`, `updated_at`
- Índices:
  - Único: `organization_id + personnel_id + periodo`
  - Index: `organization_id + estado`

---

## Requerimientos Funcionales
- ABM para Departamentos, Puestos, Personal, Capacitaciones y Evaluaciones.
- Relaciones:
  - Puesto pertenece a Departamento (`departamento_id`).
  - Personal pertenece a Departamento y puede tener `Puesto` y `supervisor_id`.
  - Capacitaciones relacionan múltiples `Personal` como `participantes`.
  - Evaluaciones relacionan `Personal` y `Evaluador`.
- Búsqueda y filtros: `organization_id`, estado, departamento, periodo, texto.
- Validaciones en formularios con Zod, alineadas a reglas de Mongoose.
- Estados y flujos:
  - Activar/Inactivar personal.
  - Publicar/Cerrar evaluaciones.
  - Completar/Cancelar capacitaciones.
- Auditoría: timestamps y usuario responsable (cuando aplique).
- Multi-organización: `organization_id` presente en todas las entidades.

---

## Requerimientos Técnicos
- Stack:
  - Next.js (App Router), TypeScript, Tailwind, Shadcn UI, Mongoose (MongoDB), Zod.
- API Routes por entidad:
  - `GET` paginado y con filtros; `POST`, `PUT/PATCH`, `DELETE`.
  - Validación Zod en la capa de entrada.
- Modelos Mongoose con índices declarados como arriba.
- Autenticación y roles:
  - `admin_rrhh`, `supervisor`, `empleado`; protección de rutas y acciones.
- Paginación y ordenamiento estándar (page, limit, sort).
- Env vars: `MONGODB_URI`, `NEXTAUTH_SECRET` (si aplica), etc.
- Tests básicos de servicios y validaciones.
- Seed inicial: 2–3 departamentos, 5 puestos, 10 personas, 3 capacitaciones, 3 evaluaciones.
- Documentación de instalación y comandos dev.

---

## Prompt para IA

Crea un proyecto Next.js (App Router, TypeScript) de RRHH con módulos: Departamentos, Puestos, Personal, Capacitaciones y Evaluaciones. Usa Tailwind + Shadcn UI para UI, Mongoose para persistencia en MongoDB, y Zod para validación. Implementa ABM y API Routes con validaciones coherentes con los siguientes modelos y reglas:

- Department
  - Campos: `name` (req, máx 100), `description` (máx 500), `responsible_user_id` (ObjectId), `organization_id` (req, default `'org-001'`), `is_active` (bool), timestamps.
  - Índices: único `organization_id + name`; index `organization_id + is_active`.
- Position
  - Campos: `id` (req, único), `nombre` (req, máx 100), `descripcion_responsabilidades` (máx 1000), `requisitos_experiencia` (máx 500), `requisitos_formacion` (máx 500), `departamento_id` (string), `reporta_a_id` (string), `organization_id` (req, index), `created_at`, `updated_at` (actualizar en `pre('save')`).
  - Índices: único `organization_id + id`; index `departamento_id`; index `reporta_a_id`.
- Personnel
  - Campos: `id` (req, único), `organization_id` (req, default `'org-002'`, index), `nombres` (req, máx 50), `apellidos` (req, máx 50), `email` (req, patrón email), `telefono` (máx 20), `documento_identidad` (máx 20), `fecha_nacimiento`, `nacionalidad` (máx 50), `direccion` (máx 200), `telefono_emergencia` (máx 20), `fecha_contratacion`, `numero_legajo` (máx 20), `estado` (default `'Activo'`), `created_at`, `updated_at`, `meta_mensual` (min 0), `comision_porcentaje` (0–100), `supervisor_id` (string), `especialidad_ventas` (máx 100), `fecha_inicio_ventas`, `tipo_personal` (enum: `administrativo | ventas | técnico | supervisor | gerencial`), `zona_venta` (máx 50).
  - Índices: único `organization_id + id`, único `organization_id + email`, index `organization_id + estado`, index `supervisor_id`, index `tipo_personal`. Si defines index sobre `departamento_id`, asegúrate de incluir el campo en el modelo.
- Training (Capacitaciones)
  - Campos: `id`, `organization_id`, `tema` (req), `descripcion`, `fecha_inicio`, `fecha_fin`, `horas`, `modalidad` (`presencial | virtual | mixta`), `proveedor`, `costo`, `estado` (`planificada | en_curso | completada | cancelada`), `certificado_url`, `participantes` (array `personnel_id`).
  - Índices: `organization_id + tema + fecha_inicio`, `organization_id + estado`.
- PerformanceEvaluation (Evaluaciones)
  - Campos: `id`, `organization_id`, `personnel_id`, `periodo`, `fecha_evaluacion`, `evaluador_id`, `competencias` [{ `nombre`, `puntaje` 0–5, `comentario` }], `resultado_global` (enum o number), `comentarios_generales`, `plan_mejora`, `estado` (`borrador | publicado | cerrado`).
  - Índices: `organization_id + personnel_id + periodo`, `organization_id + estado`.

Requisitos adicionales:
- Formularios con Zod que reflejen reglas (límites de texto, enums, patrones).
- Listados con filtros por organización, estado, departamento, periodo y búsqueda por texto.
- Acciones: activar/inactivar personal; publicar/cerrar evaluaciones; completar/cancelar capacitaciones.
- API Routes: `GET` (paginado y filtros), `POST`, `PUT/PATCH`, `DELETE` por entidad.
- Auth y roles básicos (`admin_rrhh`, `supervisor`, `empleado`) y protección de rutas.
- Semillas de datos: 3 departamentos, 5 puestos, 10 empleados, 3 capacitaciones, 3 evaluaciones.
- Variables de entorno: `MONGODB_URI`; documenta cómo correr y seedear.

Entrega:
- Modelos Mongoose, endpoints, componentes Shadcn (formularios, tablas), validaciones Zod y pruebas mínimas de servicios.
- Documentación de instalación, variables y comandos para dev.

---

## Observaciones y Notas

**Importar `Schema`:**
- Si usás Mongoose para definir modelos, es importante importar `Schema` desde `mongoose` para construir los esquemas (`import { Schema } from 'mongoose'`).

**Zod:**
- Usar Zod para validar datos de entrada en formularios y API mejora la coherencia y seguridad. Es altamente recomendable.

**Inconsistencias a corregir:**
- `PersonnelSchema` declara un índice sobre `departamento_id` pero el campo no existe. Ajustar (agregar el campo en el modelo o remover el índice).

---

## Semillas de Datos (Sugeridas)
- Departamentos: `Operaciones`, `Ventas`, `RRHH`
- Puestos: `Analista`, `Supervisor`, `Gerente`, `Ejecutivo de Ventas`, `Asistente RRHH`
- Personal: 10 empleados con distribución en 3 departamentos y 5 puestos
- Capacitaciones: 3 actividades (seguridad laboral, ventas consultivas, liderazgo)
- Evaluaciones: 3 ciclos (ej. `2025-Q1`, `2025-Q2`, `2025-Q3`) para diferentes empleados