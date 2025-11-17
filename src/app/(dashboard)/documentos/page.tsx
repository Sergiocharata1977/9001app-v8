'use client';

import { DocumentSearch } from '@/components/documents/DocumentSearch';
import { DocumentStats } from '@/components/documents/DocumentStats';
import type { Document } from '@/lib/sdk/modules/documents/types';
import { BarChart3, FileText, Search, Share2 } from 'lucide-react';
import { useState } from 'react';

type TabType = 'search' | 'stats' | 'shared' | 'recent' | 'accessed';

export default function DocumentosPage() {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [sharedDocuments, setSharedDocuments] = useState<Document[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [accessedDocuments, setAccessedDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLoadShared = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sdk/documents/shared');
      if (response.ok) {
        const data = await response.json();
        setSharedDocuments(data.data || []);
      }
    } catch (error) {
      console.error('Error loading shared documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadRecent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sdk/documents/recent?limit=10');
      if (response.ok) {
        const data = await response.json();
        setRecentDocuments(data.data || []);
      }
    } catch (error) {
      console.error('Error loading recent documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadAccessed = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sdk/documents/accessed?limit=10');
      if (response.ok) {
        const data = await response.json();
        setAccessedDocuments(data.data || []);
      }
    } catch (error) {
      console.error('Error loading accessed documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentList = (documents: Document[], title: string) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {documents.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No hay documentos para mostrar</p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{doc.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {doc.status}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {doc.category}
                    </span>
                    {doc.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
                    <span>Versión: {doc.currentVersion}</span>
                    <span>Accesos: {doc.accessCount || 0}</span>
                    <span>
                      Creado: {(doc.createdAt as any).toDate?.().toLocaleDateString() || new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <FileText className="h-8 w-8 text-blue-600 flex-shrink-0 ml-4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            Gestión de Documentos
          </h1>
          <p className="text-gray-600 mt-2">
            Busca, comparte y gestiona tus documentos con features avanzadas
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => {
              setActiveTab('search');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Search className="h-4 w-4" />
            Buscar
          </button>
          <button
            onClick={() => {
              setActiveTab('stats');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Estadísticas
          </button>
          <button
            onClick={() => {
              setActiveTab('shared');
              handleLoadShared();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'shared'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Share2 className="h-4 w-4" />
            Compartidos
          </button>
          <button
            onClick={() => {
              setActiveTab('recent');
              handleLoadRecent();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'recent'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <FileText className="h-4 w-4" />
            Recientes
          </button>
          <button
            onClick={() => {
              setActiveTab('accessed');
              handleLoadAccessed();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'accessed'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Más Accedidos
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'search' && (
            <div className="space-y-6">
              <DocumentSearch
                onSearch={setSearchResults}
                onLoading={setLoading}
              />
              {searchResults.length > 0 && (
                renderDocumentList(searchResults, 'Resultados de Búsqueda')
              )}
            </div>
          )}

          {activeTab === 'stats' && <DocumentStats />}

          {activeTab === 'shared' && (
            renderDocumentList(sharedDocuments, 'Documentos Compartidos Contigo')
          )}

          {activeTab === 'recent' && (
            renderDocumentList(recentDocuments, 'Documentos Recientes')
          )}

          {activeTab === 'accessed' && (
            renderDocumentList(accessedDocuments, 'Documentos Más Accedidos')
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
