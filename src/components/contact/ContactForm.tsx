"use client";

import { useId, useState } from "react";
import { z } from "zod";
import { appendLocal, localId } from "@/lib/local-store";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Callout";
import { IconCheck } from "@/components/ui/Icon";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre."),
  contact: z
    .string()
    .trim()
    .min(6, "Deja un correo o WhatsApp donde podamos responderte."),
  topic: z.enum([
    "buscar-maquinaria",
    "publicar-maquinaria",
    "empresa",
    "problema",
    "otro",
  ]),
  message: z
    .string()
    .trim()
    .min(15, "Cuéntanos un poco más (mínimo 15 caracteres)."),
});

const topics = [
  { value: "buscar-maquinaria", label: "Busco maquinaria y no la encuentro" },
  { value: "publicar-maquinaria", label: "Quiero publicar mi maquinaria" },
  { value: "empresa", label: "Soy una empresa con varias máquinas" },
  { value: "problema", label: "Reportar un problema en una publicación" },
  { value: "otro", label: "Otro asunto" },
];

export function ContactForm() {
  const id = useId();
  const [values, setValues] = useState({
    name: "",
    contact: "",
    topic: "buscar-maquinaria",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = contactSchema.safeParse(values);
    if (!result.success) {
      const found: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!found[key]) found[key] = issue.message;
      }
      setErrors(found);
      return;
    }
    setErrors({});
    appendLocal("contact-messages", {
      id: localId("msg"),
      ...result.data,
      createdAt: new Date().toISOString(),
    });
    track({ name: "contact_form_submit", context: `contacto:${values.topic}` });
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-ok-500/30 bg-ok-50 p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ok-500 text-white">
            <IconCheck size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink-900">Mensaje registrado</h2>
            <p className="mt-2 text-sm leading-relaxed text-steel-700">
              Gracias por escribir. Tu mensaje quedó guardado en este navegador.
            </p>
          </div>
        </div>
        <Callout tone="warn" className="mt-4">
          <strong>Estado real de esta función:</strong> el envío por correo
          necesita un servicio de correo transaccional conectado al backend.
          Mientras tanto, escríbenos por WhatsApp: ese canal sí funciona.
        </Callout>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Tu nombre" htmlFor={`${id}-name`} required error={errors.name}>
          <Input
            id={`${id}-name`}
            value={values.name}
            invalid={Boolean(errors.name)}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            autoComplete="name"
            maxLength={80}
          />
        </Field>
        <Field
          label="Correo o WhatsApp"
          htmlFor={`${id}-contact`}
          required
          error={errors.contact}
        >
          <Input
            id={`${id}-contact`}
            value={values.contact}
            invalid={Boolean(errors.contact)}
            onChange={(e) => setValues({ ...values, contact: e.target.value })}
            maxLength={120}
          />
        </Field>
      </div>

      <Field label="Asunto" htmlFor={`${id}-topic`}>
        <Select
          id={`${id}-topic`}
          value={values.topic}
          onChange={(e) => setValues({ ...values, topic: e.target.value })}
        >
          {topics.map((topic) => (
            <option key={topic.value} value={topic.value}>
              {topic.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Mensaje"
        htmlFor={`${id}-message`}
        required
        error={errors.message}
        hint="Si buscas una máquina concreta, indícanos cuál, para cuándo y en qué zona."
      >
        <Textarea
          id={`${id}-message`}
          value={values.message}
          invalid={Boolean(errors.message)}
          onChange={(e) => setValues({ ...values, message: e.target.value })}
          maxLength={1500}
        />
      </Field>

      <Button type="submit" variant="primary" size="lg" className="sm:self-start">
        Enviar mensaje
      </Button>
    </form>
  );
}
