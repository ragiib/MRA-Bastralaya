/**
 * Utility functions for Indian phone number normalization and WhatsApp URL generation.
 */

/**
 * Ensures an Indian phone number is stored with the +91 country code.
 * If already formatted with a country code (starting with +), leaves it intact.
 * If 10 digits (e.g. 9876543210), prefixes with +91.
 * If 11 digits starting with 0 (e.g. 09876543210), replaces leading 0 with +91.
 * If 12 digits starting with 91 (e.g. 919876543210), prefixes with +.
 */
export function formatIndianPhoneNumber(phone: string): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('+')) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, '');

  if (digits.length === 10) {
    return `+91 ${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('0')) {
    return `+91 ${digits.slice(1)}`;
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2)}`;
  }

  // If already longer than 6 digits, add +91 prefix
  if (digits.length >= 7) {
    return `+91 ${digits}`;
  }

  return trimmed;
}

/**
 * Returns digits-only phone number formatted with country code (91) for wa.me links.
 * Strips all non-digit characters and guarantees a leading 91.
 */
export function getWhatsAppPhone(rawPhone: string | null | undefined): string {
  if (!rawPhone) return '';
  let digits = rawPhone.replace(/\D/g, '');

  if (!digits) return '';

  // 10 digits (e.g. 9876543210) -> prepend 91
  if (digits.length === 10) {
    return `91${digits}`;
  }

  // 11 digits starting with 0 (e.g. 09876543210) -> replace 0 with 91
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }

  // Already 12 digits starting with 91 -> return as is
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }

  // If already starts with 91, return digits
  if (digits.startsWith('91')) {
    return digits;
  }

  // Fallback: if 10 or more digits, prepend 91
  return digits.length >= 10 ? `91${digits}` : digits;
}
