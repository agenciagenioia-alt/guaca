/**
 * Validación y límites para APIs — ciberseguridad y estabilidad.
 * Límites conservadores para evitar abuso y sobrecarga.
 */

import { z } from 'zod'

const MAX_ITEMS_PER_ORDER = 20
const MAX_TOTAL_COP = 50_000_000 // 50M COP
const MAX_STRING = 500
const MAX_ORDER_NUMBER_LEN = 50
const MAX_CONTACT_LEN = 100
const MAX_JSON_BODY = 100 * 1024 // 100 KB

export const crearOrdenItemSchema = z.object({
  productId: z.string().min(1).max(50),
  productName: z.string().min(1).max(200),
  imageUrl: z.string().url().max(MAX_STRING).optional().or(z.literal('')),
  size: z.string().min(1).max(20),
  quantity: z.number().int().min(1).max(10),
  unitPrice: z.number().min(0).max(MAX_TOTAL_COP),
})

export const crearOrdenCustomerSchema = z.object({
  name: z.string().min(1).max(150).trim(),
  phone: z.string().min(1).max(30).trim(),
  email: z.string().email().max(150).optional().or(z.literal('')),
  address: z.string().min(1).max(MAX_STRING).trim(),
  city: z.string().min(1).max(100).trim(),
  notes: z.string().max(500).optional().nullable(),
})

export const crearOrdenBodySchema = z.object({
  items: z.array(crearOrdenItemSchema).min(1).max(MAX_ITEMS_PER_ORDER),
  customer: crearOrdenCustomerSchema,
  total: z.number().min(0).max(MAX_TOTAL_COP),
})

export const trackBodySchema = z.object({
  orderNumber: z.string().min(1).max(MAX_ORDER_NUMBER_LEN).trim(),
  contact: z.string().max(MAX_CONTACT_LEN).trim().optional(),
})

export type CrearOrdenBody = z.infer<typeof crearOrdenBodySchema>
export type TrackBody = z.infer<typeof trackBodySchema>

/** Verifica que el total coincida con la suma de items (evitar manipulación). */
export function validateOrderTotal(
  items: { quantity: number; unitPrice: number }[],
  declaredTotal: number
): boolean {
  const sum = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  return Math.abs(sum - declaredTotal) < 1 // tolerancia 1 peso
}

/** Tamaño máximo del body en bytes para leer. */
export const MAX_BODY_SIZE = MAX_JSON_BODY
