import { SafeUser, User } from '@/types/auth';

export interface StructuredAddressInput {
  address_line1?: string | null;
  address_line2?: string | null;
  landmark?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  address_type?: string | null;
}

/**
 * Composes a full formatted address string from structured fields:
 * "[address_line1], [address_line2], Landmark: [landmark], [city], [state] - [pincode]"
 * Omits the "Landmark:" segment entirely if landmark is empty.
 * Falls back to legacy unstructured address if structured fields are not present.
 */
export function formatStructuredAddress(
  addr?: StructuredAddressInput | User | SafeUser | null,
  fallback?: string | null
): string {
  if (!addr) return fallback?.trim() || '';

  const line1 = addr.address_line1?.trim();
  const line2 = addr.address_line2?.trim();
  const landmark = addr.landmark?.trim();
  const city = addr.city?.trim();
  const state = addr.state?.trim();
  const pincode = addr.pincode?.trim();

  // If none of the structured fields are present, fallback to legacy address
  if (!line1 && !line2 && !city && !state && !pincode) {
    const legacy = 'address' in addr && typeof addr.address === 'string' ? addr.address : fallback;
    return legacy?.trim() || '';
  }

  const parts: string[] = [];
  if (line1) parts.push(line1);
  if (line2) parts.push(line2);
  if (landmark) parts.push(`Landmark: ${landmark}`);

  const cityStateParts: string[] = [];
  if (city) cityStateParts.push(city);
  if (state) cityStateParts.push(state);
  const cityState = cityStateParts.join(', ');

  if (cityState && pincode) {
    parts.push(`${cityState} - ${pincode}`);
  } else if (cityState) {
    parts.push(cityState);
  } else if (pincode) {
    parts.push(pincode);
  }

  return parts.join(', ');
}

/**
 * Validates whether a pincode is a valid 6-digit Indian postal code.
 */
export function isValidPincode(pincode?: string | null): boolean {
  if (!pincode) return false;
  return /^\d{6}$/.test(pincode.trim());
}

/**
 * Checks if a user's delivery address is complete with all required structured fields.
 */
export function hasCompleteAddress(user?: User | SafeUser | null): boolean {
  if (!user) return false;

  const hasStructured = Boolean(
    user.address_line1?.trim() &&
    user.address_line2?.trim() &&
    user.landmark?.trim() &&
    user.city?.trim() &&
    user.state?.trim() &&
    isValidPincode(user.pincode)
  );

  return hasStructured;
}

/**
 * Checks if a user's contact information is complete (Name + Phone).
 */
export function hasCompleteContact(user?: User | SafeUser | null): boolean {
  if (!user) return false;
  const hasName = Boolean(user.name && user.name.trim().length >= 2);
  const hasPhone = Boolean(user.phone && user.phone.trim().replace(/\D/g, '').length >= 7);
  return hasName && hasPhone;
}

/**
 * Checks if a user's entire profile is complete.
 */
export function isProfileComplete(user?: User | SafeUser | null): boolean {
  if (!user) return false;
  return hasCompleteContact(user) && hasCompleteAddress(user);
}

/**
 * Determines current completion step:
 * 1 = Account Created (needs contact info)
 * 2 = Contact Info pending (Name or Phone missing)
 * 3 = Delivery Address pending (Structured address missing or pincode invalid)
 * 4 = Complete (All required profile fields filled)
 */
export function getProfileStep(user?: User | SafeUser | null): 1 | 2 | 3 | 4 {
  if (!user) return 1;
  if (!hasCompleteContact(user)) return 2;
  if (!hasCompleteAddress(user)) return 3;
  return 4;
}
