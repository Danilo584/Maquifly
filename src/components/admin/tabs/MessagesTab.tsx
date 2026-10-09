"use client";

import { useCallback, useEffect, useState } from "react";
import { whatsappUrl } from "@/lib/whatsapp";
import { Badge } from "@/components/ui/Badge";
import type { TabProps } from "@/components/admin/AdminApp";
import { Card, db, Empty, ErrorNote, formatDateTime, Panel } from "@/components/admin/admin-shared";

type Message = {
  id: string;
  name: string;
  contact: string;
  topic: string | null;
  message: string;
  kind: "contact" | "info_request";
  status: "new" | "read" | "archived";
  machine_id: string | null;
  created_at: string;
};

const filters = [
  { key: "inbox", label: "Bandeja" },
  { key: "archived", label: "Archivados" },
] as const;

export function MessagesTab({ onChange }: TabProps) {
  const [view, setView] = useState<(typeof filters)[number]["key"]>("inbox");
  const [items, setItems] = useState<Message[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    let query = db().from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200);
    query = view === "inbox" ? query.neq("status", "archived") : query.eq("status", "archived");
    const { data, error: err } = await query;
    if (err) setError(err.message);
    setItems((data as Message[]) ?? []);
  }, [view]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: Message["status"]) {
    const { error: err } = await db().from("contact_messages").update({ status }).eq("id", id);
    if (err) return setError(err.message);
    await load();
    onChange();
  }

  return (
    <Panel
      title="Mensajes"
      description="Lo que escriben en Contacto y en «Solicitar información» de cada máquina. Responde por WhatsApp o correo y márcalo como leído."
      actions={filters.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => setView(f.key)}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
            view === f.key ? "bg-ink-900 text-white" : "border border-steel-300 bg-white text-ink-800"
          }`}
        >
          {f.label}
        </button>
      ))}
    >
      <ErrorNote message={error} />
      {items === null ? (
        <p className="text-sm text-steel-500">Cargando…</p>
      ) : items.length === 0 ? (
        <Empty>{view === "inbox" ? "No hay mensajes. Cuando alguien escriba desde la web, aparecerá aquí." : "No hay mensajes archivados."}</Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((m) => {
            const digits = m.contact.replace(/\D/g, "");
            const isPhone = digits.length >= 9 && !m.contact.includes("@");
            const isEmail = m.contact.includes("@");
            return (
              <li key={m.id}>
                <Card className={m.status === "new" ? "border-volt-500 ring-1 ring-volt-400" : ""}>
                  <div className="flex flex-wrap items-center gap-2">
                    {m.status === "new" && <Badge tone="volt" size="sm">Nuevo</Badge>}
                    <Badge tone={m.kind === "info_request" ? "brand" : "neutral"} size="sm">
                      {m.kind === "info_request" ? "Solicitud de información" : "Contacto"}
                    </Badge>
                    <span className="text-xs text-steel-500">{formatDateTime(m.created_at)}</span>
                  </div>
                  <p className="mt-2 font-bold text-ink-900">
                    {m.name} · <span className="font-semibold text-steel-600">{m.contact}</span>
                  </p>
                  {m.topic && <p className="text-sm font-semibold text-brand-700">{m.topic}</p>}
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-steel-700">{m.message}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    {isPhone && (
                      <a
                        href={whatsappUrl(digits, `Hola ${m.name}, te escribimos de MaquiFly por tu mensaje en la web.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => m.status === "new" && setStatus(m.id, "read")}
                        className="rounded-lg bg-[#128C7E] px-3 py-1.5 font-semibold text-white hover:bg-[#0f7a6d]"
                      >
                        Responder por WhatsApp
                      </a>
                    )}
                    {isEmail && (
                      <a
                        href={`mailto:${m.contact}?subject=${encodeURIComponent("MaquiFly — respuesta a tu mensaje")}`}
                        onClick={() => m.status === "new" && setStatus(m.id, "read")}
                        className="rounded-lg bg-brand-600 px-3 py-1.5 font-semibold text-white hover:bg-brand-700"
                      >
                        Responder por correo
                      </a>
                    )}
                    {m.status === "new" && (
                      <button type="button" onClick={() => setStatus(m.id, "read")} className="rounded-lg border border-steel-300 px-3 py-1.5 font-semibold text-ink-800 hover:bg-steel-50">
                        Marcar leído
                      </button>
                    )}
                    {m.status !== "archived" ? (
                      <button type="button" onClick={() => setStatus(m.id, "archived")} className="rounded-lg border border-steel-300 px-3 py-1.5 font-semibold text-steel-600 hover:bg-steel-50">
                        Archivar
                      </button>
                    ) : (
                      <button type="button" onClick={() => setStatus(m.id, "read")} className="rounded-lg border border-steel-300 px-3 py-1.5 font-semibold text-steel-600 hover:bg-steel-50">
                        Devolver a bandeja
                      </button>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
