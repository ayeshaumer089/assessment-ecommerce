import type { User } from '@/types'

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Emily Johnson',
    email: 'emily.johnson@x.dummyjson.com',
    username: 'emilys',
    role: 'admin',
    avatar: 'https://dummyjson.com/icon/emilys/128',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Michael Williams',
    email: 'michael.williams@x.dummyjson.com',
    username: 'michaelw',
    role: 'customer',
    avatar: 'https://dummyjson.com/icon/michaelw/128',
    createdAt: '2024-02-14T00:00:00Z',
  },
  {
    id: '3',
    name: 'Sophia Davis',
    email: 'sophia.davis@x.dummyjson.com',
    username: 'sophiad',
    role: 'customer',
    avatar: 'https://dummyjson.com/icon/sophiad/128',
    createdAt: '2024-03-22T00:00:00Z',
  },
  {
    id: '4',
    name: 'James Miller',
    email: 'james.miller@x.dummyjson.com',
    username: 'jamesm',
    role: 'customer',
    avatar: 'https://dummyjson.com/icon/jamesm/128',
    createdAt: '2024-04-10T00:00:00Z',
  },
  {
    id: '5',
    name: 'Olivia Brown',
    email: 'olivia.brown@x.dummyjson.com',
    username: 'oliviab',
    role: 'customer',
    avatar: 'https://dummyjson.com/icon/oliviab/128',
    createdAt: '2024-05-05T00:00:00Z',
  },
]

// DummyJSON demo credential — works on /auth/login
export const DEMO_CREDENTIALS = {
  admin: { username: 'emilys', password: 'emilyspass' },
  customer: { username: 'michaelw', password: 'michaelwpass' },
}
