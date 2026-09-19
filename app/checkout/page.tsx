import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CheckoutForm from '@/components/CheckoutForm';

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: { event?: string; tier?: string };
}) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const nextUrl = `/checkout?event=${searchParams.event}&tier=${searchParams.tier}`;
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextUrl)}`);
  }

  if (!searchParams.event || !searchParams.tier) {
    redirect('/events');
  }

  const { data: event } = await supabase
    .from('events')
    .select('id, title_en, venue_name, start_at')
    .eq('id', searchParams.event)
    .single();

  const { data: tier } = await supabase
    .from('ticket_tiers')
    .select('id, name_en, price_paise')
    .eq('id', searchParams.tier)
    .single();

  if (!event || !tier) redirect('/events');

  return (
    <main className="min-h-screen bg-page pb-10">
      <div className="bg-ink px-6 py-5 flex items-center gap-3.5">
        <a href={`/events/${event.id}`} className="text-white">
          ←
        </a>
        <div className="font-heading font-bold text-base text-white">Checkout</div>
      </div>

      <CheckoutForm event={event} tier={tier} />
    </main>
  );
}
