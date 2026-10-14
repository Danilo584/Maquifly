"use client";

import { useRef, useState } from "react";
import { categories } from "@/lib/data/categories";
import { availabilityLabel, fuelLabel, pricingUnitLabel } from "@/lib/format";
import { getSupabase, photoUrl, PHOTO_BUCKET } from "@/lib/supabase";
import { dbErrorMessage, type MyMachine, type MyOwner } from "@/lib/account";
import type { AvailabilityStatus, FuelResponsibility, ListingStatus, MachineImage, PricingUnit } from "@/lib/types";
import { makeSlug, Modal, piuraDistricts } from "@/components/admin/admin-shared";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";

const MAX_PHOTOS = 10;
const MAX_BYTES = 5 * 1024 * 1024;

type Draft = {
  category_id: string;
  name: string;
  brand: string;
  model: string;
  year: string;
  description: string;
  area: string;
  price: string;
  pricing_unit: PricingUnit;
  minimum_rental: string;
  operator_available: boolean;
  operator_included_in_price: boolean;
  transport_available: boolean;
  transport_included_in_price: boolean;
  fuel: FuelResponsibility;
  availability: AvailabilityStatus;
  availability_note: string;
  specsText: string;
  images: MachineImage[];
};

/**
 * Editor de máquina para el propietario. Igual que el del panel de
 * administración, pero:
 *   · la máquina siempre es suya (no elige propietario);
 *   · no puede publicar directo: guarda borrador o envía a revisión;
 *   · las fotos van a su propia carpeta owners/<su id>/…
 * La base de datos refuerza todo esto (supabase/03-cuentas.sql).
 */
