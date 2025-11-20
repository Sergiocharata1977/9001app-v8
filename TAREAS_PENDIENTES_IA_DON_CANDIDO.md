# Tareas Pendientes - Mejoras IA Conversacional Don Cándido

**Fecha:** 18 de Noviembre, 2025  
**Versión:** 1.0  
**Estado:** En Desarrollo - Fase 2

---

## 📋 Resumen Ejecutivo

Este documento consolida todas las tareas pendientes para completar la Fase 2 de mejoras de Don Cándido. Se ha realizado un análisis del estado actual del desarrollo y se han identificado las tareas críticas que faltan por implementar.

### Estado Actual del Desarrollo

**✅ Implementado:**

- ✅ Componente base `DonCandidoChat.tsx`
- ✅ `VoiceRecorder` usando Web Speech API (navegador)
- ✅ `AudioPlayer` básico con ElevenLabs
- ✅ SDK Unificado con Firebase Admin
- ✅ Autenticación server-side robusta
- ✅ Middleware de permisos y rate limiting

**❌ Problemas Detectados:**

- ❌ **CRÍTICO**: La voz no funciona - el usuario debe escribir
- ❌ VoiceRecorder usa Web Speech API (navegador) en lugar de grabar audio
- ❌ No hay sistema de grabación de audio real
- ❌ Falta integración con Whisper API para transcripción
- ❌ AudioPlayer no usa Voice ID personalizado
- ❌ No existe modo conversación continua
- ❌ No hay historial de conversaciones
- ❌ No hay formularios conversacionales
- ❌ No hay acciones directas en BD
- ❌ No hay análisis inteligente
- ❌ No hay generación de reportes

---

## 🚨 TAREAS CRÍTICAS (Prioridad Máxima)

### 1. ARREGLAR SISTEMA DE VOZ (BLOQUEANTE)

**Problema:** El usuario no puede grabar voz, debe escribir. El VoiceRecorder actual usa Web Speech API del navegador que no funciona correctamente.

#### 1.1 Implementar Grabación de Audio Real

- [ ] **Reemplazar VoiceRecorder con grabación de audio**
  - Eliminar dependencia de Web Speech API
  - Implementar grabación usando MediaRecorder API
  - Capturar audio en formato compatible (webm/mp3)
  - Agregar indicador visual de grabación
  - Implementar botón de detener grabación
  - _Archivo: `src/components/ia/VoiceRecorder.tsx`_
  - _Tiempo estimado: 4 horas_

#### 1.2 Integrar Whisper API para Transcripción

- [ ] **Crear endpoint de transcripción**
  - Crear `/api/whisper/transcribe/route.ts`
  - Recibir archivo de audio
  - Enviar a OpenAI Whisper API
  - Retornar transcripción
  - Manejar errores de API
  - _Tiempo estimado: 3 horas_

- [ ] **Actualizar VoiceRecorder para usar Whisper**
  - Enviar audio grabado a endpoint de transcripción
  - Mostrar loading mientras transcribe
  - Manejar errores de transcripción
  - Agregar fallback a texto manual
  - _Tiempo estimado: 2 horas_

#### 1.3 Configurar Variables de Entorno

- [ ] **Agregar configuración de Whisper**

  ```env
  OPENAI_API_KEY=sk-...
  WHISPER_MODEL=whisper-1
  ```

  - Actualizar `.env.example`
  - Documentar en README
  - _Tiempo estimado: 30 minutos_

**Total Tarea 1: ~10 horas**

---

### 2. IMPLEMENTAR VOZ CLONADA PERSONALIZADA

**Problema:** AudioPlayer no usa el Voice ID personalizado configurado.

#### 2.1 Configurar Voice ID Personalizado

- [ ] **Crear servicio de configuración de voz**
  - Crear `src/lib/elevenlabs/voice-config.ts`
  - Implementar `getCustomVoiceConfig()`
  - Cargar Voice ID desde variables de entorno
  - Configurar parámetros de calidad (stability, similarity)
  - _Tiempo estimado: 2 horas_

#### 2.2 Actualizar AudioPlayer

