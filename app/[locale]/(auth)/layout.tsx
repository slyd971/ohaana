export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-coconut flex flex-col">
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--turquoise), transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--coral), transparent 70%)' }}
        />
      </div>

      {/* Back to home */}
      <div className="relative px-4 pt-6">
        <a href="/" className="inline-flex items-center gap-1.5 text-sm text-stone hover:text-charcoal transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-display italic text-deep-green text-lg">Ohaana</span>
        </a>
      </div>

      <main className="relative flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  )
}
