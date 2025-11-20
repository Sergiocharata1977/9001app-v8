# Implementation Plan - Sistema de Calendario Unificado

## Phase 1: Core Infrastructure & Audit Integration

- [x] 1. Crear tipos e interfaces base del calendario
  - Crear archivo `src/types/calendar.ts` con todas las interfaces (CalendarEvent, EventType, SourceModule, etc.)
  - Definir tipos para NotificationSchedule, RecurrenceRule, ModuleIntegration
  - Crear tipos para filtros, queries y respuestas de API
  - _Requirements: 1.3, 1.4, 1.5_

- [x] 2. Implementar CalendarService con operaciones CRUD
  - Crear `src/services/calendar/CalendarService.ts`
  - Implementar createEvent() para crear eventos de calendario
  - Implementar getEventById() para obtener evento por ID
  - Implementar updateEvent() para actualizar eventos
  - Implementar deleteEvent() para eliminar eventos (soft delete)
  - _Requirements: 1.1, 1.2_

- [x] 3. Implementar queries de calendario en CalendarService
  - Implementar getEventsByDateRange() con filtros
  - Implementar getEventsByUser() para eventos de un usuario
  - Implementar getEventsByModule() para eventos por módulo
  - Implementar getUpcomingEvents() para próximos N días
  - Implementar getOverdueEvents() para eventos vencidos
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 4. Crear EventPublisher para publicación desde módulos ABM
  - Crear `src/services/calendar/EventPublisher.ts`
  - Implementar publishEvent() para que módulos publiquen eventos
  - Implementar updatePublishedEvent() para actualizar eventos publicados
  - Implementar deletePublishedEvent() para eliminar eventos publicados
  - Implementar validateModuleIntegration() para validar módulos habilitados
  - _Requirements: 1.1, 1.2, 2.2_

- [x] 5. Crear validaciones con Zod para eventos de calendario
  - Crear `src/lib/validations/calendar.ts`
  - Definir CalendarEventSchema con todas las validaciones
  - Definir PublishEventSchema para publicación desde módulos
  - Definir EventFiltersSchema para validar filtros de búsqueda
  - _Requirements: 13.4_

- [x] 6. Implementar API routes base del calendario
  - Crear `/api/calendar/events/route.ts` (GET para listar, POST para crear)
  - Crear `/api/calendar/events/[id]/route.ts` (GET, PATCH, DELETE)
  - Crear `/api/calendar/events/range/route.ts` (GET por rango de fechas)
  - Crear `/api/calendar/events/upcoming/route.ts` (GET próximos eventos)
  - Implementar autenticación y validación en cada endpoint
  - _Requirements: 1.1, 1.2, 10.1, 10.4, 13.1, 13.2_

- [x] 7. Integrar EventPublisher con AuditService
  - Modificar `src/services/audits/AuditService.ts`
  - En create(): publicar evento cuando se crea auditoría
  - En update(): actualizar evento si cambia plannedDate
  - En delete(): eliminar evento de calendario
  - Manejar errores sin fallar operación principal
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 8. Crear índices compuestos de Firestore para calendar_events
  - Actualizar `firestore.indexes.json` con índices necesarios
  - Índice: organizationId + isActive + date
  - Índice: organizationId + responsibleUserId + date
  - Índice: organizationId + type + date
  - Índice: organizationId + sourceModule + date
  - Índice: sourceModule + sourceRecordId
  - Ejecutar script de deploy de índices
  - _Requirements: 15.2_

- [x] 9. Crear componente CalendarMonthView básico
  - Crear `src/components/calendar/CalendarMonthView.tsx`
  - Implementar grid de calendario mensual con date-fns
  - Mostrar eventos en cada día del mes
  - Implementar navegación entre meses (anterior/siguiente)
  - Manejar click en día para ver detalles
  - _Requirements: 4.1_

- [x] 10. Crear componente EventCard para mostrar eventos
  - Crear `src/components/calendar/EventCard.tsx`
  - Variante compact para vista de calendario
  - Variante detailed para vista expandida
  - Mostrar tipo de evento con icono y color distintivo
  - Mostrar información básica (título, hora, responsable)
  - _Requirements: 4.1, 3.4_

