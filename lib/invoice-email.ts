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
        <td style="text-align: left;">${item.product.name}</td>
        <td style="text-align: right;">${formatCurrency(item.price)}</td>
        <td style="text-align: right;">${item.quantity}</td>
        <td style="text-align: right; font-weight: 600; color: #111827;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `
  ).join('')

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice ${invoiceNumber}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: 'Inter', Arial, 'Helvetica Neue', sans-serif; 
        background: #f7f7fb; 
        padding: 20px; 
        color: #0f172a; 
        line-height: 1.6;
      }
      .email-wrapper { 
        max-width: 700px; 
        margin: 0 auto; 
        background: #fff; 
      }
      .card { 
        background: #fff; 
        border-radius: 16px; 
        padding: 40px; 
        border: 1px solid #e2e8f0; 
      }
      .header { 
        display: table; 
        width: 100%; 
        margin-bottom: 32px; 
        border-bottom: 2px solid #e2e8f0; 
        padding-bottom: 24px;
      }
      .header-left { 
        display: table-cell; 
        vertical-align: top; 
        width: 40%;
      }
      .header-right { 
        display: table-cell; 
        vertical-align: top; 
        text-align: right; 
        width: 60%;
      }
      .logo-container { 
        margin-bottom: 16px; 
      }
      .logo { 
        display: inline-block; 
        max-width: 180px; 
        height: auto; 
      }
      .logo img { 
        width: 100%; 
        height: auto; 
        display: block; 
        object-fit: contain; 
      }
      .company-info { 
        font-size: 13px; 
        color: #475569; 
        line-height: 1.8; 
        text-align: left;
      }
      .company-info div { 
        margin-bottom: 4px; 
      }
      .invoice-title { 
        font-size: 32px; 
        font-weight: 700; 
        color: #111827; 
        margin-bottom: 8px; 
        letter-spacing: 1px;
      }
      .invoice-label { 
        text-transform: uppercase; 
        letter-spacing: 0.3em; 
        font-size: 11px; 
        color: #94a3b8; 
        margin-bottom: 4px; 
      }
      .invoice-details { 
        font-size: 14px; 
        color: #475569; 
        line-height: 1.8; 
      }
      .invoice-details strong { 
        color: #111827; 
        font-weight: 600; 
      }
      .section-title { 
        text-transform: uppercase; 
        letter-spacing: 0.3em; 
        font-size: 11px; 
        color: #94a3b8; 
        margin-bottom: 12px; 
        font-weight: 600;
      }
      .customer-section { 
        display: table; 
        width: 100%; 
        margin-top: 32px; 
        margin-bottom: 32px;
      }
      .customer-left { 
        display: table-cell; 
        vertical-align: top; 
        width: 50%; 
        padding-right: 20px;
      }
      .customer-right { 
        display: table-cell; 
        vertical-align: top; 
        width: 50%; 
        padding-left: 20px;
      }
      .customer-name { 
        font-size: 18px; 
        font-weight: 600; 
        color: #111827; 
        margin-bottom: 8px; 
      }
      .customer-details { 
        font-size: 14px; 
        color: #475569; 
        line-height: 1.8; 
      }
      table { 
        width: 100%; 
        border-collapse: collapse; 
        margin-top: 24px; 
        margin-bottom: 24px;
      }
      th { 
        background: #111827; 
        color: #fff; 
        padding: 14px 12px; 
        font-size: 11px; 
        letter-spacing: 0.2em; 
        text-align: left; 
        text-transform: uppercase; 
        font-weight: 600;
      }
      th:first-child { padding-left: 16px; }
      th:last-child { text-align: right; padding-right: 16px; }
      td { 
        padding: 14px 12px; 
        border-bottom: 1px solid #e2e8f0; 
        font-size: 14px; 
        color: #475569; 
        vertical-align: top;
      }
      td:first-child { padding-left: 16px; }
      td:last-child { text-align: right; padding-right: 16px; font-weight: 600; color: #111827; }
      tbody tr:last-child td { border-bottom: none; }
      .summary { 
        margin-top: 24px; 
        border-radius: 12px; 
        border: 1px solid #e2e8f0; 
        padding: 20px; 
        background: #f8fafc; 
      }
      .summary-row { 
        display: table; 
        width: 100%; 
        margin-bottom: 10px; 
        font-size: 14px; 
        color: #475569; 
      }
      .summary-row:last-child { 
        margin-bottom: 0; 
      }
      .summary-label { 
        display: table-cell; 
        width: 70%; 
        text-align: left; 
      }
      .summary-value { 
        display: table-cell; 
        width: 30%; 
        text-align: right; 
        font-weight: 500; 
        color: #111827;
      }
      .total { 
        font-size: 18px; 
        font-weight: 700; 
        color: #111827; 
        padding-top: 12px; 
        border-top: 2px solid #e2e8f0; 
        margin-top: 8px;
      }
      .total .summary-label,
      .total .summary-value { 
        padding-top: 12px; 
      }
      .footer { 
        margin-top: 40px; 
        padding-top: 24px; 
        border-top: 1px solid #e2e8f0; 
        text-align: center; 
        font-size: 13px; 
        color: #94a3b8; 
      }
      .footer a { 
        color: #111827; 
        text-decoration: none; 
        font-weight: 600; 
      }
      @media only screen and (max-width: 600px) {
        .card { padding: 24px; }
        .header { display: block; }
        .header-left, .header-right { display: block; width: 100%; text-align: left !important; }
        .header-right { margin-top: 20px; }
        .customer-section { display: block; }
        .customer-left, .customer-right { display: block; width: 100%; padding: 0; }
        .customer-right { margin-top: 24px; }
        table { font-size: 12px; }
        th, td { padding: 10px 8px; }
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="card">
        <div class="header">
          <div class="header-left">
            <div class="logo-container">
              <div class="logo">
                <img src="${COMPANY_INFO.logo}" alt="Hars Jewellery" style="width: 100%; height: auto; display: block;" />
              </div>
            </div>
            <div class="company-info">
              <div><strong>${COMPANY_INFO.name}</strong></div>
              <div>${COMPANY_INFO.address}</div>
              <div>GSTIN/UIN: ${COMPANY_INFO.gst}</div>
              <div>${COMPANY_INFO.state}</div>
              <div>Phone: ${COMPANY_INFO.contact}</div>
              <div>Email: ${COMPANY_INFO.email}</div>
            </div>
          </div>
          <div class="header-right">
            <div class="invoice-label">Invoice</div>
            <div class="invoice-title">${invoiceNumber}</div>
            <div class="invoice-details" style="margin-top: 12px;">
              <div><strong>Date:</strong> ${invoiceDate}</div>
            </div>
          </div>
        </div>

        <div class="customer-section">
          <div class="customer-left">
            <p class="section-title">Bill To</p>
            <div class="customer-name">${order.customerName || 'Customer'}</div>
            <div class="customer-details">
              ${order.phone ? `<div>Phone: ${order.phone}</div>` : ''}
              ${customerAddress ? `<div style="margin-top: 8px;">${customerAddress}</div>` : ''}
            </div>
          </div>
          <div class="customer-right">
            <p class="section-title">Payment Details</p>
            <div class="customer-details">
              <div><strong>Payment Status:</strong> Paid</div>
              <div style="margin-top: 8px;"><strong>Payment Method:</strong> Online Payment</div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Product</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Qty</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <div class="summary-label">Sub-total</div>
            <div class="summary-value">${formatCurrency(subtotal)}</div>
          </div>
          <div class="summary-row">
            <div class="summary-label">Making Cost</div>
            <div class="summary-value">${formatCurrency(makingCost)}</div>
          </div>
          <div class="summary-row">
            <div class="summary-label">Shipping Cost</div>
            <div class="summary-value">${formatCurrency(shippingCost)}</div>
          </div>
          <div class="summary-row">
            <div class="summary-label">Tax (3%)</div>
            <div class="summary-value">${formatCurrency(tax)}</div>
          </div>
          <div class="summary-row total">
            <div class="summary-label">Total</div>
            <div class="summary-value">${formatCurrency(order.total)}</div>
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


