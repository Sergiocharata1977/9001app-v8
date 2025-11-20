# Implementation Plan

## 1. Setup base infrastructure and shared services

- [ ] 1.1 Create TypeScript interfaces and types
  - Create `src/types/audits.ts` with Audit, AuditFilters, AuditFormData interfaces
  - Create `src/types/findings.ts` with Finding, FindingFilters, FindingFormData interfaces
  - Create `src/types/actions.ts` with Action, ActionFilters, ActionFormData interfaces
  - _Requirements: 1.1, 3.1, 5.1, 8.1, 8.2, 8.3_

- [ ] 1.2 Create Zod validation schemas
  - Create `src/lib/validations/audits.ts` with audit validation schemas
  - Create `src/lib/validations/findings.ts` with finding validation schemas
  - Create `src/lib/validations/actions.ts` with action validation schemas
  - Include validation for dates, required fields, and enum values
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.9_

- [ ] 1.3 Implement TraceabilityService
  - Create `src/services/shared/TraceabilityService.ts`
  - Implement `generateNumber(prefix, year)` for sequential number generation using Firestore counters collection
  - Implement `buildTraceabilityChain(sourceChain, newId)` to construct traceability arrays
  - Implement navigation methods: `getAuditFromAction`, `getFindingFromAction`, `getAuditFromFinding`
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10_

- [ ] 1.4 Create Firestore indexes configuration
  - Update `firestore.indexes.json` with composite indexes for audits collection
  - Add composite indexes for findings collection (source, status, severity, identifiedDate)
  - Add composite indexes for actions collection (findingId, status, plannedEndDate)
  - Add index for counters collection
  - _Requirements: 1.7, 3.7, 5.8_

## 2. Implement ABM Auditorías (Audits Module)

- [ ] 2.1 Create AuditService
  - Create `src/services/audits/AuditService.ts`
  - Implement CRUD methods: `getAll`, `getById`, `create`, `update`, `delete`
  - Implement `generateAuditNumber()` using TraceabilityService
  - Implement `updateStatus(id, status, userId)` for state transitions
  - Implement `updateFindingsCounters(auditId)` to update finding counts
  - Implement `getFindings(auditId)` to retrieve related findings
  - Implement `getStats(year)` for audit statistics
  - _Requirements: 1.1, 1.5, 1.6, 1.7, 1.8, 1.9, 2.1, 2.3, 9.1_

- [ ] 2.2 Create Audit API routes
  - Create `src/app/api/audits/route.ts` for GET (list) and POST (create)
  - Create `src/app/api/audits/[id]/route.ts` for GET (detail), PUT (update), DELETE
  - Create `src/app/api/audits/[id]/status/route.ts` for PATCH (update status)
  - Create `src/app/api/audits/[id]/findings/route.ts` for GET (related findings)
  - Create `src/app/api/audits/stats/route.ts` for GET (statistics)
  - Implement error handling with custom error types
  - _Requirements: 1.6, 1.7, 1.8, 1.9, 1.10, 2.1, 2.5_

- [ ] 2.3 Create Audit UI components
  - Create `src/components/audits/AuditsList.tsx` with filters (status, type, year, auditor)
  - Create `src/components/audits/AuditCard.tsx` to display audit summary
  - Create `src/components/audits/AuditFormDialog.tsx` for create/edit with multi-step form
  - Create `src/components/audits/AuditTeamSelector.tsx` for selecting audit team members
  - Create `src/components/audits/AuditStatusBadge.tsx` for visual status indicator
  - Create `src/components/audits/AuditDashboard.tsx` with metrics and charts
  - _Requirements: 1.6, 1.7, 1.8, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2.4 Create Audit pages
  - Create `src/app/(dashboard)/auditorias/page.tsx` for main audits list with dashboard
  - Create `src/app/(dashboard)/auditorias/[id]/page.tsx` for audit detail view
  - Implement navigation and breadcrumbs
  - _Requirements: 1.6, 1.7, 1.8, 2.1_