export function OwnerMachineEditor({
  owner,
  userId,
  machine,
  onClose,
  onSaved,
}: {
  owner: MyOwner;
  userId: string;
  machine: MyMachine | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Draft>(() => ({
    category_id: machine?.category_id ?? "cat-minicargadores",
    name: machine?.name ?? "",
    brand: machine?.brand ?? "",
    model: machine?.model ?? "",
    year: machine?.year ? String(machine.year) : "",
    description: machine?.description ?? "",
    area: machine?.area ?? owner.area ?? "",
    price: machine?.price ? String(machine.price) : "",
    pricing_unit: machine?.pricing_unit && machine.pricing_unit !== "on_request" ? machine.pricing_unit : "hour",
    minimum_rental: machine?.minimum_rental ?? "",
    operator_available: machine?.operator_available ?? true,
    operator_included_in_price: machine?.operator_included_in_price ?? true,
    transport_available: machine?.transport_available ?? false,
    transport_included_in_price: machine?.transport_included_in_price ?? false,
    fuel: machine?.fuel ?? "owner",
    availability: machine?.availability ?? "available",
    availability_note: machine?.availability_note ?? "",
    specsText: (machine?.specs ?? []).map((s) => `${s.label}: ${s.value}`).join("\n"),
    images: machine?.images ?? [],
  }));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const folder = useRef(`owners/${userId}/${machine?.id ?? crypto.randomUUID()}`);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setForm((f) => ({ ...f, [key]: value }));
  const isLive = machine?.status === "published" || machine?.status === "paused";

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    const room = MAX_PHOTOS - form.images.length;
    if (room <= 0) {
      setUploading(false);
      return setError(`Máximo ${MAX_PHOTOS} fotos por máquina.`);
    }
    const added: MachineImage[] = [];
    for (const file of Array.from(files).slice(0, room)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_BYTES) {
        setError(`«${file.name}» pesa más de 5 MB. Toma la foto en menor calidad o envíala por WhatsApp a MaquiFly.`);
        continue;
      }
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${folder.current}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const { error: err } = await getSupabase()!.storage.from(PHOTO_BUCKET).upload(path, file, { contentType: file.type });
      if (err) {
        setError(`No se pudo subir «${file.name}»: ${err.message}`);
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

  /** submit = enviar a revisión. Si ya está publicada o pausada, se guarda sin cambiar su estado. */
  async function save(submit: boolean) {
    if (form.name.trim().length < 3) return setError("Escribe el título de la publicación (ej. «Minicargador Bobcat S450»).");
    if (!form.brand.trim() || !form.model.trim()) return setError("Completa marca y modelo (si no lo sabes, pon «Por confirmar»).");
    if (!form.area.trim()) return setError("Indica la zona donde está la máquina.");
    if ((submit || isLive || machine?.status === "pending_review") && form.images.length === 0) return setError("Sube al menos una foto real de la máquina.");

    const price = form.price.trim() ? Number(form.price.replace(",", ".")) : null;
    if (price !== null && (!Number.isFinite(price) || price <= 0)) return setError("El precio no es válido.");
    const year = form.year.trim() ? Number(form.year) : null;
    if (year !== null && (!Number.isInteger(year) || year < 1970 || year > new Date().getFullYear() + 1)) {
      return setError("El año no es válido.");
    }

    const specs = form.specsText
      .split("\n")
      .map((line) => line.split(":"))
      .filter((parts) => parts.length >= 2 && parts[0].trim() && parts.slice(1).join(":").trim())
      .map((parts) => ({ label: parts[0].trim().slice(0, 60), value: parts.slice(1).join(":").trim().slice(0, 120) }));

    let status: ListingStatus | undefined;
    if (!machine) status = submit ? "pending_review" : "draft";
    else if (!isLive && machine.status !== "pending_review") status = submit ? "pending_review" : "draft";

    const payload = {
      category_id: form.category_id,
      name: form.name.trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      year,
      description: form.description.trim(),
      location_id: owner.location_id,
      area: form.area.trim(),
      price,
      currency: "PEN",
      pricing_unit: price === null ? "on_request" : form.pricing_unit,
      minimum_rental: form.minimum_rental.trim() || null,
      operator_available: form.operator_available,
      operator_included_in_price: form.operator_available && form.operator_included_in_price,
      transport_available: form.transport_available,
      transport_included_in_price: form.transport_available && form.transport_included_in_price,
      fuel: form.fuel,
      availability: form.availability,
      availability_note: form.availability_note.trim() || null,
      specs,
      images: form.images,
      ...(status ? { status } : {}),
    };

    setBusy(true);
    setError(null);
    const supabase = getSupabase()!;
    const result = machine
      ? await supabase.from("machines").update(payload).eq("id", machine.id)
      : await supabase.from("machines").insert({ ...payload, owner_id: owner.id, slug: makeSlug(form.name, form.area) });
    setBusy(false);
    if (result.error) return setError(dbErrorMessage(result.error.message));
    onSaved();
  }

  return (
    <Modal title={machine ? `Editar · ${machine.reference}` : "Agregar máquina"} onClose={onClose} wide>
      <div className="flex flex-col gap-5">
        {isLive && (
          <Callout tone="info">
            Los cambios se verán en la web en aproximadamente un minuto. Si cambias de máquina por completo, mejor agrega una
            nueva.
          </Callout>
        )}
        {machine?.status === "rejected" && (
          <Callout tone="warn" title="Esta máquina no fue aprobada">
            Revisa que las fotos sean reales y de esta máquina, y que los datos estén completos. Luego vuelve a enviarla. Si
            tienes dudas, escríbenos por WhatsApp.
          </Callout>
        )}

        {/* Datos principales */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipo de máquina" htmlFor="om-cat" required>
            <Select id="om-cat" value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.singular}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Título de la publicación" htmlFor="om-name" required hint="Ej. Minicargador Bobcat S450 con operador">
            <Input id="om-name" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={90} />
          </Field>
          <Field label="Marca" htmlFor="om-brand" required>
            <Input id="om-brand" value={form.brand} onChange={(e) => set("brand", e.target.value)} maxLength={40} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Modelo" htmlFor="om-model" required>
              <Input id="om-model" value={form.model} onChange={(e) => set("model", e.target.value)} maxLength={40} />
            </Field>
            <Field label="Año" htmlFor="om-year">
              <Input id="om-year" inputMode="numeric" value={form.year} onChange={(e) => set("year", e.target.value)} maxLength={4} />
            </Field>
          </div>
          <Field label="Zona" htmlFor="om-area" required hint="Distrito de Piura">
            <Input id="om-area" list="om-districts" value={form.area} onChange={(e) => set("area", e.target.value)} />
            <datalist id="om-districts">
              {piuraDistricts.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </Field>
          <Field label="Disponibilidad" htmlFor="om-av">
            <Select id="om-av" value={form.availability} onChange={(e) => set("availability", e.target.value as AvailabilityStatus)}>
              {(Object.keys(availabilityLabel) as AvailabilityStatus[]).map((k) => (
                <option key={k} value={k}>
                  {availabilityLabel[k]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {form.availability !== "available" && (
          <Field label="Nota de disponibilidad (opcional)" htmlFor="om-avnote" hint="Ej. Libre desde el 20 de octubre">
            <Input id="om-avnote" value={form.availability_note} onChange={(e) => set("availability_note", e.target.value)} maxLength={120} />
          </Field>
        )}

        {/* Precio */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Precio (S/)" htmlFor="om-price" hint="Vacío = «Consultar precio»">
            <Input id="om-price" inputMode="decimal" value={form.price} onChange={(e) => set("price", e.target.value)} />
          </Field>
          <Field label="Por" htmlFor="om-unit">
            <Select id="om-unit" value={form.pricing_unit} onChange={(e) => set("pricing_unit", e.target.value as PricingUnit)}>
              {(["hour", "day", "week", "month", "trip"] as PricingUnit[]).map((u) => (
                <option key={u} value={u}>
                  {pricingUnitLabel[u]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Alquiler mínimo" htmlFor="om-min" hint="Ej. 4 horas">
            <Input id="om-min" value={form.minimum_rental} onChange={(e) => set("minimum_rental", e.target.value)} maxLength={40} />
          </Field>
        </div>

        {/* Condiciones */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Checkbox id="om-op" label="Con operador" checked={form.operator_available} onChange={(e) => set("operator_available", e.target.checked)} />
          {form.operator_available && (
            <Checkbox
              id="om-opinc"
              label="Operador incluido en el precio"
              checked={form.operator_included_in_price}
              onChange={(e) => set("operator_included_in_price", e.target.checked)}
            />
          )}
          <Checkbox
            id="om-tr"
            label="Ofrezco transporte a la obra"
            checked={form.transport_available}
            onChange={(e) => set("transport_available", e.target.checked)}
          />
          {form.transport_available && (
            <Checkbox
              id="om-trinc"
              label="Transporte incluido en el precio"
              checked={form.transport_included_in_price}
              onChange={(e) => set("transport_included_in_price", e.target.checked)}
            />
          )}
        </div>
        <Field label="Combustible" htmlFor="om-fuel">
          <Select id="om-fuel" value={form.fuel} onChange={(e) => set("fuel", e.target.value as FuelResponsibility)}>
            {(Object.keys(fuelLabel) as FuelResponsibility[]).map((k) => (
              <option key={k} value={k}>
                {fuelLabel[k]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Descripción" htmlFor="om-desc" hint="Para qué sirve, en qué estado está, qué incluye el alquiler.">
          <Textarea id="om-desc" value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={1500} />
        </Field>
        <Field label="Especificaciones (opcional)" htmlFor="om-specs" hint="Una por línea: «Potencia: 74 HP»">
          <Textarea id="om-specs" className="min-h-20" value={form.specsText} onChange={(e) => set("specsText", e.target.value)} />
        </Field>

        {/* Fotos */}
        <div>
          <p className="text-sm font-semibold text-ink-900">
            Fotos reales <span className="text-danger-500">*</span>
          </p>
          <p className="text-xs text-steel-500">
            De esta máquina, sin editar. La primera es la portada. Hasta {MAX_PHOTOS} fotos de máx. 5 MB cada una.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {form.images.map((img, i) => (
              <div key={img.url} className="relative overflow-hidden rounded-lg border border-steel-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} className="aspect-square w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-volt-400 px-1.5 text-[0.65rem] font-bold text-ink-950">Portada</span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink-950/70 px-1 py-0.5 text-xs text-white">
                  <button type="button" aria-label="Mover a la izquierda" onClick={() => moveImage(i, -1)} className="px-1.5">
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label="Quitar foto"
                    onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                    className="px-1.5"
                  >
                    ✕
                  </button>
                  <button type="button" aria-label="Mover a la derecha" onClick={() => moveImage(i, 1)} className="px-1.5">
                    ›
                  </button>
                </div>
              </div>
            ))}
            {form.images.length < MAX_PHOTOS && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-steel-300 p-1 text-center text-xs font-semibold text-steel-600 hover:border-brand-500">
                {uploading ? "Subiendo…" : "+ Agregar fotos"}
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  className="sr-only"
                  disabled={uploading}
                  onChange={(e) => upload(e.target.files)}
                />
              </label>
            )}
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-danger-500/30 bg-danger-50 px-3 py-2 text-sm text-danger-700">
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          {isLive || machine?.status === "pending_review" ? (
            <Button variant="primary" onClick={() => save(false)} disabled={busy || uploading}>
              {busy ? "Guardando…" : "Guardar cambios"}
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => save(false)} disabled={busy || uploading}>
                Guardar borrador
              </Button>
              <Button variant="primary" onClick={() => save(true)} disabled={busy || uploading}>
                {busy ? "Enviando…" : "Enviar a revisión"}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
