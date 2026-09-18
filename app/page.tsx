import { createClient } from '@/lib/supabase/server';

const categoryColor: Record<string, string> = {
  food: 'bg-food text-ink',
  fashion: 'bg-fashion text-white',
  heritage: 'bg-heritage text-ink',
  business: 'bg-business text-white',
  updates: 'bg-updates text-white'
};

export default async function HomePage() {
  const supabase = createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_en, slug')
    .eq('type', 'article')
    .order('name_en');

  const { data: articles } = await supabase
    .from('articles')
    .select('id, title_en, slug, category:categories(name_en, slug)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(6);

  return (
    <main>
      <header className="bg-ink px-6 py-5 flex items-center justify-between">
        <img src="/citytadka-logo.png" alt="City Tadka" className="h-6" />
        <div className="text-ink-dark text-sm">Surat</div>
      </header>

      <div className="flex gap-2 overflow-x-auto px-6 py-4">
        {(categories ?? []).map((c) => (
          <span
            key={c.id}
            className={`flex-none text-[11px] font-semibold uppercase tracking-wide px-3.5 py-1.5 rounded-pill ${
              categoryColor[c.slug] ?? 'bg-white text-ink border border-ink-light'
            }`}
          >
            {c.name_en}
          </span>
        ))}
      </div>

      <section className="px-6 py-4">
        <h2 className="font-heading font-bold text-lg text-ink mb-3">Trending Now</h2>

        {(!articles || articles.length === 0) && (
          <div className="bg-card
