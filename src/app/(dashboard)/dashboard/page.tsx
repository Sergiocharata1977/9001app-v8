'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  CheckCircle, 
  Building2, 
  Briefcase, 
  BarChart3, 
  Shield, 
  FolderOpen,
  BarChart
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  // Métricas principales
  const metrics = [
    {
      title: 'Objetivos',
      value: '85%',
      icon: TrendingUp,
      color: 'emerald',
      change: '+5%'
    },
    {
      title: 'Personal',
      value: '24',
      icon: Users,
      color: 'blue',
      change: '+2'
    },
    {
      title: 'Documentos',
      value: '42',
      icon: FileText,
      color: 'purple',
      change: '+8'
    },
    {
      title: 'Conformidad',
      value: '92%',
      icon: CheckCircle,
      color: 'orange',
      change: '+3%'
    }
  ];

  // Módulos del sistema
  const modules = [
    {
      title: 'Recursos Humanos',
      description: 'Gestión de personal y departamentos',
      icon: Users,
      color: 'green',
      href: '/dashboard/rrhh',
      enabled: true,
      stats: { personal: 24, departamentos: 6 }
    },
    {
      title: 'Procesos',
      description: 'Definición y mapeo de procesos',
      icon: Briefcase,
      color: 'blue',
      href: '/dashboard/procesos',
      enabled: true,
      stats: { procesos: 12, activos: 8 }
    },
    {
      title: 'Calidad',
      description: 'Objetivos e indicadores de calidad',
      icon: BarChart3,
      color: 'purple',
      href: '/dashboard/calidad',
      enabled: true,
      stats: { objetivos: 15, cumplidos: 13 }
    },
    {
      title: 'Auditorías',
      description: 'Sistema de auditorías internas',
      icon: Shield,
      color: 'orange',
      href: '/dashboard/auditorias',
      enabled: false,
      stats: {}
    },
    {
      title: 'Documentos',
      description: 'Control documental',
      icon: FolderOpen,
      color: 'red',
      href: '/dashboard/documentos',
      enabled: false,
      stats: {}
    },
    {
      title: 'Reportes',
      description: 'KPIs y reportes ejecutivos',
      icon: BarChart,
      color: 'indigo',
      href: '/dashboard/reportes',
      enabled: false,
      stats: {}
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      emerald: 'bg-emerald-100 text-emerald-600',
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      green: 'bg-green-100 text-green-600',
      red: 'bg-red-100 text-red-600',
      indigo: 'bg-indigo-100 text-indigo-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-blue-100 text-blue-600';
  };

  const getGradientClasses = (color: string) => {
    const gradientMap = {
      green: 'from-green-500 to-green-600',
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      indigo: 'from-indigo-500 to-indigo-600'
    };
    return gradientMap[color as keyof typeof gradientMap] || 'from-blue-500 to-blue-600';
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
            <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
                Resumen del sistema de gestión ISO 9001
              </p>
            </div>
            
        {/* Métricas principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <Card key={index} className="bg-white shadow-md hover:shadow-lg rounded-xl p-4 transition-all duration-200">
                <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${getColorClasses(metric.color)}`}>
                  <metric.icon className="h-6 w-6" />
                  </div>
                  <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
                  <p className="text-sm text-green-600">{metric.change} vs mes anterior</p>
                </div>
              </div>
            </Card>
          ))}
              </div>
              
        {/* Módulos del sistema */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module, index) => {
            const ModuleCard = (
              <Card className={`bg-white shadow-md rounded-xl p-6 h-full transition-all duration-300 ${
                module.enabled 
                  ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' 
                  : 'opacity-60 cursor-not-allowed'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getGradientClasses(module.color)} flex items-center justify-center shadow-lg ${
                    !module.enabled && 'grayscale'
                  }`}>
                    <module.icon className="w-7 h-7 text-white" />
                  </div>
                  {!module.enabled && (
                    <div className="bg-gray-500 text-white text-xs px-3 py-1 rounded-full">
                      Próximamente
                  </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {module.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {module.description}
                </p>

                {/* Estadísticas */}
                {module.enabled && Object.keys(module.stats).length > 0 && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(module.stats).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-gray-500 capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="ml-1 font-semibold text-gray-900">
                            {String(value)}
                          </span>
                  </div>
                      ))}
              </div>
                  </div>
                )}

                {/* Indicador de acción */}
                {module.enabled && (
                  <div className="mt-4 flex justify-end">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-lg">→</span>
                  </div>
                  </div>
                )}
              </Card>
            );

            if (module.enabled) {
              return (
                <Link key={index} href={module.href} className="group block h-full">
                  {ModuleCard}
                </Link>
              );
            }

            return (
              <div key={index} className="h-full">
                {ModuleCard}
              </div>
            );
          })}
              </div>

        {/* Acciones rápidas */}
        <Card className="bg-white shadow-md hover:shadow-lg rounded-xl transition-all duration-200">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button asChild className="h-20 flex flex-col items-center justify-center space-y-2">
                <Link href="/dashboard/rrhh/departments">
                  <Building2 className="h-6 w-6" />
                  <span>Gestionar Departamentos</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Link href="/dashboard/rrhh/personnel">
                  <Users className="h-6 w-6" />
                  <span>Ver Personal</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Link href="/dashboard/test-firestore">
                  <FileText className="h-6 w-6" />
                  <span>Datos de Prueba</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}