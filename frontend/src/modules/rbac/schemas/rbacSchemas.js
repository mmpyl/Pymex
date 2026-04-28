import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMAS DE VALIDACIÓN RBAC
// ═══════════════════════════════════════════════════════════════════════════════

export const usuarioSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  rol_id: z.number().int().positive('El rol es obligatorio'),
});

export const permisosRolSchema = z.object({
  permisos: z.array(z.number().int().positive()).default([]),
});
