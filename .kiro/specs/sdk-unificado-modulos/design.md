# Design Document - SDK Unificado de Módulos con Firebase Admin

## Overview

Este documento describe el diseño técnico del SDK unificado que consolida todos los módulos del sistema 9001app-firebase. El SDK proporciona una capa de abstracción consistente sobre Firebase Admin SDK, servicios de negocio, autenticación, autorización y gestión de errores.

### Objetivos del Diseño

1. **Autenticación Server-Side Robusta**: Implementar Firebase Admin SDK real para verificación de tokens
2. **Interfaz Unificada**: Proporcionar acceso consistente a todos los módulos del sistema
3. **Reutilización de Código**: Eliminar duplicación mediante clases base y helpers compartidos
4. **Seguridad**: Implementar autorización centralizada con roles y permisos
5. **Mantenibilidad**: Facilitar la adición de nuevos módulos y funcionalidades
6. **Performance**: Optimizar operaciones con caching y batch operations
7. **Observabilidad**: Implementar logging, métricas y auditoría completa

### Principios de Diseño

- **Single Responsibility**: Cada servicio tiene una responsabilidad clara
- **DRY (Don't Repeat Yourself)**: Funcionalidad común en clases base
- **Dependency Injection**: Servicios reciben dependencias como parámetros
- **Type Safety**: TypeScript estricto en todo el SDK
- **Error Handling**: Manejo consistente de errores con tipos específicos
- **Testability**: Diseño que facilita unit testing y mocking

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
│                      (API Routes)                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   SDK Unificado                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Authentication Middleware                   │   │
│  │  - Token Verification                                │   │
│  │  - Role & Permission Checks                          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Service Layer                           │   │
│  │  - AuditService    - DocumentService                 │   │
│  │  - FindingService  - CalendarService                 │   │
│  │  - ActionService   - NewsService                     │   │
│  │  - NormPointService - RRHHServices                   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Base Service                            │   │
│  │  - CRUD Operations                                   │   │
│  │  - Validation                                        │   │
│  │  - Timestamps & Audit                                │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Firebase Admin SDK                              │
│  - Admin Auth (Token Verification)                          │
│  - Admin Firestore (Database)                               │
│  - Admin Storage (File Storage)                             │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── lib/
│   ├── firebase/
│   │   ├── admin.ts                 # Firebase Admin SDK initialization
│   │   ├── auth.ts                  # Auth helpers
│   │   └── config.ts                # Configuration validation
│   ├── sdk/
│   │   ├── index.ts                 # Main SDK export
│   │   ├── base/
│   │   │   ├── BaseService.ts       # Abstract base service
│   │   │   ├── BaseError.ts         # Custom error classes
│   │   │   └── types.ts             # Shared types
│   │   ├── middleware/
│   │   │   ├── auth.ts              # Authentication middleware
│   │   │   ├── permissions.ts       # Permission middleware
│   │   │   ├── rateLimit.ts         # Rate limiting
│   │   │   └── errorHandler.ts      # Error handling middleware
│   │   ├── helpers/
│   │   │   ├── auth.ts              # Auth helper functions
│   │   │   ├── permissions.ts       # Permission helpers
│   │   │   ├── validation.ts        # Validation helpers
│   │   │   └── logging.ts           # Logging utilities
│   │   └── modules/
│   │       ├── audits/              # Audit module
│   │       ├── findings/            # Findings module
│   │       ├── actions/             # Actions module
│   │       ├── documents/           # Documents module
│   │       ├── normPoints/          # Norm Points module
│   │       ├── calendar/            # Calendar module
│   │       ├── news/                # News module
│   │       ├── rrhh/                # RRHH module
│   │       └── ...                  # Other modules
├── services/                        # Existing services (to be migrated)
└── types/                           # Type definitions
```

## Components and Interfaces

### 1. Firebase Admin Initialization

**File**: `src/lib/firebase/admin.ts`

**Purpose**: Initialize and export Firebase Admin SDK instances

**Key Functions**:

- `initializeFirebaseAdmin()`: Initialize Firebase Admin with service account
- `getAdminAuth()`: Get Admin Auth instance
- `getAdminFirestore()`: Get Admin Firestore instance
- `getAdminStorage()`: Get Admin Storage instance

**Implementation Details**:

```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Singleton pattern to prevent multiple initializations
let adminApp: any = null;

export function initializeFirebaseAdmin() {
  if (adminApp) return adminApp;

  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } else {
    adminApp = getApps()[0];
  }

  return adminApp;
}

