'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Instagram, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface GalleryImage {
  id: string
  image_url: string
  alt_text: string
  display_order: number
  is_active: boolean
}

// Fallback images (Luxury Streetwear vibe)
const fallbackImages = [
  { id: '1', image_url: 'https://images.unsplash.com/photo-1608228079968-c7681eaef814?w=1200&q=80', alt_text: 'Streetwear Lookbook', display_order: 0, is_active: true },
  { id: '2', image_url: 'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=1200&q=80', alt_text: 'Premium Sneakers', display_order: 1, is_active: true },
  { id: '3', image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&q=80', alt_text: 'Apparel Details', display_order: 2, is_active: true },
  { id: '4', image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&q=80', alt_text: 'Dark Editorial', display_order: 3, is_active: true },
  { id: '5', image_url: 'https://images.unsplash.com/photo-1492447105260-2e947425b5cc?w=1200&q=80', alt_text: 'Minimal Aesthetic', display_order: 4, is_active: true },
]

export function UGCMasonry() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [images, setImages] = useState<GalleryImage[]>(fallbackImages)

  useEffect(() => {
    const supabase = createClient() as any
    supabase
      .from('gallery_images')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }: { data: GalleryImage[] | null }) => {
        if (data && data.length > 0) {
          // If we have data, we'll try to use at least 4-5 images for the layout
          setImages(data)
        }
      })
  }, [])

  // Safely get images, falling back to empty if we don't have enough
  const img1 = images[0]?.image_url
  const img2 = images[1]?.image_url
  const img3 = images[2]?.image_url
  const img4 = images[3]?.image_url
  const img5 = images[4]?.image_url

  return (
    <section className="py-24 md:py-40 px-6 bg-[#111110] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* Header Minimalista */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-24 md:mb-32 gap-12">
          <div className="relative">
            <h2 className="text-5xl md:text-[80px] font-heading font-bold text-[#E8E6E1] uppercase leading-none tracking-tight mb-4">
              LA GUACA
            </h2>
            <p className="font-mono text-xs md:text-sm text-[#6B6B68] tracking-[0.3em] uppercase">
              El espacio visual del negocio por dentro.
            </p>
          </div>
          <a 
            href="https://instagram.com/boutiquelaguaca1" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-3 border-b border-[#E8E6E1]/20 pb-2 hover:border-[#E8E6E1] transition-colors duration-500"
          >
            <Instagram className="w-5 h-5 text-[#6B6B68] group-hover:text-[#E8E6E1] transition-colors duration-500" />
            <span className="font-mono text-sm tracking-[0.2em] text-[#6B6B68] group-hover:text-[#E8E6E1] uppercase transition-colors duration-500">@BOUTIQUELAGUACA1</span>
          </a>
        </div>

        {/* CSS Grid Asimétrico Estricto con Cards "Paspartú" */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center">
          
          {/* Bloque Izquierdo (Imagen Principal Vertical) */}
          {img1 && (
            <div className="md:col-span-5 md:col-start-1 relative">
              <div 
                className="relative w-full aspect-[3/4] group cursor-pointer bg-[#1A1A18] p-4 md:p-6 border border-[#E8E6E1]/10 hover:border-[#E8E6E1]/30 transition-colors duration-700 shadow-2xl"
                onClick={() => setSelectedImage(img1)}
              >
                <div className="relative w-full h-full overflow-hidden border border-[#E8E6E1]/5">
                  <Image 
                    src={img1} 
                    alt={images[0]?.alt_text || 'Lookbook Domicilio'} 
                    fill 
                    className="object-cover grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111110]/80 via-transparent to-transparent opacity-80 group-hover:opacity-0 transition-opacity duration-700" />
                  
                  {/* Hover Reveal CTA */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[#111110]/20 backdrop-blur-[2px]">
                     <span className="font-mono text-xs text-[#111110] font-bold tracking-[0.3em] uppercase bg-[#E8E6E1] px-8 py-4 transition-transform duration-500 scale-95 group-hover:scale-100">EXPLORAR VISIÓN</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bloque Derecho (Dos imágenes apiladas asimétricamente) */}
          <div className="md:col-span-6 md:col-start-7 flex flex-col gap-12 md:gap-24 relative mt-12 md:mt-0">
            
            {/* Imagen Superior Derecha (Ancha) */}
            {img2 && (
              <div className="w-full relative ml-auto md:w-[90%]">
                <div 
                  className="relative w-full aspect-[4/3] group cursor-pointer bg-[#1A1A18] p-3 md:p-5 border border-[#E8E6E1]/10 hover:border-[#E8E6E1]/30 transition-colors duration-700 shadow-xl"
                  onClick={() => setSelectedImage(img2)}
                >
                  <div className="relative w-full h-full overflow-hidden border border-[#E8E6E1]/5">
                    <Image 
                      src={img2} 
                      alt={images[1]?.alt_text || 'Interior Premium'} 
                      fill 
                      className="object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1.2s] ease-out"
                      sizes="(max-width: 768px) 100vw, 45vw"
                    />
                    <div className="absolute inset-0 bg-[#111110]/40 group-hover:bg-transparent transition-colors duration-700" />
                  </div>
                  
                  {/* Etiqueta Inferior (Fuera de la imagen, en el "marco") */}
                  <div className="absolute -bottom-5 right-6 bg-[#111110] px-4 py-2 border border-[#E8E6E1]/20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                    <span className="font-mono text-[10px] text-[#E8E6E1] tracking-[0.4em] uppercase">STREETWEAR DIARIO</span>
                  </div>
                </div>
              </div>
            )}

            {/* Imagen Inferior Derecha (Cuadrada/Pequeña offset) */}
            {img3 && (
              <div className="w-[80%] md:w-[65%] relative mr-auto">
                <div 
                  className="relative w-full aspect-square group cursor-pointer bg-[#242422] p-2 md:p-4 border border-[#E8E6E1]/5 hover:border-[#E8E6E1]/40 transition-colors duration-700 shadow-lg"
                  onClick={() => setSelectedImage(img3)}
                >
                  <div className="relative w-full h-full overflow-hidden">
                    <Image 
                      src={img3} 
                      alt={images[2]?.alt_text || 'Detalles'} 
                      fill 
                      className="object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out"
                      sizes="(max-width: 768px) 80vw, 30vw"
                    />
                    <div className="absolute inset-0 bg-[#111110]/30 group-hover:bg-transparent transition-colors duration-700" />
                    <div className="absolute inset-0 border border-[#E8E6E1]/20 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Fila Inferior */}
          <div className="md:col-span-12 flex flex-col md:flex-row gap-12 md:gap-20 mt-16 md:mt-24 items-start">
             
             {/* Imagen Panorámica Inferior */}
             {img4 && (
               <div className="w-full md:w-[45%] md:ml-[5%]">
                 <div 
                    className="relative w-full aspect-video md:aspect-[3/2] group cursor-pointer bg-[#1A1A18] p-4 md:p-6 border border-[#E8E6E1]/10 hover:border-[#E8E6E1]/30 transition-all duration-700 shadow-2xl hover:-translate-y-2"
                    onClick={() => setSelectedImage(img4)}
                  >
                    <div className="relative w-full h-full overflow-hidden border border-[#E8E6E1]/10">
                      <Image 
                        src={img4} 
                        alt={images[3]?.alt_text || 'Galería'} 
                        fill 
                        className="object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out"
                        sizes="(max-width: 768px) 100vw, 40vw"
                      />
                       <div className="absolute inset-0 bg-[#111110]/50 group-hover:bg-[#111110]/10 transition-colors duration-700" />
                    </div>
                  </div>
               </div>
             )}

             {/* Imagen Flotante a la Derecha */}
             {img5 && (
               <div className="w-[85%] md:w-[30%] ml-auto mt-8 md:mt-32 md:mr-[10%]">
                 <div 
                    className="relative w-full aspect-[4/5] group cursor-pointer bg-[#111110] p-2 md:p-3 border border-[#E8E6E1]/20 hover:border-[#E8E6E1]/60 transition-colors duration-700 shadow-xl"
                    onClick={() => setSelectedImage(img5)}
                  >
                    <div className="relative w-full h-full overflow-hidden">
                      <Image 
                        src={img5} 
                        alt={images[4]?.alt_text || 'Vibe'} 
                        fill 
                        className="object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out"
                        sizes="(max-width: 768px) 100vw, 30vw"
                      />
                       <div className="absolute inset-0 bg-gradient-to-tr from-[#111110]/60 to-transparent group-hover:opacity-0 transition-opacity duration-700" />
                    </div>
                  </div>
               </div>
             )}

          </div>

        </div>

      </div>

      {/* Lightbox Modal Minimalista */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[99999] bg-[#111110]/98 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-8 right-8 text-[#6B6B68] hover:text-[#E8E6E1] transition-colors group flex items-center gap-4 z-50 bg-[#1A1A18]/50 p-3"
            onClick={() => setSelectedImage(null)}
            aria-label="Cerrar"
          >
            <span className="font-mono text-xs tracking-[0.3em] uppercase opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">CERRAR</span>
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>
          
          <div 
            className="relative w-full max-w-[90vw] md:max-w-[75vw] h-[85vh] animate-scale-up border border-[#E8E6E1]/5 bg-[#111110]"
            onClick={e => e.stopPropagation()}
          >
            <Image 
              src={selectedImage} 
              alt="La Guaca Detail" 
              fill 
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
    </section>
  )
}
