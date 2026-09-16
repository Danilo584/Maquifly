"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readLocal, removeLocal } from "@/lib/local-store";
import { formatDate } from "@/lib/format";
import type { Machine, OwnerProfile } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconAlert, IconCheck, IconMail } from "@/components/ui/Icon";

type LocalReport = {
  id: string;
  reference: string;
  reason: string;
  comment: string;
  reporterContact: string | null;
  createdAt: string;
  status: string;
};

type LocalMessage = {
  id: string;
  name: string;
  contact: string;
  topic: string;
  message: string;
  createdAt: string;
};

type LocalRequest = {
  id: string;
  reference: string;
  name: string;
  contact: string;
  message: string;
  createdAt: string;
};

const tabs = [
  { key: "listings", label: "Publicaciones" },
  { key: "owners", label: "Propietarios" },
  { key: "reports", label: "Reportes" },
  { key: "messages", label: "Mensajes" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const reasonLabels: Record<string, string> = {
  false_info: "Información falsa",
  wrong_price: "Precio incorrecto",
  not_available: "No disponible",
  inappropriate: "Contenido inapropiado",
  possible_scam: "Posible estafa",
  other: "Otro",
};

/**
 * PANEL DE ADMINISTRACIÓN — ESQUELETO FUNCIONAL
 * ---------------------------------------------------------------------------
 * Muestra la estructura real que tendrá la moderación: publicaciones con su
 * estado, propietarios con su nivel de verificación, reportes y mensajes.
 *
 * Hoy lee del catálogo y del almacenamiento local del navegador. NO tiene
 * autenticación ni permisos, y por eso no realiza ninguna acción destructiva
 * sobre datos compartidos: solo puede limpiar lo que este mismo navegador
 * guardó. Al conectar Supabase, cada pestaña pasa a leer su tabla y los
 * botones de aprobar/ocultar ejecutan la mutación correspondiente, detrás de
 * un rol `admin` protegido por políticas de acceso por fila.
 */
export function AdminPanel({
  machines,
  owners,
}: {
  machines: Machine[];
  owners: OwnerProfile[];
}) {
  const [tab, setTab] = useState<TabKey>("listings");
  const [reports, setReports] = useState<LocalReport[]>([]);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [requests, setRequests] = useState<LocalRequest[]>([]);

  useEffect(() => {
    setReports(readLocal<LocalReport[]>("reports", []));
    setMessages(readLocal<LocalMessage[]>("contact-messages", []));
    setRequests(readLocal<LocalRequest[]>("info-requests", []));
  }, []);

  function clearLocal(key: string) {
    removeLocal(key);
    if (key === "reports") setReports([]);
    if (key === "contact-messages") setMessages([]);
    if (key === "info-requests") setRequests([]);
  }

  return (
    <div>
      <Callout tone="warn" title="Panel sin autenticación">
        Esta pantalla es el esqueleto del panel de administración. No hay
        control de acceso porque todavía no hay sistema de cuentas: en
        producción esta ruta debe quedar detrás de autenticación y de un rol
        <code> admin</code>. Los reportes y mensajes que aparecen aquí son los
        que este navegador guardó localmente, no los de otros usuarios.
      </Callout>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Stat label="Publicaciones" value={machines.length} note="catálogo actual" />
        <Stat label="Propietarios" value={owners.length} note="catálogo actual" />
        <Stat label="Reportes" value={reports.length} note="en este navegador" />
        <Stat
          label="Mensajes"
          value={messages.length + requests.length}
          note="en este navegador"
        />
      </div>

      <div className="mt-8 border-b border-steel-200">
        <nav aria-label="Secciones del panel">
          <ul className="no-scrollbar flex gap-1 overflow-x-auto">
            {tabs.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => setTab(item.key)}
                  aria-current={tab === item.key ? "page" : undefined}
                  className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                    tab === item.key
                      ? "border-brand-600 text-brand-800"
                      : "border-transparent text-steel-500 hover:text-ink-900"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mt-6">
        {tab === "listings" && (
          <Table
            head={["Referencia", "Máquina", "Zona", "Estado", "Origen", ""]}
            rows={machines.map((machine) => [
              <span key="ref" className="font-mono text-xs">
                {machine.reference}
              </span>,
              <span key="name" className="font-semibold text-ink-900">
                {machine.name}
              </span>,
              machine.area,
              <Badge key="st" tone="ok" size="sm">
                Publicada
              </Badge>,
              machine.isDemo ? (
                <Badge key="demo" tone="demo" size="sm">
                  DEMO
                </Badge>
              ) : (
                <Badge key="real" tone="brand" size="sm">
                  Real
                </Badge>
              ),
              <Link
                key="link"
                href={`/maquina/${machine.slug}`}
                className="text-sm font-semibold text-brand-700 hover:underline"
              >
                Ver
              </Link>,
            ])}
          />
        )}

        {tab === "owners" && (
          <Table
            head={["Propietario", "Zona", "Máquinas", "Verificación", ""]}
            rows={owners.map((owner) => [
              <span key="n" className="font-semibold text-ink-900">
                {owner.businessName}
              </span>,
              owner.area ?? "—",
              String(owner.machineCount),
              <Badge key="v" tone="neutral" size="sm">
                Registrado
              </Badge>,
              <Link
                key="l"
                href={`/propietario/${owner.slug}`}
                className="text-sm font-semibold text-brand-700 hover:underline"
              >
                Ver perfil
              </Link>,
            ])}
          />
        )}

        {tab === "reports" && (
          <>
            {reports.length === 0 ? (
              <EmptyState
                tone="dashed"
                icon={<IconAlert size={24} />}
                title="Sin reportes registrados en este navegador"
                description="Usa «Reportar publicación» en cualquier ficha de maquinaria para ver cómo llegan aquí."
              />
            ) : (
              <>
                <Table
                  head={["Publicación", "Motivo", "Detalle", "Contacto", "Fecha"]}
                  rows={reports.map((report) => [
                    <span key="r" className="font-mono text-xs">
                      {report.reference}
                    </span>,
                    <Badge key="m" tone="warn" size="sm">
                      {reasonLabels[report.reason] ?? report.reason}
                    </Badge>,
                    <span key="c" className="text-sm text-steel-600">
                      {report.comment || "—"}
                    </span>,
                    report.reporterContact ?? "—",
                    formatDate(report.createdAt),
                  ])}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4"
                  onClick={() => clearLocal("reports")}
                >
                  Limpiar reportes locales
                </Button>
              </>
            )}
          </>
        )}

        {tab === "messages" && (
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-base font-bold text-ink-900">
                Mensajes de contacto
              </h2>
              <div className="mt-3">
                {messages.length === 0 ? (
                  <EmptyState
                    tone="dashed"
                    icon={<IconMail size={24} />}
                    title="Sin mensajes en este navegador"
                  />
                ) : (
                  <Table
                    head={["Nombre", "Contacto", "Asunto", "Mensaje", "Fecha"]}
                    rows={messages.map((message) => [
                      message.name,
                      message.contact,
                      message.topic,
                      <span key="m" className="text-sm text-steel-600">
                        {message.message}
                      </span>,
                      formatDate(message.createdAt),
                    ])}
                  />
                )}
              </div>
            </div>

            <div>
              <h2 className="text-base font-bold text-ink-900">
                Solicitudes de información
              </h2>
              <div className="mt-3">
                {requests.length === 0 ? (
                  <EmptyState
                    tone="dashed"
                    icon={<IconCheck size={24} />}
                    title="Sin solicitudes en este navegador"
                  />
                ) : (
                  <Table
                    head={["Publicación", "Nombre", "Contacto", "Mensaje", "Fecha"]}
                    rows={requests.map((request) => [
                      <span key="r" className="font-mono text-xs">
                        {request.reference}
                      </span>,
                      request.name,
                      request.contact,
                      <span key="m" className="text-sm text-steel-600">
                        {request.message}
                      </span>,
                      formatDate(request.createdAt),
                    ])}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-steel-200 bg-white p-4">
      <p className="text-xs font-medium text-steel-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink-900">{value}</p>
      <p className="mt-0.5 text-xs text-steel-400">{note}</p>
    </div>
  );
}

function Table({
  head,
  rows,
}: {
  head: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-steel-200">
      <table className="w-full min-w-3xl border-collapse bg-white text-left">
        <thead>
          <tr className="border-b border-steel-200 bg-steel-50">
            {head.map((cell, i) => (
              <th
                key={i}
                scope="col"
                className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-steel-500"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-steel-100 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top text-sm text-steel-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
