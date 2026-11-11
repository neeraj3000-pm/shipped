// Re-mounts on every navigation inside the app, giving each page a short entry animation.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page">{children}</div>;
}
