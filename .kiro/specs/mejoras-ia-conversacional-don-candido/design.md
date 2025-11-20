# Design Document - Mejoras IA Conversacional Don Cándido

## Overview

Este documento describe el diseño técnico para la Fase 2 de mejoras de Don Cándido. El objetivo es transformar Don Cándido de un chat básico a un asistente conversacional completo con capacidades de voz mejorada, modo continuo, formularios conversacionales, acciones directas en BD, análisis inteligente y generación de reportes.

### Design Goals

1. **Experiencia Natural:** Conversaciones fluidas con voz clonada personalizada
2. **Productividad:** Completar tareas complejas mediante conversación natural
3. **Inteligencia:** Análisis proactivo y generación automática de reportes
4. **Performance:** Respuestas rápidas sin degradar la experiencia del usuario
5. **Seguridad:** Validación y auditoría de todas las acciones de la IA

### Architecture Principles

- **Modular:** Cada funcionalidad es un módulo independiente
- **Extensible:** Fácil agregar nuevos tipos de formularios, acciones y reportes
- **Resiliente:** Manejo robusto de errores con fallbacks
- **Auditable:** Logging completo de todas las operaciones
- **Performante:** Optimización mediante caché y procesamiento paralelo

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  DonCandidoChat (Enhanced)                                   │
│  ├─ VoiceRecorder (Improved)                                 │
│  ├─ AudioPlayer (Custom Voice)                               │
│  ├─ ContinuousModeController (NEW)                           │
│  ├─ ConversationHistory (NEW)                                │
│  ├─ ConversationalFormHandler (NEW)                          │
│  └─ ActionConfirmationDialog (NEW)                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  /api/claude/chat (Enhanced)                                 │
│  /api/claude/conversational-form (NEW)                       │
│  /api/claude/execute-action (NEW)                            │
│  /api/claude/analyze (NEW)                                   │
│  /api/claude/generate-report (NEW)                           │
│  /api/elevenlabs/text-to-speech (Enhanced)                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
```

┌─────────────────────────────────────────────────────────────┐
│ Service Layer │
├─────────────────────────────────────────────────────────────┤
│ ClaudeService (Enhanced) │
│ ├─ IntentDetectionService (NEW) │
│ ├─ ConversationalFormService (NEW) │
│ ├─ ActionExecutionService (NEW) │
│ ├─ AnalysisService (NEW) │
│ └─ ReportGenerationService (NEW) │
│ │
│ ElevenLabsService (Enhanced) │
│ ├─ Custom Voice Configuration │
│ └─ Voice Quality Optimization │
│ │
│ ConversationStateManager (NEW) │
│ └─ Manages multi-turn conversations and form state │
└─────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ Data Layer (Firebase) │
├─────────────────────────────────────────────────────────────┤
│ chat_sessions (Enhanced) │
│ conversational_forms (NEW) │
│ ai_actions_log (NEW) │
│ generated_reports (NEW) │
│ user_preferences (NEW) │
└─────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ External Services │
├─────────────────────────────────────────────────────────────┤
│ Anthropic Claude API (Sonnet 4) │
│ ElevenLabs API (Custom Voice) │
└─────────────────────────────────────────────────────────────┘

````

---

## Components and Interfaces

### 1. Enhanced Voice System

#### VoiceConfiguration Service

```typescript
// src/lib/elevenlabs/voice-config.ts
interface VoiceConfig {
  voiceId: string;
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
}

class VoiceConfigurationService {
  static getCustomVoiceConfig(): VoiceConfig;
  static updateVoiceConfig(config: Partial<VoiceConfig>): Promise<void>;
  static testVoice(text: string): Promise<AudioBuffer>;
}
````

#### Enhanced AudioPlayer Component

```typescript
// src/components/ia/AudioPlayer.tsx
interface AudioPlayerProps {
  text: string;
  autoPlay?: boolean;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  voiceConfig?: VoiceConfig;
}

// Features:
// - Custom voice ID support
// - Auto-play for continuous mode
// - Playback controls (pause, resume, speed)
// - Visual waveform indicator
```

---

### 2. Continuous Conversation Mode

#### ContinuousModeController Component

