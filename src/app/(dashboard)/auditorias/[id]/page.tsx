'use client';

import { AuditStatusBadge } from '@/components/audits/AuditStatusBadge';
import { RelatedEntitiesCard } from '@/components/shared/RelatedEntitiesCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Audit } from '@/types/audits';
import type { Finding } from '@/types/findings';
import { ArrowLeft, Calendar, FileText, User } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [relatedFindings, setRelatedFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchAudit(params.id as string);
      fetchRelatedFindings(params.id as string);
    }
  }, [params.id]);

  const fetchAudit = async (id: string) => {
    try {
      const response = await fetch(`/api/audits/${id}`, {
        headers: { authorization: 'Bearer token' },
      });
      const data = await response.json();
      setAudit(data.audit);
    } catch (error) {
      console.error('Error fetching audit:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedFindings = async (auditId: string) => {
    try {
      const response = await fetch(`/api/audits/${auditId}/findings`, {
        headers: { authorization: 'Bearer token' },
      });
      const data = await response.json();
      setRelatedFindings(data.findings || []);
    } catch (error) {
      console.error('Error fetching related findings:', error);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!audit) return <div>Auditoría no encontrada</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{audit.title}</h1>
          <p className="text-muted-foreground">{audit.auditNumber}</p>
        </div>
        <AuditStatusBadge status={audit.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Fecha: {new Date(audit.plannedDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Auditor Líder: {audit.leadAuditorName}
              </span>
            </div>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              <span className="text-sm">Tipo: {audit.auditType}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hallazgos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-bold">{audit.findingsCount}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Críticos:</span>
                <span className="font-bold">{audit.criticalFindings}</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span>Mayores:</span>
                <span className="font-bold">{audit.majorFindings}</span>
              </div>
              <div className="flex justify-between text-yellow-600">
                <span>Menores:</span>
                <span className="font-bold">{audit.minorFindings}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {audit.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{audit.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Related Findings */}
      <RelatedEntitiesCard
        title="Hallazgos Asociados"
        entityType="findings"
        entities={relatedFindings.map(finding => ({
          id: finding.id,
          number: finding.findingNumber,
          title: finding.title,
          status: finding.status,
          severity: finding.severity,
          type: finding.findingType,
        }))}
        emptyMessage="No hay hallazgos registrados para esta auditoría"
      />
    </div>
  );
}
