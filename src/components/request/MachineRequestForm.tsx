"use client";

import { useEffect, useId, useState } from "react";
import { z } from "zod";
import { categories, categoriesBySlug } from "@/lib/data/categories";
import { locationsBySlug } from "@/lib/data/locations";
import { sendMachineRequest } from "@/lib/submissions";
import { whatsappUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/site";
import { track } from "@/lib/analytics";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Callout";
import { IconCheck, IconWhatsApp } from "@/components/ui/Icon";
import { PrivacyConsent } from "@/components/common/PrivacyConsent";

/**
 * «TE CONSEGUIMOS LA MÁQUINA»
 * ---------------------------------------------------------------------------
 * Formulario corto (pensado para celular) para el cliente que no encuentra
 * el equipo publicado. El pedido se guarda en Supabase (machine_requests) y
 * aparece en /admin → Pedidos de clientes. Nunca se promete un tiempo de
 * respuesta concreto: el que tiene urgencia escribe directo por WhatsApp.
 */

const OTHER = "otra";

export const durations = [
  "Unas horas",
  "1 día",
  "2 a 6 días",
  "1 a 3 semanas",
  "1 mes o más",
  "Aún no sé",
] as const;

const operatorOptions = [
  { value: "con", label: "Con operador" },
  { value: "sin", label: "Sin operador (tengo quien la maneje)" },
  { value: "indiferente", label: "Me da igual" },
] as const;

const schema = z.object({
  category: z.string().min(1, "Elige qué máquina necesitas."),
  otherMachine: z.string().trim(),
  zone: z.string().trim().min(3, "Dinos en qué distrito o ciudad es la obra."),
  startDate: z.string(),
  duration: z.enum(durations, { message: "Elige por cuánto tiempo." }),
  operator: z.enum(["con", "sin", "indiferente"]),
  name: z.string().trim().min(2, "Escribe tu nombre."),
  whatsapp: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length >= 9, "Escribe un WhatsApp de 9 dígitos."),
});

type Values = z.input<typeof schema>;

function today(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

/** 933407807 → «933 407 807» (solo para mostrarlo de vuelta al cliente). */
function prettyPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const local = digits.length === 11 && digits.startsWith("51") ? digits.slice(2) : digits;
  return local.length === 9 ? `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}` : raw;
}

