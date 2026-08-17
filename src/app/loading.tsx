export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory-100">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-gold-500" />
        <p className="text-sm text-neutral-500">جارٍ التحميل…</p>
      </div>
    </div>
  );
}
