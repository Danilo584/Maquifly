"use client";

import { useState } from "react";
import { categories } from "@/lib/data/categories";
import { pricingUnitLabel } from "@/lib/format";
import { isBoostActive, plans } from "@/lib/plans";
import { getSupabase } from "@/lib/supabase";
import {
  dbErrorMessage,
  effectivePlan,
  machineStatusHelp,
  machineStatusLabel,
  type MyMachine,
  type MyOwner,
} from "@/lib/account";
import type { ListingStatus } from "@/lib/types";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { IconPlus } from "@/components/ui/Icon";
import { OwnerMachineEditor } from "@/components/account/OwnerMachineEditor";

const statusTone: Record<ListingStatus, BadgeTone> = {
  draft: "neutral",
  pending_review: "brand",
  published: "ok",
  paused: "warn",
  rejected: "danger",
  archived: "neutral",
};

export function MyMachines({
  owner,
  userId,
  machines,
  onChanged,
  goTo,
}: {
  owner: MyOwner;
  userId: string;
  machines: MyMachine[] | null;
  onChanged: () => Promise<void>;
  goTo: (tab: "plan") => void;
}) {
  const [editing, setEditing] = useState<MyMachine | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const plan = plans[effectivePlan(owner)];

  const list = machines ?? [];
  const published = list.filter((m) => m.status === "published").length;
  const atLimit = plan.maxMachines !== null && published >= plan.maxMachines;
  const visible = list.filter((m) => showArchived || m.status !== "archived");
  const archivedCount = list.length - list.filter((m) => m.status !== "archived").length;

  async function setStatus(m: MyMachine, status: ListingStatus) {
    setError(null);
    const { error: err } = await getSupabase()!.from("machines").update({ status }).eq("id", m.id);
    if (err) return setError(dbErrorMessage(err.message));
    await onChanged();
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-ink-900 sm:text-2xl">Mis máquinas</h2>
          <p className="mt-1 text-sm text-steel-600">
            {plan.maxMachines === null
              ? `Tienes ${published} publicada${published === 1 ? "" : "s"}. Con ${plan.name} no hay límite.`
              : `Tienes ${published} de ${plan.maxMachines} publicadas que permite ${plan.name}.`}
          </p>
        </div>
        <Button variant="primary" onClick={() => setEditing("new")}>
          <IconPlus size={18} />
          Agregar máquina
        </Button>
      </div>

      {atLimit && plan.id !== "pro" && (
        <Callout tone="warn" title="Llegaste al límite de tu plan">
          Puedes guardar más máquinas como borrador, pero para publicarlas necesitas un plan con más cupo.{" "}
          <button type="button" onClick={() => goTo("plan")} className="font-semibold text-brand-700 hover:underline">
            Ver planes
          </button>
        </Callout>
      )}

      {error && (
        <p role="alert" className="rounded-lg border border-danger-500/30 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {error}
        </p>
      )}

      {machines === null ? (
        <p className="text-sm text-steel-500">Cargando…</p>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-steel-300 bg-white px-6 py-12 text-center">
          <p className="font-bold text-ink-900">Todavía no agregas máquinas</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-steel-600">
            Agrega tu primera máquina con fotos reales. Cuando la envíes a revisión, MaquiFly la revisa y la publica.
          </p>
          <Button variant="primary" className="mt-5" onClick={() => setEditing("new")}>
            <IconPlus size={18} />
            Agregar máquina
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((m) => {
            const category = categories.find((c) => c.id === m.category_id);
            const cover = m.images[0];
            return (
              <li key={m.id} className="flex flex-col gap-4 rounded-2xl border border-steel-200 bg-white p-4 sm:flex-row sm:p-5">
                <div className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-ink-900 sm:w-40">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover.url} alt={cover.alt} className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-xs text-ink-300">Sin fotos</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={statusTone[m.status]} size="sm">
                      {machineStatusLabel[m.status]}
                    </Badge>
                    <span className="text-xs font-semibold text-steel-500">{m.reference}</span>
                    {isBoostActive(m.featured_until) && (
                      <Badge tone="volt" size="sm">
                        Destacado hasta {new Date(m.featured_until!).toLocaleDateString("es-PE")}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1.5 font-bold text-ink-900">{m.name}</p>
                  <p className="text-sm text-steel-500">
                    {category?.singular} · {m.brand} {m.model} · {m.area}
                  </p>
                  <p className="text-sm font-semibold text-ink-900">
                    {m.price ? `S/ ${m.price} ${pricingUnitLabel[m.pricing_unit]}` : "Consultar precio"}
                  </p>
                  <p className="mt-1 text-xs text-steel-500">{machineStatusHelp[m.status]}</p>

                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <button
                      type="button"
                      onClick={() => setEditing(m)}
                      className="rounded-lg bg-brand-600 px-3 py-1.5 font-semibold text-white hover:bg-brand-700"
                    >
                      Editar
                    </button>
                    {(m.status === "draft" || m.status === "rejected") && (
                      <button
                        type="button"
                        onClick={() => {
                          if (m.images.length === 0) return setError("Sube al menos una foto real antes de enviarla a revisión.");
                          setStatus(m, "pending_review");
                        }}
                        className="rounded-lg bg-ok-500 px-3 py-1.5 font-semibold text-white"
                      >
                        Enviar a revisión
                      </button>
                    )}
                    {m.status === "published" && (
                      <>
                        <a
                          href={`/maquina/${m.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-steel-300 px-3 py-1.5 font-semibold text-ink-800 hover:bg-steel-50"
                        >
                          Ver en la web
                        </a>
                        <button
                          type="button"
                          onClick={() => setStatus(m, "paused")}
                          className="rounded-lg border border-steel-300 px-3 py-1.5 font-semibold text-steel-700 hover:bg-steel-50"
                        >
                          Pausar
                        </button>
                      </>
                    )}
                    {m.status === "paused" && (
                      <button
                        type="button"
                        onClick={() => setStatus(m, "published")}
                        className="rounded-lg bg-ok-500 px-3 py-1.5 font-semibold text-white"
                      >
                        Reactivar
                      </button>
                    )}
                    {m.status === "archived" ? (
                      <button
                        type="button"
                        onClick={() => setStatus(m, "draft")}
                        className="rounded-lg border border-steel-300 px-3 py-1.5 font-semibold text-steel-700 hover:bg-steel-50"
                      >
                        Recuperar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Archivar «${m.name}»? Dejará de verse en la web. Puedes recuperarla después.`)) {
                            setStatus(m, "archived");
                          }
                        }}
                        className="rounded-lg border border-steel-300 px-3 py-1.5 font-semibold text-steel-600 hover:bg-steel-50"
                      >
                        Archivar
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {archivedCount > 0 && (
        <button
          type="button"
          onClick={() => setShowArchived((v) => !v)}
          className="self-start text-sm font-semibold text-steel-600 hover:text-ink-900"
        >
          {showArchived ? "Ocultar archivadas" : `Ver archivadas (${archivedCount})`}
        </button>
      )}

      {editing && (
        <OwnerMachineEditor
          owner={owner}
          userId={userId}
          machine={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await onChanged();
          }}
        />
      )}
    </section>
  );
}
