export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      {/* Header placeholder */}
      <section className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-white/15 skeleton" />
          <div className="h-6 w-48 bg-white/15 skeleton" />
        </div>
        <div className="h-8 w-20 bg-white/15 skeleton" /></div>
      </section>

      {/* List placeholders */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="glass-card p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-5 bg-white/15 skeleton" />
            <div className="h-5 w-32 bg-white/15 skeleton" />
          </div>
          <div className="h-3 w-3/4 bg-white/15 skeleton" />
        </div>
      ))}
    </main>
  );
}
