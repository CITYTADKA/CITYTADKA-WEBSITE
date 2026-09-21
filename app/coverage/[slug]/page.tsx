import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: article } = await supabase
    .from('articles')
    .select('*, category:categories(name_en, slug)')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single();

  if (!article) {
    notFound();
  }

  return (
    <main className="px-6 py-6 max-w-2xl mx-auto">
      <a href="/" className="text-sm text-ink-light">
        &larr; Back
      </a>

      {article.category && (
        <div className="text-xs uppercase tracking-wide text-ink-light mt-4">
          {article.category.name_en}
        </div>
      )}

      <h1 className="font-heading font-bold text-2xl text-ink mt-2 mb-4">
        {article.title_en}
      </h1>

      {article.cover_image && (
        <img
          src={article.cover_image}
          alt={article.title_en}
          className="w-full rounded-md mb-4"
        />
      )}

      <div
        className="prose max-w-none text-ink"
        dangerouslySetInnerHTML={{
          __html: article.content_en ?? article.content ?? '',
        }}
      />
    </main>
  );
}
