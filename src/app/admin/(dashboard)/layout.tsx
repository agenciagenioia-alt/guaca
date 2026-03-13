'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
  CreditCard,
  GalleryHorizontal,
  MessageSquare,
  Tag,
  Users,
} from 'lucide-react'
import { ToastContainer } from '@/components/ui/ToastContainer'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Productos', href: '/admin/productos', icon: Package },
    { name: 'Categorías', href: '/admin/categorias', icon: Tags },
    { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingCart },
    { name: 'Wompi', href: '/admin/wompi', icon: CreditCard },
    { name: 'Banners', href: '/admin/banners', icon: ImageIcon },
    { name: 'Galería', href: '/admin/galeria', icon: GalleryHorizontal },
    { name: 'Reseñas', href: '/admin/resenas', icon: MessageSquare },
    { name: 'Marcas', href: '/admin/marcas', icon: Tag },
    { name: 'Nosotros', href: '/admin/nosotros', icon: Users },
    { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
  ]

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <nav className="fixed inset-x-0 bottom-0 md:relative md:inset-auto md:w-64 md:h-screen bg-surface border-t md:border-t-0 md:border-r border-border z-40 flex md:flex-col">
        {/* Logo (Desktop only) */}
        <div className="hidden md:flex flex-col items-center justify-center h-20 border-b border-border p-4">
          <span className="font-display text-2xl tracking-wider text-foreground">
            LA GUACA
          </span>
          <span className="text-xs text-[#E8E6E1] font-bold tracking-widest uppercase">
            Admin
          </span>
        </div>

        {/* Action Buttons (Desktop only top) */}
        <div className="hidden md:flex p-4 gap-2 border-b border-border">
          <Link
            href="/"
            target="_blank"
            className="flex-1 flex items-center justify-center gap-2 text-xs font-medium bg-background border border-border text-foreground py-2 rounded-md hover:border-[rgba(232,230,225,0.25)] hover:text-[#E8E6E1] transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Ver tienda
          </Link>
        </div>

        {/* Nav Links */}
        <ul className="flex-1 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible p-2 scrollbar-hide md:p-4">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)

            return (
              <li key={item.name} className="flex-shrink-0 md:flex-shrink">
                <Link
                  href={item.href}
                  className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 md:py-3 rounded-md text-xs md:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#E8E6E1]/10 text-[#E8E6E1] md:border-r-2 md:border-[rgba(232,230,225,0.25)]'
                      : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="w-5 h-5 md:w-4 md:h-4" />
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Logout (Desktop only bottom) */}
        <div className="hidden md:block p-4 border-t border-border mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-error hover:bg-error/10 hover:text-error rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Header Mobile */}
      <div className="md:hidden flex items-center justify-between p-4 bg-surface border-b border-border sticky top-0 z-30">
        <div className="flex flex-col">
          <span className="font-display text-xl tracking-wider text-foreground leading-none">
            LA GUACA
          </span>
          <span className="text-[10px] text-[#E8E6E1] font-bold tracking-widest uppercase">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="p-2 border border-border rounded-md text-foreground hover:text-[#E8E6E1] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 border border-border rounded-md text-error hover:bg-error/10 hover:border-error transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-background overflow-y-auto pb-20 md:pb-0">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">{children}</div>
      </main>
      <ToastContainer />
    </div>
  )
}
