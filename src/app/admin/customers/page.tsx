import React from 'react';
import { UserRepository } from '@/lib/repositories/user.repository';
import { Users, Mail, Phone, Calendar } from 'lucide-react';

export default async function AdminCustomersPage() {
  const customers = UserRepository.listCustomers(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl text-[#FAF7F2]">Customer Directory</h1>
          <p className="text-xs text-gray-400 mt-1">
            Registered customer accounts stored in the database ({customers.length} records).
          </p>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 space-y-3">
          <Users className="w-8 h-8 text-gray-400 mx-auto" />
          <h2 className="font-serif text-lg text-[#FAF7F2]">No Customers Registered Yet</h2>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Customers who register via /register will automatically appear in this verified database list.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#1E181A] border border-[#D4AF37]/20 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#251D20] text-[#D4AF37] uppercase tracking-wider text-[10px] font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Customer</th>
                  <th className="py-3.5 px-4 sm:px-6">Email Address</th>
                  <th className="py-3.5 px-4 sm:px-6">Phone Number</th>
                  <th className="py-3.5 px-4 sm:px-6">Role</th>
                  <th className="py-3.5 px-4 sm:px-6">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#251D20]/50 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-[#FAF7F2] flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-xs flex items-center justify-center shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{c.name}</span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <Mail className="w-3.5 h-3.5 text-gray-500" />
                        <span>{c.email}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-gray-400">
                      {c.phone ? (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-500" />
                          <span>{c.phone}</span>
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        {c.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
