import type { DJAuthResponse, DJCart, DJProduct, DJUser } from '@/types/dummyjson'
import type { CartItem, Product, User } from '@/types'

export function mapProduct(p: DJProduct): Product {
  const discounted = parseFloat(
    (p.price * (1 - p.discountPercentage / 100)).toFixed(2),
  )
  return {
    id: String(p.id),
    name: p.title,
    description: p.description,
    price: p.price,
    discountPercentage: p.discountPercentage,
    discountedPrice: discounted,
    stock: p.stock,
    category: p.category,
    brand: p.brand ?? '',
    sku: p.sku ?? '',
    tags: p.tags ?? [],
    rating: p.rating,
    reviewCount: p.reviews?.length ?? 0,
    reviews: (p.reviews ?? []).map((r) => ({
      rating: r.rating,
      comment: r.comment,
      date: r.date,
      reviewerName: r.reviewerName,
    })),
    image: p.thumbnail,
    images: p.images ?? [p.thumbnail],
    availabilityStatus: p.availabilityStatus ?? '',
    shippingInformation: p.shippingInformation ?? '',
    warrantyInformation: p.warrantyInformation ?? '',
    returnPolicy: p.returnPolicy ?? '',
    createdAt: p.meta?.createdAt ?? new Date().toISOString(),
  }
}

export function mapAuthUser(u: DJAuthResponse): User {
  return {
    id: String(u.id),
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    username: u.username,
    role: 'customer',
    avatar: u.image,
    createdAt: new Date().toISOString(),
  }
}

export function mapDJUser(u: DJUser): User {
  return {
    id: String(u.id),
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    username: u.username,
    role: u.role === 'admin' ? 'admin' : 'customer',
    avatar: u.image,
    createdAt: new Date().toISOString(),
  }
}

export function mapCartItems(cart: DJCart, productMap: Map<string, Product>): CartItem[] {
  return cart.products
    .map((cp) => {
      const product = productMap.get(String(cp.id))
      if (!product) return null
      return { product, quantity: cp.quantity } satisfies CartItem
    })
    .filter(Boolean) as CartItem[]
}
