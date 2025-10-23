# 🚀 PROMPT PARA IA - MÓDULO RRHH ISO 9001 (FIREBASE)

## 📋 CONTEXTO DEL PROYECTO
Estás trabajando en un sistema de gestión de normas ISO 9001 desarrollado en **Next.js 14** con **Firebase Firestore**. El sistema ya tiene:
- ✅ Autenticación con Firebase configurada
- ✅ Dashboard principal funcionando
- ✅ Estructura de carpetas organizada
- ✅ TypeScript y Tailwind CSS configurados
- ✅ Prettier configurado

## 🎯 OBJETIVO
Implementar el **módulo completo de Recursos Humanos** con las siguientes entidades:
1. **Departamentos**
2. **Puestos** 
3. **Personal**
4. **Capacitaciones**
5. **Evaluaciones de Desempeño**

## 🛠️ STACK TECNOLÓGICO
- **Next.js 14** (App Router)
- **TypeScript** (estricto)
- **Firebase Firestore** (base de datos)
- **Tailwind CSS** (estilos)
- **Zod** (validaciones)
- **Shadcn/ui** (componentes UI)

## 📊 MODELOS DE DATOS (FIREBASE FIRESTORE)

### 1. DEPARTMENT (Departamentos)
```typescript
interface Department {
  id: string;
  name: string; // requerido, máx 100 chars
  description?: string; // opcional, máx 500 chars
  responsible_user_id?: string; // ID del usuario responsable
  is_active: boolean; // default true
  created_at: Date;
  updated_at: Date;
}
```

### 2. POSITION (Puestos)
```typescript
interface Position {
  id: string;
  nombre: string; // requerido, máx 100 chars
  descripcion_responsabilidades?: string; // opcional, máx 1000 chars
  requisitos_experiencia?: string; // opcional, máx 500 chars
  requisitos_formacion?: string; // opcional, máx 500 chars
  departamento_id?: string; // referencia a Department
  reporta_a_id?: string; // referencia a otro Position
  created_at: Date;
  updated_at: Date;
}
```

### 3. PERSONNEL (Personal)
```typescript
interface Personnel {
  id: string;
  nombres: string; // requerido, máx 50 chars
  apellidos: string; // requerido, máx 50 chars
  email: string; // requerido, patrón email
  telefono?: string; // opcional, máx 20 chars
  documento_identidad?: string; // opcional, máx 20 chars
  fecha_nacimiento?: Date;
  nacionalidad?: string; // opcional, máx 50 chars
  direccion?: string; // opcional, máx 200 chars
  telefono_emergencia?: string; // opcional, máx 20 chars
  fecha_contratacion?: Date;
  numero_legajo?: string; // opcional, máx 20 chars
  estado: 'Activo' | 'Inactivo'; // default 'Activo'
  meta_mensual: number; // default 0, min 0
  comision_porcentaje: number; // default 0, min 0, max 100
  supervisor_id?: string; // referencia a otro Personnel
  especialidad_ventas?: string; // opcional, máx 100 chars
  fecha_inicio_ventas?: Date;
  tipo_personal: 'administrativo' | 'ventas' | 'técnico' | 'supervisor' | 'gerencial'; // default 'administrativo'
  zona_venta?: string; // opcional, máx 50 chars
  created_at: Date;
  updated_at: Date;
}
```

### 4. TRAINING (Capacitaciones)
```typescript
interface Training {
  id: string;
  tema: string; // requerido, máx 150 chars
  descripcion?: string; // opcional, máx 1000 chars
  fecha_inicio: Date; // requerido
  fecha_fin: Date; // requerido
  horas?: number; // opcional, min 0
  modalidad: 'presencial' | 'virtual' | 'mixta';
  proveedor?: string; // opcional, máx 150 chars
  costo?: number; // opcional, min 0
  estado: 'planificada' | 'en_curso' | 'completada' | 'cancelada'; // default 'planificada'
  certificado_url?: string; // opcional
  participantes: string[]; // array de Personnel IDs
  created_at: Date;
  updated_at: Date;
}
```

### 5. PERFORMANCE_EVALUATION (Evaluaciones)
```typescript
interface PerformanceEvaluation {
  id: string;
  personnel_id: string; // referencia a Personnel
  periodo: string; // ejemplo: "2025-Q1"
  fecha_evaluacion: Date; // requerido
  evaluador_id: string; // referencia a Personnel (evaluador)
  competencias: {
    nombre: string;
    puntaje: number; // 0-5
    comentario?: string;
  }[];
  resultado_global: 'bajo' | 'medio' | 'alto' | 'excelente';
  comentarios_generales?: string; // opcional, máx 1000 chars
  plan_mejora?: string; // opcional, máx 1000 chars
  estado: 'borrador' | 'publicado' | 'cerrado'; // default 'borrador'
  created_at: Date;
  updated_at: Date;
}
```

## 🔧 REQUERIMIENTOS FUNCIONALES

### CRUD Completo
- **Crear, Leer, Actualizar, Eliminar** para todas las entidades
- **Validaciones** con Zod en formularios y API
- **Búsqueda y filtros** por texto, estado, departamento, período
- **Paginación** en todos los listados
- **Estados y flujos** de trabajo

### Relaciones
- **Position** → **Department** (departamento_id)
- **Personnel** → **Department** y **Position** (implícito)
- **Personnel** → **Personnel** (supervisor_id)
- **Training** → **Personnel[]** (participantes)
- **PerformanceEvaluation** → **Personnel** (evaluado y evaluador)

