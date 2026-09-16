import type { FaqItem } from "@/lib/data/faq";
import { IconChevronDown } from "@/components/ui/Icon";

/**
 * Acordeón con <details>/<summary>: accesible por teclado y funcional sin
 * JavaScript. Menos código, menos peso y un estado vacío imposible de romper.
 */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-steel-200 overflow-hidden rounded-2xl border border-steel-200 bg-white">
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 text-left font-semibold text-ink-900 transition-colors hover:bg-steel-50 [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <IconChevronDown
              size={20}
              className="mt-0.5 shrink-0 text-steel-400 transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <div className="px-5 pb-5 text-[0.95rem] leading-relaxed text-steel-600">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
