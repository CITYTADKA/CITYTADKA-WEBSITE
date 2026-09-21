import { createClient } from '@/lib/supabase/server';
import ArticleForm from '@/components/ArticleForm';
import { createArticle } from '@/app/studio/actions';

export default async function NewArticlePage() {
  const supabase = createClient();
  const { data: categories } = await supabase.from('categories').select('id, name_en').eq('type', 'article');
  const { data: areas } = await supabase.from('areas').select('id, name_en');

  return (
    <div>
      <div className="font-heading font-bold text-xl text-ink mb-5">New Article</div>
      <ArticleForm categories={categories ?? []} areas={areas ?? []} action={createArticle} />
    </div>
  );
}