export function getAdminAuth() {
  initializeFirebaseAdmin();
  return getAuth();
}

export function getAdminFirestore() {
  initializeFirebaseAdmin();
  return getFirestore();
}

export function getAdminStorage() {
  initializeFirebaseAdmin();
  return getStorage();
}
```

### 2. Authentication Middleware

**File**: `src/lib/sdk/middleware/auth.ts`

**Purpose**: Verify Firebase tokens and attach user context to requests

**Key Functions**:

- `withAuth()`: HOF that wraps API route handlers with authentication
- `verifyToken()`: Verify Firebase ID token
- `extractUserFromToken()`: Extract user info from decoded token

**Implementation Details**:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { UnauthorizedError } from '../base/BaseError';

export interface AuthenticatedRequest extends NextRequest {
  user: {
    uid: string;
    email: string;
    role: string;
    organizationId: string;
    permissions: string[];
  };
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedError('No token provided');
      }

      const token = authHeader.substring(7);

      // Verify token with Firebase Admin
      const auth = getAdminAuth();
      const decodedToken = await auth.verifyIdToken(token);

      // Extract user info and custom claims
      const user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        role: decodedToken.role || 'empleado',
        organizationId: decodedToken.organizationId || '',
        permissions: decodedToken.permissions || [],
      };

      // Attach user to request
      (req as AuthenticatedRequest).user = user;

      // Call the actual handler
      return await handler(req as AuthenticatedRequest);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }

      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}
```

**Usage Example**:

```typescript
// In API route: src/app/api/audits/route.ts
import { withAuth } from '@/lib/sdk/middleware/auth';

export const GET = withAuth(async req => {
  const { user } = req;
  // user is now available with type safety
  const audits = await SDK.audits.list({ organizationId: user.organizationId });
  return NextResponse.json(audits);
});
```

### 3. Permission Middleware

**File**: `src/lib/sdk/middleware/permissions.ts`

**Purpose**: Check user roles and permissions before allowing operations

**Key Functions**:

- `requireRole(role)`: Middleware to require specific role
- `requirePermission(permission)`: Middleware to require specific permission
- `requireOrganization(orgId)`: Middleware to validate organization access

**Implementation Details**:

```typescript
import { AuthenticatedRequest } from './auth';
import { ForbiddenError } from '../base/BaseError';

export function requireRole(...allowedRoles: string[]) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return async (req: AuthenticatedRequest) => {
      const { user } = req;

      if (!allowedRoles.includes(user.role)) {
        throw new ForbiddenError(`Required role: ${allowedRoles.join(' or ')}`);
      }

      return handler(req);
    };
  };
}

export function requirePermission(...requiredPermissions: string[]) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return async (req: AuthenticatedRequest) => {
      const { user } = req;

      const hasPermission = requiredPermissions.every(perm =>
        user.permissions.includes(perm)
      );

      if (!hasPermission) {
        throw new ForbiddenError(
          `Required permission: ${requiredPermissions.join(', ')}`
        );
      }

      return handler(req);
    };
  };
}
```

**Usage Example**:

```typescript
// Require admin or gerente role
export const DELETE = withAuth(
  requireRole(
    'admin',
    'gerente'
  )(async req => {
    // Only admin or gerente can access this
    await SDK.audits.delete(auditId);
    return NextResponse.json({ success: true });
  })
);
```

### 4. Base Service Class

**File**: `src/lib/sdk/base/BaseService.ts`

**Purpose**: Abstract base class with common CRUD operations

**Key Methods**:

