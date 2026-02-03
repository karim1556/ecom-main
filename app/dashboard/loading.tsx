export default function DashboardLoading() {
  return (
    <div className="p-6 lg:p-8">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-2" />
        <div className="h-4 w-64 bg-muted rounded mb-8" />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>

        <div className="h-96 bg-muted rounded-lg" />
      </div>
    </div>
  )
}
