export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="skeleton h-10 w-56" />
      <div className="skeleton mt-3 h-4 w-96 max-w-full" />
      <div className="mt-8 flex gap-2">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-8 w-24 !rounded-full" />)}</div>
      <div className="card mt-4 space-y-4 p-5">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-8 w-full" />)}</div>
    </div>
  );
}
