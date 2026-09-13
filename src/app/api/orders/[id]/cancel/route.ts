import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { OrderRepository } from '@/lib/repositories/order.repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const order = await OrderRepository.findById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Check authorization: customer can only cancel their own order (admins can cancel any)
    if (user.role !== 'ADMIN' && order.userId !== user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to cancel this order.' },
        { status: 403 }
      );
    }

    // Only orders in 'Pending' status can be cancelled by the customer
    const cancellableStatuses = ['Pending', 'Pending - Awaiting WhatsApp Confirmation'];
    if (!cancellableStatuses.includes(order.status)) {
      return NextResponse.json(
        {
          error: `Order cannot be cancelled because it is already marked as ${order.status}. Orders can only be cancelled while Pending.`,
        },
        { status: 400 }
      );
    }

    const updatedOrder = await OrderRepository.updateStatus(id, 'Cancelled');

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Order cancelled successfully.',
    });
  } catch (error) {
    console.error('[API ORDER CANCEL ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to cancel order.' },
      { status: 500 }
    );
  }
}
