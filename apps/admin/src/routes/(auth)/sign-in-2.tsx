import { createFileRoute, redirect } from '@tanstack/react-router'
import SignIn2 from '@/features/auth/sign-in/sign-in-2'

export const Route = createFileRoute('/(auth)/sign-in-2')({
  beforeLoad: async () => {
    const { supabase } = await import('@/lib/supabase')
    const { data } = await supabase.auth.getSession()
    if (data.session) throw redirect({ to: '/' })
  },
  component: SignIn2,
})
