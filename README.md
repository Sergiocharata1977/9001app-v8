# Sistema de Gestión ISO 9001

Sistema completo de gestión de calidad basado en ISO 9001 con Next.js 14, Firebase y TypeScript.

## 🚀 Tecnologías

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Firebase (Firestore, Storage, Auth)
- **Autenticación**: Clerk
- **UI**: Tailwind CSS, shadcn/ui
- **IA**: Claude AI (Anthropic), ElevenLabs (Text-to-Speech)

## 📦 Módulos Principales

### 1. Sistema de Auditorías

- Gestión completa de auditorías internas
- Vista Kanban por estados
- Formularios conversacionales con IA

### 2. Sistema de Hallazgos (4 Fases)

- **Fase 1**: Registro del Hallazgo
- **Fase 2**: Planificación de Acción Inmediata
- **Fase 3**: Ejecución de Acción Inmediata
- **Fase 4**: Análisis de Causa Raíz
- Vista Lista y Kanban
- Estadísticas en tiempo real

### 3. Sistema de Acciones (4 Fases)

- **Fase 1**: Planificación de la Acción
- **Fase 2**: Ejecución de la Acción
- **Fase 3**: Planificación del Control
- **Fase 4**: Ejecución del Control
- Vista Lista y Kanban
- Seguimiento de efectividad

### 4. Gestión de Documentos

- ABM de documentos
- Relación con puntos de norma ISO 9001
- Control de versiones

### 5. RRHH

- Gestión de personal
- Capacitaciones y evaluaciones
- Competencias y puestos

### 6. Don Cándido (Asistente IA)

- Chat conversacional con Claude AI
- Voz con ElevenLabs
- Modo continuo de conversación
- Historial de sesiones

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Verificar tipos y lint
npm run check-all
```

## 📝 Variables de Entorno

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Claude AI
ANTHROPIC_API_KEY=

# ElevenLabs
ELEVENLABS_API_KEY=
```

## 🗂️ Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── (dashboard)/       # Rutas protegidas
│   └── api/               # API Routes
├── components/            # Componentes React
│   ├── actions/          # Sistema de Acciones
│   ├── findings/         # Sistema de Hallazgos
│   ├── audits/           # Sistema de Auditorías
│   └── ui/               # Componentes UI base
├── services/             # Lógica de negocio
├── types/                # Tipos TypeScript
├── lib/                  # Utilidades y helpers
└── firebase/             # Configuración Firebase
```

## 🔥 Firestore Collections

- `actions` - Acciones correctivas/preventivas
- `findings` - Hallazgos
- `audits` - Auditorías
- `documents` - Documentos
- `users` - Usuarios
- `chat_sessions` - Sesiones de chat con IA

## 📊 Características Principales

- ✅ Sistema de 4 fases para Hallazgos y Acciones
- ✅ Vistas Kanban y Lista
- ✅ Estadísticas en tiempo real
- ✅ Formularios conversacionales con IA
- ✅ Asistente de voz (Don Cándido)
- ✅ Autenticación con Clerk
- ✅ Responsive design
- ✅ TypeScript estricto
- ✅ Validación con Zod

## 🚀 Deployment

El proyecto está configurado para deployment en Vercel o Hostinger.

## 📄 Licencia

Privado - Todos los derechos reservados
