import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRazorpay } from '@/lib/razorpay';

export async function POST(request: Request) {
  const { eventId, tierId, quantity, couponCode } = await request.json();
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Please log in first.' }, { status: 401 });
  }

  const qty = Math.max(1, Math.min(10, Number(quantity) || 1));

  const { data: tier } = await supabase
    .from('ticket_tiers')
    .select('id, price_paise, quantity_total, quantity_sold, event_id')
    .eq('id', tierId)
    .eq('event_id', eventId)
    .single();

  if (!tier) {
    return NextResponse.json({ error: 'Ticket type not found.' }, { status: 404 });
  }

  if (tier.quantity_sold + qty > tier.quantity_total) {
    return NextResponse.json({ error: 'Not enough tickets left.' }, { status: 400 });
  }

  let amountPaise = tier.price_paise * qty;
  let discountPaise = 0;
  let couponId: string | null = null;

  if (couponCode) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.trim().toUpperCase())
      .eq('status', 'active')
      .single();

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or expired coupon code.' }, { status: 400 });
    }
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json({ error: 'This coupon is not active yet.' }, { status: 400 });
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return NextResponse.json({ error: 'This coupon has expired.' }, { status: 400 });
    }
    if (coupon.event_id && coupon.event_id !== eventId) {
      return NextResponse.json({ error: 'This coupon is not valid for this event.' }, { status: 400 });
    }
    if (coupon.usage_limit_total && coupon.times_used >= coupon.usage_limit_total) {
      return NextResponse.json({ error: 'This coupon has been fully redeemed.' }, { status: 400 });
    }

    couponId = coupon.id;
    if (coupon.discount_type === 'percent') {
      discountPaise = Math.round((amountPaise * coupon.discount_value) / 100);
    } else {
      discountPaise = Math.round(coupon.discount_value * 100);
    }
    discountPaise = Math.min(discountPaise, amountPaise);
    amountPaise = amountPaise - discountPaise;
  }

  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: 'INR',
    notes: { eventId, tierId, userId: user.id }
  });

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      event_id: eventId,
      user_id: user.id,
      ticket_tier_id: tierId,
      quantity: qty,
      amount_paise: amountPaise,
      coupon_id: couponId,
      discount_applied_paise: discountPaise,
      razorpay_order_id: order.id,
      payment_status: 'created'
    })
    .select('id')
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'Could not start booking. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({
    bookingId: booking.id,
    razorpayOrderId: order.id,
    amount: amountPaise,
    keyId: process.env.RAZORPAY_KEY_ID
  });
}
