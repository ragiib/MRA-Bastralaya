import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { OrderRepository } from '@/lib/repositories/order.repository';
import { ORDER_STATUSES, OrderStatus } from '@/types/order';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/orders/[id]
 * Server-side protected: Retrieves a single order by ID.
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Administrator credentials required.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const order = await OrderRepository.findById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('[API ADMIN ORDER GET BY ID ERROR]', error);
    return NextResponse.json({ error: 'Failed to retrieve order.' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Server-side protected: Updates an order's status and updated_at timestamp.
 */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Administrator credentials required.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const { status } = body;

    if (!status || typeof status !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "status" parameter.' },
        { status: 400 }
      );
    }

    if (!ORDER_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status "${status}". Allowed statuses: ${ORDER_STATUSES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const existing = await OrderRepository.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const updated = await OrderRepository.updateStatus(id, status);
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update order status.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order ${id} status updated to ${status}.`,
      order: updated,
    });
  } catch (error) {
    console.error('[API ADMIN ORDER STATUS PATCH ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update order status in database.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/orders/[id]
 * Alias for PATCH to support diverse client conventions.
 */
export async function PUT(request: Request, context: RouteContext) {
  return PATCH(request, context);
}

/**
 * DELETE /api/admin/orders/[id]
 * Server-side protected: Permanently hard deletes an order from the database.
 */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Administrator credentials required.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const existing = await OrderRepository.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const deleted = await OrderRepository.deleteOrder(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete order from database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order #${id} was permanently deleted.`,
      id,
    });
  } catch (error) {
    console.error('[API ADMIN ORDER DELETE ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to delete order from database.' },
      { status: 500 }
    );
  }
}
