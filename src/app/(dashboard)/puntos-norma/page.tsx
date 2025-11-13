'use client';

import { NormPointsDashboard } from '@/components/normPoints/NormPointsDashboard';
import { NormPointsList } from '@/components/normPoints/NormPointsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

export default function PuntosNormaPage() {
  const [activeTab, setActiveTab] = useState('gestion');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Puntos de Norma</h1>
        <p className="text-muted-foreground">
          Gestión de requisitos normativos y cumplimiento
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="gestion">Gestión</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <NormPointsDashboard />
        </TabsContent>

        <TabsContent value="gestion" className="mt-6">
          <NormPointsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