- [ ] **Integrar Voice ID personalizado**
  - Modificar `src/components/ia/AudioPlayer.tsx`
  - Usar Voice ID de configuración
  - Agregar parámetros de calidad
  - Implementar fallback a voz por defecto
  - _Tiempo estimado: 2 horas_

#### 2.3 Actualizar Endpoint de ElevenLabs

- [ ] **Mejorar `/api/elevenlabs/text-to-speech`**
  - Aceptar Voice ID como parámetro
  - Usar configuración personalizada
  - Agregar logging de métricas
  - Implementar caché de audio (opcional)
  - _Tiempo estimado: 2 horas_

#### 2.4 Variables de Entorno

- [ ] **Configurar Voice ID**

  ```env
  ELEVENLABS_VOICE_ID=kulszILr6ees0ArU8miO
  ELEVENLABS_VOICE_STABILITY=0.5
  ELEVENLABS_VOICE_SIMILARITY=0.75
  ELEVENLABS_VOICE_STYLE=0.0
  ELEVENLABS_SPEAKER_BOOST=true
  ```

  - _Tiempo estimado: 30 minutos_

**Total Tarea 2: ~7 horas**

---

## 🎯 TAREAS CORTO PLAZO (Esta Semana)

### 3. MODO CONVERSACIÓN CONTINUA

**Objetivo:** Permitir conversaciones fluidas donde el usuario habla y la IA responde automáticamente.

#### 3.1 Implementar Detección de Silencio

- [ ] **Crear SilenceDetector**
  - Crear `src/lib/voice/silence-detector.ts`
  - Implementar algoritmo de detección de silencio
  - Configurar threshold y duración
  - Agregar calibración automática
  - _Tiempo estimado: 4 horas_

#### 3.2 Crear ContinuousModeController

- [ ] **Componente de control de modo continuo**
  - Crear `src/components/ia/ContinuousModeController.tsx`
  - Gestionar estados: idle, listening, processing, speaking
  - Integrar SilenceDetector
  - Agregar indicadores visuales de estado
  - Implementar comandos de voz ("detener", "pausar")
  - _Tiempo estimado: 6 horas_

#### 3.3 Integrar Auto-play de Respuestas

- [ ] **Modificar AudioPlayer**
  - Agregar prop `autoPlay`
  - Reproducir automáticamente en modo continuo
  - Detectar fin de reproducción
  - Reactivar micrófono después de hablar
  - _Tiempo estimado: 2 horas_

#### 3.4 Actualizar DonCandidoChat

- [ ] **Integrar modo continuo**
  - Agregar botón de toggle para modo continuo
  - Integrar ContinuousModeController
  - Implementar flujo completo: escuchar → procesar → hablar → escuchar
  - Guardar preferencia en localStorage
  - _Tiempo estimado: 4 horas_

**Total Tarea 3: ~16 horas**

---

### 4. HISTORIAL DE CONVERSACIONES

**Objetivo:** Permitir al usuario revisar y continuar conversaciones anteriores.

#### 4.1 Mejorar Modelo de Datos

- [ ] **Actualizar ChatSession**
  - Agregar campos: `titulo`, `resumen`, `tags`, `duracion_minutos`
  - Agregar `last_accessed_at`
  - Crear índice en Firestore
  - _Archivo: `src/types/chat.ts`_
  - _Tiempo estimado: 2 horas_

#### 4.2 Implementar Generación de Títulos

- [ ] **Crear función de generación de título**
  - Usar Claude para generar título basado en primer mensaje
  - Implementar en endpoint de chat
  - Guardar título al crear sesión
  - _Tiempo estimado: 2 horas_

#### 4.3 Crear Página de Historial

- [ ] **Página de lista de conversaciones**
  - Crear `src/app/(dashboard)/historial-ia/page.tsx`
  - Mostrar lista de sesiones con metadata
  - Ordenar por fecha descendente
  - Implementar paginación (20 por página)
  - _Tiempo estimado: 4 horas_

#### 4.4 Implementar Búsqueda y Filtros

- [ ] **Agregar funcionalidad de búsqueda**
  - Barra de búsqueda por contenido
  - Filtro por fecha
  - Filtro por módulo
  - Filtro por tags
  - _Tiempo estimado: 4 horas_

