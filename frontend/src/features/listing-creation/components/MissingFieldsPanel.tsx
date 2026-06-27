import { cn } from '@/lib/utils';

interface MissingFieldsPanelProps {
  fields: string[];
  className?: string;
}

export function MissingFieldsPanel({ fields, className }: MissingFieldsPanelProps) {
  if (!fields.length) return null;

  return (
    <section
      className={cn(
        'rounded-2xl border border-harvest-gold/30 bg-harvest-gold/10 px-4 py-4',
        className,
      )}
      aria-label="Missing listing details"
    >
      <h2 className="font-heading text-base font-semibold text-deep-soil">
        A few details are still needed
      </h2>
      <ul className="mt-3 space-y-1 text-sm text-deep-soil">
        {fields.map((field) => (
          <li key={field} className="flex items-start gap-2">
            <span aria-hidden>•</span>
            {field}
          </li>
        ))}
      </ul>
    </section>
  );
}
