export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      {children}
    </div>
  )
}