## 3. Implement ABM Hallazgos (Findings Module) - Fase 1: Detección

- [ ] 3.1 Create FindingService - Phase 1 methods
  - Create `src/services/findings/FindingService.ts`
  - Implement CRUD methods: `getAll`, `getById`, `create`, `update`, `delete`
  - Implement `generateFindingNumber()` using TraceabilityService
  - Implement `addImmediateCorrection(id, correction)` for immediate correction data
  - Implement `getBySource(sourceType, sourceId)` to filter by origin
  - Implement `updatePhase(id, phase)` to transition between phases
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 10.1_

- [ ] 3.2 Create Finding API routes - Phase 1
  - Create `src/app/api/findings/route.ts` for GET (list) and POST (create)
  - Create `src/app/api/findings/[id]/route.ts` for GET (detail), PUT (update), DELETE
  - Create `src/app/api/findings/[id]/correction/route.ts` for POST (add immediate correction)
  - Create `src/app/api/findings/by-source/[sourceType]/route.ts` for GET (by source)
  - Implement validation for Phase 1 required fields
  - _Requirements: 3.1, 3.2, 3.3, 3.7, 3.8, 3.9, 3.10_

- [ ] 3.3 Create Finding UI components - Phase 1
  - Create `src/components/findings/FindingsList.tsx` with filters (source, status, severity, type)
  - Create `src/components/findings/FindingCard.tsx` to display finding summary
  - Create `src/components/findings/FindingFormDialog.tsx` for Phase 1 fields (detection)
  - Create `src/components/findings/FindingPhaseIndicator.tsx` to show current phase (1, 2, 3)
  - Create `src/components/findings/ImmediateCorrectionForm.tsx` for correction data
  - Create `src/components/findings/FindingStatusBadge.tsx` for visual status indicator
  - _Requirements: 3.1, 3.2, 3.3, 3.7, 3.8, 3.12, 10.1, 10.8_

## 4. Implement ABM Hallazgos - Fase 2: Tratamiento

- [ ] 4.1 Extend FindingService - Phase 2 methods
  - Implement `analyzeRootCause(id, analysis)` for root cause analysis
  - Implement `setRequiresAction(id, requires)` to mark if action is needed
  - Implement `updateActionsCounters(findingId)` to update action counts
  - Implement `getActions(findingId)` to retrieve related actions
  - Implement `checkRecurrence(findingId)` to detect recurring findings
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 10.2, 10.3, 10.4_

- [ ] 4.2 Create Finding API routes - Phase 2
  - Create `src/app/api/findings/[id]/analyze/route.ts` for POST (root cause analysis)
  - Create `src/app/api/findings/[id]/actions/route.ts` for GET (related actions)
  - Create `src/app/api/findings/[id]/phase/route.ts` for PATCH (update phase)
  - Implement validation for Phase 2 required fields
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 10.2_

- [ ] 4.3 Create Finding UI components - Phase 2
  - Create `src/components/findings/RootCauseAnalysisForm.tsx` for cause analysis
  - Extend `FindingFormDialog.tsx` to show Phase 2 fields when in treatment phase
  - Add action requirement toggle and action creation button
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 10.2, 10.8_

## 5. Implement ABM Acciones (Actions Module) - Fase 2: Tratamiento

- [ ] 5.1 Create ActionService - Phase 2 methods
  - Create `src/services/actions/ActionService.ts`
  - Implement CRUD methods: `getAll`, `getById`, `create`, `update`, `delete`
  - Implement `generateActionNumber()` using TraceabilityService
  - Implement `updateStatus(id, status, userId)` for state transitions
  - Implement `updateProgress(id, progress)` to update completion percentage
  - Implement `updateActionPlanStep(actionId, stepSequence, status)` for plan steps
  - Implement `getByFinding(findingId)` to filter by finding
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

