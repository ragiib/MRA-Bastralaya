'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  MessageSquareText,
  Home,
  Briefcase,
  Building,
  Navigation,
  CheckCircle2,
} from 'lucide-react';
import { INDIAN_STATES } from '@/data/indianStates';
import { isValidPincode } from '@/lib/utils/address';
import { isValidIndianPhone, normalizeIndianPhone } from '@/lib/utils/phone';
import { useShop } from '@/context/ShopContext';
import FormErrorBox from '@/components/ui/FormErrorBox';
import FieldError from '@/components/ui/FieldError';
import { focusAndScrollTo } from '@/lib/utils/scrollHelper';

function CompleteProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/account';
  const { refreshUser } = useShop();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressType, setAddressType] = useState<'Home' | 'Work'>('Home');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('West Bengal');
  const [pincode, setPincode] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    landmark?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }>({});

  const clearFieldError = (field: keyof typeof fieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (error) setError('');
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`/api/account/profile?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!res.ok) {
          if (res.status === 401) {
            const returnTarget =
              callbackUrl && callbackUrl !== '/account'
                ? `/account/complete-profile?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : '/account/complete-profile';
            window.location.href = `/login?callbackUrl=${encodeURIComponent(returnTarget)}`;
            return;
          }
          setError('Failed to load your profile. Please check your connection.');
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        if (data.user) {
          const isEmailVerified = Boolean(data.user.emailVerified ?? data.user.email_verified);
          if (!isEmailVerified && data.user.role !== 'ADMIN') {
            const safeTarget =
              callbackUrl && !callbackUrl.includes('/account/verify-email') && callbackUrl !== '/account/complete-profile'
                ? callbackUrl
                : '/cart';
            window.location.href = `/account/verify-email?callbackUrl=${encodeURIComponent(`/account/complete-profile?callbackUrl=${encodeURIComponent(safeTarget)}`)}`;
            return;
          }
          setName(data.user.name || '');
          setPhone(data.user.phone || '');
          setAddressType((data.user.address_type as 'Home' | 'Work') || 'Home');
          setAddressLine1(data.user.address_line1 || '');
          setAddressLine2(data.user.address_line2 || '');
          setLandmark(data.user.landmark || '');
          setCity(data.user.city || '');
          setState(data.user.state || 'West Bengal');
          setPincode(data.user.pincode || '');
        }
      } catch {
        setError('Network error loading profile. Please refresh or check your internet connection.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router, callbackUrl]);

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(clean);
    clearFieldError('pincode');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validate all fields at once
    const errors: typeof fieldErrors = {};

    if (!name.trim() || name.trim().length < 2) {
      errors.name = 'Please provide your full name (minimum 2 characters).';
    }

    if (!phone.trim() || !isValidIndianPhone(phone)) {
      errors.phone = 'Please provide a valid 10-digit Indian mobile number (e.g. 98765 43210).';
    }

    if (!addressLine1.trim()) {
      errors.addressLine1 = 'House / Flat / Building / Company (Address Line 1) is required.';
    }

    if (!addressLine2.trim()) {
      errors.addressLine2 = 'Area / Street / Locality (Address Line 2) is required.';
    }

    if (!landmark.trim()) {
      errors.landmark = 'Landmark is required to assist courier delivery.';
    }

    if (!city.trim()) {
      errors.city = 'City / Town is required.';
    }

    if (!state.trim()) {
      errors.state = 'Please select a State or Union Territory.';
    }

    if (!isValidPincode(pincode)) {
      errors.pincode = 'Please enter a valid 6-digit postal PIN Code.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fill in all required address fields highlighted above.');
      const firstField = Object.keys(errors)[0];
      focusAndScrollTo(`profile-input-${firstField}`);
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: normalizeIndianPhone(phone),
          address_type: addressType,
          address_line1: addressLine1.trim(),
          address_line2: addressLine2.trim(),
          landmark: landmark.trim() || null,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const serverErr = data.error || 'Failed to update profile details.';
        setError(serverErr);
        focusAndScrollTo('profile-error-box');
        setIsSaving(false);
        return;
      }

      // Refresh cached user profile in ShopContext
      await refreshUser();

      setSuccessMessage('Delivery address saved successfully! Continuing...');
      setTimeout(() => {
        window.location.href = callbackUrl;
      }, 700);
    } catch {
      setError("We couldn't save this. Please check your internet connection and try again, or call 8391097995 if it keeps happening.");
      focusAndScrollTo('profile-error-box');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#D4AF37]/30 p-10 text-center shadow-lg">
        <div className="inline-block w-8 h-8 border-3 border-[#6B0D2F]/30 border-t-[#6B0D2F] rounded-full animate-spin mb-4" />
        <p className="text-xs text-[#6E676A] tracking-wider uppercase font-semibold">
          Loading Your Profile...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-[#D4AF37]/30 p-6 sm:p-10 relative">
      {/* Decorative Top Accent */}
      <div className="absolute -top-px left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

      {/* Header */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex flex-col items-center group mb-4">
          <span className="font-serif text-2xl tracking-[0.18em] text-[#1A1315] group-hover:text-[#6B0D2F] transition-colors">
            MRA BASTRALAYA
          </span>
          <span className="text-[9px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
            Textiles &amp; Apparel
          </span>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold mb-2">
          <MessageSquareText className="w-3.5 h-3.5 text-emerald-600" />
          <span>Delivery Address Setup</span>
        </div>
        <h1 className="font-serif text-2xl text-[#1A1315] font-normal">Delivery Address</h1>
        <p className="text-xs text-[#6E676A] mt-2 leading-relaxed max-w-md mx-auto">
          Where should our courier deliver your parcels? Please enter your address details below. Our store team will confirm with you on WhatsApp before dispatching.
        </p>
      </div>

      {/* Success Notice */}
      {successMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Contact Info Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="profile-input-name" className="block text-[11px] font-semibold uppercase tracking-wider text-[#1A1315] mb-1.5">
              Full Name <span className="text-[#6B0D2F]">*</span>
            </label>
            <div className="relative">
              <input
                id="profile-input-name"
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearFieldError('name');
                }}
                placeholder="e.g. Sunita Sen"
                aria-invalid={Boolean(fieldErrors.name)}
                className={`w-full bg-[#FAF7F2] rounded-xl px-3.5 py-2.5 pl-10 text-xs sm:text-sm text-[#1A1315] placeholder-gray-400 focus:outline-none transition-all ${
                  fieldErrors.name
                    ? 'border-2 border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                    : 'border border-[#D4AF37]/30 focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F]'
                }`}
              />
              <User className={`w-4 h-4 absolute left-3.5 top-3 ${fieldErrors.name ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
            <FieldError error={fieldErrors.name} />
          </div>

          <div>
            <label htmlFor="profile-input-phone" className="block text-[11px] font-semibold uppercase tracking-wider text-[#1A1315] mb-1.5">
              WhatsApp Contact Number <span className="text-[#6B0D2F]">*</span>
            </label>
            <div className="relative">
              <input
                id="profile-input-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearFieldError('phone');
                }}
                placeholder="e.g. 98765 43210"
                aria-invalid={Boolean(fieldErrors.phone)}
                className={`w-full bg-[#FAF7F2] rounded-xl px-3.5 py-2.5 pl-10 text-xs sm:text-sm text-[#1A1315] placeholder-gray-400 focus:outline-none transition-all ${
                  fieldErrors.phone
                    ? 'border-2 border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                    : 'border border-[#D4AF37]/30 focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F]'
                }`}
              />
              <Phone className={`w-4 h-4 absolute left-3.5 top-3 ${fieldErrors.phone ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
            <FieldError error={fieldErrors.phone} />
          </div>
        </div>

        {/* Address Type Selector */}
        <div className="pt-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1A1315] mb-1.5">
            Address Type
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAddressType('Home')}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                addressType === 'Home'
                  ? 'border-[#6B0D2F] bg-[#6B0D2F]/10 text-[#6B0D2F] font-semibold'
                  : 'border-gray-200 bg-[#FAF7F2] text-gray-600 hover:border-gray-300'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home (All Day Delivery)</span>
            </button>

            <button
              type="button"
              onClick={() => setAddressType('Work')}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                addressType === 'Work'
                  ? 'border-[#6B0D2F] bg-[#6B0D2F]/10 text-[#6B0D2F] font-semibold'
                  : 'border-gray-200 bg-[#FAF7F2] text-gray-600 hover:border-gray-300'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Work (10 AM - 6 PM)</span>
            </button>
          </div>
        </div>

        {/* Structured Address Line 1 */}
        <div>
          <label htmlFor="profile-input-addressLine1" className="block text-[11px] font-semibold uppercase tracking-wider text-[#1A1315] mb-1.5">
            Flat / House No. / Building / Apartment <span className="text-[#6B0D2F]">*</span>
          </label>
          <div className="relative">
            <input
              id="profile-input-addressLine1"
              type="text"
              required
              value={addressLine1}
              onChange={(e) => {
                setAddressLine1(e.target.value);
                clearFieldError('addressLine1');
              }}
              placeholder="e.g. Flat 4B, Shanti Niketan Apts"
              aria-invalid={Boolean(fieldErrors.addressLine1)}
              className={`w-full bg-[#FAF7F2] rounded-xl px-3.5 py-2.5 pl-10 text-xs sm:text-sm text-[#1A1315] placeholder-gray-400 focus:outline-none transition-all ${
                fieldErrors.addressLine1
                  ? 'border-2 border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                  : 'border border-[#D4AF37]/30 focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F]'
              }`}
            />
            <Building className={`w-4 h-4 absolute left-3.5 top-3 ${fieldErrors.addressLine1 ? 'text-red-500' : 'text-gray-400'}`} />
          </div>
          <FieldError error={fieldErrors.addressLine1} />
        </div>

        {/* Structured Address Line 2 */}
        <div>
          <label htmlFor="profile-input-addressLine2" className="block text-[11px] font-semibold uppercase tracking-wider text-[#1A1315] mb-1.5">
            Area / Street / Sector / Village <span className="text-[#6B0D2F]">*</span>
          </label>
          <div className="relative">
            <input
              id="profile-input-addressLine2"
              type="text"
              required
              value={addressLine2}
              onChange={(e) => {
                setAddressLine2(e.target.value);
                clearFieldError('addressLine2');
              }}
              placeholder="e.g. 12/1 Gariahat Road"
              aria-invalid={Boolean(fieldErrors.addressLine2)}
              className={`w-full bg-[#FAF7F2] rounded-xl px-3.5 py-2.5 pl-10 text-xs sm:text-sm text-[#1A1315] placeholder-gray-400 focus:outline-none transition-all ${
                fieldErrors.addressLine2
                  ? 'border-2 border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                  : 'border border-[#D4AF37]/30 focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F]'
              }`}
            />
            <Navigation className={`w-4 h-4 absolute left-3.5 top-3 ${fieldErrors.addressLine2 ? 'text-red-500' : 'text-gray-400'}`} />
          </div>
          <FieldError error={fieldErrors.addressLine2} />
        </div>

        {/* Landmark (Required) */}
        <div>
          <label htmlFor="profile-input-landmark" className="block text-[11px] font-semibold uppercase tracking-wider text-[#1A1315] mb-1.5">
            Landmark <span className="text-[#6B0D2F]">*</span>
          </label>
          <div className="relative">
            <input
              id="profile-input-landmark"
              type="text"
              required
              value={landmark}
              onChange={(e) => {
                setLandmark(e.target.value);
                clearFieldError('landmark');
              }}
              placeholder="e.g. Near Pantaloons / Opposite Lake Mall"
              aria-invalid={Boolean(fieldErrors.landmark)}
              className={`w-full bg-[#FAF7F2] rounded-xl px-3.5 py-2.5 pl-10 text-xs sm:text-sm text-[#1A1315] placeholder-gray-400 focus:outline-none transition-all ${
                fieldErrors.landmark
                  ? 'border-2 border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                  : 'border border-[#D4AF37]/30 focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F]'
              }`}
            />
            <MapPin className={`w-4 h-4 absolute left-3.5 top-3 ${fieldErrors.landmark ? 'text-red-500' : 'text-gray-400'}`} />
          </div>
          <FieldError error={fieldErrors.landmark} />
        </div>

        {/* City, State & PIN Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="profile-input-city" className="block text-[11px] font-semibold uppercase tracking-wider text-[#1A1315] mb-1.5">
              City / Town <span className="text-[#6B0D2F]">*</span>
            </label>
            <input
              id="profile-input-city"
              type="text"
              required
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                clearFieldError('city');
              }}
              placeholder="e.g. Kolkata"
              aria-invalid={Boolean(fieldErrors.city)}
              className={`w-full bg-[#FAF7F2] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#1A1315] placeholder-gray-400 focus:outline-none transition-all ${
                fieldErrors.city
                  ? 'border-2 border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                  : 'border border-[#D4AF37]/30 focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F]'
              }`}
            />
            <FieldError error={fieldErrors.city} />
          </div>

          <div>
            <label htmlFor="profile-input-state" className="block text-[11px] font-semibold uppercase tracking-wider text-[#1A1315] mb-1.5">
              State <span className="text-[#6B0D2F]">*</span>
            </label>
            <select
              id="profile-input-state"
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                clearFieldError('state');
              }}
              required
              className="w-full bg-[#FAF7F2] border border-[#D4AF37]/30 rounded-xl px-2.5 py-2.5 text-xs sm:text-sm text-[#1A1315] focus:outline-none focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F] transition-all"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <FieldError error={fieldErrors.state} />
          </div>

          <div>
            <label htmlFor="profile-input-pincode" className="block text-[11px] font-semibold uppercase tracking-wider text-[#1A1315] mb-1.5">
              6-Digit PIN Code <span className="text-[#6B0D2F]">*</span>
            </label>
            <input
              id="profile-input-pincode"
              type="text"
              required
              maxLength={6}
              value={pincode}
              onChange={handlePincodeChange}
              placeholder="700029"
              aria-invalid={Boolean(fieldErrors.pincode)}
              className={`w-full bg-[#FAF7F2] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#1A1315] placeholder-gray-400 focus:outline-none transition-all font-mono ${
                fieldErrors.pincode
                  ? 'border-2 border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                  : 'border border-[#D4AF37]/30 focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F]'
              }`}
            />
            <FieldError error={fieldErrors.pincode} />
          </div>
        </div>

        {/* Prominent Action Error Box directly above Submit Button */}
        {error && (
          <FormErrorBox
            id="profile-error-box"
            error={error}
            className="mt-3"
          />
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full mt-4 bg-[#6B0D2F] hover:bg-[#540924] text-white py-3.5 px-4 rounded-xl font-medium text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 group cursor-pointer"
        >
          {isSaving ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving Address &amp; Details...</span>
            </>
          ) : (
            <>
              <span>Save Address &amp; Continue</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Back to Store Link */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center text-xs text-[#6E676A]">
        <Link href={callbackUrl} className="hover:text-[#6B0D2F] flex items-center gap-1.5 transition-colors">
          <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Back to Store</span>
        </Link>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#D4AF37]/30 selection:text-[#6B0D2F]">
      <Suspense fallback={<div className="text-xs text-[#6E676A]">Loading...</div>}>
        <CompleteProfileForm />
      </Suspense>
    </div>
  );
}
