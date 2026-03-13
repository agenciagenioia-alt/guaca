'use client'

import { useRef } from 'react'
import { Camera, ImageIcon } from 'lucide-react'

/**
 * Dos inputs ocultos: uno con capture (cámara) y otro sin (galería/archivos).
 * En móvil permite "Tomar foto/video" o "Elegir de galería". En desktop ambos abren el selector de archivos.
 */
export function CameraOrGalleryInput({
  accept,
  onChange,
  id,
  disabled,
  className = '',
  multiple,
}: {
  accept: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  id?: string
  disabled?: boolean
  className?: string
  multiple?: boolean
}) {
  const camRef = useRef<HTMLInputElement>(null)
  const galRef = useRef<HTMLInputElement>(null)
  const baseId = id || 'upload'
  const isVideo = accept.startsWith('video')

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <input
        ref={camRef}
        id={`${baseId}-camera`}
        type="file"
        accept={accept}
        capture={isVideo ? undefined : 'environment'}
        className="sr-only"
        onChange={onChange}
        disabled={disabled}
        multiple={multiple}
      />
      <input
        ref={galRef}
        id={`${baseId}-gallery`}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={onChange}
        disabled={disabled}
        multiple={multiple}
      />
      <label
        htmlFor={`${baseId}-camera`}
        className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-border rounded-none text-foreground-muted hover:border-foreground hover:text-foreground cursor-pointer transition-colors disabled:opacity-50 disabled:pointer-events-none text-sm"
      >
        <Camera className="w-4 h-4" />
        {isVideo ? 'Grabar video' : 'Cámara'}
      </label>
      <label
        htmlFor={`${baseId}-gallery`}
        className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-border rounded-none text-foreground-muted hover:border-foreground hover:text-foreground cursor-pointer transition-colors disabled:opacity-50 disabled:pointer-events-none text-sm"
      >
        <ImageIcon className="w-4 h-4" />
        {isVideo ? 'Galería / archivo' : 'Galería / archivo'}
      </label>
    </div>
  )
}
