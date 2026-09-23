import { CategoryGroupForm } from "@/components/admin/category-form";
import { CategoryTable } from "@/components/admin/category-table";
import { listCategories } from "@/server/actions/categories";

export default async function CategoriesPage() {
  let rows: Awaited<ReturnType<typeof listCategories>> = [];
  let loadError = false;

  try {
    rows = await listCategories(true);
  } catch {
    loadError = true;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="mt-2 max-w-[55ch] text-sm text-muted">
          Add a category, then open it to manage its subcategories.
        </p>
        {loadError ? (
          <p className="mt-3 text-sm font-bold text-danger" role="alert">
            Could not load categories. Run db:push, then reload.
          </p>
        ) : null}
      </div>
      <div className="ui-card">
        <h2 className="mb-4 text-sm font-bold">Add category</h2>
        <CategoryGroupForm />
      </div>
      <CategoryTable initial={rows} />
    </div>
  );
}