#### 4.5 Permitir Reanudar Conversaciones

- [ ] **Funcionalidad de continuar sesión**
  - Botón "Continuar conversación"
  - Cargar contexto completo
  - Permitir nuevos mensajes
  - Actualizar `last_accessed_at`
  - _Tiempo estimado: 3 horas_

#### 4.6 Agregar Eliminación de Sesiones

- [ ] **Permitir eliminar conversaciones**
  - Botón de eliminar con confirmación
  - Soft delete (marcar como inactivo)
  - Actualizar lista después de eliminar
  - _Tiempo estimado: 2 horas_

#### 4.7 Agregar Enlace en Sidebar

- [ ] **Navegación al historial**
  - Agregar enlace "Historial IA" en Sidebar
  - Usar icono apropiado (History o MessageSquare)
  - _Tiempo estimado: 30 minutos_

**Total Tarea 4: ~18 horas**

---

## 📊 TAREAS MEDIANO PLAZO (Próximas 2 Semanas)

### 5. FORMULARIOS CONVERSACIONALES

**Objetivo:** Completar formularios del sistema mediante conversación natural.

#### 5.1 Implementar Detección de Intenciones

- [ ] **Crear IntentDetectionService**
  - Crear `src/lib/claude/intent-detection.ts`
  - Definir tipos de intención: query, form, action, analysis, report
  - Implementar función `detectIntent()` usando Claude
  - Crear prompts optimizados
  - _Tiempo estimado: 4 horas_

#### 5.2 Definir Formularios

- [ ] **Crear definiciones de formularios**
  - Crear `src/config/conversational-forms.ts`
  - Definir: No Conformidad, Auditoría, Acción Correctiva, Process Record
  - Incluir campos, tipos, validaciones
  - _Tiempo estimado: 3 horas_

#### 5.3 Crear ConversationalFormService

- [ ] **Servicio de formularios conversacionales**
  - Crear `src/services/forms/ConversationalFormService.ts`
  - Implementar `initializeForm()`
  - Implementar `processUserResponse()`
  - Implementar `generateNextQuestion()`
  - Implementar `validateAndSubmit()`
  - _Tiempo estimado: 6 horas_

#### 5.4 Crear Modelo de Datos

- [ ] **ConversationalForm en Firestore**
  - Definir interfaz en `src/types/forms.ts`
  - Crear colección `conversational_forms`
  - Implementar servicio de persistencia
  - _Tiempo estimado: 2 horas_

#### 5.5 Crear Endpoint de Formularios

- [ ] **API de formularios conversacionales**
  - Crear `/api/claude/conversational-form/route.ts`
  - Manejar inicio de formulario
  - Procesar respuestas de usuario
  - Validar y crear registro final
  - _Tiempo estimado: 4 horas_

#### 5.6 Crear UI de Formularios

- [ ] **Componente ConversationalFormHandler**
  - Crear `src/components/ia/ConversationalFormHandler.tsx`
  - Mostrar progreso del formulario
  - Permitir edición de respuestas previas
  - Mostrar resumen antes de enviar
  - Implementar confirmación final
  - _Tiempo estimado: 6 horas_

#### 5.7 Integrar en DonCandidoChat

- [ ] **Integración completa**
  - Detectar inicio de formulario
  - Cambiar modo de chat a modo formulario
  - Mantener contexto durante formulario
  - Crear registro al completar
  - _Tiempo estimado: 3 horas_

**Total Tarea 5: ~28 horas**

---

### 6. ACCIONES DIRECTAS EN BASE DE DATOS

**Objetivo:** Permitir que la IA ejecute operaciones en la BD con confirmación del usuario.

#### 6.1 Crear ActionExecutionService

- [ ] **Servicio de ejecución de acciones**
  - Crear `src/services/actions/ActionExecutionService.ts`
  - Implementar `executeAction()` para cada tipo
  - Implementar validación de permisos
  - Implementar logging de acciones
  - _Tiempo estimado: 6 horas_

#### 6.2 Definir Acciones Soportadas

