import React from 'react';
import { Settings, ShieldCheck, Key, Database } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl text-[#FAF7F2]">Console Settings</h1>
          <p className="text-xs text-gray-400 mt-1">
            System configuration, cryptographic parameters, and store administration preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-4">
          <div className="flex items-center gap-2.5 text-[#D4AF37]">
            <Key className="w-5 h-5" />
            <h2 className="font-serif text-base text-[#FAF7F2]">Authentication Configuration</h2>
          </div>
          <div className="space-y-3 text-xs text-gray-300">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-gray-400">Auth Token Protocol</span>
              <span className="font-mono text-emerald-400">JWT (jose / Web Crypto)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-gray-400">Cookie Security Policy</span>
              <span className="font-mono text-emerald-400">HttpOnly; SameSite=Lax</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-gray-400">Password Hashing Algorithm</span>
              <span className="font-mono text-emerald-400">bcrypt (10 rounds)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Session Validity Period</span>
              <span className="font-mono text-emerald-400">7 Days</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-4">
          <div className="flex items-center gap-2.5 text-[#D4AF37]">
            <Database className="w-5 h-5" />
            <h2 className="font-serif text-base text-[#FAF7F2]">Database Persistence</h2>
          </div>
          <div className="space-y-3 text-xs text-gray-300">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-gray-400">Database Engine</span>
              <span className="font-mono text-emerald-400">SQLite (Node 24 Native)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-gray-400">Journal Mode</span>
              <span className="font-mono text-emerald-400">WAL (Write-Ahead Logging)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-gray-400">Role-Based Tables</span>
              <span className="font-mono text-emerald-400">users (CHECK role)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Foreign Key Constraints</span>
              <span className="font-mono text-emerald-400">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
