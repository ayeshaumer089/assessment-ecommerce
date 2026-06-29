import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/store/cartStore'
import type { Product } from '@/types'

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '1',
    name: 'Widget',
    description: '',
    price: 100,
    discountPercentage: 10,
    discountedPrice: 90,
    stock: 20,
    category: 'electronics',
    brand: '',
    sku: '',
    tags: [],
    rating: 4,
    reviewCount: 0,
    reviews: [],
    image: '',
    images: [],
    availabilityStatus: 'In Stock',
    shippingInformation: '',
    warrantyInformation: '',
    returnPolicy: '',
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] })
  })

  it('starts with an empty cart', () => {
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('adds a new item', () => {
    const p = makeProduct()
    useCartStore.getState().addItem(p, 2)
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0].quantity).toBe(2)
  })

  it('increments quantity when same product is added again', () => {
    const p = makeProduct()
    useCartStore.getState().addItem(p, 1)
    useCartStore.getState().addItem(p, 3)
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(4)
  })

  it('adds different products as separate items', () => {
    useCartStore.getState().addItem(makeProduct({ id: 'A' }))
    useCartStore.getState().addItem(makeProduct({ id: 'B' }))
    expect(useCartStore.getState().items).toHaveLength(2)
  })

  it('removes an item by productId', () => {
    const p = makeProduct()
    useCartStore.getState().addItem(p)
    useCartStore.getState().removeItem(p.id)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('updateQuantity changes quantity', () => {
    const p = makeProduct()
    useCartStore.getState().addItem(p, 5)
    useCartStore.getState().updateQuantity(p.id, 2)
    expect(useCartStore.getState().items[0].quantity).toBe(2)
  })

  it('updateQuantity with 0 removes the item', () => {
    const p = makeProduct()
    useCartStore.getState().addItem(p, 5)
    useCartStore.getState().updateQuantity(p.id, 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('clearCart empties all items', () => {
    useCartStore.getState().addItem(makeProduct({ id: 'A' }))
    useCartStore.getState().addItem(makeProduct({ id: 'B' }))
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('totalItems sums quantities', () => {
    useCartStore.getState().addItem(makeProduct({ id: 'A' }), 3)
    useCartStore.getState().addItem(makeProduct({ id: 'B' }), 2)
    expect(useCartStore.getState().totalItems()).toBe(5)
  })

  it('totalPrice sums price × quantity (original price)', () => {
    // Uses product.price, not discountedPrice
    useCartStore.getState().addItem(makeProduct({ price: 100 }), 2)
    expect(useCartStore.getState().totalPrice()).toBe(200)
  })
})
