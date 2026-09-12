'use client';

import React from 'react';
import { OrderStatus } from '@/types/order';
import {
  Clock,
  CheckCircle2,
  Truck,
  CheckCheck,
  XCircle,
  HelpCircle,
} from 'lucide-react';

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export function getStatusThemeStyles(
  status: OrderStatus | string,
  theme: 'dark' | 'light' = 'dark'
) {
  const norm =
    status === 'Pending - Awaiting WhatsApp Confirmation' ? 'Pending' : status;

  if (theme === 'dark') {
    switch (norm) {
      case 'Pending':
        return {
          container: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400',
          label: 'Pending',
        };
      case 'Confirmed':
        return {
          container: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
          dot: 'bg-blue-400',
          label: 'Confirmed',
        };
      case 'Shipped':
        return {
          container: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          dot: 'bg-purple-400',
          label: 'Shipped',
        };
      case 'Delivered':
        return {
          container: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400',
          label: 'Delivered',
        };
      case 'Cancelled':
        return {
          container: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          dot: 'bg-rose-400',
          label: 'Cancelled',
        };
      default:
        return {
          container: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
          dot: 'bg-gray-400',
          label: norm,
        };
    }
  } else {
    // Light theme (for customer account)
    switch (norm) {
      case 'Pending':
        return {
          container: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Pending',
        };
      case 'Confirmed':
        return {
          container: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
          label: 'Confirmed',
        };
      case 'Shipped':
        return {
          container: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500',
          label: 'Shipped',
        };
      case 'Delivered':
        return {
          container: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600',
          label: 'Delivered',
        };
      case 'Cancelled':
        return {
          container: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          label: 'Cancelled',
        };
      default:
        return {
          container: 'bg-gray-50 text-gray-800 border-gray-200',
          dot: 'bg-gray-400',
          label: norm,
        };
    }
  }
}

export function getStatusIcon(status: OrderStatus | string, className = 'w-3 h-3') {
  const norm =
    status === 'Pending - Awaiting WhatsApp Confirmation' ? 'Pending' : status;

  switch (norm) {
    case 'Pending':
      return <Clock className={className} />;
    case 'Confirmed':
      return <CheckCircle2 className={className} />;
    case 'Shipped':
      return <Truck className={className} />;
    case 'Delivered':
      return <CheckCheck className={className} />;
    case 'Cancelled':
      return <XCircle className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
}

export default function OrderStatusBadge({
  status,
  theme = 'dark',
  size = 'md',
  showIcon = true,
}: OrderStatusBadgeProps) {
  const styles = getStatusThemeStyles(status, theme);
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] gap-1'
      : 'px-2.5 py-1 text-xs gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors ${styles.container} ${sizeClasses}`}
    >
      {showIcon && getStatusIcon(status, size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5')}
      <span className="tracking-wide">{styles.label}</span>
    </span>
  );
}