- [ ] **Configuración de acciones**
  - Crear `src/config/supported-actions.ts`
  - Identificar acciones seguras vs peligrosas
  - Definir permisos requeridos por acción
  - _Tiempo estimado: 2 horas_

#### 6.3 Crear Modelo de Log de Acciones

- [ ] **AIActionLog en Firestore**
  - Definir interfaz `AIActionLog`
  - Crear colección `ai_actions_log`
  - Implementar logging completo
  - _Tiempo estimado: 2 horas_

#### 6.4 Implementar Validación de Permisos

- [ ] **Sistema de permisos**
  - Crear `src/lib/security/permissions.ts`
  - Implementar `canExecuteAction()`
  - Validar permisos por rol
  - _Tiempo estimado: 3 horas_

#### 6.5 Crear UI de Confirmación

- [ ] **ActionConfirmationDialog**
  - Crear `src/components/ia/ActionConfirmationDialog.tsx`
  - Mostrar tipo de acción y datos
  - Agregar advertencias para acciones peligrosas
  - Implementar confirmar/cancelar
  - _Tiempo estimado: 4 horas_

#### 6.6 Crear Endpoint de Acciones

- [ ] **API de ejecución de acciones**
  - Crear `/api/claude/execute-action/route.ts`
  - Validar permisos de usuario
  - Ejecutar acción en base de datos
  - Registrar en log
  - Retornar resultado
  - _Tiempo estimado: 4 horas_

#### 6.7 Integrar en DonCandidoChat

- [ ] **Integración completa**
  - Detectar solicitud de acción
  - Mostrar diálogo de confirmación
  - Ejecutar acción confirmada
  - Mostrar resultado en chat
  - _Tiempo estimado: 3 horas_

#### 6.8 Implementar Prevención de Acciones Peligrosas

- [ ] **Seguridad adicional**
  - Bloquear bulk delete
  - Requerir confirmación doble para delete
  - Limitar acciones por día
  - _Tiempo estimado: 2 horas_

**Total Tarea 6: ~26 horas**

---

## 📈 TAREAS LARGO PLAZO (Próximo Mes)

### 7. ANÁLISIS INTELIGENTE

**Objetivo:** Analizar datos del sistema y proporcionar insights relevantes.

#### 7.1 Crear AnalysisService

- [ ] **Servicio de análisis**
  - Crear `src/services/analysis/AnalysisService.ts`
  - Implementar `analyzeProcessPerformance()`
  - Implementar `analyzeObjectiveProgress()`
  - Implementar `analyzeIndicatorTrends()`
  - Implementar `analyzePendingTasks()`
  - _Tiempo estimado: 8 horas_

#### 7.2 Implementar Algoritmos de Análisis

- [ ] **Algoritmos de detección**
  - Crear `src/lib/analysis/algorithms.ts`
  - Implementar detección de tendencias
  - Implementar detección de anomalías
  - Implementar cálculo de performance score
  - _Tiempo estimado: 6 horas_

#### 7.3 Crear Motor de Recomendaciones

- [ ] **Generación de recomendaciones**
  - Implementar `generateRecommendations()` basado en insights
  - Priorizar recomendaciones por impacto
  - Generar acciones específicas y accionables
  - _Tiempo estimado: 4 horas_

#### 7.4 Crear Endpoint de Análisis

- [ ] **API de análisis**
  - Crear `/api/claude/analyze/route.ts`
  - Recibir tipo de análisis y parámetros
  - Ejecutar análisis apropiado
  - Retornar insights y recomendaciones
  - _Tiempo estimado: 3 horas_

#### 7.5 Crear UI de Análisis

- [ ] **AnalysisDisplay Component**
  - Crear `src/components/ia/AnalysisDisplay.tsx`
  - Mostrar resumen ejecutivo
  - Listar insights por categoría
  - Mostrar recomendaciones priorizadas
  - Agregar visualizaciones (gráficos, progress bars)
  - _Tiempo estimado: 6 horas_

#### 7.6 Integrar en DonCandidoChat

- [ ] **Integración completa**
  - Detectar solicitud de análisis
  - Ejecutar análisis apropiado
  - Mostrar resultados en chat
  - Permitir drill-down en detalles
  - _Tiempo estimado: 3 horas_

