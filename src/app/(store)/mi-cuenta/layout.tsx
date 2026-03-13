import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function MiCuentaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth?returnTo=/mi-cuenta')
  return <>{children}</>
}
