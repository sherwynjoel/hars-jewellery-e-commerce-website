import { Prisma } from '@prisma/client'

const COMPANY_INFO = {
  name: 'Hars Jewellery',
  address: '323 A3 Kumaran Ntr Complex 1st Floor, Raja Street, Coimbatore, Tamil Nadu - 641001, India',
  gst: '33AAGFH5102E1Z1',
  state: 'Tamil Nadu (Code: 33)',
  contact: '+91 98765 43210',
  email: 'harsjewellery2005@gmail.com',
  website: 'https://harsjewellery.in',
  logo: 'https://harsjewellery.in/hars-logo.jpg'
}

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: true
      }
    }
  }
}>

export function buildInvoiceEmail(order: OrderWithItems) {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = order.items.reduce(
    (sum, item) => sum + ((item.product?.shippingCost || 0) * item.quantity),
    0
  )
  const tax = Math.round(subtotal * 0.03 * 100) / 100
  const makingCost = Math.max(0, Math.round((order.total - (subtotal + shippingCost + tax)) * 100) / 100)

  const invoiceNumber = `#${order.id.slice(-8).toUpperCase()}`
  const invoiceDate = new Date(order.createdAt).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const customerAddress = [
    order.addressLine1,
    order.addressLine2,
    [order.city, order.state, order.postalCode].filter(Boolean).join(', ')
  ]
    .filter(Boolean)
    .join('<br />')

  const itemsRows = order.items.map(
    (item) => `
      <tr>
        <td>${item.product.name}</td>
        <td>${formatCurrency(item.price)}</td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `
  ).join('')

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Invoice ${invoiceNumber}</title>
    <style>
      body { font-family: 'Inter', Arial, sans-serif; background: #f7f7fb; padding: 24px; color: #0f172a; }
      .card { max-width: 640px; margin: 0 auto; background: #fff; border-radius: 24px; padding: 40px; border: 1px solid #e2e8f0; }
      .header { display: flex; justify-content: space-between; gap: 24px; }
      .logo { width: 72px; height: 72px; border-radius: 999px; border: 1px solid #e5e7eb; display:flex; align-items:center; justify-content:center; overflow:hidden; }
      .logo img { width: 60px; height: 60px; object-fit: contain; }
      .section-title { text-transform: uppercase; letter-spacing: 0.4em; font-size: 11px; color: #94a3b8; margin-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; margin-top: 24px; }
      th { background: #111827; color: #fff; padding: 12px; font-size: 12px; letter-spacing: 0.3em; text-align: left; text-transform: uppercase; }
      td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #475569; }
      .summary { margin-top: 24px; border-radius: 18px; border: 1px solid #e2e8f0; padding: 16px; background: #f8fafc; }
      .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #475569; }
      .summary-row:last-child { margin-bottom: 0; }
      .total { font-size: 18px; font-weight: 700; color: #111827; }
      .footer { margin-top: 32px; text-align: center; font-size: 13px; color: #94a3b8; }
      .footer a { color: #111827; text-decoration: none; font-weight: 600; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <div class="logo">
          <img src="${COMPANY_INFO.logo}" alt="Hars Jewellery logo" />
        </div>
        <div style="text-align:right">
          <p class="section-title" style="margin:0">Invoice</p>
          <p style="font-size:24px;font-weight:600;color:#111827;margin:4px 0">${COMPANY_INFO.name}</p>
          <div style="font-size:14px;color:#475569;line-height:1.6">
            <div>${COMPANY_INFO.address}</div>
            <div>GSTIN/UIN: ${COMPANY_INFO.gst}</div>
            <div>${COMPANY_INFO.state}</div>
            <div>${COMPANY_INFO.contact}</div>
            <div>${COMPANY_INFO.email}</div>
          </div>
        </div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:24px;margin-top:32px">
        <div style="flex:1;min-width:220px">
          <p class="section-title">Invoice To</p>
          <p style="font-size:18px;font-weight:600;color:#111827;margin:0">${order.customerName || 'Customer'}</p>
          <p style="color:#475569;margin:4px 0">${order.phone || ''}</p>
          <p style="color:#64748b;margin:0">${customerAddress || '—'}</p>
        </div>
        <div style="flex:1;min-width:220px;text-align:right">
          <p class="section-title">Details</p>
          <p style="margin:0;color:#475569">Invoice ID: <strong>${invoiceNumber}</strong></p>
          <p style="margin:4px 0 0;color:#475569">Date: <strong>${invoiceDate}</strong></p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-row">
          <span>Sub-total</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Making Cost</span>
          <span>${formatCurrency(makingCost)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping Cost</span>
          <span>${formatCurrency(shippingCost)}</span>
        </div>
        <div class="summary-row">
          <span>Tax (3%)</span>
          <span>${formatCurrency(tax)}</span>
        </div>
        <div class="summary-row total" style="margin-top:8px">
          <span>Total</span>
          <span>${formatCurrency(order.total)}</span>
        </div>
      </div>

      <div class="footer">
        Thank you for your business!<br/>
        <a href="${COMPANY_INFO.website}">${COMPANY_INFO.website}</a>
      </div>
    </div>
  </body>
  </html>
  `
}