#### 7.7 Implementar Caché de Análisis

- [ ] **Optimización de performance**
  - Cachear resultados por 15 minutos
  - Invalidar caché al agregar nuevas mediciones
  - Optimizar queries de datos
  - _Tiempo estimado: 3 horas_

**Total Tarea 7: ~33 horas**

---

### 8. GENERACIÓN DE REPORTES AUTOMÁTICOS

**Objetivo:** Generar reportes personalizados automáticamente.

#### 8.1 Crear Plantillas de Reportes

- [ ] **Definir plantillas**
  - Crear `src/config/report-templates.ts`
  - Definir: Reporte Semanal, Mensual, Auditoría, Cumplimiento
  - Incluir secciones y datos requeridos
  - _Tiempo estimado: 4 horas_

#### 8.2 Crear ReportGenerationService

- [ ] **Servicio de generación**
  - Crear `src/services/reports/ReportGenerationService.ts`
  - Implementar `generateReport()` usando Claude
  - Implementar `saveReport()` en Firestore
  - Implementar recopilación de datos por tipo
  - _Tiempo estimado: 8 horas_

#### 8.3 Crear Modelo de Datos

- [ ] **GeneratedReport en Firestore**
  - Definir interfaz en `src/types/reports.ts`
  - Crear colección `generated_reports`
  - Implementar servicio de persistencia
  - _Tiempo estimado: 2 horas_

#### 8.4 Implementar Personalización por Rol

- [ ] **Adaptar contenido según rol**
  - Adaptar contenido según rol de usuario
  - Incluir solo procesos/objetivos asignados
  - Ajustar nivel de detalle según posición
  - _Tiempo estimado: 3 horas_

#### 8.5 Crear Endpoint de Reportes

- [ ] **API de generación de reportes**
  - Crear `/api/claude/generate-report/route.ts`
  - Recopilar datos necesarios
  - Generar contenido con Claude
  - Guardar reporte en Firestore
  - _Tiempo estimado: 4 horas_

#### 8.6 Implementar Exportación a PDF/Word

- [ ] **Exportación de documentos**
  - Instalar librería para generar PDF (jsPDF o similar)
  - Implementar `exportToPDF()`
  - Implementar `exportToDocx()` (opcional)
  - Generar URL de descarga
  - _Tiempo estimado: 6 horas_

#### 8.7 Crear UI de Reportes

- [ ] **ReportGenerator Component**
  - Crear `src/components/ia/ReportGenerator.tsx`
  - Selector de tipo de reporte
  - Configuración de parámetros
  - Preview del reporte
  - Botones de descarga
  - _Tiempo estimado: 6 horas_

#### 8.8 Integrar en DonCandidoChat

- [ ] **Integración completa**
  - Detectar solicitud de reporte
  - Mostrar opciones de personalización
  - Generar reporte
  - Mostrar preview en chat
  - Ofrecer descarga
  - _Tiempo estimado: 4 horas_

#### 8.9 Implementar Visualizaciones

- [ ] **Gráficos y tablas**
  - Agregar gráficos de tendencias
  - Agregar tablas de datos
  - Agregar progress bars
  - Usar Chart.js o Recharts
  - _Tiempo estimado: 5 horas_

**Total Tarea 8: ~42 horas**

---

## 🔒 TAREAS DE SEGURIDAD Y OPTIMIZACIÓN

### 9. SEGURIDAD Y VALIDACIÓN

#### 9.1 Implementar Sanitización de Inputs

- [ ] **Sanitización completa**
  - Crear `src/lib/security/sanitization.ts`
  - Implementar sanitización de mensajes
  - Implementar sanitización de datos de formularios
  - Implementar sanitización de parámetros de acciones
  - _Tiempo estimado: 3 horas_

#### 9.2 Implementar Rate Limiting

- [ ] **Límites de uso**
  - Crear `src/lib/security/rate-limiter.ts`
  - Limitar mensajes de chat (100/hora)
  - Limitar acciones (100/día)
  - Limitar reportes (10/día)
  - Retornar 429 cuando se exceda
  - _Tiempo estimado: 3 horas_

