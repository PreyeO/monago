// UK-only delivery: shared postcode check for the checkout form and the order API.
// Covers all standard UK formats (e.g. SW1A 1AA, M1 1AE, B33 8TH, CR2 6XH, DN55 1PT, BT1 5GS) and GIR 0AA.
const UK_POSTCODE = /^(GIR ?0AA|[A-PR-UWYZ][A-HK-Y]?\d[A-Z\d]? ?\d[ABD-HJLNP-UW-Z]{2})$/i;

export function isUkPostcode(value: string): boolean {
  return UK_POSTCODE.test(value.trim().replace(/\s+/g, ' '));
}

/** "sw1a1aa" → "SW1A 1AA" */
export function formatUkPostcode(value: string): string {
  const compact = value.replace(/\s+/g, '').toUpperCase();
  return compact.length > 3 ? `${compact.slice(0, -3)} ${compact.slice(-3)}` : compact;
}
