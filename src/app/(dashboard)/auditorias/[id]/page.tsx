'use client';

import { AuditFormDialog } from '@/components/audits/AuditFormDialog';
import { AuditStatusBadge } from '@/components/audits/AuditStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getChapters, ISO9001_NORM_POINTS } from '@/data/iso9001-norm-points';
import type { AuditFormInput } from '@/lib/validations/audits';
import type { Audit } from '@/types/audits';
import { Checkbox } from '@radix-ui/react-checkbox';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, CheckCircle, Edit, Play, Trash2, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Estado local para ejecución
  const [processes, setProcesses] = useState<string[]>([]);
  const [newProcess, setNewProcess] = useState('');
  const [selectedNormPoints, setSelectedNormPoints] = useState<string[]>([]);
  const [findings, setFindings] = useState('');

  const fetchAudit = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/audits/${id}`);
        const data = await response.json();
        setAudit(data.audit);

        // Cargar datos de ejecución
        setProcesses(data.audit.processes || []);
        setSelectedNormPoints(data.audit.normPointCodes || []);
        setFindings(data.audit.findings || '');
      } catch (error) {
        console.error('Error fetching audit:', error);
        router.push('/auditorias');
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (params.id) {
      fetchAudit(params.id as string);
    }
  }, [fetchAudit, params.id]);

  const handleStartExecution = async () => {
    try {
      await fetch(`/api/audits/${params.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' }),
      });
      fetchAudit(params.id as string);
    } catch (error) {
      console.error('Error starting execution:', error);
    }
  };

  const handleUpdate = async (data: AuditFormInput) => {
    try {
      await fetch(`/api/audits/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      fetchAudit(params.id as string);
    } catch (error) {
      console.error('Error updating audit:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta auditoría?')) return;

    try {
      await fetch(`/api/audits/${params.id}`, {
        method: 'DELETE',
      });
      router.push('/auditorias');
    } catch (error) {
      console.error('Error deleting audit:', error);
    }
  };

  const handleAddProcess = () => {
    if (newProcess.trim()) {
      setProcesses([...processes, newProcess.trim()]);
      setNewProcess('');
    }
  };

  const handleRemoveProcess = (index: number) => {
    setProcesses(processes.filter((_, i) => i !== index));
  };

  const handleToggleNormPoint = (code: string) => {
    setSelectedNormPoints(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleCompleteAudit = async () => {
    try {
      // Guardar ejecución
      await fetch(`/api/audits/${params.id}/execution`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processes,
          normPointCodes: selectedNormPoints,
          findings,
        }),
      });

      // Cambiar estado
      await fetch(`/api/audits/${params.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      fetchAudit(params.id as string);
    } catch (error) {
      console.error('Error completing audit:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando auditoría...</p>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Auditoría no encontrada</p>
          <Button onClick={() => router.push('/auditorias')} className="mt-4">
            Volver a Auditorías
          </Button>
        </div>
      </div>
    );
  }

  const isPlanned = audit.status === 'planned';
  const isInProgress = audit.status === 'in_progress';
  const isCompleted = audit.status === 'completed';
  const isReadOnly = isCompleted;

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push('/auditorias')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Auditorías
        </Button>
      </div>

      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{audit.title}</h1>
          <p className="text-muted-foreground mt-1">{audit.description}</p>
        </div>
        <div className="flex gap-2 items-center">
          <AuditStatusBadge status={audit.status} />
          {!isCompleted && (
            <>
              <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Información de Planificación */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Planificación</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>Fecha Planificada</Label>
            <p className="text-lg">
              {format(new Date(audit.plannedDate), 'PPP', { locale: es })}
            </p>
          </div>
          <div>
            <Label>Auditor Líder</Label>
            <p className="text-lg">{audit.leadAuditor}</p>
          </div>
        </CardContent>
      </Card>

      {/* Botón Iniciar Ejecución */}
      {isPlanned && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                La auditoría está planificada. Haz clic en el botón para iniciar
                la ejecución.
              </p>
              <Button onClick={handleStartExecution} size="lg">
                <Play className="mr-2 h-5 w-5" />
                Iniciar Ejecución
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ejecución de Auditoría */}
      {(isInProgress || isCompleted) && (
        <>
          {/* Procesos Auditados */}
          <Card>
            <CardHeader>
              <CardTitle>Procesos Auditados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isReadOnly && (
                <div className="flex gap-2">
                  <Input
                    value={newProcess}
                    onChange={e => setNewProcess(e.target.value)}
                    placeholder="Nombre del proceso..."
                    onKeyPress={e => e.key === 'Enter' && handleAddProcess()}
                  />
                  <Button onClick={handleAddProcess}>Agregar</Button>
                </div>
              )}
              <div className="space-y-2">
                {processes.map((process, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span>{process}</span>
                    {!isReadOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveProcess(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {processes.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No se han agregado procesos
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Puntos de la Norma */}
          <Card>
            <CardHeader>
              <CardTitle>Puntos de la Norma ISO 9001:2015</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {getChapters().map(chapter => {
                  const chapterPoints = ISO9001_NORM_POINTS.filter(
                    np => np.chapter === chapter
                  );
                  return (
                    <div key={chapter}>
                      <h3 className="font-semibold mb-3 text-lg">
                        Capítulo {chapter}
                      </h3>
                      <div className="space-y-2">
                        {chapterPoints.map(point => (
                          <div
                            key={point.code}
                            className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <Checkbox
                              checked={selectedNormPoints.includes(point.code)}
                              onCheckedChange={() =>
                                handleToggleNormPoint(point.code)
                              }
                              disabled={isReadOnly}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p className="font-medium">
                                {point.code} - {point.title}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {point.requirement}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">
                  Puntos seleccionados: {selectedNormPoints.length} de{' '}
                  {ISO9001_NORM_POINTS.length}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Hallazgos */}
          <Card>
            <CardHeader>
              <CardTitle>Hallazgos</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={findings}
                onChange={e => setFindings(e.target.value)}
                placeholder="Registra los hallazgos de la auditoría..."
                rows={8}
                disabled={isReadOnly}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {findings.length} / 2000 caracteres
              </p>
            </CardContent>
          </Card>

          {/* Botón Completar */}
          {isInProgress && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Una vez que hayas completado la ejecución de la auditoría,
                    haz clic en el botón para finalizar.
                  </p>
                  <Button onClick={handleCompleteAudit} size="lg">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Completar Auditoría
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Dialog de Edición */}
      <AuditFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleUpdate}
        initialData={{
          title: audit.title,
          description: audit.description,
          plannedDate: new Date(audit.plannedDate),
          leadAuditor: audit.leadAuditor,
        }}
        mode="edit"
      />
    </div>
  );
}
