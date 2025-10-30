'use client';

import { FindingPhaseIndicator } from '@/components/findings/FindingPhaseIndicator';
import { FindingStatusBadge } from '@/components/findings/FindingStatusBadge';
import { ImmediateCorrectionForm } from '@/components/findings/ImmediateCorrectionForm';
import { RelatedEntitiesCard } from '@/components/shared/RelatedEntitiesCard';
import { TraceabilityBreadcrumb } from '@/components/shared/TraceabilityBreadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Action } from '@/types/actions';
import type { Audit } from '@/types/audits';
import type { Finding } from '@/types/findings';
import { AlertTriangle, ArrowLeft, Calendar, User } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FindingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [finding, setFinding] = useState<Finding | null>(null);
  const [sourceAudit, setSourceAudit] = useState<Audit | null>(null);
  const [relatedActions, setRelatedActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFinding = async (id: string) => {
    try {
      const response = await fetch(`/api/findings/${id}`, {
        headers: { authorization: 'Bearer token' },
      });
      const data = await response.json();
      setFinding(data.finding);

      // Fetch source audit if applicable
      if (data.finding.source === 'audit' && data.finding.sourceId) {
        fetchSourceAudit(data.finding.sourceId);
      }
    } catch (error) {
      console.error('Error fetching finding:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchFinding(params.id as string);
      fetchRelatedActions(params.id as string);
    }
  }, [params.id]);


  const fetchSourceAudit = async (auditId: string) => {
    try {
      const response = await fetch(`/api/audits/${auditId}`, {
        headers: { authorization: 'Bearer token' },
      });
      const data = await response.json();
      setSourceAudit(data.audit);
    } catch (error) {
      console.error('Error fetching source audit:', error);
    }
  };

  const fetchRelatedActions = async (findingId: string) => {
    try {
      const response = await fetch(`/api/actions/by-finding/${findingId}`, {
        headers: { authorization: 'Bearer token' },
      });
      const data = await response.json();
      setRelatedActions(data.actions || []);
    } catch (error) {
      console.error('Error fetching related actions:', error);
    }
  };

  const handleCorrectionSubmit = async (
    correction: Finding['immediateCorrection']
  ) => {
    try {
      await fetch(`/api/findings/${params.id}/correction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'Bearer token',
        },
        body: JSON.stringify(correction),
      });
      fetchFinding(params.id as string);
    } catch (error) {
      console.error('Error submitting correction:', error);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!finding) return <div>Hallazgo no encontrado</div>;

  // Build traceability chain
  const traceabilityItems = [];
  if (sourceAudit) {
    traceabilityItems.push({
      type: 'audit' as const,
      id: sourceAudit.id,
      number: sourceAudit.auditNumber,
      title: sourceAudit.title,
    });
  }
  traceabilityItems.push({
    type: 'finding' as const,
    id: finding.id,
    number: finding.findingNumber,
    title: finding.title,
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>

      {traceabilityItems.length > 0 && (
        <TraceabilityBreadcrumb
          items={traceabilityItems}
          currentId={finding.id}
        />
      )}

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{finding.title}</h1>
          <p className="text-muted-foreground">{finding.findingNumber}</p>
        </div>
        <div className="flex gap-2">
          <FindingStatusBadge status={finding.status} />
          <FindingPhaseIndicator phase={finding.currentPhase} />
        </div>
      </div>

      <Tabs defaultValue="detection" className="w-full">
        <TabsList>
          <TabsTrigger value="detection">Detección</TabsTrigger>
          <TabsTrigger value="treatment">Tratamiento</TabsTrigger>
          <TabsTrigger value="control">Control</TabsTrigger>
        </TabsList>

        <TabsContent value="detection" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    Identificado:{' '}
                    {new Date(finding.identifiedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Severidad: {finding.severity}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    Reportado por: {finding.reportedByName}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clasificación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Tipo:</span>
                  <span className="font-medium">{finding.findingType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Categoría:</span>
                  <span className="font-medium">{finding.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fuente:</span>
                  <span className="font-medium">{finding.source}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{finding.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evidencia</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{finding.evidence}</p>
            </CardContent>
          </Card>

          <ImmediateCorrectionForm
            findingId={finding.id}
            currentCorrection={finding.immediateCorrection}
            onSubmit={handleCorrectionSubmit}
          />
        </TabsContent>

        <TabsContent value="treatment">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Causa Raíz</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Esta sección se completará en la Fase 2: Tratamiento
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="control">
          <Card>
            <CardHeader>
              <CardTitle>Verificación de Efectividad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Esta sección se completará en la Fase 3: Control
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Related Actions */}
      <RelatedEntitiesCard
        title="Acciones Relacionadas"
        entityType="actions"
        entities={relatedActions.map(action => ({
          id: action.id,
          number: action.actionNumber,
          title: action.title,
          status: action.status,
          type: action.actionType,
        }))}
        emptyMessage="No hay acciones asociadas a este hallazgo"
      />
    </div>
  );
}
