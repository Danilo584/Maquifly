"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { categories } from "@/lib/data/categories";
import { availabilityLabel, fuelLabel, pricingUnitLabel } from "@/lib/format";
import { isBoostActive, plans } from "@/lib/plans";
import { photoUrl, PHOTO_BUCKET } from "@/lib/supabase";
import type {
  AvailabilityStatus,
  FuelResponsibility,
  ListingStatus,
  MachineImage,
  PricingUnit,
} from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import type { TabProps } from "@/components/admin/AdminApp";
import {
  Card,
  db,
  Empty,
  ErrorNote,
  makeSlug,
  Modal,
  Panel,
  piuraDistricts,
} from "@/components/admin/admin-shared";
import { fetchOwners, OwnerEditor, planIsActive, type OwnerRow } from "@/components/admin/tabs/OwnersTab";

export type MachineRow = {
  id: string;
  reference: string;
  slug: string;
  owner_id: string;
  category_id: string;
  name: string;
  brand: string;
  model: string;
  year: number | null;
  description: string;
  location_id: string;
  area: string;
  price: number | null;
  currency: "PEN" | "USD";
  pricing_unit: PricingUnit;
  minimum_rental: string | null;
  operator_available: boolean;
  operator_included_in_price: boolean;
  transport_available: boolean;
  transport_included_in_price: boolean;
  fuel: FuelResponsibility;
  availability: AvailabilityStatus;
  availability_note: string | null;
  specs: Array<{ label: string; value: string }>;
  images: MachineImage[];
  status: ListingStatus;
  featured_until: string | null;
  created_at: string;
};

const statusLabel: Partial<Record<ListingStatus, string>> = {
  draft: "Borrador",
  pending_review: "Por revisar",
  published: "Publicada",
  paused: "Pausada",
  rejected: "Rechazada",
  archived: "Archivada",
};

