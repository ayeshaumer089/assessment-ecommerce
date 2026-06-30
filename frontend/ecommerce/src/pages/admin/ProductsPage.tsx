import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, Pencil, Trash2, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { useProducts, useCategories, useSearchProducts } from '@/hooks/useProducts'
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useAdminProducts'
import { useDebounce } from '@/hooks/useDebounce'
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

  // Scroll lock while any modal is open
  useEffect(() => {
    const anyOpen = formOpen || !!deleteTarget
    document.body.style.overflow = anyOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [formOpen, deleteTarget])

  // Close on Escape
  useEffect(() => {
    if (!formOpen && !deleteTarget) return
    const handle = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (formOpen) closeForm()
      else if (deleteTarget) closeDelete()
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formOpen, deleteTarget])

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

      {/* ── Add / Edit Modal ── */}
      {formOpen && createPortal(
        <div
          className="adm-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeForm() }}
        >
          <div className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="adm-form-title">

            <div className="adm-modal-header adm-modal-header--accent">
              <h2 id="adm-form-title">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button className="adm-close-btn" onClick={closeForm} aria-label="Close">✕</button>
            </div>

            <div className="adm-modal-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="adm-field">
                  <label>Name</label>
                  <input
                    className={`adm-input${errors.name ? ' adm-input--err' : ''}`}
                    {...register('name')}
                  />
                  {errors.name && <p className="adm-field-err">{errors.name.message}</p>}
                </div>

                <div className="adm-row">
                  <div className="adm-field">
                    <label>Price</label>
                    <input
                      className={`adm-input${errors.price ? ' adm-input--err' : ''}`}
                      type="number"
                      step="0.01"
                      {...register('price')}
                    />
                    {errors.price && <p className="adm-field-err">{errors.price.message}</p>}
                  </div>
                  <div className="adm-field">
                    <label>Stock</label>
                    <input
                      className={`adm-input${errors.stock ? ' adm-input--err' : ''}`}
                      type="number"
                      {...register('stock')}
                    />
                    {errors.stock && <p className="adm-field-err">{errors.stock.message}</p>}
                  </div>
                </div>

                <div className="adm-field">
                  <label>Category</label>
                  {categories.length > 0 ? (
                    <>
                      <select
                        className={`adm-select${errors.category ? ' adm-input--err' : ''}`}
                        {...register('category')}
                      >
                        <option value="">Select a category</option>
                        {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                      </select>
                      {errors.category && <p className="adm-field-err">{errors.category.message}</p>}
                    </>
                  ) : (
                    <>
                      <input
                        className={`adm-input${errors.category ? ' adm-input--err' : ''}`}
                        {...register('category')}
                      />
                      {errors.category && <p className="adm-field-err">{errors.category.message}</p>}
                    </>
                  )}
                </div>

                <div className="adm-field">
                  <label>Image URL</label>
                  <input
                    className={`adm-input${errors.image ? ' adm-input--err' : ''}`}
                    placeholder="https://example.com/product.jpg"
                    {...register('image')}
                  />
                  {errors.image && <p className="adm-field-err">{errors.image.message}</p>}
                </div>

                <div className="adm-field" style={{ marginBottom: 0 }}>
                  <label>Description</label>
                  <textarea
                    className={`adm-textarea${errors.description ? ' adm-input--err' : ''}`}
                    placeholder="Describe the product..."
                    {...register('description')}
                  />
                  {errors.description && <p className="adm-field-err">{errors.description.message}</p>}
                </div>
              </form>
            </div>

            <div className="adm-modal-footer">
              {mutationError && (
                <div className="adm-err-banner">{mutationError.message ?? 'Something went wrong.'}</div>
              )}
              <div className="adm-footer-btns">
                <button className="adm-btn adm-btn-cancel" onClick={closeForm}>Cancel</button>
                <button
                  className="adm-btn adm-btn-primary"
                  disabled={mutationPending}
                  onClick={handleSubmit(onSubmit)}
                >
                  {mutationPending ? 'Saving…' : (editingProduct ? 'Save Changes' : 'Add Product')}
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body,
      )}

      {/* ── Delete Modal ── */}
      {!!deleteTarget && createPortal(
        <div
          className="adm-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeDelete() }}
        >
          <div className="adm-modal adm-modal--sm" role="dialog" aria-modal="true" aria-labelledby="adm-del-title">

            <div className="adm-modal-header adm-modal-header--delete">
              <div className="adm-del-header-left">
                <div className="adm-del-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#e5484d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="21" height="21">
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </div>
                <h2 id="adm-del-title">Delete Product</h2>
              </div>
              <button className="adm-close-btn" onClick={closeDelete} aria-label="Close">✕</button>
            </div>

            <div className="adm-modal-body adm-modal-body--delete">
              <p>
                Are you sure you want to delete{' '}
                <strong>{deleteTarget.name}</strong>?{' '}
                This action cannot be undone.
              </p>
            </div>

            <div className="adm-modal-footer adm-modal-footer--bordered">
              {deleteMutation.error && (
                <div className="adm-err-banner">
                  {(deleteMutation.error as Error).message ?? 'Failed to delete product.'}
                </div>
              )}
              <div className="adm-footer-btns">
                <button className="adm-btn adm-btn-cancel" onClick={closeDelete}>Cancel</button>
                <button
                  className="adm-btn adm-btn-danger"
                  disabled={deleteMutation.isPending}
                  onClick={confirmDelete}
                >
                  {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body,
      )}
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
