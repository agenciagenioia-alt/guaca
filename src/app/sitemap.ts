import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://laguaca.co'
  const supabase = createClient()

  // Productos dinámicos
  const { data: productsData } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)
  const products = productsData as any[]

  const productUrls: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${baseUrl}/producto/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  // Categorías dinámicas
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('slug, updated_at')
    .eq('is_active', true)
  const categories = categoriesData as any[]

  const categoryUrls: MetadataRoute.Sitemap = (categories || []).map((category) => ({
    url: `${baseUrl}/catalogo?categoria=${category.slug}`,
    lastModified: new Date(category.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Rutas estáticas principales
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalogo`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nosotros`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/politica-de-privacidad`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  return [...staticRoutes, ...productUrls, ...categoryUrls]
}
