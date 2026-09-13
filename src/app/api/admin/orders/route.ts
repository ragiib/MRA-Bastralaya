import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { OrderRepository } from '@/lib/repositories/order.repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/admin/orders
 * Server-side protected: Requires authenticated ADMIN role.
 * Lists orders optionally filtered by status, and provides metrics.
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Administrator credentials required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    const orders = await OrderRepository.listOrders(150, status);
    const metrics = await OrderRepository.countMetrics();

    return NextResponse.json({
      success: true,
      orders,
      metrics,
    });
  } catch (error) {
    console.error('[API ADMIN ORDERS GET ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to retrieve orders from database.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/orders
 * Server-side protected: Bulk delete orders by status (e.g. Cancelled).
 */
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Administrator credentials required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    if (!status) {
      return NextResponse.json(
        { error: 'Status query parameter is required for bulk deletion.' },
        { status: 400 }
      );
    }

    const deletedCount = await OrderRepository.deleteOrdersByStatus(status);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} ${status} orders.`,
      deletedCount,
    });
  } catch (error) {
    console.error('[API ADMIN ORDERS BULK DELETE ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to bulk delete orders from database.' },
      { status: 500 }
    );
  }
}
