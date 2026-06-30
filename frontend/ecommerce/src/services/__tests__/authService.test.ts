import { describe, it, expect, beforeEach } from 'vitest'
import { authService } from '@/services/authService'
import type { User } from '@/types'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

const mockUser: User = {
  id: '1',
  name: 'Jane Doe',
  email: 'jane@example.com',
  username: 'janedoe',
  role: 'admin',
  createdAt: '2024-01-01T00:00:00.000Z',
}

describe('authService – localStorage helpers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getStoredUser', () => {
    it('returns null when localStorage is empty', () => {
      expect(authService.getStoredUser()).toBeNull()
    })

    it('returns the parsed user when set', () => {
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser))
      const result = authService.getStoredUser()
      expect(result).toEqual(mockUser)
    })

    it('returns null when stored value is malformed JSON', () => {
      localStorage.setItem(USER_KEY, '{bad json')
      expect(authService.getStoredUser()).toBeNull()
    })

    it('preserves role field', () => {
      localStorage.setItem(USER_KEY, JSON.stringify({ ...mockUser, role: 'admin' }))
      expect(authService.getStoredUser()?.role).toBe('admin')
    })
  })

  describe('getStoredToken', () => {
    it('returns null when not set', () => {
      expect(authService.getStoredToken()).toBeNull()
    })

    it('returns the token when set', () => {
      localStorage.setItem(TOKEN_KEY, 'abc123')
      expect(authService.getStoredToken()).toBe('abc123')
    })
  })

  describe('clearStorage', () => {
    it('clears token and user from localStorage', () => {
      localStorage.setItem(TOKEN_KEY, 'abc123')
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser))
      authService.clearStorage()
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
      expect(localStorage.getItem(USER_KEY)).toBeNull()
    })
  })
})
