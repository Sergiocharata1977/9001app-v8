// Types for authentication and user management

export interface User {
  id: string; // Same as Firebase Auth UID
  email: string;
  personnel_id: string; // Reference to personnel collection
  rol: 'admin' | 'gerente' | 'jefe' | 'operario' | 'auditor';
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserFormData {
  email: string;
  personnel_id: string;
  rol: User['rol'];
  activo: boolean;
}

// Mapping from personnel tipo_personal to user rol
export const TIPO_PERSONAL_TO_ROL: Record<string, User['rol']> = {
  gerencial: 'gerente',
  supervisor: 'jefe',
  administrativo: 'jefe',
  técnico: 'operario',
  ventas: 'operario',
};
