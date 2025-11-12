// Types for Documents module

export type DocumentType =
  | 'manual'
  | 'procedimiento'
  | 'instruccion'
  | 'formato'
  | 'registro'
  | 'politica'
  | 'otro';

export type DocumentStatus =
  | 'borrador'
  | 'en_revision'
  | 'aprobado'
  | 'publicado'
  | 'obsoleto';

export interface Document {
  id: string;

  // Identificación
  code: string;
  title: string;
  description?: string;
  keywords?: string[];

  // Clasificación
  type: DocumentType;
  category?: string;

  // Estado y versión
  status: DocumentStatus;
  version: string;

  // Responsabilidad
  responsible_user_id: string;
  distribution_list?: string[];

  // Relaciones
  iso_clause?: string;
  process_id?: string;
  norm_point_ids?: string[];

  // Archivo
  file_path?: string;
  file_size?: number;
  mime_type?: string;

  // Fechas
  effective_date?: Date;
  review_date?: Date;
  approved_at?: Date;
  approved_by?: string;

  // Auditoría
  download_count: number;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version: string;
  change_reason: string;
  changed_by: string;
  changed_at: Date;
  snapshot: Partial<Document>;
}

export type DocumentFormData = Omit<
  Document,
  'id' | 'created_at' | 'updated_at' | 'download_count' | 'is_archived'
>;

export type DocumentCreateData = Omit<
  Document,
  'id' | 'code' | 'created_at' | 'updated_at' | 'download_count' | 'is_archived'
>;

export interface DocumentFilters {
  search?: string;
  type?: DocumentType;
  status?: DocumentStatus;
  category?: string;
  responsible_user_id?: string;
  iso_clause?: string;
  process_id?: string;
  is_archived?: boolean;
}

export interface DocumentStats {
  total: number;
  by_status: Record<DocumentStatus, number>;
  by_type: Record<DocumentType, number>;
  expiring_soon: number;
  expired: number;
  most_downloaded: Document[];
  recent: Document[];
}

// Pagination types (reuse from rrhh)
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
