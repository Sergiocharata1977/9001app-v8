'use client';

import { DocumentsDashboard } from '@/components/documents/DocumentsDashboard';
import { DocumentsList } from '@/components/documents/DocumentsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

export default function DocumentosPage() {
  const [activeTab, setActiveTab] = useState('gestion');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Documentos</h1>
        <p className="text-muted-foreground">
          Gestión de documentación del sistema de calidad
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="gestion">Gestión</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <DocumentsDashboard />
        </TabsContent>

        <TabsContent value="gestion" className="mt-6">
          <DocumentsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
