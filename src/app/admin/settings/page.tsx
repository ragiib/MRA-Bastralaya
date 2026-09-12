import React from 'react';
import { Store, ShieldCheck, CheckCircle2, HelpCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
            Store Settings
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            General store details, WhatsApp ordering preferences, and account protection.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store Information */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-5">
          <div className="flex items-center gap-3 text-[#D4AF37]">
            <div className="w-10 h-10 rounded-xl bg-[#251D20] flex items-center justify-center border border-[#D4AF37]/30">
              <Store className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-[#FAF7F2]">Store Profile</h2>
              <p className="text-xs text-gray-400">Public store identification</p>
            </div>
          </div>

          <div className="space-y-3.5 text-sm text-gray-200">
            <div className="flex justify-between py-2.5 border-b border-white/5">
              <span className="text-gray-400">Store Name</span>
              <span className="font-medium text-[#FAF7F2]">MRA Bastralaya</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-white/5">
              <span className="text-gray-400">Primary Collections</span>
              <span className="text-[#FAF7F2]">Sarees, Suits &amp; Bed Sheets</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-white/5">
              <span className="text-gray-400">WhatsApp Ordering</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Active &amp; Connected</span>
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-gray-400">Storefront Status</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Online &amp; Open</span>
              </span>
            </div>
          </div>
        </div>

        {/* Security & System Status */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-5">
          <div className="flex items-center gap-3 text-[#D4AF37]">
            <div className="w-10 h-10 rounded-xl bg-[#251D20] flex items-center justify-center border border-[#D4AF37]/30">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-[#FAF7F2]">Security &amp; Data Protection</h2>
              <p className="text-xs text-gray-400">Administrator safeguards</p>
            </div>
          </div>

          <div className="space-y-3.5 text-sm text-gray-200">
            <div className="flex justify-between py-2.5 border-b border-white/5">
              <span className="text-gray-400">Admin Login Security</span>
              <span className="text-emerald-400 font-semibold">Protected &amp; Encrypted</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-white/5">
              <span className="text-gray-400">Customer Registration</span>
              <span className="text-gray-200">Enabled for Storefront</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-white/5">
              <span className="text-gray-400">Database Storage</span>
              <span className="text-emerald-400 font-semibold">Saved Locally &amp; Synced</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-gray-400">Session Duration</span>
              <span className="text-gray-200">7 Days Auto-Renewal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Helpful Instructions Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-3">
        <div className="flex items-center gap-2 text-[#D4AF37]">
          <HelpCircle className="w-5 h-5" />
          <h3 className="text-base font-medium text-[#FAF7F2]">Need Help Managing Your Store?</h3>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">
          To add new sarees or suits to your website, go to <strong>Products</strong> and click <strong>Add New Product</strong>. To review incoming customer order requests, open <strong>Orders</strong>. You can change any order to <em>Confirmed</em> or <em>Shipped</em> and send an update directly to the customer on WhatsApp.
        </p>
      </div>
    </div>
  );
}