```typescript
// src/components/ia/ContinuousModeController.tsx
interface ContinuousModeState {
  enabled: boolean;
  currentState: 'idle' | 'listening' | 'processing' | 'speaking';
  silenceThreshold: number;
  silenceDuration: number;
}

class ContinuousModeController {
  // Manages the continuous conversation flow
  startContinuousMode(): void;
  stopContinuousMode(): void;
  handleSilenceDetection(): void;
  handleVoiceActivity(): void;
}
```

#### Silence Detection Algorithm

```typescript
// src/lib/voice/silence-detector.ts
interface SilenceDetectorConfig {
  threshold: number; // Audio level threshold
  duration: number; // Milliseconds of silence to detect
  sampleRate: number;
}

class SilenceDetector {
  detectSilence(audioStream: MediaStream): Observable<boolean>;
  calibrate(): Promise<number>; // Auto-calibrate threshold
}
```

---

### 3. Conversation History

#### ConversationHistory Component

```typescript
// src/components/ia/ConversationHistory.tsx
interface ConversationHistoryProps {
  userId: string;
  onSelectSession: (sessionId: string) => void;
}

// Features:
// - List of past sessions with metadata
// - Search by content
// - Filter by date/module
// - Pagination
// - Delete sessions
```

#### Enhanced ChatSession Model

```typescript
// src/types/chat.ts (Enhanced)
interface ChatSession {
  id: string;
  user_id: string;
  tipo: 'don-candidos' | 'asistente' | 'formulario';
  modulo?: string;
  estado: 'activo' | 'pausado' | 'completado';
  mensajes: Mensaje[];
  contexto_snapshot: UserContext;

  // NEW fields
  titulo?: string; // Auto-generated title
  resumen?: string; // AI-generated summary
  tags: string[]; // Auto-tagged topics
  duracion_minutos?: number;
  modo_continuo_usado: boolean;

  created_at: Date;
  updated_at: Date;
  last_accessed_at: Date;
}
```

---

### 4. Conversational Forms

#### Intent Detection Service

```typescript
// src/lib/claude/intent-detection.ts
interface DetectedIntent {
  type: 'query' | 'form' | 'action' | 'analysis' | 'report';
  formType?:
    | 'no_conformidad'
    | 'auditoria'
    | 'accion_correctiva'
    | 'process_record';
  actionType?: 'create' | 'update' | 'delete' | 'assign' | 'complete';
  confidence: number;
  parameters: Record<string, any>;
}

class IntentDetectionService {
  static async detectIntent(
    message: string,
    context: UserContext
  ): Promise<DetectedIntent>;
}
```

#### Conversational Form Service

```typescript
// src/services/forms/ConversationalFormService.ts
interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  validation?: (value: any) => boolean;
  options?: string[];
}

interface FormState {
  formType: string;
  fields: FormField[];
  collectedData: Record<string, any>;
  currentField: string;
  completed: boolean;
}

class ConversationalFormService {
  static getFormDefinition(formType: string): FormField[];
  static initializeForm(formType: string): FormState;
  static processUserResponse(state: FormState, response: string): FormState;
  static generateNextQuestion(state: FormState): string;
  static validateAndSubmit(state: FormState): Promise<string>; // Returns record ID
}
```

#### Form Definitions

```typescript
// src/config/conversational-forms.ts
const FORM_DEFINITIONS = {
  no_conformidad: [
    {
      name: 'descripcion',
      label: '¿Cuál es el problema detectado?',
      type: 'textarea',
      required: true,
    },
    {
      name: 'area',
      label: '¿En qué área ocurrió?',
      type: 'select',
      required: true,
      options: ['Producción', 'Calidad', 'Logística'],
    },
    {
      name: 'severidad',
      label: '¿Qué tan grave es?',
      type: 'select',
      required: true,
      options: ['Menor', 'Mayor', 'Crítica'],
    },
    {
      name: 'fecha_deteccion',
      label: '¿Cuándo lo detectaste?',
      type: 'date',
      required: true,
    },
  ],
  auditoria: [
    {
      name: 'proceso',
      label: '¿Qué proceso vas a auditar?',
      type: 'select',
      required: true,
    },
    {
      name: 'fecha_programada',
      label: '¿Para cuándo la programas?',
      type: 'date',
      required: true,
    },
    {
      name: 'alcance',
      label: '¿Cuál es el alcance?',
      type: 'textarea',
      required: true,
    },
  ],
  // ... more form definitions
};
```

