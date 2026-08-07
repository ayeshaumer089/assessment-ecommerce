import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import { useProducts, useCategories, useSearchProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useDebounce } from '@/hooks'
import { formatCurrency } from '@/utils'
import {
  AdminButton,
  AdminEmptyState,
  AdminField,
  AdminInput,
  AdminModal,
  AdminModalBody,
  AdminModalFooter,
  AdminModalHeader,
  AdminPagination,
  AdminTable,
  AdminTableRow,
  AdminTextarea,
  SearchBar,
  Select,
  TablePanel,
} from '@/common/components'
import type { AdminTableColumn } from '@/common/components'
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

const COLUMNS: AdminTableColumn[] = [
  { label: 'Thumbnail' },
  { label: 'Product' },
  { label: 'Price' },
  { label: 'Discount' },
  { label: 'Stock' },
  { label: 'Rating' },
  { label: 'Actions', align: 'right' },
]

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

  const categoryOptions = categories.map((c) => ({ value: c.slug, label: c.name }))

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
        <SearchBar
          value={search}
          onChange={(value) => { setSearch(value); setPage(1) }}
          placeholder="Search products..."
        />
      </div>

      <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 12 }}>{total} products</div>

      <TablePanel>
        {isLoading ? (
          <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ height: 56, background: '#F8F7FB', borderRadius: 10 }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <AdminEmptyState icon={<Package size={28} />}>
            No products found
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ display: 'block', marginTop: 8, color: 'var(--violet)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}
              >
                Clear search
              </button>
            )}
          </AdminEmptyState>
        ) : (
          <AdminTable columns={COLUMNS}>
            {products.map((product) => (
              <ProductRow key={product.id} product={product} onEdit={openEdit} onDelete={openDelete} />
            ))}
          </AdminTable>
        )}
      </TablePanel>

      {!isLoading && totalPages > 1 && (
        <AdminPagination page={page} totalPages={totalPages} onPage={setPage} />
      )}

      {/* ── Add / Edit Modal ── */}
      <AdminModal open={formOpen} onClose={closeForm} labelledBy="adm-form-title">
        <AdminModalHeader variant="accent" onClose={closeForm}>
          <h2 id="adm-form-title">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
        </AdminModalHeader>

        <AdminModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <AdminField label="Name" error={errors.name?.message}>
              <AdminInput invalid={!!errors.name} {...register('name')} />
            </AdminField>

            <div className="adm-row">
              <AdminField label="Price" error={errors.price?.message}>
                <AdminInput invalid={!!errors.price} type="number" step="0.01" {...register('price')} />
              </AdminField>
              <AdminField label="Stock" error={errors.stock?.message}>
                <AdminInput invalid={!!errors.stock} type="number" {...register('stock')} />
              </AdminField>
            </div>

            <AdminField label="Category" error={errors.category?.message}>
              {categories.length > 0 ? (
                <Select
                  className={`adm-select${errors.category ? ' adm-input--err' : ''}`}
                  placeholder="Select a category"
                  options={categoryOptions}
                  {...register('category')}
                />
              ) : (
                <AdminInput invalid={!!errors.category} {...register('category')} />
              )}
            </AdminField>

            <AdminField label="Image URL" error={errors.image?.message}>
              <AdminInput
                invalid={!!errors.image}
                placeholder="https://example.com/product.jpg"
                {...register('image')}
              />
            </AdminField>

            <AdminField label="Description" error={errors.description?.message} style={{ marginBottom: 0 }}>
              <AdminTextarea
                invalid={!!errors.description}
                placeholder="Describe the product..."
                {...register('description')}
              />
            </AdminField>
          </form>
        </AdminModalBody>

        <AdminModalFooter error={mutationError && (mutationError.message ?? 'Something went wrong.')}>
          <AdminButton variant="cancel" onClick={closeForm}>Cancel</AdminButton>
          <AdminButton
            variant="primary"
            disabled={mutationPending}
            onClick={handleSubmit(onSubmit)}
          >
            {mutationPending ? 'Saving…' : (editingProduct ? 'Save Changes' : 'Add Product')}
          </AdminButton>
        </AdminModalFooter>
      </AdminModal>

      {/* ── Delete Modal ── */}
      <AdminModal open={!!deleteTarget} onClose={closeDelete} labelledBy="adm-del-title" size="sm">
        <AdminModalHeader variant="delete" onClose={closeDelete}>
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
        </AdminModalHeader>

        <AdminModalBody variant="delete">
          <p>
            Are you sure you want to delete{' '}
            <strong>{deleteTarget?.name}</strong>?{' '}
            This action cannot be undone.
          </p>
        </AdminModalBody>

        <AdminModalFooter
          bordered
          error={
            deleteMutation.error &&
            ((deleteMutation.error as Error).message ?? 'Failed to delete product.')
          }
        >
          <AdminButton variant="cancel" onClick={closeDelete}>Cancel</AdminButton>
          <AdminButton
            variant="danger"
            disabled={deleteMutation.isPending}
            onClick={confirmDelete}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </AdminButton>
        </AdminModalFooter>
      </AdminModal>
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
    <AdminTableRow>
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
    </AdminTableRow>
  )
}
