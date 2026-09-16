import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { categories } from "@/lib/data/categories";
import { IconPlus, IconSearch } from "@/components/ui/Icon";

export default function NotFound() {
  return (
    <div className="container-mf py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-display text-6xl font-extrabold text-steel-200 sm:text-7xl">
          404
        </p>
        <h1 className="mt-4 text-3xl font-extrabold text-ink-900 sm:text-4xl">
          Esta página no existe
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-[1.02rem] leading-relaxed text-steel-600">
          Puede que la publicación se haya retirado o que el enlace esté mal
          escrito. Desde aquí puedes volver a buscar lo que necesitas.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <LinkButton href="/maquinaria" variant="primary" size="lg">
            <IconSearch size={19} />
            Buscar maquinaria
          </LinkButton>
          <LinkButton href="/publicar" variant="secondary" size="lg">
            <IconPlus size={19} />
            Publicar la mía
          </LinkButton>
        </div>

        <div className="mt-12 border-t border-steel-200 pt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-steel-500">
            Categorías más buscadas
          </h2>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {categories.slice(0, 8).map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/maquinaria/${category.slug}`}
                  className="inline-flex rounded-full border border-steel-300 bg-white px-3.5 py-1.5 text-sm font-medium text-steel-700 transition-colors hover:border-brand-300 hover:text-brand-800"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