- [x] 11. Crear página principal de calendario
  - Crear `src/app/(dashboard)/calendario/page.tsx`
  - Integrar CalendarMonthView
  - Implementar carga de eventos del mes actual
  - Mostrar loading states y error handling
  - Implementar filtros básicos (por tipo de evento)
  - _Requirements: 4.1, 4.4_

- [x] 12. Crear sistema de colores y estilos por tipo de evento
  - Definir paleta de colores para cada EventType en Tailwind config
  - Auditorías: azul
  - Vencimiento documentos: naranja/amarillo
  - Acciones: rojo
  - Capacitaciones: verde
  - General: gris
  - Aplicar estilos consistentes en todos los componentes
  - _Requirements: 3.4, 7.4, 7.5, 8.4_

## Phase 2: Document Expiry Integration

- [x] 13. Integrar EventPublisher con DocumentService
  - Modificar `src/services/documents/DocumentService.ts`
  - En create(): publicar evento si tiene review_date
  - En update(): actualizar evento si cambia review_date
  - En delete(): eliminar evento de calendario
  - Implementar getExpiryPriority() basado en días hasta vencimiento
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 14. Implementar lógica de prioridad dinámica para documentos
  - Crítico: < 7 días hasta vencimiento
  - Alto: < 30 días hasta vencimiento
  - Medio: < 60 días hasta vencimiento
  - Bajo: > 60 días hasta vencimiento
  - Actualizar estilos visuales según prioridad
  - _Requirements: 7.4, 7.5_

- [x] 15. Mejorar filtros de calendario
  - Crear `src/components/calendar/CalendarFilters.tsx`
  - Filtro por tipo de evento (multi-select)
  - Filtro por módulo origen
  - Filtro por estado (scheduled, completed, overdue)
  - Filtro por prioridad
  - Aplicar filtros en queries de API
  - _Requirements: 4.4_

- [x] 16. Crear vista de agenda (lista de eventos)
  - Crear `src/components/calendar/CalendarAgendaView.tsx`
  - Listar eventos agrupados por fecha
  - Mostrar eventos en orden cronológico
  - Implementar paginación o scroll infinito
  - Permitir agrupar por tipo o módulo
  - _Requirements: 4.3_

- [x] 17. Implementar indicadores de eventos vencidos
  - Detectar eventos con fecha pasada y status != completed
  - Marcar como overdue automáticamente
  - Mostrar badge o indicador visual de "vencido"
  - Implementar query getOverdueEvents()
  - _Requirements: 8.4_

## Phase 3: Notifications & Personal Events

- [ ] 18. Crear modelo de datos para notificaciones
  - Definir interfaces en `src/types/calendar.ts`
  - CalendarNotification con campos (eventId, userId, type, scheduledFor, status)
  - NotificationPreferences para preferencias de usuario
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ] 19. Implementar NotificationEngine
  - Crear `src/services/calendar/NotificationEngine.ts`
  - Implementar scheduleNotifications() para programar notificaciones de evento
  - Implementar cancelNotifications() para cancelar notificaciones
  - Implementar getUserNotificationPreferences()
  - Implementar updateNotificationPreferences()
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ] 20. Crear API routes para notificaciones
  - Crear `/api/calendar/notifications/preferences/route.ts` (GET, PATCH)
  - Implementar lógica de guardado de preferencias en Firestore
  - Validar preferencias con Zod
  - _Requirements: 6.5_

- [ ] 21. Implementar procesamiento de notificaciones programadas
  - Crear función processScheduledNotifications() en NotificationEngine
  - Query de notificaciones pendientes con scheduledFor <= now
  - Enviar notificaciones (in-app por ahora, email futuro)
  - Marcar notificaciones como sent
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 22. Crear sistema de notificaciones in-app básico
  - Crear colección notifications en Firestore
  - Implementar badge de notificaciones no leídas
  - Crear dropdown de notificaciones en navbar
  - Mostrar últimas notificaciones de calendario
  - _Requirements: 6.4_

