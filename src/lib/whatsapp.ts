import { WhatsAppOrderPayload } from '@/types/order';

/**
 * Retrieves the owner's WhatsApp phone number.
 * - Reads NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER from environment variables.
 * - Strips all non-digit characters to ensure clean international format for wa.me.
 * - Throws a descriptive configuration error if the environment variable is not defined.
 */
export function getOwnerWhatsAppNumber(): string {
  const envNumber = process.env.NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER?.trim();

  if (envNumber) {
    const clean = envNumber.replace(/\D/g, '');
    if (clean.length >= 10) {
      return clean;
    }
  }

  throw new Error(
    '[WHATSAPP CONFIG ERROR] Store WhatsApp phone number is not configured. ' +
    'Please set NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER in your environment variables.'
  );
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

/**
 * Generates direct wa.me link for manual account recovery assistance via WhatsApp.
 */
export function generateWhatsAppAccountRecoveryUrl(phone: string): string {
  const storePhone = getOwnerWhatsAppNumber();
  const text = `Hello MRA Bastralaya Support, I need assistance recovering my account associated with registered phone number: ${phone}.`;
  return `https://wa.me/${storePhone}?text=${encodeURIComponent(text)}`;
}
