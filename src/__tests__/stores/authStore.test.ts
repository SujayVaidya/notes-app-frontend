import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { createMockSession } from '@/test/utils'

beforeEach(() => {
  useAuthStore.setState({ session: null, user: null })
})

describe('authStore', () => {
  describe('setSession', () => {
    it('stores session and derives user from it', () => {
      const session = createMockSession()
      useAuthStore.getState().setSession(session)

      const state = useAuthStore.getState()
      expect(state.session).toBe(session)
      expect(state.user).toEqual({ id: 'user-1', email: 'test@example.com' })
    })

    it('clears user when session is null', () => {
      useAuthStore.getState().setSession(createMockSession())
      useAuthStore.getState().setSession(null)

      const state = useAuthStore.getState()
      expect(state.session).toBeNull()
      expect(state.user).toBeNull()
    })

    it('handles user with missing email gracefully', () => {
      const session = createMockSession()
      session.user.email = undefined
      useAuthStore.getState().setSession(session)

      expect(useAuthStore.getState().user?.email).toBe('')
    })
  })

  describe('clearSession', () => {
    it('resets both session and user to null', () => {
      useAuthStore.getState().setSession(createMockSession())
      useAuthStore.getState().clearSession()

      const state = useAuthStore.getState()
      expect(state.session).toBeNull()
      expect(state.user).toBeNull()
    })
  })
})
