import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, Pencil, Trash2, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { useProducts, useCategories, useSearchProducts } from '@/hooks/useProducts'
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useAdminProducts'
import { useDebounce } from '@/hooks/useDebounce'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatCurrency } from '@/utils/formatters'
import type { Product } from '@/types'

const productSchema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price:       z.coerce.number().min(0.01, 'Price must be greater than 0'),
  category:    z.string().min(1, 'Category is required'),
  stock:       z.coerce.number().int().min(0, 'Stock cannot be negative'),
  image:       z.string().url('Enter a valid image URL (https://…)'),
})

type ProductFormValues = z.infer<typeof productSchema>
type ProductFormInput  = z.input<typeof productSchema>

interface AdminProductPayload {
  name: string; description: string; price: number
  category: string; stock: number; image: string
}

const LIMIT = 12

export default function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [page, setPage] = useState(1)

  const [formOpen,       setFormOpen]       = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteTarget,   setDeleteTarget]   = useState<Product | null>(null)

  const isSearching  = debouncedSearch.trim().length > 1
  const browseQuery  = useProducts({ page, limit: LIMIT })
  const searchQuery  = useSearchProducts(debouncedSearch)
  const activeQuery  = isSearching ? searchQuery : browseQuery
  const { data, isLoading } = activeQuery

  const { data: categoriesData } = useCategories()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const deleteMutation = useDeleteProduct()
  const categories     = categoriesData ?? []

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<ProductFormInput, unknown, ProductFormValues>({ resolver: zodResolver(productSchema) })

  function openAdd() {
    setEditingProduct(null)
    reset({ name: '', description: '', price: 0, category: '', stock: 0, image: '' })
    setFormOpen(true)
  }

  function openEdit(product: Product) {
    setEditingProduct(product)
    reset({ name: product.name, description: product.description, price: product.price, category: product.category, stock: product.stock, image: product.image })
    setFormOpen(true)
  }

  function closeForm() { setFormOpen(false); createMutation.reset(); updateMutation.reset() }

  function onSubmit(values: ProductFormValues) {
    const payload: AdminProductPayload = { name: values.name, description: values.description, price: values.price, category: values.category, stock: values.stock, image: values.image }
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...payload }, { onSuccess: closeForm })
    } else {
      createMutation.mutate(payload, { onSuccess: closeForm })
    }
  }

  function openDelete(product: Product) { setDeleteTarget(product); deleteMutation.reset() }
  function closeDelete() { setDeleteTarget(null); deleteMutation.reset() }
  function confirmDelete() { if (!deleteTarget) return; deleteMutation.mutate(deleteTarget.id, { onSuccess: closeDelete }) }

  const mutationError   = (editingProduct ? updateMutation.error : createMutation.error) as Error | null
  const mutationPending = editingProduct ? updateMutation.isPending : createMutation.isPending

  const total      = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const products   = data?.items ?? []

  return (
    <div className="sz-admin">
      <div className="sz-content-head">
        <h1>Products</h1>
        <button className="sz-btn-add" onClick={openAdd}>
          <Plus size={15} /> Add Product
        </button>
      </div>

      <div className="sz-search-row">
        <div className="sz-search-bar">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 12 }}>{total} products</div>

      <div className="sz-table-panel">
        {isLoading ? (
          <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ height: 56, background: '#F8F7FB', borderRadius: 10 }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="sz-empty-state">
            <div className="sz-empty-ic"><Package size={28} /></div>
            <div className="sz-empty-text">
              No products found
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ display: 'block', marginTop: 8, color: 'var(--violet)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Thumbnail', 'Product', 'Price', 'Discount', 'Stock', 'Rating', 'Actions'].map((h) => (
                    <th key={h} style={{ textAlign: h === 'Actions' ? 'right' : 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9A93AE', padding: '14px 18px', borderBottom: '1px solid var(--line)', background: '#FBFAFD', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <ProductRow key={product.id} product={product} onEdit={openEdit} onDelete={openDelete} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="sz-pagination">
          <span className="pg-info">Page {page} of {totalPages}</span>
          <div className="pg-btns">
            <button className="sz-btn-pg" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
              <ChevronLeft size={14} /> Previous
            </button>
            <button className="sz-btn-pg" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="xl"
        footer={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mutationError && (
              <div style={{ background: '#FFF5F5', border: '1px solid #FED7D7', borderRadius: 10, padding: '10px 16px', fontSize: 13.5, color: '#C53030' }}>
                {mutationError.message ?? 'Something went wrong.'}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button variant="outline" onClick={closeForm}>Cancel</Button>
              <Button variant="primary" loading={mutationPending} onClick={handleSubmit(onSubmit)}>
                {editingProduct ? 'Save Changes' : 'Add Product'}
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" type="number" step="0.01" error={errors.price?.message} {...register('price')} />
            <Input label="Stock" type="number" error={errors.stock?.message} {...register('stock')} />
          </div>
          {categories.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select {...register('category')} className="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                <option value="">Select a category</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
              {errors.category && <p className="text-xs text-red-600">{errors.category.message}</p>}
            </div>
          ) : (
            <Input label="Category" error={errors.category?.message} {...register('category')} />
          )}
          <Input label="Image URL" placeholder="https://example.com/product.jpg" error={errors.image?.message} {...register('image')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea {...register('description')} rows={3} className="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" placeholder="Describe the product..." />
            {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={closeDelete}
        title="Delete Product"
        size="sm"
        footer={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {deleteMutation.error && (
              <div style={{ background: '#FFF5F5', border: '1px solid #FED7D7', borderRadius: 10, padding: '10px 16px', fontSize: 13.5, color: '#C53030' }}>
                {(deleteMutation.error as Error).message ?? 'Failed to delete product.'}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button variant="outline" onClick={closeDelete}>Cancel</Button>
              <Button variant="danger" loading={deleteMutation.isPending} onClick={confirmDelete}>Delete</Button>
            </div>
          </div>
        }
      >
        <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
          Are you sure you want to delete{' '}
          <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{deleteTarget?.name}</span>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}

function ProductRow({
  product,
  onEdit,
  onDelete,
}: {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}) {
  const stockClass = product.stock === 0 ? 'out' : product.stock <= 10 ? 'low' : ''
  const stockLabel = product.stock === 0 ? 'Out' : product.stock

  return (
    <tr style={{ borderBottom: '1px solid var(--line)', transition: 'background .15s ease', cursor: 'default' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#FAF9FE')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
    >
      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
        <div className="sz-thumb">
          <img src={product.image} alt={product.name} loading="lazy" />
        </div>
      </td>
      <td style={{ padding: '14px 18px', verticalAlign: 'middle', maxWidth: 200 }}>
        <div className="sz-prod-name">{product.name}</div>
        <div className="sz-prod-cat">{product.category}</div>
      </td>
      <td style={{ padding: '14px 18px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
        <div className="sz-price-cell">{formatCurrency(product.price)}</div>
        {product.discountPercentage > 0 && (
          <div className="sz-price-disc">{formatCurrency(product.discountedPrice)}</div>
        )}
      </td>
      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
        {product.discountPercentage > 0 ? (
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: '#FF5A5F', padding: '3px 9px', borderRadius: 100 }}>
            -{product.discountPercentage}%
          </span>
        ) : (
          <span className="sz-muted">—</span>
        )}
      </td>
      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
        <span className={`sz-stock-pill${stockClass ? ` ${stockClass}` : ''}`}>{stockLabel}</span>
      </td>
      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
        <div className="sz-rating-cell">★ {product.rating.toFixed(1)}</div>
      </td>
      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
        <div className="sz-actions-cell">
          <button className="sz-act-edit" onClick={() => onEdit(product)}>
            <Pencil size={13} /> Edit
          </button>
          <button className="sz-act-delete" onClick={() => onDelete(product)}>
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </td>
    </tr>
  )
}
