'use client';

import { Sidebar } from '@/components/layout/Sidebar';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-xl font-bold text-gray-900">Test Page</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Usuario Test</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Página de Prueba</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">
                Esta es una página de prueba para verificar que el sidebar funciona correctamente.
                Si puedes ver el menú lateral izquierdo, entonces el problema está en la autenticación.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