---

### 5. Direct Database Actions

#### Action Execution Service

```typescript
// src/services/actions/ActionExecutionService.ts
interface ActionRequest {
  type: 'create' | 'update' | 'delete' | 'assign' | 'complete';
  entity:
    | 'no_conformidad'
    | 'auditoria'
    | 'accion_correctiva'
    | 'process_record'
    | 'measurement';
  data: Record<string, any>;
  userId: string;
}

interface ActionResult {
  success: boolean;
  recordId?: string;
  message: string;
  error?: string;
}

class ActionExecutionService {
  static async executeAction(request: ActionRequest): Promise<ActionResult>;
  static async validatePermissions(
    userId: string,
    action: ActionRequest
  ): Promise<boolean>;
  static async logAction(
    userId: string,
    action: ActionRequest,
    result: ActionResult
  ): Promise<void>;
}
```

#### Supported Actions

```typescript
// src/config/supported-actions.ts
const SUPPORTED_ACTIONS = {
  create: [
    'no_conformidad',
    'auditoria',
    'accion_correctiva',
    'process_record',
    'measurement',
  ],
  update: [
    'no_conformidad',
    'auditoria',
    'accion_correctiva',
    'process_record',
    'objective',
    'indicator',
  ],
  delete: ['process_record'], // Limited to safe entities
  assign: ['process_record', 'accion_correctiva'],
  complete: ['process_record', 'auditoria', 'accion_correctiva'],
};

const DANGEROUS_ACTIONS = ['delete', 'bulk_update', 'bulk_delete'];
```

#### Action Confirmation Dialog

```typescript
// src/components/ia/ActionConfirmationDialog.tsx
interface ActionConfirmationProps {
  action: ActionRequest;
  onConfirm: () => void;
  onCancel: () => void;
}

// Shows:
// - Action type and entity
// - Data to be modified
// - Warning for destructive actions
// - Confirm/Cancel buttons
```

---

### 6. Intelligent Analysis

#### Analysis Service

```typescript
// src/services/analysis/AnalysisService.ts
interface AnalysisRequest {
  type:
    | 'process_performance'
    | 'objective_progress'
    | 'indicator_trends'
    | 'pending_tasks';
  userId: string;
  parameters?: {
    processId?: string;
    dateRange?: { start: Date; end: Date };
    includeRecommendations?: boolean;
  };
}

interface AnalysisResult {
  type: string;
  summary: string;
  insights: Insight[];
  recommendations: Recommendation[];
  data: any;
  generatedAt: Date;
}

interface Insight {
  category: 'trend' | 'anomaly' | 'achievement' | 'risk';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  affectedEntities: string[];
}

interface Recommendation {
  priority: 'low' | 'medium' | 'high';
  action: string;
  rationale: string;
  estimatedImpact: string;
}

class AnalysisService {
  static async analyzeProcessPerformance(
    processId: string,
    userId: string
  ): Promise<AnalysisResult>;
  static async analyzeObjectiveProgress(
    userId: string
  ): Promise<AnalysisResult>;
  static async analyzeIndicatorTrends(
    userId: string,
    dateRange: DateRange
  ): Promise<AnalysisResult>;
  static async analyzePendingTasks(userId: string): Promise<AnalysisResult>;
}
```

#### Analysis Algorithms

```typescript
// src/lib/analysis/algorithms.ts

// Trend Detection
function detectTrend(
  dataPoints: number[]
): 'increasing' | 'decreasing' | 'stable';

// Anomaly Detection
function detectAnomalies(dataPoints: number[], threshold: number): number[];

// Performance Scoring
function calculatePerformanceScore(
  actual: number,
  target: number,
  direction: 'higher' | 'lower'
): number;

// Recommendation Engine
function generateRecommendations(
  insights: Insight[],
  context: UserContext
): Recommendation[];
```

---

### 7. Automatic Report Generation

#### Report Generation Service

