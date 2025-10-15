import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      // Redirect to login page if not authenticated
      throw redirect({ to: '/login' })
    }
  },
  component: AuthenticatedLayout,
})
