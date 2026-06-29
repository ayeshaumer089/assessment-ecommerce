import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, Pencil, Trash2, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { useProducts, useCategories, useSearchProducts } from '@/hooks/useProducts'
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useAdminProducts'
import { useDebounce } from '@/hooks/useDebounce'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/utils/formatters'
import type { Product } from '@/types'

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  discountPercentage: z.coerce.number().min(0).max(100).default(0),
  category: z.string().min(1, 'Category is required'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  brand: z.string().optional(),
})

type ProductFormValues  = z.infer<typeof productSchema>
type ProductFormInput   = z.input<typeof productSchema>

interface AdminProductPayload {
  name: string
  description: string
  price: number
  discountPercentage: number
  category: string
  stock: number
  brand?: string
}

const LIMIT = 12

export default function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const isSearching = debouncedSearch.trim().length > 1
  const browseQuery = useProducts({ page, limit: LIMIT })
  const searchQuery = useSearchProducts(debouncedSearch)
  const activeQuery = isSearching ? searchQuery : browseQuery
  const { data, isLoading } = activeQuery

  const { data: categoriesData } = useCategories()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const deleteMutation = useDeleteProduct()

  const categories = categoriesData?.map((c) => c.name) ?? []

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { discountPercentage: 0 },
  })

  function openAdd() {
    setEditingProduct(null)
    reset({ name: '', description: '', price: 0, discountPercentage: 0, category: '', stock: 0, brand: '' })
    setFormOpen(true)
  }

  function openEdit(product: Product) {
    setEditingProduct(product)
    reset({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPercentage: product.discountPercentage,
      category: product.category,
      stock: product.stock,
      brand: product.brand,
    })
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    createMutation.reset()
    updateMutation.reset()
  }

  function onSubmit(values: ProductFormValues) {
    const payload: AdminProductPayload = {
      name: values.name,
      description: values.description,
      price: values.price,
      discountPercentage: values.discountPercentage,
      category: values.category,
      stock: values.stock,
      brand: values.brand,
    }
    if (editingProduct) {
      updateMutation.mutate(
        { id: editingProduct.id, ...payload },
        { onSuccess: closeForm },
      )
    } else {
      createMutation.mutate(payload, { onSuccess: closeForm })
    }
  }

  function openDelete(product: Product) {
    setDeleteTarget(product)
    deleteMutation.reset()
  }

  function closeDelete() {
    setDeleteTarget(null)
    deleteMutation.reset()
  }

  function confirmDelete() {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, { onSuccess: closeDelete })
  }

  const mutationError =
    (editingProduct ? updateMutation.error : createMutation.error) as Error | null
  const mutationPending = editingProduct ? updateMutation.isPending : createMutation.isPending

  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const products = data?.items ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search products..."
            className="block w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-150"
          />
        </div>
        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openAdd}>
          Add Product
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-500">{total} products</p>
        <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 leading-none">
          Note: Changes are session-only and reset on page refresh
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-gray-50 mx-4 my-2 rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <Package size={40} strokeWidth={1.5} />
            <p className="text-sm font-medium">No products found</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xs text-indigo-600 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Thumbnail</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Discount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Rating</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onEdit={openEdit}
                    onDelete={openDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ChevronLeft size={14} />}
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ChevronRight size={14} />}
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="xl"
        footer={
          <div className="flex flex-col gap-3">
            {mutationError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
                {mutationError.message ?? 'Something went wrong. Please try again.'}
              </div>
            )}
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={mutationPending}
                onClick={handleSubmit(onSubmit)}
              >
                {editingProduct ? 'Save Changes' : 'Add Product'}
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              step="0.01"
              error={errors.price?.message}
              {...register('price')}
            />
            <Input
              label="Discount %"
              type="number"
              step="0.01"
              error={errors.discountPercentage?.message}
              {...register('discountPercentage')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {categories.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                  {...register('category')}
                  className={[
                    'block w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 bg-white shadow-sm',
                    'outline-none transition-all duration-150 focus:ring-2 focus:ring-offset-0',
                    errors.category
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-100',
                  ].join(' ')}
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 5Zm0 7.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                    </svg>
                    {errors.category.message}
                  </p>
                )}
              </div>
            ) : (
              <Input
                label="Category"
                error={errors.category?.message}
                {...register('category')}
              />
            )}
            <Input
              label="Stock"
              type="number"
              error={errors.stock?.message}
              {...register('stock')}
            />
          </div>
          <Input
            label="Brand"
            optional
            error={errors.brand?.message}
            {...register('brand')}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className={[
                'block w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 bg-white shadow-sm',
                'placeholder:text-gray-400 outline-none transition-all duration-150 focus:ring-2 focus:ring-offset-0 resize-none',
                errors.description
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-100',
              ].join(' ')}
              placeholder="Describe the product..."
            />
            {errors.description && (
              <p className="flex items-center gap-1 text-xs text-red-600">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 5Zm0 7.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                </svg>
                {errors.description.message}
              </p>
            )}
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={closeDelete}
        title="Delete Product"
        size="sm"
        footer={
          <div className="flex flex-col gap-3">
            {deleteMutation.error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
                {(deleteMutation.error as Error).message ?? 'Failed to delete product.'}
              </div>
            )}
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={closeDelete}>
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={deleteMutation.isPending}
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-medium text-gray-900">{deleteTarget?.name}</span>? This action
          cannot be undone.
        </p>
      </Modal>
    </div>
  )
}

interface ProductRowProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

function ProductRow({ product, onEdit, onDelete }: ProductRowProps) {
  const stockPill =
    product.stock === 0
      ? 'bg-red-50 text-red-700 border border-red-200'
      : product.stock <= 10
        ? 'bg-amber-50 text-amber-700 border border-amber-200'
        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'

  const stockLabel =
    product.stock === 0 ? 'Out' : product.stock

  return (
    <tr className="hover:bg-gray-50/40 transition-colors">
      <td className="px-4 py-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-11 h-11 rounded-xl object-cover bg-gray-50"
          loading="lazy"
        />
      </td>
      <td className="px-4 py-3 max-w-xs">
        <p className="font-medium text-sm text-gray-900 line-clamp-1">{product.name}</p>
        <span className="inline-block mt-0.5 text-xs font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md">
          {product.category}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <p className="text-sm text-gray-900">{formatCurrency(product.price)}</p>
        {product.discountPercentage > 0 && (
          <p className="text-xs text-emerald-600 font-medium">
            {formatCurrency(product.discountedPrice)}
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        {product.discountPercentage > 0 ? (
          <span className="inline-block text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md">
            -{product.discountPercentage}%
          </span>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${stockPill}`}>
          {stockLabel}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-sm text-amber-600">&#9733; {product.rating.toFixed(1)}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="xs"
            leftIcon={<Pencil size={13} />}
            onClick={() => onEdit(product)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="xs"
            leftIcon={<Trash2 size={13} />}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(product)}
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  )
}
