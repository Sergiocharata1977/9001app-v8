'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DepartmentListing } from '@/components/rrhh/DepartmentListing';

export default function DepartmentsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <DepartmentListing />
              </div>
    </DashboardLayout>
  );
}