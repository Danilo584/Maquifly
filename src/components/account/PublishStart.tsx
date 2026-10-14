"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { publishForMeUrl, useSession } from "@/lib/account";
import { LinkButton } from "@/components/ui/Button";
import { IconWhatsApp } from "@/components/ui/Icon";

const steps = [
  { title: "Crea tu cuenta", text: "Con tu correo y una contraseña. Es gratis y toma un minuto." },
  { title: "Elige tu plan", text: "Fly Start es gratis. Fly Plus y Fly Pro te dan más alcance y WhatsApp directo." },
  {
    title: "Agrega tu máquina",
    text: "Fotos reales, precio y condiciones. La revisamos y la publicamos; luego la editas o pausas cuando quieras.",
  },
];

export function PublishStart() {
  const router = useRouter();
  const { session, loading } = useSession();

  // Con sesión iniciada, directo al formulario de su cuenta.
  useEffect(() => {
    if (!loading && session) router.replace("/cuenta#nueva-maquina");
  }, [loading, session, router]);

  if (loading || session) {
    return <p className="py-10 text-center text-sm text-steel-500">Cargando…</p>;
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <ol className="grid gap-3 md:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.title} className="rounded-2xl border border-steel-200 bg-white p-5">
            <span className="flex size-9 items-center justify-center rounded-full bg-ink-900 text-sm font-extrabold text-volt-400">
              {i + 1}
            </span>
            <p className="mt-3 font-bold text-ink-900">{step.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-steel-600">{step.text}</p>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-3 sm:flex-row">
        <LinkButton href="/ingresar?modo=registro" variant="primary" size="lg" className="sm:flex-1">
          Crear cuenta y publicar
        </LinkButton>
        <LinkButton href="/ingresar" variant="secondary" size="lg" className="sm:flex-1">
          Ya tengo cuenta
        </LinkButton>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-ink-950 p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="font-bold">¿Prefieres que la publiquemos por ti?</p>
          <p className="mt-1 text-sm text-ink-200">Mándanos fotos y datos por WhatsApp y nosotros armamos tu publicación.</p>
        </div>
        <LinkButton href={publishForMeUrl()} external variant="whatsapp" size="md">
          <IconWhatsApp size={18} />
          Escribir por WhatsApp
        </LinkButton>
      </div>
    </div>
  );
}