export function MachineRequestForm({
  defaultCategory = "",
  defaultZone = "",
  context = "portada",
  readFromUrl = false,
}: {
  /** Slug de categoría para dejar elegida (p. ej. desde una búsqueda vacía). */
  defaultCategory?: string;
  defaultZone?: string;
  /** Desde dónde se envió, para la analítica. */
  context?: string;
  /** Lee ?categoria= y ?ciudad= de la URL al montar (página dedicada). */
  readFromUrl?: boolean;
}) {
  const id = useId();
  const [values, setValues] = useState<Values>({
    category: categoriesBySlug.has(defaultCategory) ? defaultCategory : "",
    otherMachine: "",
    zone: defaultZone,
    startDate: "",
    duration: "" as Values["duration"],
    operator: "indiferente",
    name: "",
    whatsapp: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accepted, setAccepted] = useState(false);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [sent, setSent] = useState<{ label: string; zone: string; phone: string } | null>(null);

  useEffect(() => {
    if (!readFromUrl) return;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("categoria") ?? "";
    const city = locationsBySlug.get(params.get("ciudad") ?? "")?.name ?? "";
    setValues((v) => ({
      ...v,
      category: v.category || (categoriesBySlug.has(cat) ? cat : ""),
      zone: v.zone || city,
    }));
  }, [readFromUrl]);

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  const isOther = values.category === OTHER;

  function machineLabel(): string {
    if (isOther) return values.otherMachine.trim();
    return categoriesBySlug.get(values.category)?.singular ?? values.category;
  }

  /** Mensaje para el que tiene urgencia: ya lleva todos los datos del pedido. */
  function urgentMessage(): string {
    const label = machineLabel() || "una máquina";
    return [
      `Hola MaquiFly, necesito ${label.toLowerCase()} con urgencia en ${values.zone || "Piura"}.`,
      values.startDate ? `Para el ${values.startDate.split("-").reverse().join("/")}.` : "",
      values.duration ? `Por: ${values.duration.toLowerCase()}.` : "",
      `Acabo de enviar la solicitud en la web.`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = schema.safeParse(values);
    const found: Record<string, string> = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!found[key]) found[key] = issue.message;
      }
    }
    if (isOther && values.otherMachine.trim().length < 3) {
      found.otherMachine = "Cuéntanos qué máquina buscas.";
    }
    if (!accepted) found.consent = "Marca la casilla para poder enviar tu solicitud.";
    if (!result.success || Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    const data = result.data;
    setErrors({});
    setSending(true);
    setFailure(null);
    const label = machineLabel();
    const res = await sendMachineRequest({
      categorySlug: isOther ? null : data.category,
      machineLabel: label,
      zone: data.zone,
      startDate: data.startDate || null,
      duration: data.duration,
      operator: data.operator,
      name: data.name,
      whatsapp: data.whatsapp,
    });
    setSending(false);
    if (!res.ok) {
      setFailure(
        res.reason === "not_configured"
          ? "El formulario aún no está conectado. Escríbenos por WhatsApp y lo vemos al toque."
          : "No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.",
      );
      return;
    }
    track({ name: "machine_request_submit", category: data.category, context });
    setSent({ label, zone: data.zone, phone: prettyPhone(data.whatsapp) });
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-ok-500/30 bg-ok-50 p-6" role="status">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ok-500 text-white">
            <IconCheck size={20} />
          </span>
          <div>
            <h3 className="text-lg font-bold text-ink-900">¡Recibimos tu solicitud!</h3>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-steel-700">
              Ya estamos buscando tu <strong>{sent.label.toLowerCase()}</strong> en{" "}
              <strong>{sent.zone}</strong>. Te escribiremos por WhatsApp al{" "}
              <strong className="whitespace-nowrap">{sent.phone}</strong> apenas tengamos
              opciones.
            </p>
          </div>
        </div>
        <div className="mt-5 border-t border-ok-500/20 pt-5">
          <p className="text-sm font-semibold text-ink-900">¿La necesitas para hoy o mañana?</p>
          <p className="mt-1 text-sm text-steel-600">
            Escríbenos directo y le damos prioridad a tu pedido.
          </p>
          <LinkButton
            href={whatsappUrl(siteConfig.contact.whatsapp, urgentMessage())}
            external
            variant="whatsapp"
            size="sm"
            className="mt-3"
          >
            <IconWhatsApp size={16} />
            Es urgente, escribir por WhatsApp
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field label="¿Qué máquina necesitas?" htmlFor={`${id}-cat`} required error={errors.category}>
        <Select
          id={`${id}-cat`}
          value={values.category}
          invalid={Boolean(errors.category)}
          onChange={(e) => set("category", e.target.value)}
        >
          <option value="">Elige una opción</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.singular}
            </option>
          ))}
          <option value={OTHER}>Otra máquina</option>
        </Select>
      </Field>

      {isOther && (
        <Field label="¿Cuál?" htmlFor={`${id}-other`} required error={errors.otherMachine}>
          <Input
            id={`${id}-other`}
            value={values.otherMachine}
            invalid={Boolean(errors.otherMachine)}
            onChange={(e) => set("otherMachine", e.target.value)}
            placeholder="Ej. grúa, compactadora, cisterna…"
            maxLength={80}
          />
        </Field>
      )}

      <Field label="¿Dónde es la obra?" htmlFor={`${id}-zone`} required error={errors.zone}>
        <Input
          id={`${id}-zone`}
          value={values.zone}
          invalid={Boolean(errors.zone)}
          onChange={(e) => set("zone", e.target.value)}
          placeholder="Ej. Castilla, Piura"
          maxLength={120}
          autoComplete="address-level2"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="¿Para cuándo?" htmlFor={`${id}-date`}>
          <Input
            id={`${id}-date`}
            type="date"
            min={today()}
            value={values.startDate}
            onChange={(e) => set("startDate", e.target.value)}
          />
        </Field>
        <Field label="¿Por cuánto tiempo?" htmlFor={`${id}-dur`} required error={errors.duration}>
          <Select
            id={`${id}-dur`}
            value={values.duration}
            invalid={Boolean(errors.duration)}
            onChange={(e) => set("duration", e.target.value as Values["duration"])}
          >
            <option value="">Elige una opción</option>
            {durations.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="¿Con operador?" htmlFor={`${id}-op`}>
        <Select
          id={`${id}-op`}
          value={values.operator}
          onChange={(e) => set("operator", e.target.value as Values["operator"])}
        >
          {operatorOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tu nombre" htmlFor={`${id}-name`} required error={errors.name}>
          <Input
            id={`${id}-name`}
            value={values.name}
            invalid={Boolean(errors.name)}
            onChange={(e) => set("name", e.target.value)}
            autoComplete="name"
            maxLength={80}
          />
        </Field>
        <Field label="Tu WhatsApp" htmlFor={`${id}-wa`} required error={errors.whatsapp}>
          <Input
            id={`${id}-wa`}
            type="tel"
            inputMode="tel"
            value={values.whatsapp}
            invalid={Boolean(errors.whatsapp)}
            onChange={(e) => set("whatsapp", e.target.value)}
            placeholder="9xx xxx xxx"
            autoComplete="tel"
            maxLength={20}
          />
        </Field>
      </div>

      <PrivacyConsent
        id={`${id}-consent`}
        checked={accepted}
        onChange={(v) => {
          setAccepted(v);
          if (v) setErrors((e) => ({ ...e, consent: "" }));
        }}
        error={errors.consent || undefined}
        purpose="buscarme la maquinaria y contactarme por WhatsApp"
      />

      {failure && (
        <Callout tone="warn">
          {failure}
          <div className="mt-3">
            <LinkButton
              href={whatsappUrl(siteConfig.contact.whatsapp, urgentMessage())}
              external
              variant="whatsapp"
              size="sm"
            >
              <IconWhatsApp size={16} />
              Escribir por WhatsApp
            </LinkButton>
          </div>
        </Callout>
      )}

      <Button type="submit" variant="primary" size="lg" fullWidth disabled={sending}>
        {sending ? "Enviando…" : "Buscar mi máquina"}
      </Button>
      <p className="text-center text-xs text-steel-500">
        Es gratis y sin compromiso. Tus datos solo los ve el equipo de MaquiFly.
      </p>
    </form>
  );
}
