"use client";

import { useCallback, useEffect, useState } from "react";
import {
  boostPackages,
  FOUNDER_SLOTS,
  formatPEN,
  founderPricePEN,
  plans,
} from "@/lib/plans";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Callout";
import type { TabProps } from "@/components/admin/AdminApp";
import { Card, db, Empty, ErrorNote, formatDateTime, Modal, Panel } from "@/components/admin/admin-shared";
import { fetchOwners, type OwnerRow } from "@/components/admin/tabs/OwnersTab";

type Payment = {
  id: string;
  owner_id: string;
  product: "fly-plus" | "fly-pro" | "destacado-7";
  machine_id: string | null;
  amount_pen: number;
  method: "yape" | "plin" | "transfer";
  operation_number: string | null;
  founder_requested: boolean;
  status: "pending" | "approved" | "rejected";
  note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

const productLabel: Record<Payment["product"], string> = {
  "fly-plus": "Fly Plus (1 mes)",
  "fly-pro": "Fly Pro (1 mes)",
  "destacado-7": "Destacado Express 7 días",
};

const methodLabel: Record<Payment["method"], string> = {
  yape: "Yape",
  plin: "Plin",
  transfer: "Transferencia BCP",
};

export function PaymentsTab({ onChange }: TabProps) {
  const [items, setItems] = useState<Payment[] | null>(null);
  const [owners, setOwners] = useState<OwnerRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ data, error: err }, ownerList] = await Promise.all([
      db().from("payments").select("*").order("created_at", { ascending: false }).limit(300),
      fetchOwners(),
    ]);
    if (err) setError(err.message);
    setItems((data as Payment[]) ?? []);
    setOwners(ownerList);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const ownerName = (id: string) => owners.find((o) => o.id === id)?.business_name ?? "—";
  const founders = owners.filter((o) => o.founder_number !== null).length;

  async function approve(p: Payment) {
    if (!confirm(`¿Confirmas que ya viste el abono de ${formatPEN(p.amount_pen)} en tu ${methodLabel[p.method]}?`)) return;
    setError(null);
    const { error: err } = await db().rpc("approve_payment", { p_payment_id: p.id });
    if (err) return setError(err.message);
    await load();
    onChange();
  }

  async function reject(p: Payment) {
    const note = prompt("Motivo del rechazo (opcional):") ?? "";
    const { error: err } = await db()
      .from("payments")
      .update({ status: "rejected", note: note || p.note, reviewed_at: new Date().toISOString() })
      .eq("id", p.id);
    if (err) return setError(err.message);
    await load();
    onChange();
  }

  const pending = items?.filter((p) => p.status === "pending") ?? [];
  const history = items?.filter((p) => p.status !== "pending") ?? [];

  return (
    <Panel
      title="Pagos y planes"
      description="Cuando alguien te mande su constancia por WhatsApp, regístrala aquí. Al aprobarla se activa el plan por 1 mes (o el destacado por 7 días) y, si quedan cupos, se le asigna su número de Socio Fundador."
      actions={
        <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
          + Registrar pago
        </Button>
      }
    >
      <Callout tone="info">
        Socios Fundadores: <strong>{founders} de {FOUNDER_SLOTS}</strong> cupos usados.
      </Callout>
      <ErrorNote message={error} />

      <h3 className="text-sm font-bold uppercase tracking-wider text-steel-500">Por verificar</h3>
      {items === null ? (
        <p className="text-sm text-steel-500">Cargando…</p>
      ) : pending.length === 0 ? (
        <Empty>No hay pagos pendientes.</Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {pending.map((p) => (
            <li key={p.id}>
              <Card className="border-volt-500 ring-1 ring-volt-400">
                <PaymentInfo p={p} ownerName={ownerName(p.owner_id)} />
                <div className="mt-3 flex gap-2 text-sm">
                  <button type="button" onClick={() => approve(p)} className="rounded-lg bg-ok-500 px-3 py-1.5 font-semibold text-white">
                    Aprobar y activar
                  </button>
                  <button type="button" onClick={() => reject(p)} className="rounded-lg border border-steel-300 px-3 py-1.5 font-semibold text-steel-600">
                    Rechazar
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {history.length > 0 && (
        <>
          <h3 className="mt-2 text-sm font-bold uppercase tracking-wider text-steel-500">Historial</h3>
          <ul className="flex flex-col gap-2">
            {history.map((p) => (
              <li key={p.id}>
                <Card>
                  <PaymentInfo p={p} ownerName={ownerName(p.owner_id)} />
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      {creating && (
        <PaymentForm
          owners={owners}
          foundersLeft={FOUNDER_SLOTS - founders}
          onClose={() => setCreating(false)}
          onSaved={async () => {
            setCreating(false);
            await load();
            onChange();
          }}
        />
      )}
    </Panel>
  );
}

function PaymentInfo({ p, ownerName }: { p: Payment; ownerName: string }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={p.status === "approved" ? "ok" : p.status === "rejected" ? "danger" : "volt"} size="sm">
          {p.status === "approved" ? "Aprobado" : p.status === "rejected" ? "Rechazado" : "Pendiente"}
        </Badge>
        <span className="text-xs text-steel-500">{formatDateTime(p.created_at)}</span>
        {p.founder_requested && <Badge tone="dark" size="sm">Pide cupo fundador</Badge>}
      </div>
      <p className="mt-1 font-bold text-ink-900">
        {ownerName} · {productLabel[p.product]}
      </p>
      <p className="text-sm text-steel-600">
        {formatPEN(p.amount_pen)} por {methodLabel[p.method]}
        {p.operation_number ? ` · Op. ${p.operation_number}` : ""}
        {p.note ? ` · ${p.note}` : ""}
      </p>
    </>
  );
}

function PaymentForm({
  owners,
  foundersLeft,
  onClose,
  onSaved,
}: {
  owners: OwnerRow[];
  foundersLeft: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [ownerId, setOwnerId] = useState(owners[0]?.id ?? "");
  const [product, setProduct] = useState<Payment["product"]>("fly-plus");
  const [machineId, setMachineId] = useState("");
  const [machines, setMachines] = useState<Array<{ id: string; reference: string; name: string }>>([]);
  const [method, setMethod] = useState<Payment["method"]>("yape");
  const [operation, setOperation] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const owner = owners.find((o) => o.id === ownerId);
  const isPlan = product !== "destacado-7";
  const founderPrice = isPlan && owner?.founder_number == null && foundersLeft > 0;
  const plan = product === "fly-pro" ? plans.pro : plans.plus;
  const suggested = isPlan
    ? founderPrice
      ? founderPricePEN(plan)
      : plan.pricePEN
    : boostPackages[0].pricePEN;
  const [amount, setAmount] = useState(String(suggested));

  useEffect(() => setAmount(String(suggested)), [suggested]);

  useEffect(() => {
    if (!ownerId) return;
    db()
      .from("machines")
      .select("id, reference, name")
      .eq("owner_id", ownerId)
      .then(({ data }) => {
        setMachines(data ?? []);
        setMachineId(data?.[0]?.id ?? "");
      });
  }, [ownerId]);

  async function save() {
    if (!ownerId) return setError("Elige el propietario.");
    if (!isPlan && !machineId) return setError("Elige la máquina a destacar.");
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return setError("Monto no válido.");
    setBusy(true);
    const { error: err } = await db().from("payments").insert({
      owner_id: ownerId,
      product,
      machine_id: isPlan ? null : machineId,
      amount_pen: value,
      method,
      operation_number: operation.trim() || null,
      founder_requested: founderPrice,
      note: note.trim() || null,
    });
    setBusy(false);
    if (err) return setError(err.message);
    onSaved();
  }

  return (
    <Modal title="Registrar pago" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Field label="Propietario" htmlFor="p-owner" required>
          <Select id="p-owner" value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
            {owners.length === 0 && <option value="">— Crea el propietario primero —</option>}
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.business_name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Producto" htmlFor="p-prod">
          <Select id="p-prod" value={product} onChange={(e) => setProduct(e.target.value as Payment["product"])}>
            {Object.entries(productLabel).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        {!isPlan && (
          <Field label="Máquina a destacar" htmlFor="p-mach" required>
            <Select id="p-mach" value={machineId} onChange={(e) => setMachineId(e.target.value)}>
              {machines.length === 0 && <option value="">— Este propietario no tiene máquinas —</option>}
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.reference} · {m.name}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Monto recibido (S/)" htmlFor="p-amount" hint={founderPrice ? "Precio Socio Fundador (50%)" : undefined}>
            <Input id="p-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="Medio" htmlFor="p-method">
            <Select id="p-method" value={method} onChange={(e) => setMethod(e.target.value as Payment["method"])}>
              <option value="yape">Yape</option>
              <option value="transfer">Transferencia BCP</option>
            </Select>
          </Field>
        </div>
        <Field label="N.º de operación (de la constancia)" htmlFor="p-op">
          <Input id="p-op" value={operation} onChange={(e) => setOperation(e.target.value)} />
        </Field>
        <Field label="Nota (opcional)" htmlFor="p-note">
          <Input id="p-note" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <ErrorNote message={error} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={save} disabled={busy}>
            {busy ? "Guardando…" : "Registrar (queda pendiente)"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