- [ ] 23. Implementar eventos personales (custom events)
  - Agregar lógica en CalendarService para eventos con sourceModule='custom'
  - Validar que usuario solo puede crear eventos en su organización
  - Implementar isSystemGenerated flag para diferenciar eventos
  - _Requirements: 5.1, 5.3_

- [ ] 24. Crear diálogo para crear/editar eventos personales
  - Crear `src/components/calendar/EventDialog.tsx`
  - Formulario con título, descripción, fecha, hora
  - Selector de tipo (general, meeting)
  - Opción de evento recurrente
  - Validación con react-hook-form y Zod
  - _Requirements: 5.1, 5.2, 5.5_

- [ ] 25. Implementar eventos recurrentes
  - Agregar lógica para generar instancias de eventos recurrentes
  - Soportar frecuencias: daily, weekly, monthly, yearly
  - Implementar intervalo (cada N períodos)
  - Implementar fecha de fin o número de ocurrencias
  - Generar eventos futuros al crear evento recurrente
  - _Requirements: 5.5_

- [ ] 26. Implementar permisos de edición de eventos
  - Validar que solo creador puede editar eventos personales
  - Validar que eventos del sistema no se pueden editar directamente
  - Implementar canEditEvent() en CalendarService
  - Aplicar validación en API routes
  - _Requirements: 5.2, 5.3, 13.2, 13.3_

- [ ] 27. Crear widget de calendario para dashboard
  - Crear `src/components/calendar/DashboardCalendarWidget.tsx`
  - Mostrar próximos 7 días de eventos del usuario
  - Mostrar eventos vencidos con badge
  - Link a página completa de calendario
  - Diseño compacto y responsive
  - _Requirements: 14.2, 14.3_

- [ ] 28. Integrar widget en dashboard principal
  - Agregar DashboardCalendarWidget a página de dashboard
  - Posicionar en grid de widgets
  - Implementar refresh automático
  - _Requirements: 14.2_

## Phase 4: AI Query API

- [x] 29. Crear tipos específicos para APIs de IA
  - Definir UserWorkload interface con métricas
  - Definir AvailabilitySlot para disponibilidad
  - Definir EventContext con información completa de evento
  - Definir AIQueryFilters para filtros avanzados
  - _Requirements: 15.3, 15.4, 15.7_

- [x] 30. Implementar queries de IA en CalendarService
  - Implementar getUserWorkload() con métricas por período
  - Implementar getUserAvailability() para slots disponibles
  - Implementar getEventContext() con relaciones completas
  - Calcular métricas: total events, overdue, by priority, by type
  - _Requirements: 15.5, 15.8_

- [x] 31. Crear API routes para consultas de IA
  - Crear `/api/calendar/ai/user-events/route.ts` (POST)
  - Crear `/api/calendar/ai/user-tasks/route.ts` (POST)
  - Crear `/api/calendar/ai/workload-analysis/route.ts` (POST)
  - Crear `/api/calendar/ai/event-context/route.ts` (POST)
  - Implementar autenticación con service accounts
  - _Requirements: 15.1, 15.2, 15.9_

- [ ] 32. Implementar lógica de contexto de evento
  - En getEventContext(), obtener registro origen (audit, document, etc.)

  - Incluir información del módulo origen
  - Incluir relaciones (ej: action → finding → audit)
  - Incluir información de responsable y participantes
  - _Requirements: 15.4, 15.7_

- [x] 33. Implementar análisis de disponibilidad
  - En getUserAvailability(), obtener eventos del usuario en rango
  - Calcular slots libres entre eventos
  - Considerar horario laboral (9am-6pm por defecto)
  - Retornar slots disponibles con duración mínima
  - _Requirements: 15.8_

- [x] 34. Implementar rate limiting para APIs de IA
  - Crear RateLimiter class simple
  - Aplicar límite de 100 requests por minuto por usuario
  - Retornar 429 Too Many Requests si se excede
  - Logging de requests bloqueados
  - _Requirements: 13.5, 15.10_

