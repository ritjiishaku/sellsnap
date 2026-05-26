type Rule = { label: string; test: (p: string) => boolean };

const rules: Rule[] = [
  { label: 'Must contain a number', test: (p) => /\d/.test(p) },
  { label: 'Must contain an uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Must contain a special character', test: (p) => /[!@#$%^&*(),.?":{}|<>`~\-_=+[\];'\\\/]/.test(p) },
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
];

export function PasswordRules({ password }: { password: string }) {
  const firstUnmet = rules.findIndex((r) => !r.test(password));

  if (firstUnmet === -1) return null;

  const current = rules[firstUnmet];

  return (
    <p className="text-body-sm text-ink-muted animate-in fade-in slide-in-from-top-1 duration-300">
      {current.label}
    </p>
  );
}
