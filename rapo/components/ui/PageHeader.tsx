export default function PageHeader({ title, subtitle, actions }: any) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="flex gap-2">{actions}</div>
    </div>
  )
}