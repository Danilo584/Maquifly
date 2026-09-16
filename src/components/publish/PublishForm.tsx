"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";

import {
  emptyListing,
  listingSchema,
  photoRules,
  stepFields,
  validateFields,
  validatePhoto,
  type ListingInput,
} from "@/lib/validation/listing";
import { categories, getCategory } from "@/lib/data/categories";
import { activeLocations, getLocation, locations } from "@/lib/data/locations";
import { readLocal, writeLocal, removeLocal, localId } from "@/lib/local-store";
import { track } from "@/lib/analytics";
import type { Machine } from "@/lib/types";

import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Callout";
import { MachineCard } from "@/components/machine/MachineCard";
import {
  IconArrowRight,
  IconCamera,
  IconCheck,
  IconClose,
  IconPlus,
} from "@/components/ui/Icon";

const steps = [
  { title: "Información básica", short: "Máquina" },
  { title: "Ubicación", short: "Ubicación" },
  { title: "Condiciones de alquiler", short: "Condiciones" },
  { title: "Fotografías", short: "Fotos" },
  { title: "Contacto", short: "Contacto" },
  { title: "Vista previa", short: "Revisar" },
];

const DRAFT_KEY = "listing-draft";

type Photo = { id: string; name: string; size: number; url: string };

export function PublishForm() {
  const id = useId();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<ListingInput>(emptyListing);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Recupera el borrador guardado (solo los campos de texto: las fotos no se
  // pueden serializar y se vuelven a seleccionar).
  useEffect(() => {
    const saved = readLocal<ListingInput | null>(DRAFT_KEY, null);
    if (saved && typeof saved === "object") {
      setValues({ ...emptyListing, ...saved });
      setDraftRestored(true);
    }
  }, []);

  // Autoguardado del borrador.
  useEffect(() => {
    if (values === emptyListing) return;
    const timer = setTimeout(() => writeLocal(DRAFT_KEY, values), 600);
    return () => clearTimeout(timer);
  }, [values]);

  // Libera las URLs de objeto al desmontar, para no filtrar memoria.
  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof ListingInput>(key: K, value: ListingInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  function goTo(next: number) {
    setStep(next);
    // Devuelve el foco al encabezado del paso: sin esto, quien navega con
    // teclado o lector de pantalla se queda al final del paso anterior.
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function next() {
    const fields = stepFields[step] ?? [];
    const found = validateFields(values, fields);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setErrors({});
    if (step === 4) {
      track({ name: "listing_preview", categorySlug: String(values.categorySlug) });
    }
    goTo(Math.min(step + 1, steps.length - 1));
  }

  function back() {
    setErrors({});
    goTo(Math.max(step - 1, 0));
  }

  function onFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setPhotoError(null);

    const accepted: Photo[] = [];
    for (const file of files) {
      if (photos.length + accepted.length >= photoRules.maxFiles) {
        setPhotoError(`Puedes subir hasta ${photoRules.maxFiles} fotografías.`);
        break;
      }
      const problem = validatePhoto(file);
      if (problem) {
        setPhotoError(problem);
        continue;
      }
      accepted.push({
        id: localId("img"),
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
      });
    }
    setPhotos((prev) => [...prev, ...accepted]);
    event.target.value = "";
  }

  function removePhoto(photoId: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === photoId);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== photoId);
    });
  }

  function publish() {
    const result = listingSchema.safeParse(values);
    if (!result.success) {
      const found: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!found[key]) found[key] = issue.message;
      }
      setErrors(found);
      // Lleva al usuario al primer paso que contiene un error.
      const firstBad = Object.keys(found)[0];
      const badStep = Number(
        Object.entries(stepFields).find(([, fields]) =>
          fields.includes(firstBad as keyof ListingInput),
        )?.[0] ?? 0,
      );
      goTo(badStep);
      return;
    }

    writeLocal(`listing-submitted-${localId("l")}`, {
      ...result.data,
      photoCount: photos.length,
      createdAt: new Date().toISOString(),
    });
    track({ name: "listing_draft_saved", categorySlug: String(values.categorySlug) });
    removeLocal(DRAFT_KEY);
    setPublished(true);
    goTo(steps.length - 1);
  }

  const previewMachine = useMemo(
    () => buildPreviewMachine(values, photos),
    [values, photos],
  );

  const selectedLocation = getLocation(String(values.locationSlug));

  if (published) {
    return <PublishedState machine={previewMachine} onRestart={() => location.reload()} />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
      <div className="min-w-0">
        <Stepper current={step} onSelect={(i) => i < step && goTo(i)} />

        {draftRestored && step === 0 && (
          <Callout tone="info" className="mt-5">
            Recuperamos el borrador que habías empezado en este navegador. Puedes
            seguir donde lo dejaste.
          </Callout>
        )}

        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-6 text-xl font-extrabold text-ink-900 outline-none sm:text-2xl"
        >
          {step + 1}. {steps[step]?.title}
        </h2>

        <div className="mt-5">
          {/* ---------------------------------------------- 1. Información */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <Field
                label="Categoría"
                htmlFor={`${id}-cat`}
                required
                error={errors.categorySlug}
              >
                <Select
                  id={`${id}-cat`}
                  value={values.categorySlug}
                  invalid={Boolean(errors.categorySlug)}
                  onChange={(e) =>
                    set("categorySlug", e.target.value as ListingInput["categorySlug"])
                  }
                >
                  <option value="">Selecciona una categoría…</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Nombre de la publicación"
                htmlFor={`${id}-name`}
                required
                error={errors.name}
                hint="Lo que verá el cliente en la lista. Ejemplo: «Minicargador Hyundai HSL850-7A»."
              >
                <Input
                  id={`${id}-name`}
                  value={values.name}
                  invalid={Boolean(errors.name)}
                  onChange={(e) => set("name", e.target.value)}
                  maxLength={90}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Marca" htmlFor={`${id}-brand`} required error={errors.brand}>
                  <Input
                    id={`${id}-brand`}
                    value={values.brand}
                    invalid={Boolean(errors.brand)}
                    onChange={(e) => set("brand", e.target.value)}
                    maxLength={40}
                    placeholder="Caterpillar, JCB, Hyundai…"
                  />
                </Field>
                <Field label="Modelo" htmlFor={`${id}-model`} required error={errors.model}>
                  <Input
                    id={`${id}-model`}
                    value={values.model}
                    invalid={Boolean(errors.model)}
                    onChange={(e) => set("model", e.target.value)}
                    maxLength={40}
                    placeholder="320D, 3CX…"
                  />
                </Field>
                <Field label="Año" htmlFor={`${id}-year`} error={errors.year}>
                  <Input
                    id={`${id}-year`}
                    type="number"
                    inputMode="numeric"
                    value={String(values.year ?? "")}
                    invalid={Boolean(errors.year)}
                    onChange={(e) => set("year", e.target.value as never)}
                    min={1970}
                    max={new Date().getFullYear() + 1}
                    placeholder="2018"
                  />
                </Field>
              </div>

              <Field
                label="Descripción"
                htmlFor={`${id}-desc`}
                required
                error={errors.description}
                hint="Estado del equipo, implementos incluidos, tipo de trabajo para el que sirve. Cuanto más claro, menos preguntas por WhatsApp."
              >
                <Textarea
                  id={`${id}-desc`}
                  value={values.description}
                  invalid={Boolean(errors.description)}
                  onChange={(e) => set("description", e.target.value)}
                  maxLength={2000}
                />
                <p className="text-right text-xs text-steel-400">
                  {String(values.description).length}/2000
                </p>
              </Field>
            </div>
          )}

          {/* ------------------------------------------------- 2. Ubicación */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <Field
                label="Ciudad"
                htmlFor={`${id}-city`}
                required
                error={errors.locationSlug}
                hint="MaquiFly está activo en Piura. Puedes publicar en otras ciudades, pero todavía reciben poco tráfico."
              >
                <Select
                  id={`${id}-city`}
                  value={values.locationSlug}
                  invalid={Boolean(errors.locationSlug)}
                  onChange={(e) =>
                    set("locationSlug", e.target.value as ListingInput["locationSlug"])
                  }
                >
                  {activeLocations.map((l) => (
                    <option key={l.slug} value={l.slug}>
                      {l.name} (activa)
                    </option>
                  ))}
                  <optgroup label="Próximamente">
                    {locations
                      .filter((l) => !l.active)
                      .map((l) => (
                        <option key={l.slug} value={l.slug}>
                          {l.name}
                        </option>
                      ))}
                  </optgroup>
                </Select>
              </Field>

              <Field
                label="Distrito o zona"
                htmlFor={`${id}-area`}
                required
                error={errors.area}
              >
                <Select
                  id={`${id}-area`}
                  value={values.area}
                  invalid={Boolean(errors.area)}
                  onChange={(e) => set("area", e.target.value)}
                >
                  <option value="">Selecciona el distrito…</option>
                  {(selectedLocation?.districts ?? []).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Referencia de la zona"
                htmlFor={`${id}-ref`}
                hint="Opcional y aproximada: «cerca del by-pass», «km 4 carretera a Paita». No publiques tu dirección exacta."
                error={errors.reference}
              >
                <Input
                  id={`${id}-ref`}
                  value={values.reference ?? ""}
                  onChange={(e) => set("reference", e.target.value)}
                  maxLength={120}
                />
              </Field>

              <Callout tone="neutral">
                Por seguridad, MaquiFly muestra solo el distrito o zona en la
                publicación. La dirección exacta la compartes tú al coordinar el
                alquiler.
              </Callout>
            </div>
          )}

          {/* ----------------------------------------------- 3. Condiciones */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-3">
                <Field
                  label="Precio"
                  htmlFor={`${id}-price`}
                  error={errors.price}
                  hint="Déjalo vacío para «Consultar precio»."
                >
                  <Input
                    id={`${id}-price`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={String(values.price ?? "")}
                    invalid={Boolean(errors.price)}
                    onChange={(e) => set("price", e.target.value as never)}
                    placeholder="120"
                  />
                </Field>
                <Field label="Moneda" htmlFor={`${id}-currency`}>
                  <Select
                    id={`${id}-currency`}
                    value={values.currency}
                    onChange={(e) =>
                      set("currency", e.target.value as ListingInput["currency"])
                    }
                  >
                    <option value="PEN">Soles (S/)</option>
                    <option value="USD">Dólares (US$)</option>
                  </Select>
                </Field>
                <Field label="Unidad de cobro" htmlFor={`${id}-unit`}>
                  <Select
                    id={`${id}-unit`}
                    value={values.pricingUnit}
                    onChange={(e) =>
                      set("pricingUnit", e.target.value as ListingInput["pricingUnit"])
                    }
                  >
                    <option value="hour">Por hora</option>
                    <option value="day">Por día</option>
                    <option value="week">Por semana</option>
                    <option value="month">Por mes</option>
                    <option value="trip">Por viaje</option>
                    <option value="on_request">A consultar</option>
                  </Select>
                </Field>
              </div>

              <Field
                label="Mínimo de alquiler"
                htmlFor={`${id}-min`}
                hint="Opcional. Ejemplo: «4 horas», «1 día», «por hectárea»."
              >
                <Input
                  id={`${id}-min`}
                  value={values.minimumRental ?? ""}
                  onChange={(e) => set("minimumRental", e.target.value)}
                  maxLength={60}
                />
              </Field>

              <fieldset className="flex flex-col gap-3">
                <legend className="mb-1 text-sm font-semibold text-ink-900">
                  Operador y transporte
                </legend>
                <Checkbox
                  id={`${id}-op`}
                  checked={values.operatorAvailable}
                  onChange={(e) => set("operatorAvailable", e.target.checked)}
                  label="Ofrezco operador"
                  description="Aparecerás en el filtro «con operador», uno de los más usados."
                />
                {values.operatorAvailable && (
                  <Checkbox
                    id={`${id}-op-inc`}
                    checked={values.operatorIncludedInPrice}
                    onChange={(e) => set("operatorIncludedInPrice", e.target.checked)}
                    label="El operador está incluido en el precio"
                    description="Si no, se indicará que se cobra aparte."
                  />
                )}
                <Checkbox
                  id={`${id}-tr`}
                  checked={values.transportAvailable}
                  onChange={(e) => set("transportAvailable", e.target.checked)}
                  label="Ofrezco transporte de la máquina"
                />
                {values.transportAvailable && (
                  <Checkbox
                    id={`${id}-tr-inc`}
                    checked={values.transportIncludedInPrice}
                    onChange={(e) => set("transportIncludedInPrice", e.target.checked)}
                    label="El transporte está incluido en el precio"
                  />
                )}
              </fieldset>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Combustible" htmlFor={`${id}-fuel`}>
                  <Select
                    id={`${id}-fuel`}
                    value={values.fuel}
                    onChange={(e) => set("fuel", e.target.value as ListingInput["fuel"])}
                  >
                    <option value="client">A cargo del cliente</option>
                    <option value="owner">Incluido por el propietario</option>
                    <option value="negotiable">A coordinar</option>
                  </Select>
                </Field>
                <Field label="Disponibilidad" htmlFor={`${id}-avail`}>
                  <Select
                    id={`${id}-avail`}
                    value={values.availability}
                    onChange={(e) =>
                      set("availability", e.target.value as ListingInput["availability"])
                    }
                  >
                    <option value="available">Disponible</option>
                    <option value="limited">Disponibilidad limitada</option>
                    <option value="unavailable">No disponible por ahora</option>
                  </Select>
                </Field>
              </div>

              <Field
                label="Nota de disponibilidad"
                htmlFor={`${id}-avail-note`}
                hint="Opcional. Ejemplo: «Disponible de lunes a sábado» o «Comprometida hasta fin de mes»."
              >
                <Input
                  id={`${id}-avail-note`}
                  value={values.availabilityNote ?? ""}
                  onChange={(e) => set("availabilityNote", e.target.value)}
                  maxLength={200}
                />
              </Field>
            </div>
          )}

          {/* ---------------------------------------------- 4. Fotografías */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <Callout tone="info" title="Las fotos deciden si te escriben">
                Fotos reales de tu máquina, con luz de día y desde varios
                ángulos, generan muchos más contactos que una imagen de
                catálogo. Si no subes ninguna, la publicación mostrará una
                ilustración marcada como referencial.
              </Callout>

              <div>
                <input
                  ref={fileInput}
                  id={`${id}-photos`}
                  type="file"
                  accept={photoRules.accepted.join(",")}
                  multiple
                  onChange={onFiles}
                  className="sr-only"
                />
                <label
                  htmlFor={`${id}-photos`}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-steel-300 bg-steel-50 px-6 py-10 text-center transition-colors hover:border-brand-400 hover:bg-brand-50"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-white text-steel-500 ring-1 ring-steel-200">
                    <IconCamera size={24} />
                  </span>
                  <span className="mt-3 text-base font-bold text-ink-900">
                    Seleccionar fotografías
                  </span>
                  <span className="mt-1 text-sm text-steel-500">
                    Hasta {photoRules.maxFiles} imágenes · {photoRules.acceptedLabel} ·
                    máximo 5 MB cada una
                  </span>
                </label>
              </div>

              {photoError && (
                <p role="alert" className="text-sm font-medium text-danger-700">
                  {photoError}
                </p>
              )}

              {photos.length > 0 && (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {photos.map((photo, index) => (
                    <li
                      key={photo.id}
                      className="group relative overflow-hidden rounded-xl border border-steel-200 bg-steel-100"
                    >
                      <div className="relative aspect-[4/3]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt={`Vista previa de ${photo.name}`}
                          className="size-full object-cover"
                        />
                      </div>
                      {index === 0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-ink-900 px-2 py-0.5 text-[0.68rem] font-bold text-volt-400">
                          Portada
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        aria-label={`Quitar ${photo.name}`}
                        className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-ink-950/75 text-white transition-colors hover:bg-danger-500"
                      >
                        <IconClose size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <Callout tone="warn" title="Qué falta para que esto funcione de verdad">
                Las fotos se validan y se previsualizan aquí, pero no se suben a
                ningún servidor: no hay almacenamiento conectado. La subida real
                necesita Supabase Storage (o equivalente) con límite de tamaño,
                conversión a WebP y URLs firmadas.
              </Callout>
            </div>
          )}

          {/* ------------------------------------------------- 5. Contacto */}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              <Field
                label="Nombre del propietario o empresa"
                htmlFor={`${id}-owner`}
                required
                error={errors.ownerName}
              >
                <Input
                  id={`${id}-owner`}
                  value={values.ownerName}
                  invalid={Boolean(errors.ownerName)}
                  onChange={(e) => set("ownerName", e.target.value)}
                  maxLength={80}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="WhatsApp"
                  htmlFor={`${id}-wa`}
                  required
                  error={errors.whatsapp}
                  hint="9 dígitos. Es el canal por el que te contactarán."
                >
                  <Input
                    id={`${id}-wa`}
                    type="tel"
                    inputMode="tel"
                    value={values.whatsapp}
                    invalid={Boolean(errors.whatsapp)}
                    onChange={(e) => set("whatsapp", e.target.value)}
                    placeholder="987 654 321"
                    maxLength={20}
                  />
                </Field>
                <Field
                  label="Teléfono alternativo"
                  htmlFor={`${id}-phone`}
                  error={errors.phone}
                >
                  <Input
                    id={`${id}-phone`}
                    type="tel"
                    inputMode="tel"
                    value={values.phone ?? ""}
                    onChange={(e) => set("phone", e.target.value)}
                    maxLength={20}
                  />
                </Field>
              </div>

              <Field
                label="Correo electrónico"
                htmlFor={`${id}-email`}
                error={errors.email}
                hint="Opcional. Solo lo usamos para avisarte sobre tu publicación."
              >
                <Input
                  id={`${id}-email`}
                  type="email"
                  value={values.email}
                  invalid={Boolean(errors.email)}
                  onChange={(e) => set("email", e.target.value)}
                  maxLength={120}
                />
              </Field>

              <div className="flex flex-col gap-3 border-t border-steel-200 pt-5">
                <Checkbox
                  id={`${id}-own`}
                  checked={values.confirmsOwnership}
                  onChange={(e) =>
                    set("confirmsOwnership", e.target.checked as never)
                  }
                  label="La máquina es mía o tengo autorización para alquilarla"
                />
                {errors.confirmsOwnership && (
                  <p role="alert" className="text-xs font-medium text-danger-700">
                    {errors.confirmsOwnership}
                  </p>
                )}
                <Checkbox
                  id={`${id}-terms`}
                  checked={values.acceptsTerms}
                  onChange={(e) => set("acceptsTerms", e.target.checked as never)}
                  label="Acepto los términos y la política de privacidad de MaquiFly"
                  description="MaquiFly es una plataforma de conexión y no participa en el contrato de alquiler."
                />
                {errors.acceptsTerms && (
                  <p role="alert" className="text-xs font-medium text-danger-700">
                    {errors.acceptsTerms}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* --------------------------------------------- 6. Vista previa */}
          {step === 5 && (
            <div className="flex flex-col gap-6">
              <p className="text-[0.95rem] leading-relaxed text-steel-600">
                Así se verá tu publicación en los resultados de búsqueda.
                Revísala antes de publicar.
              </p>

              <div className="max-w-sm">
                <MachineCard machine={previewMachine} />
              </div>

              <PreviewSummary values={values} photoCount={photos.length} />

              <Callout tone="warn" title="Qué ocurre al pulsar «Publicar»">
                Tu publicación queda guardada en este navegador para que puedas
                revisarla, pero todavía no se hace pública: falta conectar la
                base de datos y la moderación. Cuando MaquiFly tenga backend,
                este mismo formulario creará la publicación real y te avisará
                por WhatsApp cuando esté aprobada.
              </Callout>

              <Button variant="primary" size="lg" onClick={publish}>
                <IconCheck size={19} />
                Publicar maquinaria
              </Button>
            </div>
          )}
        </div>

        {step < 5 && (
          <div className="mt-8 flex flex-col gap-3 border-t border-steel-200 pt-6 sm:flex-row-reverse sm:justify-start">
            <Button variant="primary" size="md" onClick={next}>
              Continuar
              <IconArrowRight size={18} />
            </Button>
            {step > 0 && (
              <Button variant="secondary" size="md" onClick={back}>
                Volver
              </Button>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="mt-6">
            <Button variant="secondary" size="md" onClick={back}>
              Volver y editar
            </Button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------- lateral */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-steel-200 bg-steel-50 p-5">
          <h2 className="text-base font-bold text-ink-900">
            Consejos para publicar bien
          </h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-steel-700">
            {[
              "Usa el nombre que la gente busca: «Minicargador», no «Máquina cargadora compacta».",
              "Indica marca y modelo exactos: muchos clientes buscan por modelo.",
              "Si puedes, publica un precio. Las publicaciones con precio reciben más consultas que las de «consultar precio».",
              "Sube fotos propias con luz de día, incluyendo el estado real de orugas o llantas.",
              "Mantén la disponibilidad actualizada: nada daña más la reputación que una máquina que aparece libre y no lo está.",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2.5">
                <IconCheck size={15} className="mt-1 shrink-0 text-ok-500" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 rounded-2xl border border-steel-200 bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-steel-500">
            Publicar es gratis
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-steel-600">
            En esta etapa no hay costo de publicación ni comisión sobre el
            alquiler. Si en el futuro aparecen opciones de pago, serán
            opcionales y para dar más visibilidad.
          </p>
        </div>
      </aside>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Stepper({
  current,
  onSelect,
}: {
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav aria-label="Progreso de la publicación">
      <ol className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={step.short} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onSelect(index)}
                disabled={index > current}
                aria-current={active ? "step" : undefined}
                className={`flex w-full flex-col gap-1.5 rounded-lg px-1 pb-1 pt-1.5 text-left transition-colors ${
                  index > current ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <span
                  className={`h-1.5 w-full rounded-full ${
                    done ? "bg-brand-600" : active ? "bg-volt-400" : "bg-steel-200"
                  }`}
                />
                <span
                  className={`truncate text-xs font-semibold ${
                    active ? "text-ink-900" : done ? "text-brand-700" : "text-steel-400"
                  }`}
                >
                  {step.short}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function PreviewSummary({
  values,
  photoCount,
}: {
  values: ListingInput;
  photoCount: number;
}) {
  const category = getCategory(String(values.categorySlug));
  const location = getLocation(String(values.locationSlug));

  const rows: Array<[string, string]> = [
    ["Categoría", category?.name ?? "—"],
    ["Marca y modelo", `${values.brand} ${values.model}`.trim() || "—"],
    ["Año", values.year ? String(values.year) : "No indicado"],
    ["Ubicación", `${values.area}${location ? `, ${location.name}` : ""}`],
    [
      "Precio",
      values.price
        ? `${values.currency === "USD" ? "US$" : "S/"} ${values.price}`
        : "Consultar precio",
    ],
    ["Operador", values.operatorAvailable ? "Sí" : "No"],
    ["Transporte", values.transportAvailable ? "Sí" : "No"],
    ["Fotografías", photoCount > 0 ? `${photoCount} seleccionadas` : "Ninguna"],
    ["Contacto", values.whatsapp || "—"],
  ];

  return (
    <div className="rounded-2xl border border-steel-200 bg-white p-5">
      <h3 className="text-base font-bold text-ink-900">Resumen de la publicación</h3>
      <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 text-sm">
            <dt className="text-steel-500">{label}</dt>
            <dd className="text-right font-semibold text-ink-900">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 border-t border-steel-100 pt-4">
        <p className="text-xs font-medium text-steel-500">Descripción</p>
        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-steel-700">
          {values.description || "—"}
        </p>
      </div>
    </div>
  );
}

function PublishedState({
  machine,
  onRestart,
}: {
  machine: Machine;
  onRestart: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-col items-center rounded-2xl border border-ok-500/30 bg-ok-50 p-8 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-ok-500 text-white">
          <IconCheck size={28} />
        </span>
        <h2 className="mt-4 text-2xl font-extrabold text-ink-900">
          Publicación completada
        </h2>
        <p className="mt-2 max-w-lg text-[0.95rem] leading-relaxed text-steel-700">
          Registramos tu publicación y ya no necesitas volver a llenar el
          formulario: quedó guardada en este navegador con todos sus datos.
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-steel-500">
          Así quedó
        </h3>
        <div className="mt-3 max-w-sm">
          <MachineCard machine={machine} />
        </div>
      </div>

      <Callout tone="warn" className="mt-6" title="Siguiente paso real">
        Para que esta publicación sea visible para todo el mundo falta conectar
        el backend: base de datos, subida de fotos y revisión previa. Está todo
        preparado en el código (modelo de datos, validación y panel de
        administración); solo falta enchufarlo.
      </Callout>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button variant="primary" onClick={onRestart}>
          <IconPlus size={18} />
          Publicar otra máquina
        </Button>
      </div>
    </div>
  );
}

/** Construye un objeto Machine válido para previsualizar con el mismo componente real. */
function buildPreviewMachine(values: ListingInput, photos: Photo[]): Machine {
  const category = getCategory(String(values.categorySlug));
  const price =
    values.price === "" || values.price === undefined ? null : Number(values.price);

  return {
    id: "preview",
    reference: "MF-BORRADOR",
    slug: "preview",
    ownerId: "preview",
    categoryId: category?.id ?? "cat-minicargadores",
    name: values.name || "Nombre de tu publicación",
    brand: values.brand || "Marca",
    model: values.model || "Modelo",
    year: values.year ? Number(values.year) : null,
    description: values.description,
    locationId: `loc-${values.locationSlug}`,
    area: values.area || "Zona",
    price: Number.isFinite(price) ? price : null,
    currency: values.currency,
    pricingUnit: values.pricingUnit,
    minimumRental: values.minimumRental || null,
    operatorAvailable: values.operatorAvailable,
    operatorIncludedInPrice: values.operatorIncludedInPrice,
    transportAvailable: values.transportAvailable,
    transportIncludedInPrice: values.transportIncludedInPrice,
    fuel: values.fuel,
    availability: values.availability,
    availabilityNote: values.availabilityNote || null,
    specs: [],
    workHours: null,
    images:
      photos.length > 0
        ? photos.map((p) => ({
            url: p.url,
            alt: `Fotografía de ${values.name || "la máquina"}`,
            isPlaceholder: false,
          }))
        : [
            {
              url: `/placeholders/${category?.icon ?? "other"}-a.svg`,
              alt: "Ilustración referencial: esta publicación aún no tiene fotografías",
              isPlaceholder: true,
            },
          ],
    status: "draft",
    rating: null,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: false,
  };
}
