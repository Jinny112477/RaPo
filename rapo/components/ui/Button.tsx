export default function Button({ children, variant = "default", size = "md" }: any) {
  const base = "rounded px-3 py-1.5 text-sm font-medium"

  const variants: any = {
    default: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    primary: "bg-red-600 hover:bg-red-700 text-white",
  }

  const sizes: any = {
    sm: "text-xs px-2 py-1",
    md: "",
  }

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]}`}>
      {children}
    </button>
  )
}