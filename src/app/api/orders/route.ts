import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { OrderRepository } from '@/lib/repositories/order.repository';
import { OrderItem } from '@/types/order';
import { generateWhatsAppOrderUrl } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admins can see all, customers see their own
    const orders =
      user.role === 'ADMIN'
        ? OrderRepository.listOrders(100)
        : OrderRepository.listOrdersByUser(user.id);

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('[API ORDERS GET ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to retrieve orders.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to place an order.', code: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }

    // Verify profile is complete (Name, Phone Number, Delivery Address)
    const hasName = Boolean(user.name && user.name.trim().length >= 2);
    const hasPhone = Boolean(user.phone && user.phone.trim().length >= 7);
    const hasAddress = Boolean(user.address && user.address.trim().length >= 5);

    if (!hasName || !hasPhone || !hasAddress) {
      return NextResponse.json(
        {
          error:
            'Please complete your Full Name, Phone Number, and Delivery Address before placing your order.',
          code: 'PROFILE_INCOMPLETE',
          missingFields: {
            name: !hasName,
            phone: !hasPhone,
            address: !hasAddress,
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { items, total } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item.' },
        { status: 400 }
      );
    }

    const formattedItems: OrderItem[] = items.map((item) => ({
      productId: item.productId || item.id || '',
      name: item.name || 'Handloom Item',
      department: item.department,
      category: item.category,
      categorySlug: item.categorySlug,
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
      subtotal: (Number(item.price) || 0) * (Number(item.quantity) || 1),
      image: item.image || (item.images && item.images[0]) || undefined,
    }));

    const computedTotal =
      typeof total === 'number' && total > 0
        ? total
        : formattedItems.reduce((sum, item) => sum + item.subtotal, 0);

    const order = OrderRepository.createOrder({
      userId: user.id,
      customerName: user.name,
      customerPhone: user.phone!,
      customerAddress: user.address!,
      items: formattedItems,
      total: computedTotal,
      status: 'Pending - Awaiting WhatsApp Confirmation',
      source: 'whatsapp',
    });

    const whatsappUrl = generateWhatsAppOrderUrl({
      customerName: user.name,
      customerPhone: user.phone!,
      customerAddress: user.address!,
      items: formattedItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        department: item.department,
        category: item.category,
      })),
      total: computedTotal,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order,
      whatsappUrl,
    });
  } catch (error) {
    console.error('[API ORDERS POST ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to record order attempt.' },
      { status: 500 }
    );
  }
}
