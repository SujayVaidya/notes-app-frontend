import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  user: { id: string; email: string } | null
  setSession: (session: Session | null) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  setSession: (session) =>
    set({
      session,
      user: session?.user
        ? { id: session.user.id, email: session.user.email ?? '' }
        : null,
    }),
  clearSession: () => set({ session: null, user: null }),
}))
