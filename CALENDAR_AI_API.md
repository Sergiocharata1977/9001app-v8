# Calendar AI API Documentation

Esta documentación describe los endpoints especializados del sistema de calendario diseñados para ser consumidos por agentes de IA.

## Características Generales

- **Rate Limiting**: 100 requests por minuto por IP
- **Autenticación**: Requerida (headers estándar de la aplicación)
- **Formato**: JSON
- **Método**: POST para todos los endpoints

## Headers de Rate Limiting

Todos los endpoints retornan headers de rate limiting:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699564800000
```

## Endpoints

### 1. User Events Query

Obtener eventos de un usuario con filtros avanzados.

**Endpoint**: `POST /api/calendar/ai/user-events`

**Request Body**:

```json
{
  "userId": "user123",
  "filters": {
    "type": ["audit", "document_expiry"],
    "status": ["scheduled", "overdue"],
    "priority": "high",
    "minPriority": "medium",
    "dateRange": {
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    },
    "includeCompleted": false,
    "includeOverdue": true,
    "limit": 50
  },
  "includeContext": true,
  "sortBy": "date",
  "sortOrder": "asc"
}
```

**Response**:

```json
{
  "userId": "user123",
  "userName": "Juan Pérez",
  "totalEvents": 15,
  "events": [
    {
      "id": "evt123",
      "title": "Auditoría Interna ISO 9001",
      "date": "2024-03-15T09:00:00Z",
      "type": "audit",
      "priority": "high",
      "status": "scheduled",
      ...
    }
  ],
  "summary": {
    "byType": {
      "audit": 5,
      "document_expiry": 10
    },
    "byPriority": {
      "high": 8,
      "medium": 7
    },
    "byStatus": {
      "scheduled": 12,
      "overdue": 3
    },
    "overdueCount": 3,
    "upcomingCount": 12
  },
  "context": [
    {
      "event": {...},
      "sourceRecord": {...},
      "responsibleUser": {...},
      ...
    }
  ]
}
```

**Casos de Uso**:

- Obtener todos los eventos pendientes de un usuario
- Filtrar eventos por prioridad y tipo
- Analizar eventos vencidos
- Obtener contexto completo para análisis

---

### 2. User Tasks Query

Obtener tareas pendientes de un usuario (eventos no completados).

**Endpoint**: `POST /api/calendar/ai/user-tasks`

**Request Body**:

```json
{
  "userId": "user123",
  "includeOverdue": true,
  "includeUpcoming": true,
  "daysAhead": 30,
  "groupBy": "priority"
}
```

**Response**:

```json
{
  "userId": "user123",
  "userName": "Juan Pérez",
  "totalTasks": 25,
  "overdueTasks": 5,
  "upcomingTasks": 20,
  "tasks": [...],
  "groupedTasks": {
    "critical": [...],
    "high": [...],
    "medium": [...],
    "low": [...]
  }
}
```

**Opciones de groupBy**:

- `type`: Agrupar por tipo de evento
- `priority`: Agrupar por prioridad
- `module`: Agrupar por módulo origen
- `date`: Agrupar por fecha

**Casos de Uso**:

- Listar tareas pendientes del día
- Identificar tareas vencidas
- Priorizar trabajo del usuario
- Generar reportes de tareas

---

### 3. Workload Analysis

Analizar la carga de trabajo de un usuario en un período.

**Endpoint**: `POST /api/calendar/ai/workload-analysis`

**Request Body**:

```json
{
  "userId": "user123",
  "period": "month",
  "startDate": "2024-03-01",
  "compareWithPrevious": true
}
```

**Períodos disponibles**: `week`, `month`, `quarter`

**Response**:

```json
{
  "current": {
    "userId": "user123",
    "userName": "Juan Pérez",
    "period": "month",
    "startDate": "2024-03-01",
    "endDate": "2024-03-31",
    "totalEvents": 45,
    "overdueEvents": 3,
    "upcomingEvents": 35,
    "completedEvents": 7,
    "byType": {
      "audit": 10,
      "document_expiry": 20,
      "action_deadline": 15
    },
    "byPriority": {
      "critical": 5,
      "high": 15,
      "medium": 20,
      "low": 5
    },
    "byStatus": {
      "scheduled": 35,
      "overdue": 3,
      "completed": 7
    },
    "completionRate": 15.56,
    "averageEventsPerDay": 1.5,
    "peakDay": {
      "date": "2024-03-15",
      "count": 8
    }
  },
  "previous": {
    ...
  },
  "trend": "increasing",
  "insights": [
    "Tiene 3 evento(s) vencido(s) que requieren atención inmediata.",
    "5 evento(s) de prioridad crítica requieren atención."
  ],
  "recommendations": [
    "Priorice la resolución de eventos vencidos antes de tomar nuevas tareas.",
    "Considere delegar o reprogramar eventos no críticos para balancear la carga."
  ]
}
```

**Casos de Uso**:

- Evaluar carga de trabajo actual
- Comparar con períodos anteriores
- Identificar tendencias
- Generar recomendaciones de gestión
- Detectar sobrecarga de trabajo

---

### 4. Event Context

Obtener contexto completo de un evento específico.

**Endpoint**: `POST /api/calendar/ai/event-context`

**Request Body**:

```json
{
  "eventId": "evt123",
  "includeSourceRecord": true,
  "includeRelatedRecords": true,
  "includeUserDetails": true,
  "includeProcessDetails": true
}
```

**Response**:

```json
{
  "event": {
    "id": "evt123",
    "title": "Auditoría Interna ISO 9001",
    "date": "2024-03-15T09:00:00Z",
    "type": "audit",
    ...
  },
  "sourceRecord": {
    "id": "audit456",
    "auditNumber": "AUD-2024-001",
    "scope": "Proceso de Producción",
    ...
  },
  "relatedRecords": [],
  "responsibleUser": {
    "id": "user123",
    "name": "Juan Pérez",
    "email": "juan.perez@example.com"
  },
  "participants": [
    {
      "id": "user456",
      "name": "María García",
      "email": "maria.garcia@example.com"
    }
  ],
  "process": {
    "id": "proc789",
    "name": "Gestión de Calidad"
  },
  "organization": {
    "id": "org001",
    "name": "Mi Organización"
  }
}
```

**Casos de Uso**:

- Obtener información completa de un evento
- Acceder al registro origen (auditoría, documento, etc.)
- Conocer participantes y responsables
- Entender el contexto organizacional

---

## Tipos de Eventos

| Tipo              | Descripción                          | Módulo Origen |
| ----------------- | ------------------------------------ | ------------- |
| `audit`           | Auditorías programadas               | audits        |
| `document_expiry` | Vencimiento de documentos            | documents     |
| `action_deadline` | Fecha límite de acciones correctivas | actions       |
| `training`        | Capacitaciones                       | trainings     |
| `evaluation`      | Evaluaciones                         | evaluations   |
| `meeting`         | Reuniones                            | custom        |
| `general`         | Eventos generales                    | custom        |

## Prioridades

| Prioridad  | Descripción                 |
| ---------- | --------------------------- |
| `critical` | Requiere atención inmediata |
| `high`     | Alta prioridad              |
| `medium`   | Prioridad media             |
| `low`      | Baja prioridad              |

## Estados

| Estado        | Descripción |
| ------------- | ----------- |
| `scheduled`   | Programado  |
| `in_progress` | En progreso |
| `completed`   | Completado  |
| `cancelled`   | Cancelado   |
| `overdue`     | Vencido     |

## Manejo de Errores

### 400 Bad Request

```json
{
  "error": "userId es requerido"
}
```

### 404 Not Found

```json
{
  "error": "Evento no encontrado"
}
```

### 429 Too Many Requests

```json
{
  "error": "Demasiadas solicitudes. Intente nuevamente más tarde.",
  "resetAt": "2024-03-15T10:30:00Z"
}
```

### 500 Internal Server Error

```json
{
  "error": "Error al obtener eventos del usuario"
}
```

## Ejemplos de Uso

### Ejemplo 1: Obtener tareas urgentes del día

```javascript
const response = await fetch('/api/calendar/ai/user-tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    includeOverdue: true,
    includeUpcoming: true,
    daysAhead: 1,
    groupBy: 'priority',
  }),
});

