'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Document, DocumentType, DocumentStatus } from '@/types/documents';
import { X, Upload, FileText } from 'lucide-react';

interface DocumentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document?: Document | null;
  onSuccess: () => void;
}

export function DocumentFormDialog({
  open,
  onOpenChange,
  document,
  onSuccess,
}: DocumentFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: DocumentType;
    status: DocumentStatus;
    version: string;
    responsible_user_id: string;
    created_by: string;
    updated_by: string;
  }>({
    title: '',
    description: '',
    type: 'procedimiento',
    status: 'borrador',
    version: '1.0',
    responsible_user_id: 'current-user',
    created_by: 'current-user',
    updated_by: 'current-user',
  });

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title,
        description: document.description || '',
        type: document.type,
        status: document.status,
        version: document.version,
        responsible_user_id: document.responsible_user_id,
        created_by: document.created_by,
        updated_by: 'current-user',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'procedimiento',
        status: 'borrador',
        version: '1.0',
        responsible_user_id: 'current-user',
        created_by: 'current-user',
        updated_by: 'current-user',
      });
    }
  }, [document, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea PDF
      if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF');
        return;
      }
      // Validar tamaño (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo no debe superar 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Crear o actualizar el documento
      const url = document
        ? `/api/documents/${document.id}`
        : '/api/documents';
      const method = document ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.error}`);
        return;
      }

      const savedDocument = await response.json();
      
      console.log('Documento guardado:', savedDocument);
      
      // Verificar que tenemos el ID del documento
      const documentId = savedDocument.id || document?.id;
      
      if (!documentId) {
        console.error('No se pudo obtener ID del documento. Respuesta:', savedDocument);
        alert('Error: No se pudo obtener el ID del documento');
        return;
      }
      
      console.log('ID del documento para subir archivo:', documentId);

      // 2. Si hay archivo, subirlo
      if (selectedFile) {
        setUploadingFile(true);
        const fileFormData = new FormData();
        fileFormData.append('file', selectedFile);
        fileFormData.append('userId', 'current-user');

        const fileResponse = await fetch(
          `/api/documents/${documentId}/file`,
          {
            method: 'POST',
            body: fileFormData,
          }
        );

        if (!fileResponse.ok) {
          const errorData = await fileResponse.json();
          console.error('Error uploading file:', errorData);
          alert(`Documento guardado pero error al subir archivo: ${errorData.error || 'Error desconocido'}`);
        }
      }

      // Limpiar formulario y cerrar
      setSelectedFile(null);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Error al guardar el documento');
    } finally {
      setLoading(false);
      setUploadingFile(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {document ? 'Editar Documento' : 'Nuevo Documento'}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="hover:bg-white/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Título *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ej: Manual de Calidad ISO 9001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe el contenido y propósito del documento..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tipo *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as typeof formData.type })
                }
              >
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">📘 Manual</SelectItem>
                  <SelectItem value="procedimiento">📋 Procedimiento</SelectItem>
                  <SelectItem value="instruccion">📝 Instrucción</SelectItem>
                  <SelectItem value="formato">📄 Formato</SelectItem>
                  <SelectItem value="registro">📊 Registro</SelectItem>
                  <SelectItem value="politica">⚖️ Política</SelectItem>
                  <SelectItem value="otro">📁 Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Estado *
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as typeof formData.status })
                }
              >
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="borrador">✏️ Borrador</SelectItem>
                  <SelectItem value="en_revision">👀 En Revisión</SelectItem>
                  <SelectItem value="aprobado">✅ Aprobado</SelectItem>
                  <SelectItem value="publicado">🌐 Publicado</SelectItem>
                  <SelectItem value="obsoleto">🗑️ Obsoleto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="version" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Versión *
            </Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) =>
                setFormData({ ...formData, version: e.target.value })
              }
              placeholder="1.0"
              required
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Campo de archivo PDF */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-900/50">
            <Label htmlFor="file" className="block mb-2 text-sm font-medium">
              Archivo PDF {!document && '(Opcional)'}
            </Label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="file"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                <Upload className="h-4 w-4" />
                Seleccionar PDF
              </label>
              <input
                id="file"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{selectedFile.name}</span>
                  <span className="text-xs">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
              {document?.file_path && !selectedFile && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <FileText className="h-4 w-4" />
                  <span>Archivo actual disponible</span>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Solo archivos PDF. Tamaño máximo: 10MB
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading || uploadingFile}
              className="min-w-[100px]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || uploadingFile}
              className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
            >
              {uploadingFile
                ? 'Subiendo archivo...'
                : loading
                ? 'Guardando...'
                : document
                ? 'Actualizar'
                : 'Crear Documento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