- [x] 35. Crear documentación de API para IA
  - Documentar endpoints de AI API
  - Ejemplos de requests y responses
  - Describir estructura de datos retornados
  - Casos de uso comunes
  - Crear archivo `CALENDAR_AI_API.md` en docs
  - _Requirements: 15.1, 15.2, 15.3_

## Phase 5: Actions & Training Integration (Future)

- [x] 36. Preparar integración con módulo de Acciones
  - Definir estructura de evento para action_deadline
  - Crear función helper mapActionPriority()
  - Documentar puntos de integración en ActionService
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 37. Preparar integración con módulo de Capacitaciones
  - Definir estructura de evento para training
  - Definir estructura de evento para evaluation
  - Soportar eventos multi-día para capacitaciones extendidas
  - Documentar puntos de integración
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 38. Implementar vista semanal de calendario
  - Crear `src/components/calendar/CalendarWeekView.tsx`
  - Grid con días de la semana y slots de tiempo
  - Mostrar eventos en slots horarios
  - Útil para capacitaciones y reuniones con hora específica
  - _Requirements: 4.2_

- [x] 39. Implementar exportación a iCalendar (.ics)
  - Crear función generateICalendar() en CalendarService
  - Convertir eventos a formato iCal estándar
  - Crear API route `/api/calendar/export/ical`
  - Permitir filtrar eventos a exportar
  - _Requirements: 12.1, 12.4_

- [x] 40. Implementar exportación a CSV
  - Crear función generateCSV() en CalendarService
  - Incluir campos relevantes para reporting
  - Crear API route `/api/calendar/export/csv`
  - Permitir filtrar eventos a exportar
  - _Requirements: 12.2, 12.4_

- [x] 41. Implementar feed de calendario personal
  - Generar URL única por usuario para feed
  - Implementar endpoint público con token de autenticación
  - Retornar eventos en formato iCal
  - Permitir suscripción desde Google Calendar, Outlook
  - _Requirements: 12.3_

## Phase 6: Sync & Advanced Features

- [ ] 42. Crear ModuleIntegration registry
  - Crear colección module_integrations en Firestore
  - Inicializar con módulos disponibles (audits, documents, actions, etc.)
  - Implementar getModuleIntegration() en CalendarService
  - _Requirements: 2.1, 2.2_

- [ ] 43. Implementar SyncService para validación de consistencia
  - Crear `src/services/calendar/SyncService.ts`
  - Implementar validateEventConsistency() para verificar eventos vs registros origen
  - Implementar cleanOrphanedEvents() para eliminar eventos huérfanos
  - Implementar syncModule() para sincronizar módulo específico
  - _Requirements: 11.2, 11.3_

- [ ] 44. Crear API routes para sincronización
  - Crear `/api/calendar/sync/validate/route.ts` (POST)
  - Crear `/api/calendar/sync/cleanup/route.ts` (POST)
  - Crear `/api/calendar/sync/module/[module]/route.ts` (POST)
  - Solo accesible para administradores
  - _Requirements: 11.2, 11.3_

- [ ] 45. Implementar job de sincronización diaria
  - Crear función dailySync() en SyncService
  - Validar consistencia de todos los módulos
  - Limpiar eventos huérfanos
  - Logging de resultados
  - Documentar cómo configurar cron job (Cloud Scheduler futuro)
  - _Requirements: 11.2, 11.3, 11.4_

- [ ] 46. Crear panel de administración de integraciones
  - Crear página `src/app/(dashboard)/admin/calendar-integrations/page.tsx`
  - Listar módulos con estado de integración
  - Botones para habilitar/deshabilitar módulos
  - Mostrar estadísticas por módulo (total events, last sync)
  - Botón para forzar sincronización manual
  - _Requirements: 2.3, 2.4_

- [ ] 47. Crear API routes para gestión de integraciones
  - Crear `/api/calendar/integrations/route.ts` (GET)
  - Crear `/api/calendar/integrations/[module]/route.ts` (GET, PATCH)
  - Crear `/api/calendar/integrations/[module]/enable/route.ts` (POST)
  - Crear `/api/calendar/integrations/[module]/disable/route.ts` (POST)
  - Solo accesible para administradores
  - _Requirements: 2.3_

