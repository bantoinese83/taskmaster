export default function Loading() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-8 w-60 bg-muted animate-pulse rounded-md" />
        <div className="h-10 w-44 bg-muted animate-pulse rounded-md" />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-md border p-6 h-[400px] bg-muted/20 animate-pulse" />
          ))}
        </div>
        <div className="rounded-md border p-6 h-[400px] bg-muted/20 animate-pulse" />
      </div>
    </div>
  )
}
