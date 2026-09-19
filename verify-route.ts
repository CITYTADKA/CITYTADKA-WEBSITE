import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const { bookingId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await request.json();

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Please log in first.' }, { status: 401 });
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, user_id, quantity, razorpay_order_id, coupon_id, payment_status')
    .eq('id', bookingId)
    .single();

  if (!booking || booking.user_id !== user.id || booking.razorpay_order_id !== razorpay_order_id) {
    return NextResponse.json({ error: 'Booking mismatch.' }, { status: 400 });
  }

  if (booking.payment_status === 'paid') {
    const admin = createAdminClient();
    const { data: existingTickets } = await admin.from('tickets').select('id').eq('booking_id', booking.id);
    return NextResponse.json({ bookingId: booking.id, ticketCount: existingTickets?.length ?? 0 });
  }

  const admin = createAdminClient();

  await admin
    .from('bookings')
    .update({ payment_status: 'paid', razorpay_payment_id })
    .eq('id', booking.id);

  const ticketRows = Array.from({ length: booking.quantity }).map(() => ({
    booking_id: booking.id,
    qr_token: crypto.randomUUID(),
    status: 'valid'
  }));

  await admin.from('tickets').insert(ticketRows);

  if (booking.coupon_id) {
    const { data: coupon } = await admin.from('coupons').select('times_used').eq('id', booking.coupon_id).single();
    if (coupon) {
      await admin.from('coupons').update({ times_used: coupon.times_used + 1 }).eq('id', booking.coupon_id);
    }
  }

  return NextResponse.json({ bookingId: booking.id, ticketCount: booking.quantity });
}
