export default function Loading() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]" aria-busy="true" aria-label="Loading release">
      <div>
        <div className="skeleton h-4 w-48" />
        <div className="skeleton mt-6 h-16 w-full" />
        <div className="skeleton mt-8 h-12 w-4/5" />
        <div className="skeleton mt-4 h-7 w-28" />
        <div className="skeleton mt-6 h-6 w-full" />
        <div className="mt-10 space-y-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-12 w-full" />)}</div>
      </div>
      <div className="space-y-4 lg:pt-12"><div className="skeleton h-32 w-full" /><div className="skeleton h-48 w-full" /></div>
    </div>
  );
}
