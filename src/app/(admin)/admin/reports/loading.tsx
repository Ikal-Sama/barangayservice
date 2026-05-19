export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      {/* Header placeholder */}
      <section className="mb-6 flex items-center gap-4">
        <div className="h-8 w-24 bg-white/15 skeleton" />
        <div className="h-6 w-48 bg-white/15 skeleton" />
      </section>

      {/* Metric cards */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="h-5 w-24 bg-white/15 skeleton mb-2" />
            <div className="h-10 w-full bg-white/15 skeleton" />
          </div>
        ))}
      </section>

      {/* Filter bar */}
      <section className="flex flex-col gap-3 md:flex-row md:items-center mb-6">
        <div className="flex-1 h-10 bg-white/15 skeleton" />
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-white/15 skeleton" />
          <div className="h-10 w-28 bg-white/15 skeleton" />
        </div>
      </section>

      {/* List placeholders */}
      <section className="space-y-3 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-4 flex flex-col gap-2">
            <div className="h-4 w-1/3 bg-white/15 skeleton" />
            <div className="h-4 w-2/3 bg-white/15 skeleton" />
            <div className="h-4 w-1/4 bg-white/15 skeleton" />
          </div>
        ))}
      </section>

      {/* Side panel placeholder */}
      <aside className="glass-card p-5">
        <div className="h-6 w-24 bg-white/15 skeleton mb-2" />
        <div className="h-4 w-3/4 bg-white/15 skeleton mb-1" />
        <div className="h-4 w-1/2 bg-white/15 skeleton mb-1" />
        <div className="h-12 w-full bg-white/15 skeleton" />
      </aside>
    </main>
  );
}
