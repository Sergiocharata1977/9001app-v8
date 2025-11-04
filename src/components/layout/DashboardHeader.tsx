'use client';

import { UserMenu } from './UserMenu';

export function DashboardHeader() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - could add breadcrumbs or title here */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Sistema ISO 9001
          </h1>
        </div>

        {/* Right side - User Menu */}
        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
