"use client";

import { useCallback, useEffect, useState } from "react";
import { plans, planOrder, type PlanId } from "@/lib/plans";
import { verificationLabel } from "@/lib/format";
import type { VerificationStatus } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import type { TabProps } from "@/components/admin/AdminApp";
import {
  Card,
  db,
  Empty,
  ErrorNote,
  makeSlug,
  Modal,
  normalizeWhatsapp,
  Panel,
  piuraDistricts,
} from "@/components/admin/admin-shared";

export type OwnerRow = {
  id: string;
  slug: string;
  business_name: string;
  description: string;
  location_id: string;
  area: string | null;
  whatsapp: string;
  phone: string | null;
  ruc: string | null;
  verification_status: VerificationStatus;
  plan: PlanId;
  plan_expires_at: string | null;
  founder_number: number | null;
  machine_count: number;
};

export async function fetchOwners(): Promise<OwnerRow[]> {
  const { data } = await db().from("owner_profiles").select("*").order("business_name");
  return (data as OwnerRow[]) ?? [];
}

export function planIsActive(o: Pick<OwnerRow, "plan" | "plan_expires_at">): boolean {
  return o.plan !== "start" && !!o.plan_expires_at && new Date(o.plan_expires_at) > new Date();
}

export function OwnersTab({ onChange }: TabProps) {
  const [items, setItems] = useState<OwnerRow[] | null>(null);
  const [editing, setEditing] = useState<OwnerRow | "new" | null>(null);

  const load = useCallback(async () => setItems(await fetchOwners()), []);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <Panel
      title="Propietarios"
      description="Dueños de las máquinas. Aquí defines su nombre público, WhatsApp, RUC, verificación y plan."
      actions={
        <Button variant="primary" size="sm" onClick={() => setEditing("new")}>
          + Nuevo propietario
        </Button>
      }
    >
      {items === null ? (
        <p className="text-sm text-steel-500">Cargando…</p>
      ) : items.length === 0 ? (
        <Empty>Aún no hay propietarios. Crea el primero (por ejemplo, tu papá) y luego publica sus máquinas.</Empty>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {items.map((o) => {
            const active = planIsActive(o);
            return (
              <li key={o.id}>
                <Card>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-ink-900">{o.business_name}</p>
                      <p className="text-sm text-steel-500">
                        {o.area ?? "Piura"} · {o.machine_count} máquina{o.machine_count === 1 ? "" : "s"} · {o.whatsapp}
                      </p>
                    </div>
                    <button type="button" onClick={() => setEditing(o)} className="shrink-0 text-sm font-semibold text-brand-700 hover:underline">
                      Editar
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge tone={active ? "brand" : "neutral"} size="sm">
                      {active ? plans[o.plan].name : "Fly Start"}
                      {active && o.plan_expires_at ? ` · vence ${new Date(o.plan_expires_at).toLocaleDateString("es-PE")}` : ""}
                    </Badge>
                    {o.plan !== "start" && !active && <Badge tone="warn" size="sm">Plan vencido</Badge>}
                    {o.founder_number !== null && <Badge tone="dark" size="sm">Socio Fundador #{o.founder_number}</Badge>}
                    <Badge tone={o.verification_status === "registered" ? "neutral" : "ok"} size="sm">
                      {verificationLabel[o.verification_status]}
                    </Badge>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <OwnerEditor
          owner={editing === "new" ? null : editing}
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

export function OwnerEditor({
  owner,
  initial,
  onClose,
  onSaved,
}: {
  owner: OwnerRow | null;
  initial?: Partial<OwnerRow>;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const [form, setForm] = useState({
    business_name: owner?.business_name ?? initial?.business_name ?? "",
    area: owner?.area ?? initial?.area ?? "",
    whatsapp: owner?.whatsapp ?? initial?.whatsapp ?? "",
    ruc: owner?.ruc ?? "",
    description: owner?.description ?? "",
    verification_status: owner?.verification_status ?? ("registered" as VerificationStatus),
    plan: owner?.plan ?? ("start" as PlanId),
    plan_expires_at: owner?.plan_expires_at ? owner.plan_expires_at.slice(0, 10) : "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function save() {
    if (form.business_name.trim().length < 2) return setError("Escribe el nombre que verán los clientes.");
    const whatsapp = normalizeWhatsapp(form.whatsapp);
    if (whatsapp.length < 9) return setError("WhatsApp no válido (9 dígitos).");
    if (form.ruc && !/^(10|15|17|20)\d{9}$/.test(form.ruc.trim())) return setError("RUC no válido: 11 dígitos, empieza con 10 o 20.");
    if (form.plan !== "start" && !form.plan_expires_at) return setError("Pon la fecha en que vence el plan.");

    setBusy(true);
    setError(null);
    const payload = {
      business_name: form.business_name.trim(),
      area: form.area.trim() || null,
      whatsapp,
      ruc: form.ruc.trim() || null,
      description: form.description.trim(),
      verification_status: form.verification_status,
      plan: form.plan,
      plan_expires_at: form.plan === "start" ? null : new Date(`${form.plan_expires_at}T23:59:00-05:00`).toISOString(),
    };
    const result = owner
      ? await db().from("owner_profiles").update(payload).eq("id", owner.id).select("id").single()
      : await db()
          .from("owner_profiles")
          .insert({ ...payload, slug: makeSlug(form.business_name), location_id: "loc-piura" })
          .select("id")
          .single();
    setBusy(false);
    if (result.error) return setError(result.error.message);
    onSaved(result.data.id);
  }

  /**
   * Borrado definitivo, solo para casos extremos (incumple las reglas,
   * perfil duplicado o de prueba). La base de datos borra en cascada sus
   * máquinas, pagos y reseñas. Se pide escribir el nombre para confirmar.
   */
  async function remove() {
    if (!owner) return;
    if (confirmName.trim().toLowerCase() !== owner.business_name.trim().toLowerCase()) {
      return setError("Escribe el nombre exacto del propietario para confirmar.");
    }
    setBusy(true);
    setError(null);
    const { error: err } = await db().from("owner_profiles").delete().eq("id", owner.id);
    setBusy(false);
    if (err) return setError(err.message);
    onSaved(owner.id);
  }

  return (
    <Modal title={owner ? `Editar · ${owner.business_name}` : "Nuevo propietario"} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Field label="Nombre público (empresa o persona)" htmlFor="o-name" required>
          <Input id="o-name" value={form.business_name} onChange={(e) => set("business_name", e.target.value)} maxLength={80} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Zona" htmlFor="o-area" hint="Distrito, nunca la dirección exacta">
            <Input id="o-area" list="o-districts" value={form.area} onChange={(e) => set("area", e.target.value)} />
            <datalist id="o-districts">
              {piuraDistricts.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </Field>
          <Field label="WhatsApp" htmlFor="o-wa" required hint="Solo se muestra con Fly Plus/Pro">
            <Input id="o-wa" inputMode="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="RUC (opcional)" htmlFor="o-ruc" hint="Visible solo en Fly Pro">
            <Input id="o-ruc" inputMode="numeric" value={form.ruc} onChange={(e) => set("ruc", e.target.value)} maxLength={11} />
          </Field>
          <Field label="Verificación" htmlFor="o-ver">
            <Select id="o-ver" value={form.verification_status} onChange={(e) => set("verification_status", e.target.value)}>
              <option value="registered">Registrado (sin verificar)</option>
              <option value="verified">Verificado</option>
              <option value="documented">Verificado + documentos de la máquina</option>
            </Select>
          </Field>
        </div>
        <Field label="Descripción (opcional)" htmlFor="o-desc">
          <Textarea id="o-desc" className="min-h-20" value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={600} />
        </Field>

        <fieldset className="rounded-xl border border-steel-200 p-4">
          <legend className="px-1 text-sm font-bold text-ink-900">Plan</legend>
          <p className="mb-3 text-xs text-steel-500">
            Normalmente el plan se activa solo al aprobar un pago. Cámbialo aquí solo para casos especiales (por ejemplo, un plan de cortesía).
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Plan" htmlFor="o-plan">
              <Select id="o-plan" value={form.plan} onChange={(e) => set("plan", e.target.value)}>
                {planOrder.map((id) => (
                  <option key={id} value={id}>
                    {plans[id].name}
                  </option>
                ))}
              </Select>
            </Field>
            {form.plan !== "start" && (
              <Field label="Vence el" htmlFor="o-exp">
                <Input id="o-exp" type="date" value={form.plan_expires_at} onChange={(e) => set("plan_expires_at", e.target.value)} />
              </Field>
            )}
          </div>
          {owner?.founder_number != null && (
            <p className="mt-3 text-sm font-semibold text-ink-900">Socio Fundador #{owner.founder_number} (permanente)</p>
          )}
        </fieldset>

        {owner && (
          <div className="rounded-xl border border-danger-500/40 bg-danger-50 p-4">
            {!confirmingDelete ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-danger-700">Eliminar propietario</p>
                  <p className="text-xs text-steel-600">Solo para casos extremos: incumple las reglas, está duplicado o es de prueba.</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => setConfirmingDelete(true)}>
                  Eliminar…
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold text-danger-700">¿Eliminar «{owner.business_name}» para siempre?</p>
                <ul className="list-disc pl-5 text-xs leading-relaxed text-steel-700">
                  <li>Se borran también sus máquinas ({owner.machine_count} publicadas), sus pagos y sus reseñas.</li>
                  <li>Su número de Socio Fundador, si tiene, se pierde.</li>
                  <li>Si tenía cuenta, podrá seguir entrando, pero ya sin perfil de propietario.</li>
                  <li>No se puede deshacer.</li>
                </ul>
                <Field label={`Escribe «${owner.business_name}» para confirmar`} htmlFor="o-del">
                  <Input id="o-del" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} autoComplete="off" />
                </Field>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={() => { setConfirmingDelete(false); setConfirmName(""); setError(null); }}>
                    No, volver
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={remove}
                    disabled={busy || confirmName.trim().toLowerCase() !== owner.business_name.trim().toLowerCase()}
                  >
                    {busy ? "Eliminando…" : "Sí, eliminar para siempre"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <ErrorNote message={error} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={save} disabled={busy}>
            {busy ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
