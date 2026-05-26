export function ProfileIllustration() {
  return (
    <svg width="180" height="130" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Phone outline */}
      <rect x="30" y="2" width="140" height="168" rx="18" className="stroke-border" strokeWidth="2" fill="none" />
      {/* Product image placeholder — handbag icon */}
      <rect x="30" y="2" width="140" height="88" rx="18" className="fill-brand/10" />
      <path d="M82 50h36M88 44l-6 6M112 44l6 6M78 50c0-12 22-12 22 0M98 50c0 8 22 8 22 0" className="stroke-brand/40" strokeWidth="2" strokeLinecap="round" />
      <rect x="85" y="64" width="30" height="8" rx="4" className="fill-brand/30" />
      {/* Seller info row — avatar + name + status */}
      <circle cx="60" cy="106" r="10" className="fill-brand/15" />
      <circle cx="60" cy="102" r="4" className="fill-brand/30" />
      <ellipse cx="60" cy="112" rx="6" ry="3" className="fill-brand/15" />
      <rect x="76" y="102" width="40" height="3" rx="1.5" className="fill-ink-muted/50" />
      <rect x="76" y="109" width="22" height="2.5" rx="1.25" className="fill-ink-subtle/50" />
      {/* Product name */}
      <rect x="48" y="130" width="64" height="4" rx="2" className="fill-ink" />
      <rect x="48" y="138" width="40" height="4" rx="2" className="fill-ink/40" />
      {/* Price */}
      <rect x="48" y="148" width="36" height="6" rx="3" className="fill-brand" />
      {/* Pay Now button */}
      <rect x="48" y="159" width="104" height="6" rx="3" className="fill-brand" />
    </svg>
  );
}

export function StepTwoIllustration() {
  return (
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="30" y="15" width="60" height="50" rx="10" className="fill-brand/10 stroke-border" strokeWidth="1.5" />
      <path d="M55 30l-8 12 8 6" className="stroke-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M45 40h20" className="stroke-brand" strokeWidth="2" strokeLinecap="round" />
      <rect x="110" y="15" width="60" height="50" rx="10" className="fill-brand/10 stroke-border" strokeWidth="1.5" />
      <path d="M135 30l-8 12 8 6" className="stroke-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M125 40h20" className="stroke-brand" strokeWidth="2" strokeLinecap="round" />
      <rect x="50" y="75" width="100" height="60" rx="12" className="fill-brand/20" />
      <rect x="65" y="88" width="70" height="10" rx="5" className="fill-white/60" />
      <rect x="65" y="105" width="50" height="10" rx="5" className="fill-white/60" />
      <path d="M100 75v-3a8 8 0 0116 0v3" className="stroke-brand" strokeWidth="2" strokeLinecap="round" />
      <circle cx="108" cy="115" r="4" className="fill-brand" />
    </svg>
  );
}

export function StepThreeIllustration() {
  return (
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="100" cy="80" r="60" className="fill-brand/10" />
      <path d="M85 80l10 10 20-20" className="stroke-brand" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="60" y="40" width="80" height="8" rx="4" className="fill-border" />
      <rect x="65" y="55" width="70" height="8" rx="4" className="fill-border" />
      <rect x="75" y="115" width="50" height="25" rx="6" className="fill-brand/20 stroke-brand/30" strokeWidth="1.5" />
      <text x="100" y="132" textAnchor="middle" className="fill-brand text-[11px] font-bold" fontFamily="system-ui">NGN</text>
    </svg>
  );
}
