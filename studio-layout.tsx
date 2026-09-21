import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/studio');
  }

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();

  if (!profile || !['editor', 'admin'].includes(profile.role)) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-ink px-6 py-4 flex items-center justify-between">
        <a href="/studio" className="font-heading font-extrabold text-white text-lg">
          city<span className="text-brand">tadka</span> <span className="text-ink-dark font-medium text-sm">Studio</span>
        </a>
        <a href="/" className="text-ink-dark text-xs font-semibold">
          ← Back to site
        </a>
      </div>
      <div className="flex gap-1 px-6 py-3 bg-card border-b border-ink-light/10 overflow-x-auto">
        <a href="/studio" className="text-xs font-semibold text-ink px-3 py-2 rounded-md hover:bg-page">
          Articles
        </a>
        <a href="/studio/events" className="text-xs font-semibold text-ink-light px-3 py-2 rounded-md hover:bg-page">
          Events
        </a>
        <a href="/studio/offers" className="text-xs font-semibold text-ink-light px-3 py-2 rounded-md hover:bg-page">
          Offers
        </a>
      </div>
      <div className="p-6 max-w-3xl mx-auto">{children}</div>
    </div>
  );
}
