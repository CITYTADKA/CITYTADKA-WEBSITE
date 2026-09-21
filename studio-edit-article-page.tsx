import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ArticleForm from '@/components/ArticleForm';
import { updateArticle, deleteArticle } from '@/app/studio/actions';

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: article } = await supabase.from('articles').select('*').eq('id', params.id).single();
  if (!article) notFound();

  const { data: categories } = await supabase.from('categories').select('id, name_en').eq('type', 'article');
  const { data: areas } = await supabase.from('areas').select('id, name_en');

  const boundUpdate = updateArticle.bind(null, article.id);
  const boundDelete = deleteArticle.bind(null, article.id);

  return (
    <div>
      <div className="font-heading font-bold text-xl text-ink mb-5">Edit Article</div>
      <ArticleForm
        categories={categories ?? []}
        areas={areas ?? []}
        initial={article}
        action={boundUpdate}
        deleteAction={boundDelete}
      />
    </div>
  );
}
