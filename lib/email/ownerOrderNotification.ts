interface OrderItem {
  amway_code: string;
  name: string;
  brand: string;
  quantity: number;
  unit_price: number;
}

interface Props {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    county?: string;
    postcode: string;
    country: string;
  };
  adminUrl: string;
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);
}

// Customer-entered values go into this email, so escape them.
function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function ownerOrderSubject(orderId: string, total: number) {
  return `New order #${orderId.slice(0, 8).toUpperCase()} — ${fmt(total)}`;
}

export function ownerOrderNotificationHtml({
  orderId, customerName, customerEmail, items, subtotal, total, shippingAddress, adminUrl,
}: Props): string {
  const shortId = orderId.slice(0, 8).toUpperCase();
  const shipping = total - subtotal;

  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;font-size:14px;color:#18181b;">
        <strong>${esc(item.name)}</strong><br>
        <span style="font-size:12px;color:#78716c;">${esc(item.brand)}</span>
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;font-family:monospace;font-size:14px;">
        <a href="https://www.amway.co.uk/p/${encodeURIComponent(item.amway_code)}" style="color:#2563eb;">${esc(item.amway_code)}</a>
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;font-size:16px;font-weight:700;">${item.quantity}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;font-size:14px;">${fmt(item.unit_price * item.quantity)}</td>
    </tr>
  `).join('');

  const address = [
    shippingAddress.line1,
    shippingAddress.line2,
    shippingAddress.city,
    shippingAddress.county,
    shippingAddress.postcode,
    shippingAddress.country,
  ].filter(Boolean).map(esc).join('<br>');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 12px;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;">
    <tr><td style="padding:24px;">
      <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#16a34a;">New paid order</p>
      <h1 style="margin:6px 0 0;font-size:22px;color:#18181b;">#${shortId} · ${fmt(total)}</h1>
      <p style="margin:8px 0 0;font-size:14px;color:#52525b;">Place these items on Amway. If anything is out of stock, refund it from the order page and mark it out of stock in admin.</p>

      <h2 style="margin:24px 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#71717a;">Items to order</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <th align="left" style="padding:6px 8px;font-size:11px;color:#a1a1aa;text-transform:uppercase;">Product</th>
          <th align="left" style="padding:6px 8px;font-size:11px;color:#a1a1aa;text-transform:uppercase;">Amway code</th>
          <th style="padding:6px 8px;font-size:11px;color:#a1a1aa;text-transform:uppercase;">Qty</th>
          <th align="right" style="padding:6px 8px;font-size:11px;color:#a1a1aa;text-transform:uppercase;">Paid</th>
        </tr>
        ${itemRows}
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;font-size:14px;color:#52525b;">
        <tr><td style="padding:3px 8px;">Subtotal</td><td align="right" style="padding:3px 8px;">${fmt(subtotal)}</td></tr>
        <tr><td style="padding:3px 8px;">Shipping charged</td><td align="right" style="padding:3px 8px;">${shipping === 0 ? 'Free' : fmt(shipping)}</td></tr>
        <tr><td style="padding:6px 8px;font-weight:700;color:#18181b;">Total paid</td><td align="right" style="padding:6px 8px;font-weight:700;color:#18181b;">${fmt(total)}</td></tr>
      </table>

      <h2 style="margin:24px 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#71717a;">Ship to</h2>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#18181b;">
        <strong>${esc(customerName)}</strong><br>${address}<br>
        <a href="mailto:${esc(customerEmail)}" style="color:#2563eb;">${esc(customerEmail)}</a>
      </p>

      <div style="margin-top:28px;">
        <a href="${esc(adminUrl)}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:8px;">Open order in admin</a>
      </div>
    </td></tr>
  </table>
</body>
</html>`;
}
