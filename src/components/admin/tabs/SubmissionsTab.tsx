"use client";

import { useCallback, useEffect, useState } from "react";
import { categoriesBySlug } from "@/lib/data/categories";
import { pricingUnitLabel } from "@/lib/format";
import { photoUrl } from "@/lib/supabase";
import { whatsappUrl } from "@/lib/whatsapp";
import type { AvailabilityStatus, FuelResponsibility, PricingUnit } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import type { TabProps } from "@/components/admin/AdminApp";
import { Card, db, Empty, ErrorNote, formatDateTime, makeSlug, normalizeWhatsapp, Panel } from "@/components/admin/admin-shared";
import { MachineEditor } from "@/components/admin/tabs/MachinesTab";
import { fetchOwners, type OwnerRow } from "@/components/admin/tabs/OwnersTab";

type Submission = {
  id: string;
  contact_name: string;
  whatsapp: string;
  data: Record<string, unknown>;
  photos: string[];
  status: "new" | "approved" | "rejected";
  created_at: string;
};

/**
 * Publicaciones enviadas desde /publicar. Al pulsar «Crear publicación» se
 * crea (o reutiliza, por WhatsApp) el propietario y se abre el editor de la
 * máquina con todos los datos y fotos ya cargados, para revisar y publicar.
 */
export function SubmissionsTab({ onChange }: TabProps) {
  const [items, setItems] = useState<Submission[] | null>(null);
  const [owners, setOwners] = useState<OwnerRow[]>([]);
  const [converting, setConverting] = useState<{ sub: Submission; ownerId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ data, error: err }, ownerList] = await Promise.all([
      db().from("listing_submissions").select("*").order("created_at", { ascending: false }).limit(200),
      fetchOwners(),
    ]);
    if (err) setError(err.message);
    setItems((data as Submission[]) ?? []);
    setOwners(ownerList);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: Submission["status"]) {
    await db().from("listing_submissions").update({ status }).eq("id", id);
    await load();
    onChange();
  }

  async function convert(sub: Submission) {
    setError(null);
    const whatsapp = normalizeWhatsapp(sub.whatsapp);
    let owner = owners.find((o) => o.whatsapp === whatsapp);
    if (!owner) {
      const { data, error: err } = await db()
        .from("owner_profiles")
        .insert({
          business_name: String(sub.data.ownerName ?? sub.contact_name),
          slug: makeSlug(String(sub.data.ownerName ?? sub.contact_name)),
          whatsapp,
          area: String(sub.data.area ?? "") || null,
          location_id: "loc-piura",
        })
        .select("*")
        .single();
      if (err) return setError(err.message);
      owner = data as OwnerRow;
      setOwners((list) => [...list, owner!]);
    }
    setConverting({ sub, ownerId: owner.id });
  }

  return (
    <Panel
      title="Publicaciones recibidas"
      description="Lo que los propietarios envían desde «Publicar maquinaria». Revisa los datos y fotos, y conviértelo en una publicación con un clic."
    >
      <ErrorNote message={error} />
      {items === null ? (
        <p className="text-sm text-steel-500">Cargando…</p>
      ) : items.length === 0 ? (
        <Empty>Aún no llegan publicaciones desde la web.</Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((s) => {
            const d = s.data as Record<string, string | number | boolean>;
            const category = categoriesBySlug.get(String(d.categorySlug));
            return (
              <li key={s.id}>
                <Card className={s.status === "new" ? "border-volt-500 ring-1 ring-volt-400" : ""}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={s.status === "new" ? "volt" : s.status === "approved" ? "ok" : "neutral"} size="sm">
                      {s.status === "new" ? "Nueva" : s.status === "approved" ? "Publicada" : "Rechazada"}
                    </Badge>
                    <span className="text-xs text-steel-500">{formatDateTime(s.created_at)}</span>
                  </div>
                  <p className="mt-1 font-bold text-ink-900">
                    {String(d.name ?? "Sin título")} · {category?.singular ?? d.categorySlug}
                  </p>
                  <p className="text-sm text-steel-600">
                    {String(d.brand ?? "")} {String(d.model ?? "")} {d.year ? `· ${d.year}` : ""} · {String(d.area ?? "")}
                  </p>
                  <p className="text-sm text-steel-600">
                    {d.price ? `S/ ${d.price} ${pricingUnitLabel[d.pricingUnit as PricingUnit] ?? ""}` : "Consultar precio"}
                    {d.operatorAvailable ? " · con operador" : ""}
                    {d.transportAvailable ? " · con transporte" : ""}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-900">
                    {s.contact_name} · {s.whatsapp}
                  </p>
                  {d.description && <p className="mt-2 line-clamp-3 text-sm text-steel-700">{String(d.description)}</p>}
                  {s.photos.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {s.photos.map((path) => (
                        <a key={path} href={photoUrl(path)} target="_blank" rel="noopener noreferrer" className="shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photoUrl(path)} alt="Foto enviada" className="size-20 rounded-lg object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    {s.status === "new" && (
                      <button type="button" onClick={() => convert(s)} className="rounded-lg bg-ok-500 px-3 py-1.5 font-semibold text-white">
                        Crear publicación
                      </button>
                    )}
                    <a
                      href={whatsappUrl(normalizeWhatsapp(s.whatsapp), `Hola ${s.contact_name}, te escribimos de MaquiFly por la máquina que publicaste.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-[#128C7E] px-3 py-1.5 font-semibold text-white"
                    >
                      WhatsApp
                    </a>
                    {s.status === "new" && (
                      <button type="button" onClick={() => setStatus(s.id, "rejected")} className="rounded-lg border border-steel-300 px-3 py-1.5 font-semibold text-steel-600">
                        Rechazar
                      </button>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {converting && (
        <MachineEditor
          machine={null}
          owners={owners}
          onOwnersChanged={async () => setOwners(await fetchOwners())}
          initial={submissionToDraft(converting.sub, converting.ownerId)}
          onClose={() => setConverting(null)}
          onSaved={async () => {
            await setStatus(converting.sub.id, "approved");
            setConverting(null);
          }}
        />
      )}
    </Panel>
  );
}

function submissionToDraft(sub: Submission, ownerId: string) {
  const d = sub.data as Record<string, string | number | boolean | undefined>;
  const category = categoriesBySlug.get(String(d.categorySlug));
  return {
    owner_id: ownerId,
    category_id: category?.id ?? "cat-minicargadores",
    name: String(d.name ?? ""),
    brand: String(d.brand ?? ""),
    model: String(d.model ?? ""),
    year: d.year ? String(d.year) : "",
    description: String(d.description ?? ""),
    area: String(d.area ?? ""),
    price: d.price ? String(d.price) : "",
    pricing_unit: (d.pricingUnit as PricingUnit) ?? "hour",
    minimum_rental: d.minimumRental ? String(d.minimumRental) : "",
    operator_available: Boolean(d.operatorAvailable),
    operator_included_in_price: Boolean(d.operatorIncludedInPrice),
    transport_available: Boolean(d.transportAvailable),
    transport_included_in_price: Boolean(d.transportIncludedInPrice),
    fuel: (d.fuel as FuelResponsibility) ?? "client",
    availability: (d.availability as AvailabilityStatus) ?? "available",
    availability_note: d.availabilityNote ? String(d.availabilityNote) : "",
    images: sub.photos.map((path) => ({
      url: photoUrl(path),
      alt: `${String(d.name ?? "Maquinaria")} en ${String(d.area ?? "Piura")}`,
      isPlaceholder: false,
    })),
  };
}
