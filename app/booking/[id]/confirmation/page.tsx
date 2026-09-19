import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function ConfirmationPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: booking } = await supabase
    .from('bookings')
    .select(
      'id, quantity, amount_paise, payment_status, event:events(title_en, venue_name, start_at), tier:ticket_tiers(name_en)'
    )
    .eq('id', params.id)
    .single();

  if (!booking) notFound();

  const { data: tickets } = await supabase
    .from('tickets')
    .select('id, qr_token, status')
    .eq('booking_id', booking.id);

  const event: any = booking.event;
  const tier: any = booking.tier;

  return (
    <main className="min-h-screen bg-page flex flex-col items-center py-10 px-5">
      <div className="w-14 h-14 rounded-pill bg-business flex items-center justify-center mb-3.5">
        <span className="text-white text-2xl">✓</span>
      </div>
      <div className="font-heading font-extrabold text-xl text-ink">Booking Confirmed</div>
      <div className="text-sm text-ink-light mt-1 mb-7">Your tickets are ready below</div>

      <div className="flex flex-col gap-5 w-full max-w-sm">
        {(tickets ?? []).map((t, i) => (
          <div key={t.id} className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="bg-ink px-5 py-4">
              <div className="font-heading font-bold text-sm text-white">{event?.title_en}</div>
              <div className="text-xs text-ink-dark mt-0.5">
                {event?.start_at ? new Date(event.start_at).toLocaleString('en-IN') : ''} · {event?.venue_name}
              </div>
            </div>
            <div className="p-6 flex flex-col items-center border-b border-dashed border-[#C7CBD6]">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${t.qr_token}`}
                alt="Ticket QR code"
                className="w-[180px] h-[180px]"
              />
              <div className="text-xs text-ink-light mt-3 tracking-wider">
                {t.qr_token.slice(0, 8).toUpperCase()}
              </div>
            </div>
            <div className="px-5 py-4 flex justify-between text-xs text-ink">
              <div>
                <div className="text-ink-light">Ticket {i + 1} of {tickets?.length}</div>
                <div className="font-bold mt-0.5">{tier?.name_en}</div>
              </div>
              <div className="text-right">
                <div className="text-ink-light">Status</div>
                <div className="font-bold mt-0.5 uppercase text-business">{t.status}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <a
        href="/account"
        className="mt-7 bg-ink text-white rounded-pill px-7 py-3.5 text-sm font-semibold w-full max-w-sm text-center"
      >
        View My Tickets
      </a>
      <a href="/" className="mt-4 text-brand text-sm font-semibold">
        Back to Home
      </a>
    </main>
  );
}
