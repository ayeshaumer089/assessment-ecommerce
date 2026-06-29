import { describe, it, expect } from 'vitest'
import { mapProduct, mapAuthUser, mapDJUser } from '@/utils/mappers'
import type { DJProduct, DJAuthResponse, DJUser } from '@/types/dummyjson'

const djProduct: DJProduct = {
  id: 1,
  title: 'iPhone 9',
  description: 'An apple mobile which is nothing like apple',
  price: 549,
  discountPercentage: 12.96,
  rating: 4.69,
  stock: 94,
  brand: 'Apple',
  category: 'smartphones',
  thumbnail: 'https://cdn.dummyjson.com/product-images/1/thumbnail.jpg',
  images: ['https://cdn.dummyjson.com/product-images/1/1.jpg'],
  sku: 'RCH45Q1A',
  tags: ['smartphones', 'apple'],
  weight: 0.5,
  minimumOrderQuantity: 1,
  reviews: [
    { rating: 5, comment: 'Great!', date: '2024-01-01T00:00:00.000Z', reviewerName: 'Alice', reviewerEmail: 'alice@example.com' },
  ],
  availabilityStatus: 'In Stock',
  shippingInformation: 'Ships in 1 month',
  warrantyInformation: '1 Year Warranty',
  returnPolicy: '30 days return policy',
  meta: { createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z', barcode: '', qrCode: '' },
}

describe('mapProduct', () => {
  it('maps id to string', () => {
    expect(mapProduct(djProduct).id).toBe('1')
  })

  it('maps title to name', () => {
    expect(mapProduct(djProduct).name).toBe('iPhone 9')
  })

  it('computes discountedPrice correctly', () => {
    const expected = parseFloat((549 * (1 - 12.96 / 100)).toFixed(2))
    expect(mapProduct(djProduct).discountedPrice).toBe(expected)
  })

  it('maps reviews array', () => {
    const product = mapProduct(djProduct)
    expect(product.reviews).toHaveLength(1)
    expect(product.reviews[0].reviewerName).toBe('Alice')
  })

  it('maps thumbnail to image', () => {
    expect(mapProduct(djProduct).image).toBe(djProduct.thumbnail)
  })
})

describe('mapAuthUser', () => {
  const djAuth: DJAuthResponse = {
    id: 5,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    username: 'janedoe',
    gender: 'female',
    image: 'https://example.com/avatar.jpg',
    token: 'mock-token',
    refreshToken: 'mock-refresh',
  }

  it('always assigns customer role', () => {
    expect(mapAuthUser(djAuth).role).toBe('customer')
  })

  it('combines firstName and lastName into name', () => {
    expect(mapAuthUser(djAuth).name).toBe('Jane Doe')
  })

  it('maps id to string', () => {
    expect(mapAuthUser(djAuth).id).toBe('5')
  })
})

describe('mapDJUser', () => {
  const makeUser = (role: string): DJUser => ({
    id: 1,
    firstName: 'Emily',
    lastName: 'Smith',
    email: 'emily@example.com',
    username: 'emilys',
    image: '',
    role,
    phone: '',
    gender: 'female',
    birthDate: '',
  })

  it('maps role admin correctly', () => {
    expect(mapDJUser(makeUser('admin')).role).toBe('admin')
  })

  it('maps non-admin role to customer', () => {
    expect(mapDJUser(makeUser('user')).role).toBe('customer')
    expect(mapDJUser(makeUser('moderator')).role).toBe('customer')
  })
})
