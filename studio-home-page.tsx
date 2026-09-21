import { createClient } from '@/lib/supabase/server';

export default async function StudioHome() {
  const supabase = createClient();

  const { data: articles } = await supabase
    .from('articles')
    .select('id, title_en, status, category:categories(name_en), updated_at')
    .order('updated_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="font-heading font-bold text-xl text-ink">Articles</div>
        <a href="/studio/articles/new" className="bg-brand text-white rounded-pill px-5 py-2.5 text-sm font-semibold">
          + New Article
        </a>
      </div>

      {(!articles || articles.length === 0) && (
        <div className="bg-card rounded-md p-6 text-center text-ink-light text-sm border border-dashed border-ink-light/30">
          No articles yet — click "+ New Article" to publish your first one.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {(articles ?? []).map((a: any) => (
          <a
            key={a.id}
            href={`/studio/articles/${a.id}/edit`}
            className="flex items-center justify-between bg-card rounded-md shadow-sm p-3.5"
          >
            <div>
              <div className="font-heading font-bold text-sm text-ink">{a.title_en}</div>
              <div className="text-xs text-ink-light mt-0.5">{a.category?.name_en ?? 'Uncategorized'}</div>
            </div>
            <span
              className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-pill ${
                a.status === 'published' ? 'bg-business text-white' : 'bg-ink-light/20 text-ink-light'
              }`}
            >
              {a.status}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
