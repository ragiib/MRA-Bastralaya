'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SafeUser } from '@/types/auth';
import { Order, OrderItem } from '@/types/order';
import {
  User,
  Package,
  MapPin,
  LogOut,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Edit2,
  X,
  Check,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Heart,
  Home,
  Briefcase,
  Building,
  Navigation,
} from 'lucide-react';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import Button from '@/components/ui/Button';
import ProfileCompletionStepper from '@/components/banners/ProfileCompletionStepper';
import { INDIAN_STATES } from '@/data/indianStates';
import { formatStructuredAddress, isValidPincode } from '@/lib/utils/address';
import { isValidIndianPhone, normalizeIndianPhone } from '@/lib/utils/phone';
import { useShop } from '@/context/ShopContext';

interface AccountViewProps {
  user: SafeUser;
}

export default function AccountView({ user: initialUser }: AccountViewProps) {
  const router = useRouter();
  const [user, setUser] = useState<SafeUser>(initialUser);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [ordersCount, setOrdersCount] = useState<number | null>(null);

  const { refreshUser } = useShop();
  // In-page Profile Editing State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(initialUser.name);
  const [phone, setPhone] = useState(initialUser.phone || '');
  const [addressType, setAddressType] = useState<'Home' | 'Work'>(
    (initialUser.address_type as 'Home' | 'Work') || 'Home'
  );
  const [addressLine1, setAddressLine1] = useState(initialUser.address_line1 || '');
  const [addressLine2, setAddressLine2] = useState(initialUser.address_line2 || '');
  const [landmark, setLandmark] = useState(initialUser.landmark || '');
  const [city, setCity] = useState(initialUser.city || '');
  const [state, setState] = useState(initialUser.state || 'West Bengal');
  const [pincode, setPincode] = useState(initialUser.pincode || '');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Account Deletion State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    if (!deletePassword.trim()) {
      setDeleteError('Please enter your password to confirm deletion.');
      return;
    }

    setIsDeletingAccount(true);
    try {
      const res = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || 'Failed to delete account.');
        setIsDeletingAccount(false);
        return;
      }

      window.location.href = '/?account_deleted=true';
    } catch {
      setDeleteError('Network error while deleting account. Please try again.');
      setIsDeletingAccount(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch {
      window.location.href = '/login';
    }
  };

  const handleOpenEdit = () => {
    setName(user.name);
    setPhone(user.phone || '');
    setAddressType((user.address_type as 'Home' | 'Work') || 'Home');
    setAddressLine1(user.address_line1 || '');
    setAddressLine2(user.address_line2 || '');
    setLandmark(user.landmark || '');
    setCity(user.city || '');
    setState(user.state || 'West Bengal');
    setPincode(user.pincode || '');
    setProfileError(null);
    setProfileSuccess(null);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!name.trim() || name.trim().length < 2) {
      setProfileError('Full name must be at least 2 characters.');
      return;
    }

    if (phone.trim() && !isValidIndianPhone(phone)) {
      setProfileError('Please provide a valid 10-digit Indian mobile number (e.g. 98765 43210 or +91 98765 43210).');
      return;
    }

    const isUpdatingAddress = Boolean(
      addressLine1.trim() ||
      addressLine2.trim() ||
      landmark.trim() ||
      city.trim() ||
      pincode.trim()
    );

    if (isUpdatingAddress) {
      if (!addressLine1.trim()) {
        setProfileError('House / Flat / Building / Company (Address Line 1) is required.');
        return;
      }
      if (!addressLine2.trim()) {
        setProfileError('Area / Street / Locality (Address Line 2) is required.');
        return;
      }
      if (!landmark.trim()) {
        setProfileError('Landmark is required.');
        return;
      }
      if (!city.trim()) {
        setProfileError('City / Town is required.');
        return;
      }
      if (!state.trim()) {
        setProfileError('Please select a State or Union Territory.');
        return;
      }
      if (!isValidPincode(pincode)) {
        setProfileError('Please enter a valid 6-digit postal PIN Code.');
        return;
      }
    }

    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() ? normalizeIndianPhone(phone) : null,
          address_type: addressType,
          address_line1: addressLine1.trim() || null,
          address_line2: addressLine2.trim() || null,
          landmark: landmark.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
          pincode: pincode.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || 'Failed to update profile.');
        return;
      }

      if (data.user) {
        setUser(data.user);
      }
      await refreshUser();
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => {
        setIsEditingProfile(false);
        setProfileSuccess(null);
      }, 1200);
      router.refresh();
    } catch {
      setProfileError('Network error while saving profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Member';

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#D4AF37]/30 selection:text-[#6B0D2F]">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#D4AF37]/50 text-[#6B0D2F] hover:bg-[#6B0D2F] hover:text-white font-medium text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow group cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#D4AF37] group-hover:text-white transition-colors" />
            <span>Return to Storefront</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/wishlist"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#D4AF37]/40 text-[#6B0D2F] text-xs font-medium tracking-wider hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Saved Wishlist</span>
            </Link>

            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1315] text-[#D4AF37] text-xs font-medium tracking-wider hover:bg-black transition-colors cursor-pointer"
              >
                <span>Admin Portal</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Profile Banner */}
        <div className="bg-white rounded-2xl shadow-md border border-[#D4AF37]/30 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#D4AF37]/10 via-transparent to-transparent pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#6B0D2F] text-[#D4AF37] flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold shadow-md shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1315] font-normal">
                    {user.name}
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#6B0D2F] border border-[#D4AF37]/40">
                    {user.role === 'ADMIN' ? 'Administrator' : 'Valued Customer'}
                  </span>
                </div>
                <p className="text-xs text-[#6E676A] mt-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{user.email}</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {/* Profile Completion Reminder Stepper Banner */}
        <ProfileCompletionStepper user={user} callbackUrl="/account" />

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-[#D4AF37]/20 pb-px overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-medium uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#6B0D2F] text-[#6B0D2F]'
                : 'border-transparent text-[#6E676A] hover:text-[#1A1315]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Information</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-medium uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-[#6B0D2F] text-[#6B0D2F]'
                : 'border-transparent text-[#6E676A] hover:text-[#1A1315]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History</span>
            {ordersCount !== null && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-600">
                {ordersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-medium uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'addresses'
                ? 'border-[#6B0D2F] text-[#6B0D2F]'
                : 'border-transparent text-[#6E676A] hover:text-[#1A1315]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses</span>
          </button>
        </div>

        {/* Tab Contents: Profile */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {/* Account Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#D4AF37]/20 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg text-[#1A1315] font-normal flex items-center gap-2">
                  <User className="w-4 h-4 text-[#D4AF37]" />
                  <span>Personal Credentials</span>
                </h2>
                {!isEditingProfile && (
                  <button
                    type="button"
                    onClick={handleOpenEdit}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B0D2F] hover:underline cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                /* Inline Edit Profile Form */
                <form onSubmit={handleSaveProfile} className="space-y-4 pt-1 animate-fadeIn">
                  {profileError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{profileError}</span>
                    </div>
                  )}

                  {profileSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{profileSuccess}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E676A] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#6B0D2F] focus:outline-none bg-[#FAF7F2]"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E676A] mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#6B0D2F] focus:outline-none bg-[#FAF7F2]"
                      placeholder="e.g. +91 98765 43210"
                    />
                    <p className="text-[10px] text-[#6E676A] mt-1">10-digit Indian mobile number</p>
                  </div>

                  {/* Address Type Selector */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E676A] mb-1">
                      Address Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAddressType('Home')}
                        className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          addressType === 'Home'
                            ? 'border-[#6B0D2F] bg-[#6B0D2F]/10 text-[#6B0D2F] font-semibold'
                            : 'border-gray-200 bg-[#FAF7F2] text-gray-600'
                        }`}
                      >
                        <Home className="w-3.5 h-3.5" />
                        <span>Home</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddressType('Work')}
                        className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          addressType === 'Work'
                            ? 'border-[#6B0D2F] bg-[#6B0D2F]/10 text-[#6B0D2F] font-semibold'
                            : 'border-gray-200 bg-[#FAF7F2] text-gray-600'
                        }`}
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Work</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E676A] mb-1">
                      Address Line 1 (Flat / House / Building) *
                    </label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#6B0D2F] focus:outline-none bg-[#FAF7F2]"
                      placeholder="e.g. Flat 4B, Shanti Niketan"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E676A] mb-1">
                      Address Line 2 (Area / Street / Locality) *
                    </label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#6B0D2F] focus:outline-none bg-[#FAF7F2]"
                      placeholder="e.g. 12/1 Gariahat Road"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E676A] mb-1">
                      Landmark (Required) *
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#6B0D2F] focus:outline-none bg-[#FAF7F2]"
                      placeholder="e.g. Near Pantaloons / Opposite Lake Mall"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E676A] mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#6B0D2F] focus:outline-none bg-[#FAF7F2]"
                        placeholder="e.g. Kolkata"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E676A] mb-1">
                        State *
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full text-xs px-2.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#6B0D2F] focus:outline-none bg-[#FAF7F2]"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E676A] mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#6B0D2F] focus:outline-none bg-[#FAF7F2] font-mono"
                        placeholder="700029"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isSavingProfile}
                      className="cursor-pointer"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Saving...
                        </>
                      ) : (
                        'Save Profile Changes'
                      )}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      disabled={isSavingProfile}
                      className="text-xs text-gray-500 hover:text-gray-700 py-1.5 px-3 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Profile View Display */
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[#6E676A] uppercase tracking-wider block text-[10px]">
                      Full Name
                    </span>
                    <span className="text-sm font-medium text-[#1A1315] mt-0.5 block">
                      {user.name}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#6E676A] uppercase tracking-wider block text-[10px]">
                      Registered Email
                    </span>
                    <span className="text-sm font-medium text-[#1A1315] mt-0.5 block">
                      {user.email}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#6E676A] uppercase tracking-wider block text-[10px]">
                      Contact Phone
                    </span>
                    <span className="text-sm font-medium text-[#1A1315] mt-0.5 block flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{user.phone || 'Not provided'}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[#6E676A] uppercase tracking-wider block text-[10px]">
                      Delivery Address
                    </span>
                    <div className="text-sm font-medium text-[#1A1315] mt-0.5 block flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      {user.address_line1 ? (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#D4AF37]/20 text-[#6B0D2F] border border-[#D4AF37]/30">
                              {user.address_type || 'Home'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {formatStructuredAddress(user)}
                          </p>
                        </div>
                      ) : user.address ? (
                        <span className="text-xs text-gray-700 leading-relaxed">{user.address}</span>
                      ) : (
                        <span className="text-gray-400">Not provided</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[#6E676A] uppercase tracking-wider block text-[10px]">
                      Member Since
                    </span>
                    <span className="text-sm font-medium text-[#1A1315] mt-0.5 block flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{formattedDate}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Account Settings & Deletion Card */}
            {user.role !== 'ADMIN' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between space-y-6">
                <div>
                  <h2 className="font-serif text-lg text-[#1A1315] font-normal flex items-center gap-2">
                    <User className="w-4 h-4 text-[#6B0D2F]" />
                    <span>Account Settings</span>
                  </h2>

                  <div className="mt-4 space-y-3 text-xs text-[#6E676A]">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <span>Email Status</span>
                      {user.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <Check className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <Link
                          href="/account/verify-email"
                          className="text-[#6B0D2F] font-semibold underline hover:text-[#540924]"
                        >
                          Verify Now
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <span>Registered Phone</span>
                      <span className="text-[#1A1315] font-medium">{user.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Delete Account
                  </span>
                  <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                    Permanently delete your customer account, addresses, and saved wishlist items.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletePassword('');
                      setDeleteError(null);
                      setShowDeleteModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <span>Delete My Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Contents: Orders */}
        {activeTab === 'orders' && (
          <CustomerOrdersTab onCountChange={setOrdersCount} />
        )}

        {/* Tab Contents: Addresses */}
        {activeTab === 'addresses' && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#D4AF37]/20 p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20">
              <div>
                <h3 className="font-serif text-xl text-[#1A1315]">Primary Delivery Address</h3>
                <p className="text-xs text-[#6E676A] mt-0.5">
                  Used for WhatsApp order confirmation and dispatch
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('profile');
                  handleOpenEdit();
                }}
                className="px-4 py-2 rounded-xl bg-[#6B0D2F] hover:bg-[#540924] text-white text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
              >
                {user.address ? 'Edit Address' : 'Add Address'}
              </button>
            </div>

            {user.address_line1 ? (
              <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/30 space-y-3 text-xs">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#D4AF37]/20">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#1A1315]">
                    <MapPin className="w-4 h-4 text-[#6B0D2F]" />
                    <span>{user.name}</span>
                    {user.phone && (
                      <span className="text-xs text-[#6E676A] font-normal">({user.phone})</span>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#6B0D2F] border border-[#D4AF37]/40">
                    {user.address_type || 'Home'}
                  </span>
                </div>

                <div className="space-y-1 pl-6 text-gray-700 leading-relaxed">
                  <p className="font-medium text-[#1A1315]">{user.address_line1}</p>
                  <p>{user.address_line2}</p>
                  {user.landmark && (
                    <p className="text-[#6E676A]">Landmark: {user.landmark}</p>
                  )}
                  <p className="font-medium text-[#1A1315]">
                    {user.city}, {user.state} - <span className="font-mono">{user.pincode}</span>
                  </p>
                </div>
              </div>
            ) : user.address ? (
              <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/30 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1A1315]">
                  <MapPin className="w-4 h-4 text-[#6B0D2F]" />
                  <span>{user.name}</span>
                  {user.phone && <span className="text-xs text-[#6E676A] font-normal">({user.phone})</span>}
                </div>
                <p className="text-gray-700 leading-relaxed pl-6">{user.address}</p>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <MapPin className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-xs text-[#6E676A]">
                  No delivery address saved yet. Please add an address to enable fast WhatsApp ordering.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    handleOpenEdit();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6B0D2F] text-white text-xs font-medium uppercase tracking-wider cursor-pointer"
                >
                  Add Delivery Address
                </button>
              </div>
            )}
          </div>
        )}

        {/* Delete Account Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-red-100 relative">
              <div className="flex items-center gap-3 text-red-700 mb-3">
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-serif text-lg font-normal text-[#1A1315]">Permanently Delete Account?</h3>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                This action cannot be undone. All saved items in your cart and wishlist will be permanently removed.
                Your past order history will be unlinked for store accounting records, and your email will become available for new registrations.
              </p>

              {deleteError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#1A1315] mb-1.5">
                    Confirm Your Password
                  </label>
                  <input
                    type="password"
                    required
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-[#FAF7F2] border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1A1315] focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    disabled={isDeletingAccount}
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Keep Account
                  </button>
                  <button
                    type="submit"
                    disabled={isDeletingAccount}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isDeletingAccount ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                      </>
                    ) : (
                      'Permanently Delete'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerOrdersTab({
  onCountChange,
}: {
  onCountChange?: (count: number) => void;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cancellation State
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState<{ id: string; success?: string; error?: string } | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          const list = data.orders || [];
          setOrders(list);
          onCountChange?.(list.length);
        }
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, [onCountChange]);

  const handleConfirmCancel = async (orderId: string) => {
    setIsProcessingCancel(true);
    setCancelFeedback(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        setCancelFeedback({ id: orderId, error: data.error || 'Failed to cancel order.' });
        return;
      }

      // Update local state immediately
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled' } : o))
      );
      setCancelFeedback({ id: orderId, success: 'Order cancelled successfully.' });
      setCancellingOrderId(null);
    } catch {
      setCancelFeedback({ id: orderId, error: 'Network error while cancelling order.' });
    } finally {
      setIsProcessingCancel(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#D4AF37]/20 p-10 text-center space-y-3">
        <div className="inline-block w-6 h-6 border-2 border-[#6B0D2F]/30 border-t-[#6B0D2F] rounded-full animate-spin" />
        <p className="text-xs text-[#6E676A]">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#D4AF37]/20 p-10 text-center space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#D4AF37]/40 text-[#6B0D2F] flex items-center justify-center mx-auto">
          <Package className="w-7 h-7" />
        </div>
        <h3 className="font-serif text-xl text-[#1A1315]">No Active Orders Yet</h3>
        <p className="text-xs text-[#6E676A] max-w-md mx-auto leading-relaxed">
          You haven&apos;t placed any WhatsApp order requests yet. When you tap &ldquo;Order via WhatsApp&rdquo;, your order request records will appear here for reference.
        </p>
        <div className="pt-2">
          <Link
            href="/sarees"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6B0D2F] hover:bg-[#540924] text-white rounded-xl text-xs font-medium uppercase tracking-wider transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Explore Saree Catalogue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {orders.map((ord) => {
        const isPending = ord.status === 'Pending' || ord.status === 'Pending - Awaiting WhatsApp Confirmation';
        const isThisCancelling = cancellingOrderId === ord.id;
        const feedback = cancelFeedback?.id === ord.id ? cancelFeedback : null;

        return (
          <div
            key={ord.id}
            className="bg-white rounded-2xl shadow-sm border border-[#D4AF37]/20 p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#6E676A] block">Order Ref</span>
                <span className="font-mono font-bold text-[#1A1315]">{ord.id}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#6E676A] block">Date</span>
                <span className="text-gray-700">
                  {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#6E676A] block mb-1">Status</span>
                <OrderStatusBadge status={ord.status} theme="light" size="sm" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#6E676A] block">Total</span>
                <span className="font-semibold text-[#1A1315] text-sm">
                  ₹{ord.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Status progress helper note */}
            <div className="text-[11px] px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D4AF37]/20 text-[#6E676A] flex items-center justify-between flex-wrap gap-1">
              <span>
                {ord.status === 'Pending' && '⏳ Order received. Our team will verify and confirm shortly.'}
                {ord.status === 'Confirmed' && '✓ Order confirmed! Being packed and prepared for dispatch.'}
                {ord.status === 'Shipped' && '🚚 Dispatched! Package is on its way to your address.'}
                {ord.status === 'Delivered' && '✨ Delivered! Thank you for choosing MRA Bastralaya.'}
                {ord.status === 'Cancelled' && '✕ Order cancelled.'}
                {!['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].includes(ord.status) && `Status: ${ord.status}`}
              </span>
              {ord.updatedAt && (
                <span className="text-[10px] text-gray-400">
                  Last activity: {new Date(ord.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>

            {/* Cancel Action Feedback */}
            {feedback?.error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{feedback.error}</span>
              </div>
            )}
            {feedback?.success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{feedback.success}</span>
              </div>
            )}

            {/* Items list */}
            <div className="space-y-2 text-xs">
              {ord.items.map((item: OrderItem, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-gray-700">
                  <span>
                    {item.name} <span className="text-gray-400">× {item.quantity}</span>
                  </span>
                  <span className="font-semibold text-[#1A1315]">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Cancel Order Section (Only visible for Pending orders) */}
            {isPending && (
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {isThisCancelling ? (
                  <div className="w-full p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2.5 animate-fadeIn">
                    <div className="flex items-center gap-2 text-amber-900 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Are you sure you want to cancel this order?</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Cancelling will mark this order as cancelled in your order history and notify the store owner.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleConfirmCancel(ord.id)}
                        disabled={isProcessingCancel}
                        className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        {isProcessingCancel ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" /> Cancelling...
                          </>
                        ) : (
                          'Yes, Cancel Order'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCancellingOrderId(null)}
                        disabled={isProcessingCancel}
                        className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-white text-xs transition-colors cursor-pointer"
                      >
                        Keep Order
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] text-gray-500">
                      Need to change details or cancel?
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCancelFeedback(null);
                        setCancellingOrderId(ord.id);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50/50 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
