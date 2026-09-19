'use client';

import { useState } from 'react';
import Script from 'next/script';

export default function CheckoutForm({ event, tier }: { event: any; tier: any }) {
  const [quantity, setQuantity] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const total = tier.price_paise * quantity;

  async function handlePay() {
    setLoading(true);
    setError('');

    const res = await fetch('/api/checkout/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: event.id, tierId: tier.id, quantity, couponCode })
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    const razorpayWindow = window as any;
    const rzp = new razorpayWindow.Razorpay({
      key: data.keyId,
      amount: data.amount,
      currency: 'INR',
      name: 'City Tadka',
      description: event.title_en,
      order_id: data.razorpayOrderId,
      handler: async function (response: any) {
        const verifyRes = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: data.bookingId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          })
        });
        const verifyData = await verifyRes.json();
        if (verifyRes.ok) {
          window.location.href = `/booking/${verifyData.bookingId}/confirmation`;
        } else {
          setError('Payment succeeded but confirmation failed — contact support.');
        }
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
        }
      },
      theme: { color: '#ED1C24' }
    });
    rzp.open();
    setLoading(false);
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="p-5">
        <div className="bg-card rounded-md shadow-sm p-4 mb-4">
          <div className="font-heading font-bold text-sm text-ink mb-1">{event.title_en}</div>
          <div className="text-xs text-ink-light mb-3">{event.venue_name}</div>
          <div className="flex justify-between text-sm text-ink">
            <span>
              {tier.name_en} × {quantity}
            </span>
            <span>₹{Math.round((tier.price_paise * quantity) / 100)}</span>
          </div>
        </div>

        <div className="bg-card rounded-md shadow-sm p-4 mb-4 flex items-center justify-between">
          <span className="text-sm text-ink">Quantity</span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-6.5 h-6.5 rounded-pill border border-ink-light text-ink font-bold w-7 h-7"
            >
              −
            </button>
            <span className="font-bold text-ink">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="rounded-pill border border-ink-light text-ink font-bold w-7 h-7"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-card rounded-md shadow-sm p-4 mb-4">
          <div className="font-heading font-bold text-xs text-ink mb-2.5">Coupon code</div>
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Enter code (optional)"
            className="w-full border border-ink-light rounded-md px-3 py-2.5 text-sm text-ink outline-none"
          />
        </div>

        {error && <p className="text-brand text-xs font-semibold mb-4">{error}</p>}

        <div className="flex justify-between items-center mb-5">
          <span className="text-sm font-bold text-ink">Total</span>
          <span className="font-heading font-extrabold text-lg text-ink">₹{Math.round(total / 100)}</span>
        </div>

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-brand text-white rounded-pill py-3.5 font-semibold text-sm disabled:opacity-50"
        >
          {loading ? 'Processing…' : `Pay ₹${Math.round(total / 100)} with Razorpay`}
        </button>
      </div>
    </>
  );
}