### Acciones Especiales
- **Activar/Inactivar** personal
- **Publicar/Cerrar** evaluaciones
- **Completar/Cancelar** capacitaciones
- **Asignar/Remover** participantes de capacitaciones

## 🛠️ REQUERIMIENTOS TÉCNICOS

### API Routes
Crear endpoints en `src/app/api/`:
```
/api/departments/
/api/positions/
/api/personnel/
/api/trainings/
/api/evaluations/
```

Cada endpoint debe tener:
- `GET` - Listado paginado con filtros
- `POST` - Crear nuevo registro
- `PUT` - Actualizar registro existente
- `DELETE` - Eliminar registro

### Validaciones Zod
Crear schemas de validación para:
- Formularios de creación/edición
- API endpoints
- Filtros de búsqueda

### Componentes UI
Usar **Shadcn/ui** para:
- Formularios con validación
- Tablas con paginación
- Modales de confirmación
- Filtros y búsqueda
- Cards de estadísticas

### Servicios Firebase
Crear servicios en `src/services/`:
- `DepartmentService`
- `PositionService`
- `PersonnelService`
- `TrainingService`
- `EvaluationService`

## 📱 PÁGINAS A CREAR

### Estructura de rutas:
```
/dashboard/rrhh/
├── departments/
│   ├── page.tsx (listado)
│   └── [id]/
│       └── page.tsx (detalle/edición)
├── positions/
│   ├── page.tsx (listado)
│   └── [id]/
│       └── page.tsx (detalle/edición)
├── personnel/
│   ├── page.tsx (listado)
│   └── [id]/
│       └── page.tsx (detalle/edición)
├── trainings/
│   ├── page.tsx (listado)
│   └── [id]/
│       └── page.tsx (detalle/edición)
└── evaluations/
    ├── page.tsx (listado)
    └── [id]/
        └── page.tsx (detalle/edición)
```

## 🎨 DISEÑO Y UX

### Dashboard RRHH
- **Cards de estadísticas** (total personal, departamentos, capacitaciones activas, evaluaciones pendientes)
- **Gráficos** de distribución por departamento
- **Accesos rápidos** a cada módulo
- **Notificaciones** de evaluaciones pendientes

### Formularios
- **Validación en tiempo real** con Zod
- **Campos obligatorios** claramente marcados
- **Mensajes de error** descriptivos
- **Autocompletado** en campos de relación
- **Diseño responsive** para móviles

### Listados
- **Filtros avanzados** por estado, departamento, período
- **Búsqueda por texto** en campos relevantes
- **Ordenamiento** por columnas
- **Paginación** con opciones de tamaño
- **Acciones masivas** (activar/inactivar, exportar)

## 📊 DATOS DE PRUEBA

### Departamentos (3)
- Operaciones
- Ventas  
- RRHH

### Puestos (5)
- Analista
- Supervisor
- Gerente
- Ejecutivo de Ventas
- Asistente RRHH

### Personal (10 empleados)
- Distribución en los 3 departamentos
- Diferentes tipos de personal
- Algunos con supervisores asignados

### Capacitaciones (3)
- Seguridad Laboral
- Ventas Consultivas
- Liderazgo

### Evaluaciones (3)
- Diferentes períodos (2025-Q1, Q2, Q3)
- Diferentes empleados
- Varios estados

## 🚀 ENTREGABLES ESPERADOS

### 1. Modelos y Tipos
- [ ] Interfaces TypeScript para todas las entidades
- [ ] Schemas Zod para validaciones
- [ ] Constantes y enums

### 2. Servicios Firebase
- [ ] Servicios CRUD para cada entidad
- [ ] Métodos de búsqueda y filtrado
- [ ] Manejo de errores

### 3. API Routes
- [ ] Endpoints REST completos
- [ ] Validaciones en cada endpoint
- [ ] Respuestas consistentes

### 4. Componentes UI
- [ ] Formularios con validación
- [ ] Tablas con paginación
- [ ] Modales y confirmaciones
- [ ] Filtros y búsqueda

### 5. Páginas
- [ ] Listados de todas las entidades
- [ ] Formularios de creación/edición
- [ ] Dashboard de RRHH
- [ ] Navegación integrada

### 6. Datos de Prueba
- [ ] Script de seed con datos de ejemplo
- [ ] Documentación de instalación
- [ ] Comandos de desarrollo

## 📝 NOTAS IMPORTANTES

### Firebase Firestore
- **NO usar organization_id** (sistema single-organización)
- **Usar subcolecciones** para relaciones complejas
- **Índices compuestos** para consultas eficientes
- **Transacciones** para operaciones atómicas

### Seguridad
- **Autenticación requerida** en todas las rutas
- **Validación de permisos** por rol de usuario
- **Sanitización** de inputs
- **Rate limiting** en APIs

### Performance
- **Paginación** en todas las consultas
- **Lazy loading** de componentes pesados
- **Caching** de datos frecuentes
- **Optimización** de consultas Firebase

## 🎯 CRITERIOS DE ÉXITO

- ✅ **Funcionalidad completa** de todos los módulos
- ✅ **Diseño moderno** y responsive
- ✅ **Validaciones robustas** con Zod
- ✅ **Navegación intuitiva** entre módulos
- ✅ **Datos de prueba** funcionando
- ✅ **Código limpio** y documentado
- ✅ **Sin errores** de TypeScript
- ✅ **Performance óptima** en consultas

---

**¿Listo para implementar el módulo RRHH completo? 🚀**