```typescript
// src/services/reports/ReportGenerationService.ts
interface ReportRequest {
  type:
    | 'weekly_activity'
    | 'monthly_indicators'
    | 'audit_report'
    | 'compliance_report';
  userId: string;
  parameters: {
    dateRange?: { start: Date; end: Date };
    includeSections?: string[];
    format?: 'html' | 'pdf' | 'docx';
  };
}

interface GeneratedReport {
  id: string;
  type: string;
  title: string;
  content: ReportContent;
  format: string;
  generatedAt: Date;
  generatedBy: string;
  downloadUrl?: string;
}

interface ReportContent {
  title: string;
  subtitle: string;
  sections: ReportSection[];
  summary: string;
  conclusions: string[];
}

interface ReportSection {
  title: string;
  content: string;
  data?: any;
  charts?: ChartConfig[];
}

class ReportGenerationService {
  static async generateReport(request: ReportRequest): Promise<GeneratedReport>;
  static async saveReport(report: GeneratedReport): Promise<string>;
  static async exportToPDF(report: GeneratedReport): Promise<Buffer>;
  static async exportToDocx(report: GeneratedReport): Promise<Buffer>;
}
```

#### Report Templates

```typescript
// src/config/report-templates.ts
interface ReportTemplate {
  type: string;
  title: string;
  sections: string[];
  requiredData: string[];
  promptTemplate: string;
}

const REPORT_TEMPLATES: Record<string, ReportTemplate> = {
  weekly_activity: {
    type: 'weekly_activity',
    title: 'Reporte Semanal de Actividades',
    sections: [
      'Resumen Ejecutivo',
      'Tareas Completadas',
      'Indicadores',
      'Próximos Pasos',
    ],
    requiredData: ['process_records', 'measurements', 'objectives'],
    promptTemplate: '...',
  },
  monthly_indicators: {
    type: 'monthly_indicators',
    title: 'Reporte Mensual de Indicadores',
    sections: [
      'Resumen',
      'Indicadores por Proceso',
      'Análisis de Tendencias',
      'Recomendaciones',
    ],
    requiredData: ['indicators', 'measurements', 'objectives'],
    promptTemplate: '...',
  },
  // ... more templates
};
```

---

## Data Models

### Enhanced Chat Session

```typescript
interface ChatSession {
  id: string;
  user_id: string;
  tipo: 'don-candidos' | 'asistente' | 'formulario';
  modulo?: string;
  estado: 'activo' | 'pausado' | 'completado';
  mensajes: Mensaje[];
  contexto_snapshot: UserContext;

  // Enhanced fields
  titulo?: string;
  resumen?: string;
  tags: string[];
  duracion_minutos?: number;
  modo_continuo_usado: boolean;

  created_at: Date;
  updated_at: Date;
  last_accessed_at: Date;
}
```

### Conversational Form State

```typescript
interface ConversationalForm {
  id: string;
  session_id: string;
  user_id: string;
  form_type: string;
  estado: 'en_progreso' | 'completado' | 'cancelado';

  fields: FormField[];
  collected_data: Record<string, any>;
  current_field_index: number;

  created_record_id?: string;

  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}
```

### AI Action Log

```typescript
interface AIActionLog {
  id: string;
  user_id: string;
  session_id: string;

  action_type: 'create' | 'update' | 'delete' | 'assign' | 'complete';
  entity_type: string;
  entity_id?: string;

  data_before?: any;
  data_after?: any;

  success: boolean;
  error_message?: string;

  confirmation_required: boolean;
  confirmed_at?: Date;

  created_at: Date;
}
```

### Generated Report

```typescript
interface GeneratedReport {
  id: string;
  user_id: string;

  report_type: string;
  title: string;

  parameters: Record<string, any>;
  content: ReportContent;

  format: 'html' | 'pdf' | 'docx';
  file_url?: string;
  file_size_bytes?: number;

  generated_at: Date;
  accessed_count: number;
  last_accessed_at?: Date;
}
```

### User Preferences

```typescript
interface UserPreferences {
  user_id: string;

  voice_enabled: boolean;
  continuous_mode_enabled: boolean;
  auto_play_responses: boolean;

  voice_config: VoiceConfig;

  preferred_report_format: 'html' | 'pdf' | 'docx';

  updated_at: Date;
}
```

