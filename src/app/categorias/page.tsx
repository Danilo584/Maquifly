import type { Metadata } from "next";
import { categories, familyLabels } from "@/lib/data/categories";
import { repository } from "@/lib/repository";
import { pageMetadata } from "@/lib/seo";
import { CategoryGrid } from "@/components/category/CategoryGrid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section } from "@/components/ui/Section";
import { LinkButton } from "@/components/ui/Button";
import { IconPlus } from "@/components/ui/Icon";
import type { MachineFamily } from "@/lib/types";

export const metadata: Metadata = pageMetadata({
  title: "Categorías de maquinaria y equipos en alquiler",
  description:
    "Todas las categorías de maquinaria y equipos disponibles en MaquiFly: maquinaria pesada, equipos ligeros, equipos agrícolas y equipos de apoyo.",
  path: "/categorias",
});

const familyOrder: MachineFamily[] = ["heavy", "support", "light", "agricultural"];

const familyIntro: Record<MachineFamily, string> = {
  heavy:
    "Equipos de movimiento de tierras, excavación, compactación y transporte. Son los de mayor costo por hora y donde más pesa acertar con la máquina correcta.",
  support:
    "Equipos que resuelven energía, altura y manejo de carga. Suelen alquilarse por día y acompañan a la maquinaria pesada en obra.",
  light:
    "Equipos de obra de menor porte, habituales en vivienda, saneamiento y acabados. Alquilarlos evita inmovilizar capital en herramientas de uso puntual.",
  agricultural:
    "Tractores e implementos para preparación de terreno, siembra y cosecha. Su demanda se concentra en ventanas de campaña muy marcadas.",
};

export default async function CategoriesPage() {
  const counts = await repository.countMachinesByCategory();

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950">
        <div className="grid-blueprint absolute inset-0" aria-hidden="true" />
        <div className="container-mf relative py-8 sm:py-12">
          <div className="[&_a]:text-ink-300 [&_a:hover]:text-volt-400 [&_span]:text-ink-100 [&_ol]:text-ink-400">
            <Breadcrumbs
              items={[{ label: "Inicio", href: "/" }, { label: "Categorías" }]}
            />
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Categorías de maquinaria y equipos
          </h1>
          <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-ink-200">
            Cada categoría tiene su propia página con los equipos publicados, los
            usos más frecuentes y lo que conviene tener claro antes de pedir una
            cotización.
          </p>
          <LinkButton href="/publicar" variant="volt" size="md" className="mt-6">
            <IconPlus size={18} />
            Publicar mi maquinaria
          </LinkButton>
        </div>
      </section>

      <Section tone="light">
        <div className="flex flex-col gap-14">
          {familyOrder.map((family) => {
            const items = categories.filter((c) => c.family === family);
            if (items.length === 0) return null;
            return (
              <div key={family}>
                <h2 className="text-2xl font-extrabold">{familyLabels[family]}</h2>
                <p className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-steel-600">
                  {familyIntro[family]}
                </p>
                <div className="mt-6">
                  <CategoryGrid items={items} counts={counts} showDescription />
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}