- [ ] 48. Implementar estadísticas de calendario
  - Implementar getStats() en CalendarService
  - Métricas: total events, by type, by module, by status
  - Eventos próximos (7 días, 30 días)
  - Eventos vencidos
  - Crear API route `/api/calendar/stats/route.ts`
  - _Requirements: 14.1_

- [ ] 49. Crear dashboard de estadísticas de calendario
  - Crear componente CalendarStatsWidget
  - Gráficos de eventos por tipo (pie chart)
  - Gráficos de eventos por mes (bar chart)
  - Métricas clave (total, vencidos, próximos)
  - Integrar en página de calendario o admin
  - _Requirements: 14.1, 14.5_

- [ ] 50. Implementar caching para queries frecuentes
  - Crear CalendarCache class simple
  - Cachear vista de mes actual (TTL: 5 min)
  - Cachear upcoming events (TTL: 2 min)
  - Cachear stats (TTL: 10 min)
  - Invalidar cache al crear/actualizar/eliminar eventos
  - _Requirements: 15.3_

- [ ] 51. Optimizar queries con paginación
  - Implementar paginación en getEventsByDateRange()
  - Limitar resultados a 100 eventos por query
  - Implementar cursor-based pagination
  - Retornar metadata de paginación (hasNext, total)
  - _Requirements: 10.5, 15.4_

- [ ] 52. Implementar logging estructurado
  - Crear CalendarLogger class
  - Log de todas las operaciones importantes
  - Formato JSON estructurado
  - Niveles: info, warn, error
  - Incluir metadata (userId, eventId, module, duration)
  - _Requirements: 2.4, 11.4, 13.4_

- [ ] 53. Crear manejo de errores centralizado
  - Crear CalendarError class con códigos de error
  - Definir CalendarErrorCode enum
  - Transformar errores de Firestore en CalendarError
  - Retornar respuestas HTTP apropiadas en API routes
  - _Requirements: 13.4_

- [ ] 54. Implementar validación de permisos en todas las operaciones
  - Crear funciones canAccessEvent() y canEditEvent()
  - Validar organizationId en todas las queries
  - Validar ownership para eventos personales
  - Aplicar en todos los API routes
  - _Requirements: 13.1, 13.2, 13.3_

- [ ] 55. Crear tests de integración para flujo completo
  - Test: Crear auditoría → Evento creado automáticamente
  - Test: Actualizar fecha de auditoría → Evento actualizado
  - Test: Eliminar auditoría → Evento eliminado
  - Test: Crear documento con review_date → Evento creado
  - Test: Usuario crea evento personal → Evento guardado
  - _Requirements: 3.1, 3.2, 3.3, 7.1, 5.1_

- [ ] 56. Optimizar rendimiento de vista de calendario
  - Implementar lazy loading de detalles de eventos
  - Usar React.memo para EventCard
  - Implementar virtual scrolling para agenda view
  - Debouncing en filtros de búsqueda
  - _Requirements: 15.1, 15.5_

- [ ] 57. Implementar responsive design para móviles
  - Vista de calendario adaptada a pantallas pequeñas
  - Navegación touch-friendly
  - Filtros en drawer/modal en móvil
  - Optimizar tamaño de EventCard para móvil
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 58. Crear documentación de usuario
  - Guía de uso del calendario
  - Cómo crear eventos personales
  - Cómo configurar notificaciones
  - Cómo exportar calendario
  - Crear archivo `CALENDAR_USER_GUIDE.md`
  - _Requirements: 5.1, 6.5, 12.1, 12.2, 12.3_

- [ ] 59. Crear documentación técnica de integración
  - Guía para integrar nuevos módulos ABM
  - Ejemplos de uso de EventPublisher
  - Estructura de metadata por tipo de evento
  - Best practices de integración
  - Crear archivo `CALENDAR_INTEGRATION_GUIDE.md`
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [ ] 60. Testing y validación final
  - Verificar todos los requerimientos implementados
  - Testing manual de flujos principales
  - Verificar performance con 1000+ eventos
  - Validar seguridad y permisos
  - Verificar responsive design
  - _Requirements: All_
