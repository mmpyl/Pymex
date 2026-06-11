/**
 * Interfaces comunes para todo el sistema
 */

// Usuario autenticado en el request
export interface UsuarioAutenticado {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'gerente' | 'vendedor' | 'inventario';
  empresa_id: number;
  iat?: number;
  exp?: number;
}

// Request de Express con usuario tipado
export interface RequestConUsuario<T = any> extends Request {
  usuario?: UsuarioAutenticado;
  body: T;
  params: Record<string, string>;
  query: Record<string, string>;
}

// Respuesta estandarizada de la API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Paginación
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginationResult<T> {
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

// Filtros comunes
export interface FiltrosBase {
  empresa_id: number;
  estado?: 'activo' | 'inactivo' | 'pendiente' | 'aprobado' | 'rechazado';
  fechaDesde?: string;
  fechaHasta?: string;
}

// Auditoría
export interface AuditoriaBase {
  created_at: Date;
  updated_at: Date;
  created_por?: number;
  updated_por?: number;
}