export function MachinesTab({ onChange }: TabProps) {
  const [items, setItems] = useState<MachineRow[] | null>(null);
  const [owners, setOwners] = useState<OwnerRow[]>([]);
  const [editing, setEditing] = useState<MachineRow | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ data, error: err }, ownerList] = await Promise.all([
      db().from("machines").select("*").order("created_at", { ascending: false }),
      fetchOwners(),
    ]);
    if (err) setError(err.message);
    setItems((data as MachineRow[]) ?? []);
    setOwners(ownerList);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const ownerName = (id: string) => owners.find((o) => o.id === id)?.business_name ?? "—";

  async function setStatus(m: MachineRow, status: ListingStatus) {
    setError(null);
    const { error: err } = await db().from("machines").update({ status }).eq("id", m.id);
    if (err) return setError(err.message);
    await load();
    onChange();
  }

  return (
    <Panel
      title="Máquinas"
      description="Crea, edita, publica o pausa cualquier máquina. Lo publicado aparece en la web en menos de un minuto."
      actions={
        <Button variant="primary" size="sm" onClick={() => setEditing("new")}>
          + Nueva máquina
        </Button>
      }
    >
      <ErrorNote message={error} />
      {items === null ? (
        <p className="text-sm text-steel-500">Cargando…</p>
      ) : items.length === 0 ? (
        <Empty>Todavía no hay máquinas. Pulsa «+ Nueva máquina» para publicar la primera.</Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((m) => {
            const category = categories.find((c) => c.id === m.category_id);
            const cover = m.images[0];
            return (
              <li key={m.id}>
                <Card className="flex flex-col gap-4 sm:flex-row">
                  <div className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-ink-900 sm:w-36">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover.url} alt={cover.alt} className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs text-ink-300">Sin fotos</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={m.status === "published" ? "ok" : m.status === "paused" ? "warn" : "neutral"} size="sm">
                        {statusLabel[m.status] ?? m.status}
                      </Badge>
                      <span className="text-xs font-semibold text-steel-500">{m.reference}</span>
                      {isBoostActive(m.featured_until) && (
                        <Badge tone="volt" size="sm">
                          Destacado hasta {new Date(m.featured_until!).toLocaleDateString("es-PE")}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 font-bold text-ink-900">{m.name}</p>
                    <p className="text-sm text-steel-500">
                      {category?.singular} · {m.brand} {m.model} · {m.area} · {ownerName(m.owner_id)}
                    </p>
                    <p className="text-sm font-semibold text-ink-900">
                      {m.price ? `S/ ${m.price} ${pricingUnitLabel[m.pricing_unit]}` : "Consultar precio"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      <button type="button" onClick={() => setEditing(m)} className="rounded-lg bg-brand-600 px-3 py-1.5 font-semibold text-white hover:bg-brand-700">
                        Editar
                      </button>
                      {m.status !== "published" ? (
                        <button type="button" onClick={() => setStatus(m, "published")} className="rounded-lg bg-ok-500 px-3 py-1.5 font-semibold text-white">
                          Publicar
                        </button>
                      ) : (
                        <>
                          <a href={`/maquina/${m.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-steel-300 px-3 py-1.5 font-semibold text-ink-800 hover:bg-steel-50">
                            Ver en la web
                          </a>
                          <button type="button" onClick={() => setStatus(m, "paused")} className="rounded-lg border border-steel-300 px-3 py-1.5 font-semibold text-steel-600 hover:bg-steel-50">
                            Pausar
                          </button>
                        </>
                      )}
                      {m.status !== "archived" && m.status !== "published" && (
                        <button type="button" onClick={() => setStatus(m, "archived")} className="rounded-lg border border-steel-300 px-3 py-1.5 font-semibold text-steel-600 hover:bg-steel-50">
                          Archivar
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <MachineEditor
          machine={editing === "new" ? null : editing}
          owners={owners}
          onOwnersChanged={async () => setOwners(await fetchOwners())}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await load();
            onChange();
          }}
        />
      )}
    </Panel>
  );
}

type Draft = Omit<MachineRow, "id" | "reference" | "slug" | "status" | "featured_until" | "created_at" | "price" | "year"> & {
  price: string;
  year: string;
  specsText: string;
};

export function MachineEditor({
  machine,
  owners,
  initial,
  onOwnersChanged,
  onClose,
  onSaved,
}: {
  machine: MachineRow | null;
  owners: OwnerRow[];
  initial?: Partial<Draft>;
  onOwnersChanged: () => void;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Draft>(() => ({
    owner_id: machine?.owner_id ?? initial?.owner_id ?? owners[0]?.id ?? "",
    category_id: machine?.category_id ?? initial?.category_id ?? "cat-minicargadores",
    name: machine?.name ?? initial?.name ?? "",
    brand: machine?.brand ?? initial?.brand ?? "",
    model: machine?.model ?? initial?.model ?? "",
    year: machine?.year ? String(machine.year) : (initial?.year ?? ""),
    description: machine?.description ?? initial?.description ?? "",
    location_id: "loc-piura",
    area: machine?.area ?? initial?.area ?? "",
    price: machine?.price ? String(machine.price) : (initial?.price ?? ""),
    currency: "PEN",
    pricing_unit: machine?.pricing_unit ?? initial?.pricing_unit ?? "hour",
    minimum_rental: machine?.minimum_rental ?? initial?.minimum_rental ?? "",
    operator_available: machine?.operator_available ?? initial?.operator_available ?? true,
    operator_included_in_price: machine?.operator_included_in_price ?? initial?.operator_included_in_price ?? true,
    transport_available: machine?.transport_available ?? initial?.transport_available ?? false,
    transport_included_in_price: machine?.transport_included_in_price ?? initial?.transport_included_in_price ?? false,
    fuel: machine?.fuel ?? initial?.fuel ?? "owner",
    availability: machine?.availability ?? initial?.availability ?? "available",
    availability_note: machine?.availability_note ?? initial?.availability_note ?? "",
    specs: [],
    specsText: (machine?.specs ?? []).map((s) => `${s.label}: ${s.value}`).join("\n"),
    images: machine?.images ?? initial?.images ?? [],
  }));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newOwner, setNewOwner] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const folder = useRef(`machines/${machine?.id ?? crypto.randomUUID()}`);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setForm((f) => ({ ...f, [key]: value }));
  const owner = owners.find((o) => o.id === form.owner_id);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    const added: MachineImage[] = [];
    for (const file of Array.from(files).slice(0, 10)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) {
        setError(`«${file.name}» pesa más de 5 MB. Redúcela o mándala por WhatsApp para comprimirla.`);
        continue;
      }
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${folder.current}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const { error: err } = await db().storage.from(PHOTO_BUCKET).upload(path, file, { contentType: file.type });
      if (err) {
        setError(err.message);
        continue;
      }
      added.push({ url: photoUrl(path), alt: `${form.name || "Maquinaria"} en ${form.area || "Piura"}`, isPlaceholder: false });
    }
    setForm((f) => ({ ...f, images: [...f.images, ...added] }));
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
  }

  function moveImage(index: number, dir: -1 | 1) {
    setForm((f) => {
      const images = [...f.images];
      const target = index + dir;
      if (target < 0 || target >= images.length) return f;
      [images[index], images[target]] = [images[target], images[index]];
      return { ...f, images };
    });
  }

  async function save(publish: boolean) {
    if (!form.owner_id) return setError("Elige el propietario.");
    if (form.name.trim().length < 3) return setError("Escribe el nombre de la publicación (ej. «Minicargador Bobcat S450»).");
    if (!form.brand.trim() || !form.model.trim()) return setError("Completa marca y modelo (si no lo sabes, pon «Por confirmar»).");
    if (!form.area.trim()) return setError("Indica la zona.");
    if (publish && form.images.length === 0) return setError("Sube al menos una foto real antes de publicar.");

    const price = form.price.trim() ? Number(form.price) : null;
    if (price !== null && (!Number.isFinite(price) || price <= 0)) return setError("Precio no válido.");
    const year = form.year.trim() ? Number(form.year) : null;

    const specs = form.specsText
      .split("\n")
      .map((line) => line.split(":"))
      .filter((parts) => parts.length >= 2 && parts[0].trim() && parts.slice(1).join(":").trim())
      .map((parts) => ({ label: parts[0].trim(), value: parts.slice(1).join(":").trim() }));

    const payload = {
      owner_id: form.owner_id,
      category_id: form.category_id,
      name: form.name.trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      year,
      description: form.description.trim(),
      location_id: form.location_id,
      area: form.area.trim(),
      price,
      currency: "PEN",
      pricing_unit: price === null ? "on_request" : form.pricing_unit === "on_request" ? "hour" : form.pricing_unit,
      minimum_rental: form.minimum_rental?.trim() || null,
      operator_available: form.operator_available,
      operator_included_in_price: form.operator_available && form.operator_included_in_price,
      transport_available: form.transport_available,
      transport_included_in_price: form.transport_available && form.transport_included_in_price,
      fuel: form.fuel,
      availability: form.availability,
      availability_note: form.availability_note?.trim() || null,
      specs,
      images: form.images,
      ...(publish ? { status: "published" } : machine ? {} : { status: "draft" }),
    };

    setBusy(true);
    setError(null);
    const result = machine
      ? await db().from("machines").update(payload).eq("id", machine.id)
      : await db()
          .from("machines")
          .insert({ ...payload, slug: makeSlug(form.name, form.area) });
    setBusy(false);
    if (result.error) return setError(result.error.message);
    onSaved();
  }

  return (
    <Modal title={machine ? `Editar · ${machine.reference}` : "Nueva máquina"} onClose={onClose} wide>
      <div className="flex flex-col gap-5">
        {/* Propietario */}
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field label="Propietario" htmlFor="m-owner" required>
            <Select id="m-owner" value={form.owner_id} onChange={(e) => set("owner_id", e.target.value)}>
              {owners.length === 0 && <option value="">— Crea un propietario primero —</option>}
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.business_name} ({planIsActive(o) ? plans[o.plan].name : "Fly Start"})
                </option>
              ))}
            </Select>
          </Field>
          <Button variant="secondary" size="md" onClick={() => setNewOwner(true)}>
            + Propietario
          </Button>
        </div>
        {owner && (
          <p className="-mt-3 text-xs text-steel-500">
            {planIsActive(owner)
              ? `Plan ${plans[owner.plan].name}: hasta ${plans[owner.plan].maxMachines ?? "∞"} máquinas, WhatsApp directo.`
              : "Fly Start: hasta 2 máquinas publicadas; los clientes escriben a MaquiFly."}
          </p>
        )}

        {/* Datos principales */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Categoría" htmlFor="m-cat" required>
            <Select id="m-cat" value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.singular}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Título de la publicación" htmlFor="m-name" required hint="Ej. Minicargador Bobcat S450 con operador">
            <Input id="m-name" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={90} />
          </Field>
          <Field label="Marca" htmlFor="m-brand" required>
            <Input id="m-brand" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Modelo" htmlFor="m-model" required>
              <Input id="m-model" value={form.model} onChange={(e) => set("model", e.target.value)} />
            </Field>
            <Field label="Año" htmlFor="m-year">
              <Input id="m-year" inputMode="numeric" value={form.year} onChange={(e) => set("year", e.target.value)} maxLength={4} />
            </Field>
          </div>
          <Field label="Zona" htmlFor="m-area" required hint="Distrito de Piura">
            <Input id="m-area" list="m-districts" value={form.area} onChange={(e) => set("area", e.target.value)} />
            <datalist id="m-districts">
              {piuraDistricts.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </Field>
          <Field label="Disponibilidad" htmlFor="m-av">
            <Select id="m-av" value={form.availability} onChange={(e) => set("availability", e.target.value as AvailabilityStatus)}>
              {(Object.keys(availabilityLabel) as AvailabilityStatus[]).map((k) => (
                <option key={k} value={k}>
                  {availabilityLabel[k]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {/* Precio */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Precio (S/)" htmlFor="m-price" hint="Vacío = «Consultar precio»">
            <Input id="m-price" inputMode="decimal" value={form.price} onChange={(e) => set("price", e.target.value)} />
          </Field>
          <Field label="Por" htmlFor="m-unit">
            <Select id="m-unit" value={form.pricing_unit} onChange={(e) => set("pricing_unit", e.target.value as PricingUnit)}>
              {(["hour", "day", "week", "month", "trip"] as PricingUnit[]).map((u) => (
                <option key={u} value={u}>
                  {pricingUnitLabel[u]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Mínimo" htmlFor="m-min" hint="Ej. 4 horas">
            <Input id="m-min" value={form.minimum_rental ?? ""} onChange={(e) => set("minimum_rental", e.target.value)} />
          </Field>
        </div>

        {/* Condiciones */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Checkbox id="m-op" label="Con operador" checked={form.operator_available} onChange={(e) => set("operator_available", e.target.checked)} />
          {form.operator_available && (
            <Checkbox
              id="m-opinc"
              label="Operador incluido en el precio"
              checked={form.operator_included_in_price}
              onChange={(e) => set("operator_included_in_price", e.target.checked)}
            />
          )}
          <Checkbox id="m-tr" label="Ofrece transporte a la obra" checked={form.transport_available} onChange={(e) => set("transport_available", e.target.checked)} />
          {form.transport_available && (
            <Checkbox
              id="m-trinc"
              label="Transporte incluido en el precio"
              checked={form.transport_included_in_price}
              onChange={(e) => set("transport_included_in_price", e.target.checked)}
            />
          )}
        </div>
        <Field label="Combustible" htmlFor="m-fuel">
          <Select id="m-fuel" value={form.fuel} onChange={(e) => set("fuel", e.target.value as FuelResponsibility)}>
            {(Object.keys(fuelLabel) as FuelResponsibility[]).map((k) => (
              <option key={k} value={k}>
                {fuelLabel[k]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Descripción" htmlFor="m-desc" hint="Para qué sirve, estado, qué incluye">
          <Textarea id="m-desc" value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={1500} />
        </Field>
        <Field label="Especificaciones (opcional)" htmlFor="m-specs" hint="Una por línea: «Potencia: 74 HP»">
          <Textarea id="m-specs" className="min-h-20" value={form.specsText} onChange={(e) => set("specsText", e.target.value)} />
        </Field>

        {/* Fotos */}
        <div>
          <p className="text-sm font-semibold text-ink-900">Fotos reales</p>
          <p className="text-xs text-steel-500">La primera es la portada. Máx. 5 MB cada una.</p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {form.images.map((img, i) => (
              <div key={img.url} className="relative overflow-hidden rounded-lg border border-steel-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} className="aspect-square w-full object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-volt-400 px-1.5 text-[0.65rem] font-bold text-ink-950">Portada</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink-950/70 px-1 py-0.5 text-xs text-white">
                  <button type="button" aria-label="Mover a la izquierda" onClick={() => moveImage(i, -1)} className="px-1">‹</button>
                  <button
                    type="button"
                    aria-label="Quitar foto"
                    onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                    className="px-1"
                  >
                    ✕
                  </button>
                  <button type="button" aria-label="Mover a la derecha" onClick={() => moveImage(i, 1)} className="px-1">›</button>
                </div>
              </div>
            ))}
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-steel-300 text-center text-xs font-semibold text-steel-600 hover:border-brand-500">
              {uploading ? "Subiendo…" : "+ Agregar fotos"}
              <input ref={fileInput} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => upload(e.target.files)} />
            </label>
          </div>
        </div>

        <ErrorNote message={error} />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="secondary" onClick={() => save(false)} disabled={busy || uploading}>
            {machine ? "Guardar cambios" : "Guardar como borrador"}
          </Button>
          {machine?.status !== "published" && (
            <Button variant="primary" onClick={() => save(true)} disabled={busy || uploading}>
              {busy ? "Guardando…" : "Guardar y publicar"}
            </Button>
          )}
        </div>
      </div>

      {newOwner && (
        <OwnerEditor
          owner={null}
          onClose={() => setNewOwner(false)}
          onSaved={async (id) => {
            setNewOwner(false);
            await onOwnersChanged();
            set("owner_id", id);
          }}
        />
      )}
    </Modal>
  );
}
