import { z } from 'zod';

export const clienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  documento: z.string().optional(),
  email: z.union([z.string().email('Email inválido'), z.literal('')]).optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
});

export const proveedorSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  documento: z.string().optional(),
  email: z.union([z.string().email('Email inválido'), z.literal('')]).optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  contacto: z.string().optional(),
});

export const categoriaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
});

export const productoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  precio_compra: z.coerce.number().nonnegative().optional(),
  precio_venta: z.coerce.number().positive('Precio de venta inválido'),
  stock: z.coerce.number().nonnegative().optional(),
  stock_minimo: z.coerce.number().nonnegative().default(5),
  categoria_id: z.union([z.string(), z.number()]).optional(),
});
