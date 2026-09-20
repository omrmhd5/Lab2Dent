import { listCategories } from "@/server/actions/categories";
import { CategoryForm } from "@/components/admin/category-form";

export default async function CategoriesPage() {
  const rows = await listCategories(true);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="mt-2 max-w-[55ch] text-sm text-muted">
          Students see active names and prices on the new case form.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-medium">Add category</h2>
        <CategoryForm />
      </div>
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl border border-border bg-surface p-5">
            <CategoryForm category={row} />
          </li>
        ))}
      </ul>
    </div>
  );
}
