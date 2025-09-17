import { createFileRoute, redirect } from '@tanstack/react-router'
import SignIn from '@/features/auth/sign-in'

export const Route = createFileRoute('/(auth)/sign-in')({
  component: SignIn,
  beforeLoad: async () => {
    // Redirect away if already authenticated
    const { supabase } = await import('@/lib/supabase')
    const { data } = await supabase.auth.getSession()
    if (data.session) throw redirect({ to: '/' })
  },
})
