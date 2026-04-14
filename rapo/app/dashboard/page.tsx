export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {["Activities", "Data Subjects", "Completed", "Pending"].map((item) => (
          <div key={item} className="bg-white shadow rounded-2xl p-4">
            <p className="text-gray-500">{item}</p>
            <p className="text-xl font-semibold">0</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-2xl p-4">
        <input
          placeholder="Search..."
          className="border p-2 mb-4 w-full rounded"
        />
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th>Name</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sample Activity</td>
              <td>Pending</td>
              <td>2026-01-01</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
