export default function StatusBadge({ status }: any) {
  const map: any = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    inactive: "bg-gray-200 text-gray-600",
  }

  return (
    <span className={`px-2 py-1 rounded text-xs ${map[status] || map.inactive}`}>
      {status}
    </span>
  )
}