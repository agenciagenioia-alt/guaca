'use server'

import { revalidatePath } from 'next/cache'

/** Llamar después de cualquier cambio en admin que deba verse en la tienda. */
export async function revalidateStore(type: 'product' | 'category' | 'config' | 'gallery', slug?: string) {
  revalidatePath('/', 'layout')
  revalidatePath('/')
  if (type === 'category') {
    revalidatePath('/catalogo')
  }
  if (type === 'product') {
    revalidatePath('/catalogo')
    if (slug) revalidatePath(`/producto/${slug}`)
  }
}
