'use client';

import { FileSpreadsheet, Map, Workflow, Zap } from 'lucide-react';
import { useState } from 'react';

export default function EstructuraOrganizacionalPage() {
  const [activeTab, setActiveTab] = useState<'organigrama' | 'flujogramas' | 'relaciones' | 'mapa'>('organigrama');

  const tabs = [
    { id: 'organigrama' as const, label: 'Organigrama', icon: Workflow },
    { id: 'flujogramas' as const, label: 'Flujogramas', icon: FileSpreadsheet },
    { id: 'relaciones' as const, label: 'Relaciones', icon: Zap },
    { id: 'mapa' as const, label: 'Mapa de Procesos', icon: Map },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Workflow className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Estructura Organizacional
          </h1>
        </div>
        <p className="text-gray-600">
          Gestiona la estructura, diagramas y relaciones de tu organización
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                    ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Organigrama Tab */}
          {activeTab === 'organigrama' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Organigrama
              </h2>
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Workflow className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Editor de Organigrama
                </h3>
                <p className="text-gray-600 mb-4">
                  Aquí se integrará el editor de organigrama existente o uno nuevo.
                </p>
                <p className="text-sm text-gray-500">
                  Los datos se guardarán en la estructura consolidada de OrganizationalStructure.
                </p>
              </div>
            </div>
          )}

          {/* Flujogramas Tab */}
          {activeTab === 'flujogramas' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Flujogramas de Procesos
              </h2>
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Editor de Flujogramas
                </h3>
                <p className="text-gray-600 mb-4">
                  Aquí se integrará el editor de flujogramas existente.
                </p>
                <p className="text-sm text-gray-500">
                  Cada flujograma se vincula a un proceso específico y se guarda en el array de flujogramas.
                </p>
              </div>
            </div>
          )}

          {/* Relaciones Tab */}
          {activeTab === 'relaciones' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Relaciones entre Procesos
              </h2>
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Gestión de Relaciones
                </h3>
                <p className="text-gray-600 mb-4">
                  Aquí se integrará el gestor de relaciones entre procesos existente.
                </p>
                <p className="text-sm text-gray-500">
                  Define cómo interactúan los procesos: entradas, salidas, dependencias, etc.
                </p>
              </div>
            </div>
          )}

          {/* Mapa de Procesos Tab */}
          {activeTab === 'mapa' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Mapa de Procesos
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Clasificación de Procesos
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Clasifica tus procesos según su naturaleza estratégica, operativa o de apoyo.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Procesos Estratégicos */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Procesos Estratégicos
                    </h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Procesos de dirección y planificación
                    </p>
                    <div className="bg-white rounded p-3 text-center text-gray-500 text-sm">
                      Arrastra procesos aquí
                    </div>
                  </div>

                  {/* Procesos Operativos */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">
                      Procesos Operativos
                    </h4>
                    <p className="text-sm text-green-700 mb-3">
                      Procesos de realización del producto/servicio
                    </p>
                    <div className="bg-white rounded p-3 text-center text-gray-500 text-sm">
                      Arrastra procesos aquí
                    </div>
                  </div>

                  {/* Procesos de Apoyo */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-900 mb-2">
                      Procesos de Apoyo
                    </h4>
                    <p className="text-sm text-amber-700 mb-3">
                      Procesos de soporte y recursos
                    </p>
                    <div className="bg-white rounded p-3 text-center text-gray-500 text-sm">
                      Arrastra procesos aquí
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <strong>Nota:</strong> Esta funcionalidad se completará con drag-and-drop
                    para clasificar procesos existentes en las tres categorías.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nota informativa */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Nota de Implementación:</strong> Esta página consolida Organigramas, Flujogramas
          y Relación de Procesos en una sola vista con tabs. Los componentes existentes se
          integrarán en cada tab respectivo.
        </p>
      </div>
    </div>
  );
}
