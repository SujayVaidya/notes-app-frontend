import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { queryClient } from '@/lib/queryClient'

export function useSession() {
  return useAuthStore((s) => s.session)
}

export function useSignIn() {
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()
  return async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setSession(data.session)
    navigate('/app')
    toast.success('Welcome back!')
  }
}

export function useSignUp() {
  return async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    toast.success('Account created! Check your email to confirm.')
  }
}

export function useSignOut() {
  const clearSession = useAuthStore((s) => s.clearSession)
  const setActiveNote = useUIStore((s) => s.setActiveNote)
  const setActiveCategory = useUIStore((s) => s.setActiveCategory)
  const navigate = useNavigate()
  return async () => {
    await supabase.auth.signOut()
    clearSession()
    setActiveNote(null)
    setActiveCategory(null)
    queryClient.clear()
    navigate('/')
  }
}
