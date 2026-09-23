import { UniversityForm } from "@/components/admin/university-form";
import { UniversityTable } from "@/components/admin/university-table";
import { listUniversities } from "@/server/actions/universities";

export default async function UniversitiesPage() {
  let rows: Awaited<ReturnType<typeof listUniversities>> = [];
  let loadError = false;

  try {
    rows = await listUniversities(true);
  } catch {
    loadError = true;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Universities</h1>
        <p className="mt-2 max-w-[55ch] text-sm text-muted">
          Students pick from this list when registering a case.
        </p>
        {loadError ? (
          <p className="mt-3 text-sm font-bold text-danger" role="alert">
            Could not load universities. Run db:push and db:seed, then reload.
          </p>
        ) : null}
      </div>
      <div className="ui-card">
        <h2 className="mb-4 text-sm font-bold">Add university</h2>
        <UniversityForm />
      </div>
      <UniversityTable initial={rows} />
    </div>
  );
}
