'use client';

import { ActionProgressBar } from '@/components/actions/ActionProgressBar';
import { ActionStatusBadge } from '@/components/actions/ActionStatusBadge';
import { TraceabilityBreadcrumb } from '@/components/shared/TraceabilityBreadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Action } from '@/types/actions';
import type { Audit } from '@/types/audits';
import type { Finding } from '@/types/findings';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Link as LinkIcon,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ActionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [action, setAction] = useState<Action | null>(null);
  const [relatedFinding, setRelatedFinding] = useState<Finding | null>(null);
  const [sourceAudit, setSourceAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAction = async (id: string) => {
    try {
      const response = await fetch(`/api/actions/${id}`, {
        headers: { authorization: 'Bearer token' },
      });
      const data = await response.json();
      setAction(data.action);

      // Fetch related finding
      if (data.action.findingId) {
        fetchRelatedFinding(data.action.findingId);
      }
    } catch (error) {
      console.error('Error fetching action:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchAction(params.id as string);
    }
  }, [params.id]);


  const fetchRelatedFinding = async (findingId: string) => {
    try {
      const response = await fetch(`/api/findings/${findingId}`, {
        headers: { authorization: 'Bearer token' },
      });
      const data = await response.json();
      setRelatedFinding(data.finding);

      // Fetch source audit if applicable
      if (data.finding.source === 'audit' && data.finding.sourceId) {
        fetchSourceAudit(data.finding.sourceId);
      }
    } catch (error) {
      console.error('Error fetching related finding:', error);
    }
  };

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

  if (loading) return <div>Cargando...</div>;
  if (!action) return <div>Acción no encontrada</div>;

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
  if (relatedFinding) {
    traceabilityItems.push({
      type: 'finding' as const,
      id: relatedFinding.id,
      number: relatedFinding.findingNumber,
      title: relatedFinding.title,
    });
  }
  traceabilityItems.push({
    type: 'action' as const,
    id: action.id,
    number: action.actionNumber,
    title: action.title,
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
          currentId={action.id}
        />
      )}

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{action.title}</h1>
          <p className="text-muted-foreground">{action.actionNumber}</p>
        </div>
        <ActionStatusBadge status={action.status} />
      </div>

      <ActionProgressBar progress={action.progress} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              <span className="text-sm">Tipo: {action.actionType}</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Responsable: {action.responsiblePersonName}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Inicio: {new Date(action.plannedStartDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Fin: {new Date(action.plannedEndDate).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trazabilidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Hallazgo Relacionado:</span>
              <Link href={`/hallazgos/${action.findingId}`}>
                <Button variant="link" size="sm">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  {action.findingNumber}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Descripción</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{action.description}</p>
        </CardContent>
      </Card>

      {action.actionPlan && action.actionPlan.steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Plan de Acción</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {action.actionPlan.steps.map(step => (
                <div
                  key={step.sequence}
                  className="flex items-center gap-2 p-2 border rounded"
                >
                  <span className="font-bold">{step.sequence}.</span>
                  <span className="flex-1">{step.description}</span>
                  <ActionStatusBadge status={step.status as Action['status']} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
