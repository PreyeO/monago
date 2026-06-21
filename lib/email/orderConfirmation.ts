interface OrderItem {
  name: string;
  brand: string;
  quantity: number;
  unit_price: number;
}

interface Props {
  customerName: string;
  orderId: string;
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
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);
}

export function orderConfirmationHtml({ customerName, orderId, items, subtotal, total, shippingAddress }: Props): string {
  const shipping = total - subtotal;
  const shortId = orderId.slice(0, 8).toUpperCase();

  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f1f0ef;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#18181b;">${item.name}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#78716c;">${item.brand} · Qty ${item.quantity}</p>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #f1f0ef;text-align:right;font-size:14px;font-weight:600;color:#18181b;">
        ${fmt(item.unit_price * item.quantity)}
      </td>
    </tr>
  `).join('');

  const addressLine = [
    shippingAddress.line1,
    shippingAddress.line2,
    shippingAddress.city,
    shippingAddress.county,
    shippingAddress.postcode,
    shippingAddress.country,
  ].filter(Boolean).join(', ');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f7f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f4;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Logo -->
        <tr><td style="padding-bottom:32px;text-align:center;">
          <span style="font-size:28px;font-weight:700;color:#18181b;letter-spacing:-0.5px;">Monago</span>
        </td></tr>

        <!-- Hero card -->
        <tr><td style="background:#18181b;border-radius:16px 16px 0 0;padding:32px;text-align:center;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#f59e0b;">Order Confirmed</p>
          <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;">Thank you, ${customerName.split(' ')[0]}!</h1>
          <p style="margin:12px 0 0;font-size:14px;color:#a8a29e;">Your order <strong style="color:#f59e0b;">#${shortId}</strong> has been received and is being prepared.</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:32px;border-radius:0 0 16px 16px;">

          <!-- Items -->
          <p style="margin:0 0 16px;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#78716c;">Your items</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${itemRows}
          </table>

          <!-- Totals -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#78716c;">Subtotal</td>
              <td style="padding:6px 0;font-size:13px;color:#78716c;text-align:right;">${fmt(subtotal)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#78716c;">Shipping</td>
              <td style="padding:6px 0;font-size:13px;color:#78716c;text-align:right;">${shipping === 0 ? 'Free' : fmt(shipping)}</td>
            </tr>
            <tr>
              <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#18181b;border-top:2px solid #f1f0ef;">Total</td>
              <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#18181b;text-align:right;border-top:2px solid #f1f0ef;">${fmt(total)}</td>
            </tr>
          </table>

          <!-- Shipping address -->
          <div style="margin-top:28px;padding:16px;background:#f9f7f4;border-radius:10px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#78716c;">Delivery address</p>
            <p style="margin:0;font-size:13px;color:#44403c;line-height:1.6;">${addressLine}</p>
          </div>

          <!-- CTA -->
          <div style="margin-top:28px;text-align:center;">
            <a href="https://monago.co.uk" style="display:inline-block;background:#f59e0b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;">
              Continue Shopping
            </a>
          </div>

          <!-- Footer note -->
          <p style="margin:28px 0 0;font-size:12px;color:#a8a29e;text-align:center;line-height:1.6;">
            Questions? Visit <a href="https://monago.co.uk/contact" style="color:#f59e0b;">monago.co.uk/contact</a><br>
            Monago · Premium Wellness · United Kingdom
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
