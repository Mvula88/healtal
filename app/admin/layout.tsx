export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Simple layout - let individual pages handle their own auth if needed
  // This prevents redirect loops
  return <>{children}</>
}