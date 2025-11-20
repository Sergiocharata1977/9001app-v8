# Arquitectura del Proyecto - Sistema ISO 9001

## Stack Tecnológico

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript 5
- **UI Library:** React 18
- **Estilos:** Tailwind CSS 3
- **Componentes:** shadcn/ui
- **Validación:** Zod
- **Formularios:** React Hook Form

### Backend

- **Base de Datos:** Firebase Firestore
- **Storage:** Firebase Storage
- **Autenticación:** Clerk
- **APIs:** Next.js API Routes

### IA y Voz

- **Chat IA:** Claude AI (Anthropic)
- **Text-to-Speech:** ElevenLabs
- **Detección de Intención:** Claude con prompts estructurados

## Estructura de Carpetas

```
src/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Rutas protegidas con layout
│   │   ├── acciones/           # Sistema de Acciones
│   │   ├── hallazgos/          # Sistema de Hallazgos
│   │   ├── auditorias/         # Sistema de Auditorías
│   │   ├── documentos/         # Gestión de Documentos
│   │   └── ...
│   └── api/                     # API Routes
│       ├── actions/            # APIs de Acciones
│       ├── findings/           # APIs de Hallazgos
│       ├── audits/             # APIs de Auditorías
│       ├── claude/             # API de Claude
│       └── elevenlabs/         # API de ElevenLabs
│
├── components/                  # Componentes React
│   ├── actions/                # Componentes de Acciones
│   ├── findings/               # Componentes de Hallazgos
│   ├── audits/                 # Componentes de Auditorías
│   ├── ia/                     # Componentes de IA (Don Cándido)
│   ├── layout/                 # Layout components (Sidebar, Header)
│   └── ui/                     # Componentes base (shadcn/ui)
│
├── services/                    # Lógica de negocio
│   ├── actions/                # ActionService
│   ├── findings/               # FindingService
│   ├── audits/                 # AuditService
│   ├── chat/                   # ChatSessionService
│   └── shared/                 # TraceabilityService
│
├── types/                       # Tipos TypeScript
│   ├── actions.ts
│   ├── findings.ts
│   ├── audits.ts
│   ├── chat.ts
│   └── ...
│
├── lib/                         # Utilidades y helpers
│   ├── validations/            # Schemas de Zod
│   ├── claude/                 # Utilidades de Claude
│   ├── elevenlabs/             # Utilidades de ElevenLabs
│   └── utils.ts                # Funciones helper
│
├── firebase/                    # Configuración Firebase
│   └── config.ts
│
├── hooks/                       # Custom React Hooks
│   └── useVoiceCommands.ts
│
├── config/                      # Configuraciones
│   └── conversational-forms.ts
│
└── data/                        # Datos estáticos
    └── iso9001-norm-points.ts
```

## Patrones de Diseño

### 1. Patrón de 4 Fases (Acciones y Hallazgos)

**Estructura:**

- Fase 1: Formulario inicial (Modal) → Crea el registro
- Fase 2: Formulario en Single → Actualiza fase 2
- Fase 3: Formulario en Single → Actualiza fase 3
- Fase 4: Formulario en Single → Actualiza fase 4

**Beneficios:**

- Flujo secuencial claro
- Validación por fase
- Progreso visual
- Trazabilidad completa

### 2. Service Layer Pattern

Cada módulo tiene su servicio que encapsula la lógica de negocio:

```typescript
export class ActionService {
  static async create(data, userId, userName): Promise<string>;
  static async getById(id): Promise<Action | null>;
  static async list(filters): Promise<{ actions: Action[] }>;
  static async updateExecution(id, data, userId, userName): Promise<void>;
  // ... más métodos
}
```

### 3. API Routes Pattern

```typescript
// GET /api/actions - Listar
export async function GET(request: NextRequest);

// POST /api/actions - Crear
export async function POST(request: NextRequest);

// GET /api/actions/[id] - Detalle
export async function GET(request, { params });

// POST /api/actions/[id]/execution - Actualizar fase
export async function POST(request, { params });
```

### 4. Component Pattern

**Estructura de componentes por módulo:**

- `ModuleCard.tsx` - Tarjeta para listado
- `ModuleList.tsx` - Lista de items
- `ModuleKanban.tsx` - Vista Kanban
- `ModuleStats.tsx` - Estadísticas
- `ModuleFormDialog.tsx` - Formulario de alta
- `ModulePhaseForm.tsx` - Formularios de fases

## Colecciones Firestore

### Principales

1. **actions** - Acciones correctivas/preventivas/mejora
2. **findings** - Hallazgos
3. **audits** - Auditorías internas
4. **documents** - Documentos del sistema
5. **users** - Usuarios del sistema
6. **chat_sessions** - Sesiones de chat con IA
7. **processes** - Procesos de la organización
8. **norm_points** - Puntos de norma ISO 9001

### Estructura de Numeración

Todas las entidades principales usan numeración automática:

- Acciones: `ACC-YYYY-NNNN` (ej: ACC-2025-0001)
- Hallazgos: `HAL-YYYY-NNNN` (ej: HAL-2025-0001)
- Auditorías: `AUD-YYYY-NNNN` (ej: AUD-2025-0001)

Gestionado por `TraceabilityService`.

## Flujo de Datos

### Creación de Entidad

```
Usuario → Formulario → Validación (Zod) → API Route → Service → Firestore
```

### Lectura de Entidad

```
Página → useEffect → API Route → Service → Firestore → Estado React → UI
```

### Actualización de Fase

```
Usuario → Formulario Fase → Validación → API Route → Service.updatePhase → Firestore
```

## Autenticación y Autorización

- **Provider:** Clerk
- **Middleware:** Protege rutas del dashboard
- **User Context:** Disponible en toda la app
- **Firestore Rules:** Validación en backend

## IA y Conversación

### Don Cándido (Asistente IA)

**Flujo:**

1. Usuario habla o escribe
2. Detección de intención con Claude
3. Generación de respuesta contextual
4. Text-to-Speech con ElevenLabs
5. Reproducción de audio

**Características:**

- Modo continuo de conversación
- Historial de sesiones
- Detección de silencio
- Configuración de voz personalizable

## Optimizaciones

### Performance

- Server Components por defecto
- Client Components solo cuando necesario
- Lazy loading de componentes pesados
- Memoización con useMemo/useCallback

### SEO

- Metadata dinámica por página
- Open Graph tags
- Sitemap automático

### TypeScript

- Strict mode habilitado
- Validación en build time
- Tipos compartidos entre frontend y backend

## Deployment

### Vercel (Recomendado)

- Auto-deploy desde Git
- Edge Functions
- Analytics integrado

### Hostinger (Alternativo)

- Node.js hosting
- PM2 para process management
- Nginx como reverse proxy

## Variables de Entorno

```env
# Firebase
NEXT_PUBLIC_FIREBASE_*

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY

# IA
ANTHROPIC_API_KEY
ELEVENLABS_API_KEY
```

## Testing

- **Type Checking:** `npm run type-check`
- **Linting:** `npm run lint`
- **Format:** `npm run format`
- **All:** `npm run check-all`

---

**Última actualización:** Enero 2025
