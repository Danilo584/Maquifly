import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Callout } from "@/components/ui/Callout";

export function LegalPage({
  title,
  updatedAt,
  intro,
  children,
}: {
  title: string;
  updatedAt: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <>
      <div className="border-b border-steel-200 bg-steel-50">
        <div className="container-mf py-3">
          <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: title }]} />
        </div>
      </div>

      <div className="container-mf py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-steel-500">
            Última actualización: {updatedAt}
          </p>
          <p className="mt-5 text-[1.02rem] leading-relaxed text-steel-700">{intro}</p>

          <Callout tone="warn" className="mt-6" title="Documento base pendiente de revisión legal">
            Este texto es un borrador de trabajo redactado para el MVP. Antes de
            operar comercialmente debe ser revisado y adaptado por un abogado,
            especialmente en lo relativo a protección de datos personales y
            responsabilidad de plataformas de intermediación en el Perú.
          </Callout>

          <div className="mt-10 flex flex-col gap-8">{children}</div>
        </div>
      </div>
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-extrabold text-ink-900">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-[0.98rem] leading-relaxed text-steel-700">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-2.5 size-1.5 shrink-0 rounded-full bg-volt-500"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
