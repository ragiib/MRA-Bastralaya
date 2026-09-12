'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Phone, MapPin, ArrowRight, ShieldCheck, ShoppingBag, MessageSquareText } from 'lucide-react';

function CompleteProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/account';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`/api/account/profile?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!res.ok) {
          if (res.status === 401) {
            router.push(`/login?callbackUrl=${encodeURIComponent(`/account/complete-profile?callbackUrl=${encodeURIComponent(callbackUrl)}`)}`);
            return;
          }
          setError('Failed to load your profile. Please try again.');
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        if (data.user) {
          setName(data.user.name || '');
          setPhone(data.user.phone || '');
          setAddress(data.user.address || '');
        }
      } catch {
        setError('Network error loading profile.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || name.trim().length < 2) {
      setError('Please provide your full name (minimum 2 characters).');
      return;
    }

    if (!phone.trim() || phone.trim().length < 7) {
      setError('Please provide a valid contact phone number (minimum 7 digits).');
      return;
    }

    if (!address.trim() || address.trim().length < 5) {
      setError('Please enter your full delivery address with pincode.');
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update profile.');
        setIsSaving(false);
        return;
      }

      // Success -> navigate to callbackUrl
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError('Network error saving profile. Please try again.');
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
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-[#D4AF37]/30 p-8 sm:p-10 relative">
      {/* Decorative Top Accent */}
      <div className="absolute -top-px left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

      {/* Header */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex flex-col items-center group mb-4">
          <span className="font-serif text-2xl tracking-[0.18em] text-[#1A1315] group-hover:text-[#6B0D2F] transition-colors">
            MRA BASTRALAYA
          </span>
          <span className="text-[9px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
            Textiles & Apparel
          </span>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold mb-2">
          <MessageSquareText className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp Direct Ordering Setup</span>
        </div>
        <h1 className="font-serif text-2xl text-[#1A1315] font-normal">Complete Your Profile</h1>
        <p className="text-xs text-[#6E676A] mt-2 leading-relaxed max-w-sm mx-auto">
          To confirm your order directly over WhatsApp and coordinate safe doorstep delivery, please complete your contact and delivery address.
        </p>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-fadeIn">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-[#1A1315] mb-1.5">
            Full Name <span className="text-[#6B0D2F]">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Smt. Sunita Sen"
              className="w-full bg-[#FAF7F2] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-[#1A1315] placeholder-gray-400 focus:outline-none focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F] transition-all"
            />
            <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-[#1A1315] mb-1.5">
            Contact / WhatsApp Phone Number <span className="text-[#6B0D2F]">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full bg-[#FAF7F2] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-[#1A1315] placeholder-gray-400 focus:outline-none focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F] transition-all"
            />
            <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>
          <p className="text-[10px] text-[#6E676A] mt-1">
            Our store desk will reach out to this number to verify your order over WhatsApp.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-[#1A1315] mb-1.5">
            Full Delivery Address <span className="text-[#6B0D2F]">*</span>
          </label>
          <div className="relative">
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Flat/House No., Street name, Landmark, City, State, PIN Code"
              className="w-full bg-[#FAF7F2] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-[#1A1315] placeholder-gray-400 focus:outline-none focus:border-[#6B0D2F] focus:ring-1 focus:ring-[#6B0D2F] transition-all resize-none"
            />
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full mt-3 bg-[#6B0D2F] hover:bg-[#540924] text-white py-3.5 px-4 rounded-xl font-medium text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 group cursor-pointer"
        >
          {isSaving ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Save & Proceed with Order</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Trust Badge */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#6E676A]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Encrypted Profile Security</span>
        </div>
        <Link href={callbackUrl} className="hover:text-[#6B0D2F] flex items-center gap-1">
          <ShoppingBag className="w-3 h-3" />
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
