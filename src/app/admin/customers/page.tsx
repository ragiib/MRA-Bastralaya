import React from 'react';
import { UserRepository } from '@/lib/repositories/user.repository';
import { Users, Mail, Phone, Calendar, MessageCircle } from 'lucide-react';

export default async function AdminCustomersPage() {
  const customers = UserRepository.listCustomers(100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
            Customer Directory
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Registered customer accounts with saved delivery details ({customers.length} total customers).
          </p>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-4">
          <Users className="w-12 h-12 text-gray-500 mx-auto" />
          <h2 className="font-serif text-xl text-[#FAF7F2]">No Customers Registered Yet</h2>
          <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
            When customers create an account on your store, their names, phone numbers, and delivery addresses will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-200">
              <thead className="bg-[#251D20] text-gray-300 uppercase tracking-wider text-xs font-semibold border-b border-white/10">
                <tr>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Phone Number</th>
                  <th className="py-4 px-6">Account Type</th>
                  <th className="py-4 px-6">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#1E181A]">
                {customers.map((c) => {
                  const cleanPhone = c.phone ? c.phone.replace(/\D/g, '') : '';
                  return (
                    <tr key={c.id} className="hover:bg-[#251D20]/60 transition-colors">
                      <td className="py-4 px-6 font-semibold text-[#FAF7F2]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] font-bold text-sm flex items-center justify-center shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{c.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="flex items-center gap-2 text-gray-300">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{c.email}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {c.phone ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-200 flex items-center gap-1.5">
                              <Phone className="w-4 h-4 text-[#D4AF37]" />
                              <span>{c.phone}</span>
                            </span>
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-colors"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>Chat</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          {c.role === 'ADMIN' ? 'Admin' : 'Customer'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {c.createdAt
                              ? new Date(c.createdAt).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '—'}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
