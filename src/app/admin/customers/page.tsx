import { listCustomers } from "@/server/actions/employees";

export default async function CustomersPage() {
  const rows = await listCustomers();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">University</th>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Orders</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const last = row.orders
                .map((order) => order.createdAt.getTime())
                .sort((a, b) => b - a)[0];
              return (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3 font-mono">{row.phone}</td>
                  <td className="px-4 py-3">{row.university.name}</td>
                  <td className="px-4 py-3">{row.studentNumber}</td>
                  <td className="px-4 py-3">
                    {row.orders.length}
                    {last
                      ? ` last ${new Date(last).toLocaleDateString("en-GB")}`
                      : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-sm text-muted">No customers yet.</p>
        ) : null}
      </div>
    </div>
  );
}