---

## Error Handling

### Error Categories

1. **Voice Errors**
   - Microphone access denied
   - ElevenLabs API failure
   - Audio playback error
   - Silence detection failure

2. **Conversation Errors**
   - Session not found
   - Context loading failure
   - Message send failure

3. **Form Errors**
   - Invalid field value
   - Required field missing
   - Form submission failure

4. **Action Errors**
   - Permission denied
   - Invalid action parameters
   - Database operation failure
   - Confirmation timeout

5. **Analysis Errors**
   - Insufficient data
   - Analysis timeout
   - Invalid parameters

6. **Report Errors**
   - Template not found
   - Data collection failure
   - Export failure

### Error Handling Strategy

```typescript
// src/lib/errors/error-handler.ts
class AIErrorHandler {
  static handleVoiceError(error: Error): UserFriendlyError;
  static handleFormError(error: Error, formState: FormState): UserFriendlyError;
  static handleActionError(
    error: Error,
    action: ActionRequest
  ): UserFriendlyError;
  static handleAnalysisError(error: Error): UserFriendlyError;
  static handleReportError(error: Error): UserFriendlyError;

  static logError(error: Error, context: any): void;
  static notifyUser(error: UserFriendlyError): void;
}

interface UserFriendlyError {
  title: string;
  message: string;
  suggestion: string;
  canRetry: boolean;
}
```

---

## Testing Strategy

### Unit Tests

1. **Voice System**
   - Voice configuration loading
   - Silence detection algorithm
   - Audio player controls

2. **Intent Detection**
   - Form intent recognition
   - Action intent recognition
   - Analysis intent recognition

3. **Conversational Forms**
   - Field validation
   - State transitions
   - Data collection

4. **Action Execution**
   - Permission validation
   - Action execution
   - Logging

5. **Analysis**
   - Trend detection
   - Anomaly detection
   - Recommendation generation

6. **Report Generation**
   - Template rendering
   - Data aggregation
   - Export functionality

### Integration Tests

1. **End-to-End Conversational Form**
   - Complete form flow
   - Record creation
   - Error handling

2. **Action Execution Flow**
   - Intent detection → Confirmation → Execution → Logging

3. **Analysis and Report Generation**
   - Data collection → Analysis → Report generation → Export

### Performance Tests

1. **Voice Response Time**
   - Target: < 3 seconds for audio generation

2. **Form Completion Time**
   - Target: < 2 seconds per question

3. **Action Execution Time**
   - Target: < 2 seconds for database operations

4. **Analysis Generation Time**
   - Target: < 5 seconds for standard analysis

5. **Report Generation Time**
   - Target: < 10 seconds for basic reports

---

## Security Considerations

### Permission Validation

```typescript
// src/lib/security/permissions.ts
interface PermissionCheck {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
}

class PermissionValidator {
  static async canExecuteAction(check: PermissionCheck): Promise<boolean>;
  static async canAccessEntity(
    userId: string,
    entity: string,
    entityId: string
  ): Promise<boolean>;
  static async canGenerateReport(
    userId: string,
    reportType: string
  ): Promise<boolean>;
}
```

### Input Sanitization

```typescript
// src/lib/security/sanitization.ts
class InputSanitizer {
  static sanitizeUserMessage(message: string): string;
  static sanitizeFormData(data: Record<string, any>): Record<string, any>;
  static sanitizeActionParameters(params: any): any;
}
```

### Rate Limiting

```typescript
// src/lib/security/rate-limiter.ts
const RATE_LIMITS = {
  chat_messages: { max: 100, window: '1h' },
  form_submissions: { max: 50, window: '1h' },
  actions: { max: 100, window: '1d' },
  analyses: { max: 20, window: '1h' },
  reports: { max: 10, window: '1d' },
};

class RateLimiter {
  static async checkLimit(userId: string, operation: string): Promise<boolean>;
  static async incrementCounter(
    userId: string,
    operation: string
  ): Promise<void>;
}
```

### Audit Logging

```typescript
// src/lib/security/audit-logger.ts
class AuditLogger {
  static logAction(
    userId: string,
    action: ActionRequest,
    result: ActionResult
  ): void;
  static logFormSubmission(
    userId: string,
    formType: string,
    recordId: string
  ): void;
  static logReportGeneration(
    userId: string,
    reportType: string,
    reportId: string
  ): void;
  static logPermissionDenied(userId: string, operation: string): void;
}
```