#### 9.3 Implementar Audit Logging Completo

- [ ] **Logging de auditoría**
  - Crear `src/lib/security/audit-logger.ts`
  - Loggear todas las acciones de IA
  - Loggear generación de reportes
  - Loggear accesos a datos sensibles
  - _Tiempo estimado: 3 horas_

#### 9.4 Validar Permisos en Todas las Operaciones

- [ ] **Validación exhaustiva**
  - Verificar permisos antes de cada acción
  - Validar acceso a datos por rol
  - Implementar checks de seguridad
  - _Tiempo estimado: 4 horas_

**Total Tarea 9: ~13 horas**

---

### 10. OPTIMIZACIÓN DE PERFORMANCE

#### 10.1 Implementar Sistema de Caché

- [ ] **Caché estratégico**
  - Cachear contexto de usuario (5 min)
  - Cachear definiciones de formularios (1 hora)
  - Cachear resultados de análisis (15 min)
  - Implementar invalidación de caché
  - _Tiempo estimado: 4 horas_

#### 10.2 Optimizar Queries de Base de Datos

- [ ] **Optimización de Firestore**
  - Crear índices necesarios
  - Usar Promise.all() para queries paralelas
  - Implementar paginación eficiente
  - _Tiempo estimado: 3 horas_

#### 10.3 Implementar Monitoreo de Performance

- [ ] **Métricas y logging**
  - Agregar logging de tiempos de respuesta
  - Identificar cuellos de botella
  - Implementar alertas de performance
  - _Tiempo estimado: 3 horas_

**Total Tarea 10: ~10 horas**

---

## 🎨 TAREAS DE EXPERIENCIA DE USUARIO

### 11. MEJORAR UX E INDICADORES VISUALES

#### 11.1 Crear Indicadores de Estado

- [ ] **Indicadores visuales**
  - Indicador "Escuchando..." con animación
  - Indicador "Pensando..." con spinner
  - Indicador "Hablando..." con animación de onda
  - Indicador de progreso para formularios
  - _Tiempo estimado: 4 horas_

#### 11.2 Mejorar Mensajes de Error

- [ ] **Errores user-friendly**
  - Mensajes claros y accionables
  - Agregar sugerencias de solución
  - Implementar retry automático cuando sea posible
  - _Tiempo estimado: 2 horas_

#### 11.3 Agregar Ayuda Contextual

- [ ] **Sistema de ayuda**
  - Tooltip con ejemplos de uso
  - Guía rápida de comandos
  - Tutorial interactivo (opcional)
  - _Tiempo estimado: 3 horas_

#### 11.4 Implementar Preferencias de Usuario

- [ ] **Configuración personalizada**
  - Crear modelo UserPreferences
  - Guardar preferencias de voz y modo continuo
  - Permitir personalización de comportamiento
  - _Tiempo estimado: 3 horas_

#### 11.5 Agregar Atajos de Teclado

- [ ] **Keyboard shortcuts**
  - Ctrl+M: Activar micrófono
  - Ctrl+K: Toggle modo continuo
  - Ctrl+H: Abrir historial
  - Esc: Detener grabación/reproducción
  - _Tiempo estimado: 2 horas_

#### 11.6 Hacer Responsive

- [ ] **Adaptación móvil**
  - Adaptar UI para móviles
  - Optimizar controles táctiles
  - Probar en diferentes dispositivos
  - _Tiempo estimado: 4 horas_

**Total Tarea 11: ~18 horas**

---

## 📦 TAREAS DE DEPLOYMENT Y CONFIGURACIÓN

### 12. CONFIGURACIÓN Y DEPLOYMENT

#### 12.1 Actualizar Variables de Entorno