- `create(data)`: Create new document with validation
- `getById(id)`: Get document by ID with org filtering
- `update(id, data)`: Update document with validation
- `delete(id)`: Soft delete document
- `list(filters, pagination)`: List documents with filters

**Implementation Details**:

```typescript
import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

export interface BaseDocument {
  id: string;
  organizationId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
}

export interface ListOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export abstract class BaseService<T extends BaseDocument> {
  protected db = getAdminFirestore();
  protected abstract collectionName: string;
  protected abstract schema: z.ZodSchema<any>;

  async create(data: Partial<T>, userId: string): Promise<T> {
    // Validate data
    const validated = this.schema.parse(data);

    // Add timestamps and audit fields
    const now = Timestamp.now();
    const docData = {
      ...validated,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
      isActive: true,
    };

    // Create document
    const docRef = await this.db.collection(this.collectionName).add(docData);

    return {
      id: docRef.id,
      ...docData,
    } as T;
  }

  async getById(id: string, organizationId: string): Promise<T | null> {
    const doc = await this.db.collection(this.collectionName).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data() as T;

    // Validate organization access
    if (data.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this resource');
    }

    return {
      id: doc.id,
      ...data,
    } as T;
  }

  async update(
    id: string,
    data: Partial<T>,
    userId: string,
    organizationId: string
  ): Promise<T> {
    // Verify document exists and user has access
    const existing = await this.getById(id, organizationId);
    if (!existing) {
      throw new NotFoundError('Document not found');
    }

    // Validate partial data
    const validated = this.schema.partial().parse(data);

    // Update with timestamp
    const updateData = {
      ...validated,
      updatedAt: Timestamp.now(),
      updatedBy: userId,
    };

    await this.db.collection(this.collectionName).doc(id).update(updateData);

    return this.getById(id, organizationId) as Promise<T>;
  }

  async delete(id: string, organizationId: string): Promise<void> {
    // Verify document exists and user has access
    const existing = await this.getById(id, organizationId);
    if (!existing) {
      throw new NotFoundError('Document not found');
    }

    // Soft delete
    await this.db.collection(this.collectionName).doc(id).update({
      isActive: false,
      updatedAt: Timestamp.now(),
    });
  }

  async list(
    organizationId: string,
    filters: Record<string, any> = {},
    options: ListOptions = {}
  ): Promise<T[]> {
    let query = this.db
      .collection(this.collectionName)
      .where('organizationId', '==', organizationId)
      .where('isActive', '==', true);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.where(key, '==', value);
    });

    // Apply ordering
    if (options.orderBy) {
      query = query.orderBy(options.orderBy, options.orderDirection || 'desc');
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.offset(options.offset);
    }

    const snapshot = await query.get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  }
}
```

### 5. Custom Error Classes

**File**: `src/lib/sdk/base/BaseError.ts`

**Purpose**: Typed error classes for consistent error handling

**Implementation Details**:

```typescript
export class BaseError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends BaseError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends BaseError {
  constructor(
    message: string = 'Validation failed',
    public errors: Record<string, string[]> = {}
  ) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class ConflictError extends BaseError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends BaseError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}
```

### 6. Error Handler Middleware

**File**: `src/lib/sdk/middleware/errorHandler.ts`

**Purpose**: Catch and format errors consistently

**Implementation Details**:

```typescript
import { NextResponse } from 'next/server';
import { BaseError, ValidationError } from '../base/BaseError';
import { ZodError } from 'zod';

export function errorHandler(error: unknown): NextResponse {
  // Log error for debugging
  console.error('API Error:', error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    error.errors.forEach(err => {
      const path = err.path.join('.');
      if (!errors[path]) errors[path] = [];
      errors[path].push(err.message);
    });

    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors,
      },
      { status: 400 }
    );
  }

  // Handle custom errors
  if (error instanceof BaseError) {
    const response: any = {
      error: error.message,
      code: error.code,
    };

    if (error instanceof ValidationError) {
      response.errors = error.errors;
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
}

// Wrapper to use with async handlers
export function withErrorHandler(
  handler: (...args: any[]) => Promise<NextResponse>
) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return errorHandler(error);
    }
  };
}
```

