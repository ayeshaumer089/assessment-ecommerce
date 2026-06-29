import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatOrderStatus } from '@/utils/formatters'

describe('formatCurrency', () => {
  it('formats a whole-dollar amount', () => {
    expect(formatCurrency(0)).toBe('$0.00')
    expect(formatCurrency(10)).toBe('$10.00')
    expect(formatCurrency(1000)).toBe('$1,000.00')
  })

  it('formats fractional amounts to 2 decimal places', () => {
    expect(formatCurrency(9.99)).toBe('$9.99')
    expect(formatCurrency(49.5)).toBe('$49.50')
  })

  it('handles negative values', () => {
    expect(formatCurrency(-5)).toBe('-$5.00')
  })
})

describe('formatDate', () => {
  it('formats an ISO date string into a readable date', () => {
    // 2024-01-15 should become something like "Jan 15, 2024"
    const result = formatDate('2024-01-15T00:00:00.000Z')
    expect(result).toMatch(/Jan(uary)?[\s,]+15/)
    expect(result).toMatch(/2024/)
  })
})

describe('formatOrderStatus', () => {
  it('capitalizes the first letter', () => {
    expect(formatOrderStatus('pending')).toBe('Pending')
    expect(formatOrderStatus('processing')).toBe('Processing')
    expect(formatOrderStatus('shipped')).toBe('Shipped')
    expect(formatOrderStatus('delivered')).toBe('Delivered')
    expect(formatOrderStatus('cancelled')).toBe('Cancelled')
  })
})
