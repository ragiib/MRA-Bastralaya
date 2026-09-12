import { WhatsAppOrderPayload } from '@/types/order';

/**
 * Configurable Store WhatsApp Phone Number.
 * You can set your real WhatsApp number directly here in code OR in .env.local:
 * (Format: Country code + phone digits without leading + or spaces, e.g. '919876543210')
 */
export const STORE_WHATSAPP_NUMBER = '919830000000';

/**
 * Retrieves the owner's WhatsApp phone number.
 * - Reads NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER from .env.local if configured with a real number.
 * - Otherwise falls back to STORE_WHATSAPP_NUMBER above.
 * - Strips all non-digit characters to ensure clean international format for wa.me.
 */
export function getOwnerWhatsAppNumber(): string {
  const envNumber = process.env.NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER?.trim();

  // If a real custom number is defined in .env.local (different from the default placeholder)
  if (envNumber && envNumber !== '919830000000') {
    const clean = envNumber.replace(/\D/g, '');
    if (clean) return clean;
  }

  // Use the directly configured number from code
  const cleanFallback = (STORE_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  if (cleanFallback) return cleanFallback;

  return '919830000000';
}

/**
 * Formats a clean, highly readable WhatsApp order message with line breaks.
 */
export function formatWhatsAppOrderMessage(payload: WhatsAppOrderPayload): string {
  const lines: string[] = [];

  lines.push('New Order Request');
  lines.push(`Name: ${payload.customerName.trim()}`);
  lines.push(`Phone: ${payload.customerPhone.trim()}`);
  lines.push(`Address: ${payload.customerAddress.trim()}`);
  lines.push('');
  lines.push('Items:');

  for (const item of payload.items) {
    const lineTotal = item.price * item.quantity;
    lines.push(`- ${item.name} x${item.quantity} - ₹${lineTotal.toLocaleString('en-IN')}`);
  }

  lines.push('');
  lines.push(`Total: ₹${payload.total.toLocaleString('en-IN')}`);

  return lines.join('\n');
}

/**
 * Generates the full, URL-encoded wa.me link for WhatsApp order submission.
 */
export function generateWhatsAppOrderUrl(payload: WhatsAppOrderPayload): string {
  const phone = payload.ownerPhone
    ? payload.ownerPhone.replace(/\D/g, '')
    : getOwnerWhatsAppNumber();

  const message = formatWhatsAppOrderMessage(payload);
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${phone}?text=${encodedMessage}`;
}
