import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 md:px-6 lg:px-8 text-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FBF6 50%, #F0F5EC 100%)' }}>
      {/* Decorative background gradients */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-brand/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-brand/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand/[0.07] rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-content animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="space-y-6 md:space-y-8 lg:space-y-10">
          {/* Brand */}
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="SellSnap" className="h-logo w-auto" />
          </Link>

          {/* Hero */}
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-hero text-on-surface">
              Turn a link into a sale<br />
              <span className="text-brand">in seconds.</span>
            </h1>
            <p className="text-hero-sub text-on-surface-variant max-w-sm mx-auto leading-relaxed">
              Share on WhatsApp. Get paid instantly. No store needed.
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="mt-10 md:mt-14 lg:mt-16">
          <Link
            href="/auth?mode=signup"
            className="flex h-cta w-full md:w-auto md:inline-flex items-center justify-center rounded-sm bg-primary font-bold text-on-primary transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
