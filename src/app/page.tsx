'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Brain,
  Target,
  TrendingUp,
  FileCheck,
  Users,
  BarChart3,
  CheckCircle,
  Play,
  Sparkles,
  Globe,
  Zap,
  Shield,
  Rocket,
  Building2,
} from "lucide-react"

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">9001app</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#como-funciona" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Cómo Funciona
                </a>
                <a href="#beneficios" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Beneficios
                </a>
                <a href="#ideal-para" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Ideal Para
                </a>
                <a href="#contacto" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Contacto
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                <a href="/login">Iniciar Sesión</a>
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 rounded-lg">
                <a href="/register">Acceso Anticipado</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-emerald-600/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-emerald-500/30">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300">Consultor IA de ISO 9001</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">La IA que organiza tu empresa</h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-4xl mx-auto">
              como lo haría una certificación <span className="text-emerald-400 font-semibold">ISO 9001</span>
            </p>
            <p className="text-lg text-slate-400 mb-10 max-w-3xl mx-auto">
              Una inteligencia organizacional diseñada para ayudarte a ordenar, medir y mejorar tu empresa, basándose en
              el estándar internacional de gestión de calidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-3 rounded-lg shadow-lg">
                <Rocket className="w-5 h-5 mr-2" />
                <a href="/register">Solicitar Acceso Anticipado</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-slate-900 text-lg px-8 py-3 bg-transparent rounded-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Ver Demo Interactiva
              </Button>
            </div>
          </div>
        </div>

        {/* Subtle wave separator */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg className="w-full h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,120L50,100C100,80,200,40,300,50C400,60,500,100,600,110C700,120,800,100,900,90C1000,80,1100,80,1150,80L1200,80L1200,120L1150,120C1100,120,1000,120,900,120C800,120,700,120,600,120C500,120,400,120,300,120C200,120,100,120,50,120L0,120Z"
              fill="#f9fafb"
            ></path>
          </svg>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section id="como-funciona" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Cómo Funciona</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              La IA analiza tu empresa como lo haría un auditor, pero con mentalidad de coach
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                  <Brain className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Escucha y Aprende</h3>
                <p className="text-gray-600">
                  Analiza tu estructura: departamentos, roles, procesos, objetivos y metas de tu organización.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Identifica Vacíos</h3>
                <p className="text-gray-600">
                  Detecta falta de definición, métricas o responsabilidades difusas en tu empresa.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Sugiere Orden</h3>
                <p className="text-gray-600">
                  Define procesos, puestos, objetivos e indicadores según buenas prácticas ISO.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Mide Madurez</h3>
                <p className="text-gray-600">
                  Evalúa tu grado de organización y propone mejoras continuas basadas en datos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-teal-600"></div>
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                  <CheckCircle className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Te Acompaña</h3>
                <p className="text-gray-600">
                  Desde el tablero principal ves evolución, alertas y próximos pasos día a día.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl relative overflow-hidden group bg-gradient-to-br from-emerald-50 to-blue-50">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-blue-600"></div>
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-md">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Mejora Continua</h3>
                <p className="text-gray-600">
                  Enfoque PHVA: Planificar, Hacer, Verificar y Actuar de forma automatizada.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Beneficios Reales</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transformá tu empresa en una organización de clase mundial
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Organización Inteligente</h3>
                <p className="text-gray-600">
                  Estructura automáticamente áreas, funciones y procesos de forma lógica y eficiente.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Claridad de Roles</h3>
                <p className="text-gray-600">
                  Cada persona sabe qué hace, por qué y cómo medirlo con indicadores claros.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Mejora Continua</h3>
                <p className="text-gray-600">La IA detecta brechas y genera planes de acción automáticamente.</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <FileCheck className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Trazabilidad Total</h3>
                <p className="text-gray-600">Cada decisión queda documentada, como lo exige la norma ISO 9001.</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Gestión Integral</h3>
                <p className="text-gray-600">Combina lógica de calidad con acompañamiento personalizado y humano.</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Estándar Internacional</h3>
                <p className="text-gray-600">Basado en ISO 9001:2015, el método más eficaz para empresas ordenadas.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="contacto"
        className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white relative overflow-hidden"
      >
        <div className="absolute top-20 right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
            <Sparkles className="w-12 h-12 text-emerald-400 mx-auto" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Estamos Lanzando la Versión Beta</h2>
          <p className="text-xl text-slate-300 mb-4">
            <span className="text-emerald-400 font-semibold">9001app</span> – Consultor IA de ISO 9001
          </p>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Sé parte de los primeros en transformar tu organización con inteligencia artificial basada en ISO 9001
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-10 py-4 rounded-lg shadow-2xl">
              <Rocket className="w-5 h-5 mr-2" />
              <a href="/register">Solicitar Acceso Anticipado</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-2 border-white hover:bg-white hover:text-slate-900 text-lg px-10 py-4 bg-transparent rounded-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Ver Demo Interactiva
            </Button>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-slate-400">
            <a href="/login" className="hover:text-white transition-colors flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>Hablar con un Consultor IA</span>
            </a>
            <span className="hidden sm:block">•</span>
            <a href="#" className="hover:text-white transition-colors flex items-center space-x-2">
              <FileCheck className="w-5 h-5" />
              <span>Descargar Caso de Estudio</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">9001app</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Consultor IA de ISO 9001. Transformamos la norma ISO 9001 en una IA práctica, moderna y accesible.
              </p>
              <div className="text-sm text-gray-500">
                <p>IA + Método ISO + Mejora Continua</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#como-funciona" className="hover:text-white">
                    Cómo Funciona
                  </a>
                </li>
                <li>
                  <a href="#beneficios" className="hover:text-white">
                    Beneficios
                  </a>
                </li>
                <li>
                  <a href="#ideal-para" className="hover:text-white">
                    Ideal Para
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Demo
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Documentación
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Casos de Estudio
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#contacto" className="hover:text-white">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 9001app. Todos los derechos reservados. Powered by ISO 9001:2015</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