- [ ] **Configuración completa**

  ```env
  # OpenAI Whisper
  OPENAI_API_KEY=sk-...
  WHISPER_MODEL=whisper-1

  # ElevenLabs Voice
  ELEVENLABS_VOICE_ID=kulszILr6ees0ArU8miO
  ELEVENLABS_VOICE_STABILITY=0.5
  ELEVENLABS_VOICE_SIMILARITY=0.75
  ELEVENLABS_VOICE_STYLE=0.0
  ELEVENLABS_SPEAKER_BOOST=true

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

  - Actualizar `.env.example`
  - Documentar cada variable
  - _Tiempo estimado: 1 hora_

#### 12.2 Crear Índices de Firestore

- [ ] **Configurar índices**
  - Actualizar `firestore.indexes.json`
  - Agregar índices para chat_sessions
  - Agregar índices para conversational_forms
  - Agregar índices para ai_actions_log
  - Agregar índices para generated_reports
  - Desplegar índices
  - _Tiempo estimado: 2 horas_

#### 12.3 Actualizar Scripts de Deployment

- [ ] **Scripts de deploy**
  - Actualizar `deploy-don-candido.ps1`
  - Agregar validación de variables
  - Agregar verificación de índices
  - _Tiempo estimado: 1 hora_

#### 12.4 Crear Documentación

- [ ] **Documentación completa**
  - Guía de usuario para Don Cándido mejorado
  - Documentación técnica de nuevas funcionalidades
  - Guía de troubleshooting
  - _Tiempo estimado: 4 horas_

**Total Tarea 12: ~8 horas**

---

## 📊 RESUMEN DE ESTIMACIONES

### Por Prioridad

| Prioridad            | Tareas        | Tiempo Estimado |
| -------------------- | ------------- | --------------- |
| 🚨 **CRÍTICAS**      | 1-2           | **17 horas**    |
| 🎯 **CORTO PLAZO**   | 3-4           | **34 horas**    |
| 📊 **MEDIANO PLAZO** | 5-6           | **54 horas**    |
| 📈 **LARGO PLAZO**   | 7-8           | **75 horas**    |
| 🔒 **SEGURIDAD**     | 9-10          | **23 horas**    |
| 🎨 **UX**            | 11            | **18 horas**    |
| 📦 **DEPLOYMENT**    | 12            | **8 horas**     |
| **TOTAL**            | **12 tareas** | **~229 horas**  |

### Por Semana (Estimación)

- **Semana 1:** Tareas Críticas + Corto Plazo = ~51 horas
- **Semana 2:** Mediano Plazo (Parte 1) = ~27 horas
- **Semana 3:** Mediano Plazo (Parte 2) = ~27 horas
- **Semana 4:** Largo Plazo (Parte 1) = ~38 horas
- **Semana 5:** Largo Plazo (Parte 2) = ~37 horas
- **Semana 6:** Seguridad + UX + Deployment = ~49 horas

**Estimación Total: 6 semanas de desarrollo**

---

## 🎯 PLAN DE ACCIÓN RECOMENDADO

### Fase 1: Arreglar Funcionalidad Básica (Semana 1)

**Objetivo:** Que la voz funcione correctamente

1. ✅ Implementar grabación de audio real
2. ✅ Integrar Whisper API
3. ✅ Configurar Voice ID personalizado
4. ✅ Implementar modo conversación continua
5. ✅ Crear historial de conversaciones

**Resultado:** Don Cándido funcional con voz mejorada

---

### Fase 2: Formularios y Acciones (Semanas 2-3)

**Objetivo:** Permitir completar tareas mediante conversación

1. ✅ Implementar detección de intenciones
2. ✅ Crear formularios conversacionales
3. ✅ Implementar acciones directas en BD
4. ✅ Agregar confirmaciones y validaciones

**Resultado:** Don Cándido puede crear registros y ejecutar acciones

---

### Fase 3: Inteligencia y Reportes (Semanas 4-5)

**Objetivo:** Análisis proactivo y generación automática

1. ✅ Implementar análisis inteligente
2. ✅ Crear motor de recomendaciones
3. ✅ Implementar generación de reportes
4. ✅ Agregar exportación a PDF

**Resultado:** Don Cándido como asistente inteligente completo

---

### Fase 4: Pulido y Optimización (Semana 6)

**Objetivo:** Seguridad, performance y UX

1. ✅ Implementar seguridad completa
2. ✅ Optimizar performance
3. ✅ Mejorar UX e indicadores
4. ✅ Documentación y deployment

**Resultado:** Sistema production-ready

---

## 🔍 IMPACTO DEL SDK EN EL DESARROLLO

### Cambios Introducidos por el SDK

**✅ Beneficios:**

- ✅ Autenticación server-side robusta con Firebase Admin
- ✅ Middleware de permisos centralizado
- ✅ Rate limiting implementado
- ✅ Manejo de errores consistente
- ✅ Logging y auditoría mejorados

**⚠️ Consideraciones:**

- ⚠️ Todas las nuevas API routes deben usar el SDK
- ⚠️ Validación de permisos debe usar `withAuth` middleware
- ⚠️ Servicios deben extender `BaseService` cuando sea posible
- ⚠️ Errores deben usar clases de error del SDK

### Integración con Don Cándido

**Endpoints que deben usar el SDK:**

- `/api/claude/chat` - Ya usa autenticación, migrar a SDK
- `/api/claude/conversational-form` - Nuevo, usar SDK desde el inicio
- `/api/claude/execute-action` - Nuevo, CRÍTICO usar SDK para permisos
- `/api/claude/analyze` - Nuevo, usar SDK
- `/api/claude/generate-report` - Nuevo, usar SDK
- `/api/whisper/transcribe` - Nuevo, usar SDK para autenticación

**Ejemplo de integración:**

```typescript
// Antes (sin SDK)
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  // ... validación manual
}

