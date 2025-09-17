import Cookies from 'js-cookie'
import type { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

const ACCESS_TOKEN = 'sb_access_token'

interface AuthStateShape {
  auth: {
    user: User | null
    session: Session | null
    isLoading: boolean
    signInWithPassword: (params: { email: string; password: string }) => Promise<void>
    signOut: () => Promise<void>
    setFromSession: (session: Session | null) => void
  }
}

export const useAuthStore = create<AuthStateShape>()((set) => ({
  auth: {
    user: null,
    session: null,
    isLoading: false,
    setFromSession: (session) =>
      set((state) => {
        const accessToken = session?.access_token ?? ''
        if (accessToken) Cookies.set(ACCESS_TOKEN, accessToken)
        else Cookies.remove(ACCESS_TOKEN)
        return {
          ...state,
          auth: { ...state.auth, user: session?.user ?? null, session },
        }
      }),
    signInWithPassword: async ({ email, password }) => {
      set((state) => ({ ...state, auth: { ...state.auth, isLoading: true } }))
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      set((state) => ({
        ...state,
        auth: {
          ...state.auth,
          user: data.user,
          session: data.session,
          isLoading: false,
        },
      }))
      const accessToken = data.session?.access_token
      if (accessToken) Cookies.set(ACCESS_TOKEN, accessToken)
    },
    signOut: async () => {
      await supabase.auth.signOut()
      Cookies.remove(ACCESS_TOKEN)
      set((state) => ({
        ...state,
        auth: { ...state.auth, user: null, session: null },
      }))
    },
  },
}))