### 7. Module Services

Each module extends BaseService and implements specific business logic.

**Example: AuditService**

**File**: `src/lib/sdk/modules/audits/AuditService.ts`

```typescript
import { BaseService, BaseDocument } from '../../base/BaseService';
import { z } from 'zod';
import { Timestamp } from 'firebase-admin/firestore';

export interface Audit extends BaseDocument {
  auditNumber: string;
  title: string;
  type: 'interna' | 'externa' | 'proveedor' | 'cliente';
  scope: 'completa' | 'parcial' | 'seguimiento';
  status: 'planificada' | 'en_progreso' | 'completada' | 'cancelada';
  scheduledDate: Timestamp;
  leadAuditor: string;
  teamMembers: Array<{
    userId: string;
    role: 'lider' | 'asistente' | 'observador';
  }>;
  normClauses: string[];
  findingsCount: number;
}

const auditSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(['interna', 'externa', 'proveedor', 'cliente']),
  scope: z.enum(['completa', 'parcial', 'seguimiento']),
  scheduledDate: z.any(), // Timestamp
  leadAuditor: z.string(),
  teamMembers: z
    .array(
      z.object({
        userId: z.string(),
        role: z.enum(['lider', 'asistente', 'observador']),
      })
    )
    .optional(),
  normClauses: z.array(z.string()).optional(),
  organizationId: z.string(),
});

export class AuditService extends BaseService<Audit> {
  protected collectionName = 'audits';
  protected schema = auditSchema;

  async create(data: Partial<Audit>, userId: string): Promise<Audit> {
    // Generate audit number
    const auditNumber = await this.generateAuditNumber(data.organizationId!);

    // Create with base service
    return super.create(
      {
        ...data,
        auditNumber,
        status: 'planificada',
        findingsCount: 0,
      },
      userId
    );
  }

  private async generateAuditNumber(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `AUD-${year}-`;

    // Get last audit number for this year
    const snapshot = await this.db
      .collection(this.collectionName)
      .where('organizationId', '==', organizationId)
      .where('auditNumber', '>=', prefix)
      .where('auditNumber', '<', `AUD-${year + 1}-`)
      .orderBy('auditNumber', 'desc')
      .limit(1)
      .get();

    let sequence = 1;
    if (!snapshot.empty) {
      const lastNumber = snapshot.docs[0].data().auditNumber;
      const lastSequence = parseInt(lastNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(3, '0')}`;
  }

  async updateStatus(
    id: string,
    status: Audit['status'],
    userId: string,
    organizationId: string
  ): Promise<Audit> {
    return this.update(
      id,
      { status } as Partial<Audit>,
      userId,
      organizationId
    );
  }

  async getByNumber(
    auditNumber: string,
    organizationId: string
  ): Promise<Audit | null> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where('organizationId', '==', organizationId)
      .where('auditNumber', '==', auditNumber)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Audit;
  }
}
```

### 8. SDK Main Export

**File**: `src/lib/sdk/index.ts`

**Purpose**: Central export point for all SDK functionality

```typescript
// Services
import { AuditService } from './modules/audits/AuditService';
import { FindingService } from './modules/findings/FindingService';
import { ActionService } from './modules/actions/ActionService';
import { DocumentService } from './modules/documents/DocumentService';
import { NormPointService } from './modules/normPoints/NormPointService';
import { CalendarService } from './modules/calendar/CalendarService';
import { PostService } from './modules/news/PostService';
import { CommentService } from './modules/news/CommentService';
import { ReactionService } from './modules/news/ReactionService';
// ... import other services

// Middleware
export { withAuth } from './middleware/auth';
export { requireRole, requirePermission } from './middleware/permissions';
export { withErrorHandler } from './middleware/errorHandler';
export { withRateLimit } from './middleware/rateLimit';

// Helpers
export * from './helpers/auth';
export * from './helpers/permissions';
export * from './helpers/validation';

// Errors
export * from './base/BaseError';

// Types
export type { AuthenticatedRequest } from './middleware/auth';
export type { BaseDocument, ListOptions } from './base/BaseService';

