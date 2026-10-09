"use client";

import { useState } from "react";
import type { Machine, OwnerProfile } from "@/lib/types";
import { buildBrokeredMessage, buildMachineMessage, whatsappUrl } from "@/lib/whatsapp";
import { plans } from "@/lib/plans";
import { siteConfig } from "@/lib/site";
import { track } from "@/lib/analytics";
import { trackMachineEvent } from "@/lib/machine-events";
import { Button, LinkButton } from "@/components/ui/Button";
import { IconClose, IconWhatsApp } from "@/components/ui/Icon";
import { Callout } from "@/components/ui/Callout";

/**
 * WhatsApp es el principal punto de conversión del MVP.
 *
 * El mensaje se arma con el nombre de la máquina, su ubicación, el código de
 * publicación y el enlace, para que el propietario no tenga que preguntar de
 * qué equipo se trata.
 *
 * En publicaciones DEMO el botón NO abre WhatsApp: los números de los
 * propietarios de demostración no existen y abrir un chat hacia un número
 * inventado sería exactamente el tipo de falso funcionamiento que este
 * proyecto evita. En su lugar se muestra el mensaje que se enviaría.
 */
export function WhatsAppCta({
  machine,
  owner,
  size = "lg",
  fullWidth = true,
}: {
  machine: Machine;
  owner: OwnerProfile | null;
  size?: "md" | "lg";
  fullWidth?: boolean;
}) {
  const [showPreview, setShowPreview] = useState(false);
  // Regla comercial: solo Fly Plus/Pro muestran el WhatsApp del propietario.
  // En Fly Start el cliente escribe a MaquiFly, que intermedia el contacto.
  const direct = Boolean(owner && plans[owner.plan].directWhatsapp && owner.whatsapp);
  const message = direct ? buildMachineMessage(machine) : buildBrokeredMessage(machine);
  const phone = direct ? owner!.whatsapp : siteConfig.contact.whatsapp;
  const href = whatsappUrl(phone, message);

  function handleReal() {
    trackMachineEvent(machine.id, "whatsapp");
    track({
      name: "whatsapp_click",
      machineId: machine.id,
      reference: machine.reference,
      ownerId: machine.ownerId,
      brokered: !direct,
    });
  }

  if (machine.isDemo) {
    return (
      <>
        <Button
          variant="whatsapp"
          size={size}
          fullWidth={fullWidth}
          onClick={() => setShowPreview(true)}
        >
          <IconWhatsApp size={20} />
          Ver el mensaje de WhatsApp
        </Button>
        <p className="mt-2 text-center text-xs text-steel-500">
          Publicación DEMO: no se abre ningún chat real.
        </p>

        {showPreview && (
          <div className="fixed inset-0 z-60 flex items-end justify-center p-0 sm:items-center sm:p-4">
            <div
              className="absolute inset-0 bg-ink-950/60"
              onClick={() => setShowPreview(false)}
              aria-hidden="true"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="wa-preview-title"
              className="relative w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-pop sm:rounded-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 id="wa-preview-title" className="text-lg font-bold text-ink-900">
                  Así llegaría el mensaje
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2"
                  aria-label="Cerrar"
                  onClick={() => setShowPreview(false)}
                >
                  <IconClose size={20} />
                </Button>
              </div>

              <div className="mt-4 rounded-xl bg-[#e5ddd5] p-4">
                <div className="ml-auto max-w-[92%] rounded-lg rounded-tr-none bg-[#d9fdd3] px-3.5 py-2.5 shadow-sm">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-ink-900">
                    {message}
                  </p>
                </div>
              </div>

              <Callout tone="warn" className="mt-4">
                Esta es una publicación de demostración: el propietario y su
                número no existen, por eso el botón no abre WhatsApp. En una
                publicación real, este mismo mensaje se abre en el chat del
                propietario con un solo toque.
              </Callout>

              <Button
                variant="secondary"
                fullWidth
                className="mt-4"
                onClick={() => setShowPreview(false)}
              >
                Entendido
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <LinkButton
        href={href}
        external
        variant="whatsapp"
        size={size}
        fullWidth={fullWidth}
        onClick={handleReal}
      >
        <IconWhatsApp size={20} />
        {direct ? "Contactar por WhatsApp" : "Consultar por WhatsApp"}
      </LinkButton>
      <p className="mt-2 text-center text-xs text-steel-500">
        {direct
          ? `Se abre el chat con el propietario, con el mensaje ya escrito y el código ${machine.reference}.`
          : `Te atiende MaquiFly y te pone en contacto con el propietario. Indica el código ${machine.reference}.`}
      </p>
    </>
  );
}
