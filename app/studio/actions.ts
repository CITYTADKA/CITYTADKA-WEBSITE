'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
    '-' +
    Math.random().toString(36).slice(2, 7)
  );
}

export async function createArticle(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const title_en = formData.get('title_en') as string;

  const { data, error } = await supabase
    .from('articles')
    .insert({
      title_en,
      title_gu: formData.get('title_gu') as string,
      body_en: formData.get('body_en') as string,
      body_gu: formData.get('body_gu') as string,
      category_id: formData.get('category_id') || null,
      area_id: formData.get('area_id') || null,
      status: formData.get('status') as string,
      slug: slugify(title_en),
      author_id: user.id,
      published_at: formData.get('status') === 'published' ? new Date().toISOString() : null
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error('Could not save article: ' + error?.message);
  }

  redirect('/studio');
}

export async function updateArticle(articleId: string, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const status = formData.get('status') as string;

  const { data: existing } = await supabase.from('articles').select('published_at').eq('id', articleId).single();

  const { error } = await supabase
    .from('articles')
    .update({
      title_en: formData.get('title_en') as string,
      title_gu: formData.get('title_gu') as string,
      body_en: formData.get('body_en') as string,
      body_gu: formData.get('body_gu') as string,
      category_id: formData.get('category_id') || null,
      area_id: formData.get('area_id') || null,
      status,
      published_at: status === 'published' ? existing?.published_at ?? new Date().toISOString() : existing?.published_at,
      updated_at: new Date().toISOString()
    })
    .eq('id', articleId);

  if (error) {
    throw new Error('Could not update article: ' + error.message);
  }

  redirect('/studio');
}

export async function deleteArticle(articleId: string) {
  const supabase = createClient();
  await supabase.from('articles').delete().eq('id', articleId);
  redirect('/studio');
}