// SDK Instance
export const SDK = {
  // Audits, Findings, Actions
  audits: new AuditService(),
  findings: new FindingService(),
  actions: new ActionService(),

  // Documents & Norm Points
  documents: new DocumentService(),
  normPoints: new NormPointService(),

  // Calendar
  calendar: new CalendarService(),

  // News
  news: {
    posts: new PostService(),
    comments: new CommentService(),
    reactions: new ReactionService(),
  },

  // RRHH
  rrhh: {
    personnel: new PersonnelService(),
    positions: new PositionService(),
    trainings: new TrainingService(),
    evaluations: new EvaluationService(),
    departments: new DepartmentService(),
    competences: new CompetenceService(),
  },

  // Quality
  quality: {
    objectives: new QualityObjectiveService(),
    indicators: new QualityIndicatorService(),
    measurements: new MeasurementService(),
  },

  // Processes
  processes: new ProcessService(),

  // Other modules
  policies: new PoliticaService(),
  foda: new AnalisisFODAService(),
  organigramas: new OrganigramaService(),
  flujogramas: new FlujogramaService(),
  reuniones: new ReunionTrabajoService(),
};
```

## Data Models

### Core Types

**File**: `src/lib/sdk/base/types.ts`

```typescript
import { Timestamp } from 'firebase-admin/firestore';

// Base document interface
export interface BaseDocument {
  id: string;
  organizationId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
}

// User context from token
export interface UserContext {
  uid: string;
  email: string;
  role: 'admin' | 'gerente' | 'jefe' | 'empleado' | 'auditor';
  organizationId: string;
  permissions: string[];
}

// Pagination
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  cursor?: string;
}

// Query filters
export interface QueryFilters {
  [key: string]: any;
}

// Sort options
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// List response
export interface ListResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  errors?: Record<string, string[]>;
}
```

### Module-Specific Models

Each module defines its own interfaces extending BaseDocument:

- **Audit**: Audit information with team, clauses, findings
- **Finding**: Finding details with source, severity, analysis
- **Action**: Corrective/preventive action with plan, verification
- **Document**: Document metadata with version, approval flow
- **NormPoint**: ISO norm point with compliance tracking
- **CalendarEvent**: Event with type, source module, participants
- **Post**: News post with content, attachments, reactions
- **Personnel**: Employee information with position, competences
- **QualityObjective**: Quality objective with targets, indicators

## Error Handling

### Error Flow

```
API Request
    ↓
Middleware (Auth, Permissions)
    ↓
Service Method
    ↓
Validation (Zod)
    ↓
Database Operation
    ↓
Error Occurs
    ↓
Throw Custom Error
    ↓
Error Handler Middleware
    ↓
Format Error Response
    ↓
Return to Client
```

### Error Response Format

```typescript
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "errors": {  // Only for validation errors
    "field1": ["Error message 1", "Error message 2"],
    "field2": ["Error message"]
  }
}
```

### HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication failed)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate resource)
- **429**: Too Many Requests (rate limit)
- **500**: Internal Server Error

## Testing Strategy

### Unit Tests

**Test BaseService**:

- CRUD operations
- Validation
- Organization filtering
- Soft delete
- Pagination

**Test Middleware**:

- Token verification
- Role checking
- Permission validation
- Error handling

**Test Services**:

- Business logic
- Number generation
- Status transitions
- Relationships

### Integration Tests

**Test API Routes**:

- Authentication flow
- Authorization checks
- CRUD operations end-to-end
- Error responses

**Test with Firebase Emulator**:

- Real Firestore operations
- Transaction handling
- Query performance

### Mocking Strategy

```typescript
// Mock Firebase Admin for unit tests
jest.mock('@/lib/firebase/admin', () => ({
  getAdminAuth: jest.fn(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: 'test-user',
      email: 'test@example.com',
      role: 'gerente',
      organizationId: 'org-123',
    }),
  })),
  getAdminFirestore: jest.fn(() => mockFirestore),
}));

