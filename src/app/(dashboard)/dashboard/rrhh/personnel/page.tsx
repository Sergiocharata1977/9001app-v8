'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PersonnelListing } from '@/components/rrhh/PersonnelListing';

export default function PersonnelPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <PersonnelListing />
      </div>
    </DashboardLayout>
  );
}