// Después (con SDK)
import { withAuth } from '@/lib/sdk/middleware/auth';

export const POST = withAuth(async (req, context) => {
  // context.user ya está autenticado y validado
  // context.permissions contiene permisos del usuario
});
```

---

## 📝 NOTAS IMPORTANTES

### Problemas Críticos Identificados

1. **VOZ NO FUNCIONA** - El usuario debe escribir en lugar de hablar
   - Causa: VoiceRecorder usa Web Speech API del navegador
   - Solución: Implementar grabación real + Whisper API
   - Prioridad: MÁXIMA

2. **Falta Voice ID Personalizado** - No se usa la voz clonada
   - Causa: AudioPlayer no está configurado con Voice ID
   - Solución: Configurar ElevenLabs con Voice ID personalizado
   - Prioridad: ALTA

3. **No hay Modo Continuo** - Experiencia no es fluida
   - Causa: No está implementado
   - Solución: Implementar ContinuousModeController
   - Prioridad: ALTA

### Dependencias Externas Necesarias

- **OpenAI API** - Para Whisper (transcripción de audio)
- **ElevenLabs API** - Para Text-to-Speech con voz clonada
- **Anthropic Claude API** - Ya configurado
- **Firebase Admin SDK** - Ya configurado

### Consideraciones de Costos

- **Whisper API**: ~$0.006 por minuto de audio
- **ElevenLabs**: ~$0.30 por 1000 caracteres (voz clonada)
- **Claude Sonnet 4**: ~$3 por millón de tokens input, ~$15 por millón output

**Estimación mensual (100 usuarios activos):**

- Whisper: ~$50/mes
- ElevenLabs: ~$200/mes
- Claude: ~$300/mes
- **Total: ~$550/mes**

---

## ✅ CHECKLIST DE VALIDACIÓN

### Antes de Considerar Completo

- [ ] La voz funciona correctamente (grabar y transcribir)
- [ ] El Voice ID personalizado está configurado
- [ ] El modo conversación continua funciona
- [ ] El historial de conversaciones está operativo
- [ ] Los formularios conversacionales funcionan
- [ ] Las acciones directas en BD están validadas
- [ ] El análisis inteligente genera insights útiles
- [ ] Los reportes se generan correctamente
- [ ] La seguridad está implementada (permisos, rate limiting)
- [ ] El performance es aceptable (< 3s respuestas)
- [ ] La UX es intuitiva y responsive
- [ ] La documentación está completa

---

## 📞 CONTACTO Y SOPORTE

Para preguntas sobre este documento o el desarrollo:

- Revisar specs en `.kiro/specs/mejoras-ia-conversacional-don-candido/`
- Consultar documentación del SDK en `.kiro/specs/sdk-unificado-modulos/`

---

**Última actualización:** 18 de Noviembre, 2025  
**Próxima revisión:** Después de completar Fase 1 (Semana 1)