// Mock service for API route tests
const mockAuditService = {
  create: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  list: jest.fn(),
};
```

## Security Considerations

### Authentication

1. **Token Verification**: All API routes verify Firebase ID tokens using Admin SDK
2. **Token Expiration**: Tokens expire after 1 hour, requiring refresh
3. **Custom Claims**: Roles and permissions stored in token claims
4. **Secure Headers**: Use HTTPS only, set security headers

### Authorization

1. **Role-Based Access Control (RBAC)**: Check user role before operations
2. **Organization Isolation**: Filter all queries by organizationId
3. **Resource Ownership**: Verify user owns resource before modification
4. **Permission Granularity**: Fine-grained permissions for specific actions

### Data Protection

1. **Input Validation**: Validate all inputs with Zod schemas
2. **SQL Injection Prevention**: Use Firestore SDK (no raw queries)
3. **XSS Prevention**: Sanitize user-generated content
4. **File Upload Security**: Validate file types and sizes
5. **Rate Limiting**: Prevent abuse with rate limits

### Audit Logging

1. **Authentication Logs**: Log all login attempts
2. **Authorization Logs**: Log permission checks
3. **Operation Logs**: Log all CRUD operations
4. **Error Logs**: Log all errors with context
5. **Sensitive Data**: Never log passwords or tokens

## Performance Optimization

### Caching Strategy

1. **Firebase Admin Instances**: Singleton pattern to reuse connections
2. **User Context**: Cache user context for 5 minutes
3. **Query Results**: Cache frequently accessed data with Redis
4. **Static Data**: Cache norm points, departments, etc.

### Database Optimization

1. **Indexes**: Create composite indexes for common queries
2. **Batch Operations**: Use batch writes for multiple updates
3. **Pagination**: Implement cursor-based pagination
4. **Lazy Loading**: Load related entities on demand
5. **Query Limits**: Always limit query results

### API Optimization

1. **Response Compression**: Enable gzip compression
2. **Payload Size**: Minimize response payload
3. **Parallel Requests**: Use Promise.all for independent operations
4. **Connection Pooling**: Reuse database connections
5. **CDN**: Serve static assets from CDN

### Monitoring

1. **Response Times**: Track API response times
2. **Error Rates**: Monitor error rates per endpoint
3. **Database Queries**: Monitor slow queries
4. **Memory Usage**: Track memory consumption
5. **Rate Limits**: Monitor rate limit hits

## Migration Plan

### Phase 1: Foundation (Week 1-2)

1. ✅ Setup Firebase Admin SDK initialization
2. ✅ Create BaseService abstract class
3. ✅ Implement authentication middleware
4. ✅ Implement permission middleware
5. ✅ Create custom error classes
6. ✅ Setup error handler middleware

### Phase 2: Core Modules (Week 3-4)

1. Migrate AuditService to new SDK
2. Migrate FindingService to new SDK
3. Migrate ActionService to new SDK
4. Update API routes to use new middleware
5. Write tests for migrated modules

### Phase 3: Document & Norm Modules (Week 5-6)

1. Migrate DocumentService to new SDK
2. Migrate NormPointService to new SDK
3. Update API routes
4. Write tests

### Phase 4: Calendar & News (Week 7-8)

1. Migrate CalendarService to new SDK
2. Migrate News services (Post, Comment, Reaction)
3. Update API routes
4. Write tests

### Phase 5: RRHH & Quality (Week 9-10)

1. Migrate RRHH services (Personnel, Position, Training, Evaluation)
2. Migrate Quality services (Objectives, Indicators)
3. Update API routes
4. Write tests

### Phase 6: Remaining Modules (Week 11-12)

1. Migrate remaining services (Processes, Policies, FODA, etc.)
2. Update all API routes
3. Complete test coverage
4. Performance optimization

### Phase 7: Documentation & Cleanup (Week 13-14)

1. Write comprehensive documentation
2. Create migration guides
3. Remove old service implementations
4. Final testing and validation

## API Route Examples

### Example 1: List Audits with Authentication

**File**: `src/app/api/audits/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withErrorHandler, SDK } from '@/lib/sdk';

