export default function SharedError({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="text-2xl font-bold text-destructive mb-2">Something went wrong</div>
      <div className="text-muted-foreground mb-4">{error.message || "An unexpected error occurred. Please try again."}</div>
      <button className="mt-2 px-4 py-2 bg-primary text-white rounded" onClick={() => window.location.reload()}>
        Reload Page
      </button>
    </div>
  );
} 