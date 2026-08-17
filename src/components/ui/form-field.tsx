import { cn } from '@/lib/utils';

export function FormField({
  label,
  htmlFor,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-charcoal-800">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-neutral-400">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}

export const inputClass = cn(
  'ds-focus-ring w-full rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm text-charcoal-900 placeholder:text-neutral-400 disabled:bg-neutral-50 disabled:text-neutral-400',
);
