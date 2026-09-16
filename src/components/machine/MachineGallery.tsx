"use client";

import Image from "next/image";
import { useState } from "react";
import type { MachineImage } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { IconCamera } from "@/components/ui/Icon";

export function MachineGallery({
  images,
  title,
  isDemo,
}: {
  images: MachineImage[];
  title: string;
  isDemo: boolean;
}) {
  const [index, setIndex] = useState(0);
  const current = images[index];

  if (!current) {
    return (
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-steel-300 bg-steel-50 text-steel-500">
        <IconCamera size={28} />
        <p className="text-sm font-medium">Esta publicación aún no tiene fotografías</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-900 sm:aspect-[16/10]">
        <Image
          src={current.url}
          alt={current.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          unoptimized={!current.url.startsWith("/")}
          /* Las ilustraciones se muestran completas (contain); las fotos
             reales llenan el marco (cover). */
          className={current.isPlaceholder ? "object-contain" : "object-cover"}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {isDemo && (
            <Badge tone="demo" title="Publicación de demostración">
              DEMO
            </Badge>
          )}
          {current.isPlaceholder && (
            <Badge tone="dark">Ilustración referencial · sin fotos reales</Badge>
          )}
        </div>
        {images.length > 1 && (
          <p className="absolute bottom-3 right-3 rounded-full bg-ink-950/70 px-2.5 py-1 text-xs font-semibold text-white">
            {index + 1} / {images.length}
          </p>
        )}
      </div>

      {images.length > 1 && (
        <ul className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <li key={image.url}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ver imagen ${i + 1} de ${images.length}`}
                aria-current={i === index}
                className={`relative size-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:size-24 ${
                  i === index
                    ? "border-brand-600"
                    : "border-transparent hover:border-steel-300"
                }`}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {current.isPlaceholder && (
        <p className="text-xs leading-relaxed text-steel-500">
          MaquiFly no usa fotografías de catálogo para representar máquinas
          concretas. Mientras el propietario no suba sus propias fotos, la
          publicación muestra una ilustración marcada como referencial: {title}.
        </p>
      )}
    </div>
  );
}
