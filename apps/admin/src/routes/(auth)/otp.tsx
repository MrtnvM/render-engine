import { createFileRoute, redirect } from '@tanstack/react-router'
import Otp from '@/features/auth/otp'

export const Route = createFileRoute('/(auth)/otp')({
  beforeLoad: async () => {
    const { supabase } = await import('@/lib/supabase')
    const { data } = await supabase.auth.getSession()
    if (data.session) throw redirect({ to: '/' })
  },
  component: Otp,
})