---

## Performance Optimization

### Caching Strategy

1. **User Context Cache**
   - TTL: 5 minutes
   - Invalidate on data changes

2. **Form Definitions Cache**
   - TTL: 1 hour
   - Static data

3. **Analysis Results Cache**
   - TTL: 15 minutes
   - Invalidate on new measurements

4. **Report Templates Cache**
   - TTL: 1 day
   - Static data

### Parallel Processing

```typescript
// Example: Parallel data fetching for analysis
async function performAnalysis(userId: string) {
  const [objectives, indicators, measurements, processRecords] =
    await Promise.all([
      ObjectiveService.getByUser(userId),
      IndicatorService.getByUser(userId),
      MeasurementService.getRecent(userId, 30),
      ProcessRecordService.getPending(userId),
    ]);

  return analyzeData({ objectives, indicators, measurements, processRecords });
}
```

### Lazy Loading

- Load conversation history on demand
- Paginate message lists
- Stream large reports

---

## Deployment Considerations

### Environment Variables

```env
# Existing
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_CLAUDE_MODEL=claude-sonnet-4-20250514

# New for Phase 2
ELEVENLABS_VOICE_ID=your-custom-voice-id
ELEVENLABS_VOICE_STABILITY=0.5
ELEVENLABS_VOICE_SIMILARITY=0.75

# Feature Flags
ENABLE_CONTINUOUS_MODE=true
ENABLE_CONVERSATIONAL_FORMS=true
ENABLE_DIRECT_ACTIONS=true
ENABLE_ANALYSIS=true
ENABLE_REPORTS=true

# Limits
MAX_ACTIONS_PER_DAY=100
MAX_REPORTS_PER_DAY=10
MAX_FORM_SUBMISSIONS_PER_HOUR=50
```

### Database Indexes

```javascript
// Firestore indexes needed
{
  "indexes": [
    {
      "collectionGroup": "chat_sessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "last_accessed_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "conversational_forms",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "estado", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "ai_actions_log",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "generated_reports",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "generated_at", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## Migration Plan

### Phase 2.1: Voice Improvements (Week 1)

1. Update ElevenLabs integration with custom voice
2. Implement continuous mode controller
3. Add silence detection
4. Test voice quality and latency

### Phase 2.2: Conversation History (Week 1)

1. Enhance ChatSession model
2. Create conversation history UI
3. Implement search and filtering
4. Add session management

### Phase 2.3: Conversational Forms (Week 2-3)

1. Implement intent detection
2. Create form definitions
3. Build conversational form service
4. Create form UI components
5. Test with all form types

### Phase 2.4: Direct Actions (Week 2-3)

1. Implement action execution service
2. Add permission validation
3. Create confirmation dialogs
4. Implement audit logging
5. Test all action types

### Phase 2.5: Analysis & Reports (Week 4)

1. Implement analysis service
2. Create analysis algorithms
3. Build report generation service
4. Create report templates
5. Implement export functionality

---

## Success Metrics

### Performance Metrics

- Voice response time: < 3 seconds
- Form question latency: < 2 seconds
- Action execution time: < 2 seconds
- Analysis generation: < 5 seconds
- Report generation: < 10 seconds

### User Experience Metrics

- Continuous mode adoption rate: > 30%
- Form completion rate: > 80%
- Action success rate: > 95%
- User satisfaction: > 4.5/5

### Business Metrics

- Time saved per user: > 2 hours/week
- Form completion time reduction: > 50%
- Report generation time reduction: > 70%
- User adoption increase: > 40%

---

## Conclusion

Este diseño proporciona una arquitectura modular y escalable para transformar Don Cándido en un asistente conversacional completo. La implementación se realizará en fases incrementales, permitiendo validación y ajustes en cada etapa.

**Next Steps:**

1. Review and approve this design
2. Create detailed implementation tasks
3. Begin Phase 2.1 implementation

---

**Document Version:** 1.0  
**Created:** November 6, 2025  
**Status:** Ready for Tasks Phase
