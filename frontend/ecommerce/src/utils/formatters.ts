export const formatCurrency = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(date))

export const formatOrderStatus = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1)
