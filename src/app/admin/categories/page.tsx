import { listCategories } from "@/server/actions/categories";
import { CategoryForm } from "@/components/admin/category-form";
import { CategoryList } from "@/components/admin/category-list";

export default async function CategoriesPage() {
  const rows = await listCategories(true);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="mt-2 max-w-[55ch] text-sm text-muted">
          Students see active names and prices on the new case form.
        </p>
      </div>
      <div className="ui-card">
        <h2 className="mb-4 text-sm font-bold">Add category</h2>
        <CategoryForm />
      </div>
      <CategoryList initial={rows} />
    </div>
  );
}