const data = await response.json();
console.log(`Tareas urgentes: ${data.overdueTasks + data.upcomingTasks}`);
```

### Ejemplo 2: Analizar carga de trabajo mensual

```javascript
const response = await fetch('/api/calendar/ai/workload-analysis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    period: 'month',
    compareWithPrevious: true,
  }),
});

const data = await response.json();
console.log(`Tendencia: ${data.trend}`);
console.log(`Insights: ${data.insights.join(', ')}`);
```

### Ejemplo 3: Buscar eventos críticos

```javascript
const response = await fetch('/api/calendar/ai/user-events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    filters: {
      priority: 'critical',
      status: ['scheduled', 'overdue'],
      limit: 10,
    },
    sortBy: 'date',
    sortOrder: 'asc',
  }),
});

const data = await response.json();
console.log(`Eventos críticos: ${data.totalEvents}`);
```

## Mejores Prácticas

1. **Rate Limiting**: Respete los límites de 100 requests/minuto
2. **Filtros**: Use filtros específicos para reducir el volumen de datos
3. **Paginación**: Use el parámetro `limit` para controlar el tamaño de respuesta
4. **Contexto**: Solo solicite `includeContext: true` cuando sea necesario
5. **Caché**: Considere cachear respuestas cuando sea apropiado
6. **Errores**: Implemente manejo robusto de errores y reintentos

## Notas de Implementación

- Los timestamps están en formato ISO 8601
- Las fechas de Firestore se serializan automáticamente
- Los filtros de array usan operador OR (cualquier coincidencia)
- Los filtros de string usan operador AND (coincidencia exacta)
- El rate limiting es por IP, no por usuario
