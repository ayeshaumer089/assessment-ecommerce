import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCartStore } from '@/store/cartStore'
import { cartService } from '@/services/cartService'
import type { Cart, Product } from '@/types'

// The cart is server-backed: the store delegates mutations to cartService and
// stores whatever the API returns. We mock the service to test that wiring.
vi.mock('@/services/cartService', () => ({
  cartService: {
    getCart: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
  },
}))

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '1',
    name: 'Widget',
    description: '',
    price: 100,
    discountPercentage: 0,
    discountedPrice: 100,
    stock: 20,
    category: 'electronics',
    brand: '',
    sku: '',
    tags: [],
    rating: 0,
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

function cartWith(items: { product: Product; quantity: number }[]): Cart {
  return {
    userId: 'u1',
    items: items.map((i) => ({
      productId: i.product.id,
      product: i.product,
      quantity: i.quantity,
      price: i.product.price,
    })),
  }
}

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ cart: null, items: [] })
    vi.clearAllMocks()
  })

  it('starts with an empty cart', () => {
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('fetchCart loads items from the server', async () => {
    const p = makeProduct()
    vi.mocked(cartService.getCart).mockResolvedValue(cartWith([{ product: p, quantity: 2 }]))

    await useCartStore.getState().fetchCart()

    expect(cartService.getCart).toHaveBeenCalled()
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0].quantity).toBe(2)
  })

  it('addItem delegates to the service and stores the returned cart', async () => {
    const p = makeProduct()
    vi.mocked(cartService.addItem).mockResolvedValue(cartWith([{ product: p, quantity: 3 }]))

    await useCartStore.getState().addItem(p, 3)

    expect(cartService.addItem).toHaveBeenCalledWith(p.id, 3)
    expect(useCartStore.getState().items[0].quantity).toBe(3)
  })

  it('updateQuantity with 0 removes the item via the service', async () => {
    vi.mocked(cartService.removeItem).mockResolvedValue(cartWith([]))

    await useCartStore.getState().updateQuantity('1', 0)

    expect(cartService.removeItem).toHaveBeenCalledWith('1')
    expect(cartService.updateItem).not.toHaveBeenCalled()
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('clearCart empties the store', async () => {
    useCartStore.setState({ items: cartWith([{ product: makeProduct(), quantity: 1 }]).items })
    vi.mocked(cartService.clearCart).mockResolvedValue(undefined)

    await useCartStore.getState().clearCart()

    expect(cartService.clearCart).toHaveBeenCalled()
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('totalItems sums quantities', () => {
    useCartStore.setState({
      items: cartWith([
        { product: makeProduct({ id: 'A' }), quantity: 3 },
        { product: makeProduct({ id: 'B' }), quantity: 2 },
      ]).items,
    })
    expect(useCartStore.getState().totalItems()).toBe(5)
  })

  it('totalPrice sums price × quantity', () => {
    useCartStore.setState({
      items: cartWith([{ product: makeProduct({ price: 100 }), quantity: 2 }]).items,
    })
    expect(useCartStore.getState().totalPrice()).toBe(200)
  })
})
