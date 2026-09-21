'use client';

export default function ArticleForm({
  categories,
  areas,
  initial,
  action,
  deleteAction
}: {
  categories: { id: string; name_en: string }[];
  areas: { id: string; name_en: string }[];
  initial?: any;
  action: (formData: FormData) => Promise<void>;
  deleteAction?: () => Promise<void>;
}) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold text-ink-light mb-1.5">Title (English)</label>
        <input
          name="title_en"
          required
          defaultValue={initial?.title_en ?? ''}
          className="w-full border border-ink-light/40 rounded-md px-3.5 py-2.5 text-sm text-ink outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink-light mb-1.5">Title (Gujarati) — optional</label>
        <input
          name="title_gu"
          defaultValue={initial?.title_gu ?? ''}
          className="w-full border border-ink-light/40 rounded-md px-3.5 py-2.5 text-sm text-ink outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-ink-light mb-1.5">Category</label>
          <select
            name="category_id"
            defaultValue={initial?.category_id ?? ''}
            className="w-full border border-ink-light/40 rounded-md px-3.5 py-2.5 text-sm text-ink outline-none bg-white"
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-light mb-1.5">Area</label>
          <select
            name="area_id"
            defaultValue={initial?.area_id ?? ''}
            className="w-full border border-ink-light/40 rounded-md px-3.5 py-2.5 text-sm text-ink outline-none bg-white"
          >
            <option value="">None</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name_en}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink-light mb-1.5">Body (English)</label>
        <textarea
          name="body_en"
          rows={8}
          defaultValue={initial?.body_en ?? ''}
          className="w-full border border-ink-light/40 rounded-md px-3.5 py-2.5 text-sm text-ink outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink-light mb-1.5">Body (Gujarati) — optional</label>
        <textarea
          name="body_gu"
          rows={6}
          defaultValue={initial?.body_gu ?? ''}
          className="w-full border border-ink-light/40 rounded-md px-3.5 py-2.5 text-sm text-ink outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink-light mb-1.5">Status</label>
        <select
          name="status"
          defaultValue={initial?.status ?? 'draft'}
          className="w-full border border-ink-light/40 rounded-md px-3.5 py-2.5 text-sm text-ink outline-none bg-white"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="flex gap-3 mt-2">
        <button type="submit" className="bg-brand text-white rounded-pill px-6 py-3 font-semibold text-sm">
          Save
        </button>
        {deleteAction && (
          <button
            formAction={deleteAction as any}
            className="text-ink-light text-sm font-semibold px-4"
            onClick={(e) => {
              if (!confirm('Delete this article? This cannot be undone.')) e.preventDefault();
            }}
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
