export default function Input(props: any) {
  return (
    <input
      {...props}
      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
    />
  )
}