- [ ] 5.2 Create Action API routes - Phase 2
  - Create `src/app/api/actions/route.ts` for GET (list) and POST (create)
  - Create `src/app/api/actions/[id]/route.ts` for GET (detail), PUT (update), DELETE
  - Create `src/app/api/actions/[id]/status/route.ts` for PATCH (update status)
  - Create `src/app/api/actions/[id]/progress/route.ts` for PATCH (update progress)
  - Create `src/app/api/actions/[id]/comments/route.ts` for POST (add comment)
  - Create `src/app/api/actions/by-finding/[findingId]/route.ts` for GET (by finding)
  - Implement validation for Phase 2 required fields
  - _Requirements: 5.8, 5.9, 5.10, 5.11, 6.1, 6.2, 6.3, 6.4, 6.5, 6.8, 6.9_

- [ ] 5.3 Create Action UI components - Phase 2
  - Create `src/components/actions/ActionsList.tsx` with filters (status, type, priority, finding)
  - Create `src/components/actions/ActionCard.tsx` to display action summary
  - Create `src/components/actions/ActionFormDialog.tsx` for create/edit with finding linkage
  - Create `src/components/actions/ActionPlanSteps.tsx` for step-by-step plan management
  - Create `src/components/actions/ActionProgressBar.tsx` for visual progress indicator
  - Create `src/components/actions/ActionPhaseIndicator.tsx` to show current phase
  - Create `src/components/actions/ActionStatusBadge.tsx` for visual status indicator
  - _Requirements: 5.8, 5.9, 5.10, 6.1, 6.2, 6.3, 6.4, 6.8, 10.5, 10.8_

## 6. Implement Fase 3: Control (Verification)

- [ ] 6.1 Extend FindingService - Phase 3 methods
  - Implement `verify(id, verification)` to mark finding as verified
  - Update finding status to 'closed' when verified
  - _Requirements: 4.6, 4.7, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 10.5, 10.6, 10.7_

- [ ] 6.2 Extend ActionService - Phase 3 methods
  - Implement `verifyEffectiveness(id, verification)` for effectiveness verification
  - Implement `addComment(id, comment)` for verification comments
  - Update action phase to 'control' when verification starts
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 10.5, 10.6, 10.7_

- [ ] 6.3 Create API routes - Phase 3
  - Create `src/app/api/findings/[id]/verify/route.ts` for POST (verify finding)
  - Create `src/app/api/actions/[id]/verify/route.ts` for POST (verify effectiveness)
  - Implement validation for Phase 3 required fields
  - _Requirements: 7.1, 7.2, 7.3, 7.6, 7.7, 7.8, 10.5_

- [ ] 6.4 Create UI components - Phase 3
  - Create `src/components/findings/FindingVerificationForm.tsx` for finding verification
  - Create `src/components/actions/EffectivenessVerificationForm.tsx` for action verification
  - Extend form dialogs to show Phase 3 fields when in control phase
  - Add visual indicators for completed phases
  - _Requirements: 7.1, 7.2, 7.3, 7.6, 7.7, 7.8, 10.5, 10.8_

## 7. Implement Statistics and Dashboards

- [ ] 7.1 Implement statistics services
  - Extend `AuditService.getStats(year)` to calculate audit metrics
  - Implement `FindingService.getStats(year)` for finding distribution
  - Implement `ActionService.getStats(year)` for action effectiveness metrics
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 7.2 Create statistics API routes
  - Create `src/app/api/audits/stats/route.ts` for GET (audit statistics)
  - Create `src/app/api/findings/stats/route.ts` for GET (finding statistics)
  - Create `src/app/api/actions/stats/route.ts` for GET (action statistics)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 7.3 Create dashboard components
  - Create `src/components/audits/AuditDashboard.tsx` with charts and metrics
  - Create `src/components/findings/FindingDashboard.tsx` with distribution charts
  - Create `src/components/actions/ActionDashboard.tsx` with effectiveness metrics
  - Use charts library (recharts or similar) for visualizations
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

## 8. Create main pages and navigation

