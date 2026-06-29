import type { User } from '@/types'

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Admin',
    email: 'admin@shopzone.com',
    role: 'admin',
    createdAt: '2024-12-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Bob Customer',
    email: 'bob@example.com',
    role: 'customer',
    createdAt: '2025-01-10T00:00:00Z',
  },
]
