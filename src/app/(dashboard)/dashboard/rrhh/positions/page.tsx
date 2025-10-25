'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PositionListing } from '@/components/rrhh/PositionListing';

export default function PositionsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <PositionListing />
      </div>
    </DashboardLayout>
  );
}