- [ ] 8.1 Create Finding pages
  - Create `src/app/(dashboard)/hallazgos/page.tsx` for main findings list with dashboard
  - Create `src/app/(dashboard)/hallazgos/[id]/page.tsx` for finding detail view with phase tabs
  - Implement phase-based navigation (Detección, Tratamiento, Control)
  - _Requirements: 3.7, 3.12, 10.1, 10.2, 10.5, 10.8_

- [ ] 8.2 Create Action pages
  - Create `src/app/(dashboard)/acciones/page.tsx` for main actions list with dashboard
  - Create `src/app/(dashboard)/acciones/[id]/page.tsx` for action detail view
  - Show related finding and audit information with navigation links
  - _Requirements: 5.8, 5.10, 6.1, 10.5, 10.8_

- [ ] 8.3 Update navigation and sidebar
  - Add "Auditorías" menu item in `src/components/layout/Sidebar.tsx`
  - Add "Hallazgos" menu item
  - Add "Acciones" menu item
  - Group under "Sistema de Calidad" section
  - _Requirements: 1.6, 3.7, 5.8_

## 9. Implement traceability navigation

- [x] 9.1 Create traceability components
  - Create `src/components/shared/TraceabilityBreadcrumb.tsx` to show full chain
  - Create `src/components/shared/RelatedEntitiesCard.tsx` to show related items
  - Add traceability navigation to detail pages
  - _Requirements: 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10_

- [x] 9.2 Implement navigation links
  - Add "Ver Auditoría" link in Finding detail when source is audit
  - Add "Ver Hallazgo" link in Action detail
  - Add "Ver Acciones" section in Finding detail
  - Add "Ver Hallazgos" section in Audit detail
  - _Requirements: 8.6, 8.7, 8.8, 8.9_

## 10. Testing and validation

- [ ]\* 10.1 Write service unit tests
  - Test TraceabilityService number generation and chain building
  - Test AuditService CRUD operations and counter updates
  - Test FindingService phase transitions and validations
  - Test ActionService progress updates and verification
  - _Requirements: All_

- [ ]\* 10.2 Write API integration tests
  - Test audit creation and status updates
  - Test finding creation with different sources
  - Test action creation linked to findings
  - Test traceability chain integrity
  - _Requirements: All_

- [ ]\* 10.3 Write component tests
  - Test form validations and submissions
  - Test phase indicators and transitions
  - Test filter functionality in lists
  - Test traceability navigation
  - _Requirements: All_

## 11. Final integration and polish

- [ ] 11.1 Implement error boundaries
  - Add error boundaries for each main section
  - Implement user-friendly error messages
  - Add error logging
  - _Requirements: 11.10_

- [ ] 11.2 Add loading states
  - Implement skeleton loaders for lists
  - Add loading spinners for forms
  - Implement optimistic updates where appropriate
  - _Requirements: All_

- [ ] 11.3 Implement data validation
  - Ensure all Zod schemas are complete
  - Add client-side validation feedback
  - Implement server-side validation in all API routes
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.10_

- [ ] 11.4 Add accessibility features
  - Ensure keyboard navigation works
  - Add ARIA labels to interactive elements
  - Test with screen readers
  - Ensure color contrast meets WCAG standards
  - _Requirements: All_

- [ ] 11.5 Performance optimization
  - Implement pagination for large lists
  - Add debouncing to search inputs
  - Optimize Firestore queries with proper indexes
  - Implement caching where appropriate
  - _Requirements: 1.7, 3.7, 5.8_

## 12. Future integration preparation (NOT IMPLEMENTED NOW)

- [ ] 12.1 Prepare for calendar integration
  - Ensure all date fields are properly formatted
  - Document which dates should appear in calendar
  - Create interface for calendar event generation
  - _Note: Calendar integration will be implemented in a future phase_

- [ ] 12.2 Prepare for RRHH integration
  - Document personnel ID fields used
  - Create placeholder for personnel lookup
  - _Note: RRHH integration will be implemented in a future phase_

- [ ] 12.3 Prepare for IA Don Cándido integration
  - Document context data structure
  - Create interface for context provider
  - _Note: IA integration will be implemented in a future phase_
