// Shared error banner used across all auth forms.
// Replaces the duplicated inline SVG + paragraph pattern.

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="flex items-start gap-3 bg-error/10 border-l-4 border-error p-4 rounded-r-lg"
      aria-live="polite"
      role="alert"
    >
      <svg
        className="w-5 h-5 shrink-0 mt-0.5 text-error"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
      <p className="text-body-sm text-error font-medium">{message}</p>
    </div>
  );
}