export const GET = withAuth(
  withErrorHandler(async req => {
    const { user } = req;
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const filters = {
      status: searchParams.get('status'),
      type: searchParams.get('type'),
    };

    const options = {
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      orderBy: 'scheduledDate',
      orderDirection: 'desc' as const,
    };

    // Get audits using SDK
    const audits = await SDK.audits.list(user.organizationId, filters, options);

    return NextResponse.json({
      success: true,
      data: audits,
    });
  })
);
```

### Example 2: Create Audit with Role Check

```typescript
import { requireRole } from '@/lib/sdk';

export const POST = withAuth(
  requireRole(
    'gerente',
    'jefe'
  )(
    withErrorHandler(async req => {
      const { user } = req;
      const body = await req.json();

      // Create audit
      const audit = await SDK.audits.create(
        {
          ...body,
          organizationId: user.organizationId,
        },
        user.uid
      );

      return NextResponse.json({ success: true, data: audit }, { status: 201 });
    })
  )
);
```

### Example 3: Update Audit with Ownership Check

```typescript
export const PUT = withAuth(
  withErrorHandler(async req => {
    const { user } = req;
    const { id } = req.params;
    const body = await req.json();

    // Get existing audit
    const existing = await SDK.audits.getById(id, user.organizationId);

    if (!existing) {
      throw new NotFoundError('Audit not found');
    }

    // Check if user can modify (owner or gerente)
    if (
      existing.createdBy !== user.uid &&
      !['gerente', 'admin'].includes(user.role)
    ) {
      throw new ForbiddenError('Cannot modify this audit');
    }

    // Update audit
    const updated = await SDK.audits.update(
      id,
      body,
      user.uid,
      user.organizationId
    );

    return NextResponse.json({
      success: true,
      data: updated,
    });
  })
);
```

### Example 4: Delete with Admin Role

```typescript
export const DELETE = withAuth(
  requireRole(
    'admin',
    'gerente'
  )(
    withErrorHandler(async req => {
      const { user } = req;
      const { id } = req.params;

      await SDK.audits.delete(id, user.organizationId);

      return NextResponse.json({
        success: true,
        message: 'Audit deleted successfully',
      });
    })
  )
);
```

## Configuration

### Environment Variables

**File**: `.env.local`

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Firebase Client SDK (for frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
```

### Firestore Indexes

**File**: `firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "audits",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "scheduledDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "audits",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "scheduledDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "findings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "severity", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

## Deployment Considerations

### Production Checklist

- [ ] Environment variables configured
- [ ] Firebase Admin SDK credentials secured
- [ ] Firestore indexes deployed
- [ ] Security rules updated
- [ ] Rate limiting configured
- [ ] Logging configured
- [ ] Error monitoring setup (Sentry)
- [ ] Performance monitoring enabled
- [ ] Backup strategy implemented
- [ ] SSL/TLS certificates configured

### Monitoring Setup

1. **Application Monitoring**: Use Vercel Analytics or similar
2. **Error Tracking**: Setup Sentry for error tracking
3. **Performance**: Monitor API response times
4. **Database**: Monitor Firestore usage and costs
5. **Logs**: Centralize logs with CloudWatch or similar

### Scaling Considerations

1. **Horizontal Scaling**: Next.js serverless functions scale automatically
2. **Database**: Firestore scales automatically
3. **Caching**: Implement Redis for high-traffic endpoints
4. **CDN**: Use Vercel Edge Network or CloudFlare
5. **Rate Limiting**: Adjust limits based on usage patterns

## Conclusion

This SDK design provides a robust, scalable, and maintainable foundation for the 9001app-firebase system. Key benefits include:

1. **Consistency**: Unified interface across all modules
2. **Security**: Centralized authentication and authorization
3. **Maintainability**: Shared base classes reduce code duplication
4. **Type Safety**: Full TypeScript support with strict typing
5. **Testability**: Easy to mock and test components
6. **Performance**: Optimized with caching and efficient queries
7. **Observability**: Comprehensive logging and monitoring

The phased migration approach ensures minimal disruption while progressively improving the codebase.
