import type { VerificationStatus } from "@/lib/types";
import { verificationHelp, verificationLabel } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { IconShield, IconUser } from "@/components/ui/Icon";

/**
 * VERIFICACIÓN HONESTA
 * ---------------------------------------------------------------------------
 * "Propietario registrado" NO es un logro: significa únicamente que la cuenta
 * existe. Por eso se muestra en gris neutro y con el texto explícito, nunca
 * con el escudo verde de verificado.
 *
 * El escudo solo aparece cuando MaquiFly verificó realmente al propietario.
 */
export function VerificationBadge({
  status,
  size = "md",
  withHelp = false,
}: {
  status: VerificationStatus;
  size?: "sm" | "md";
  withHelp?: boolean;
}) {
  const verified = status !== "registered";

  return (
    <span className="inline-flex flex-col gap-1">
      <Badge
        tone={verified ? "ok" : "neutral"}
        size={size}
        title={verificationHelp[status]}
      >
        {verified ? <IconShield size={13} /> : <IconUser size={13} />}
        {verificationLabel[status]}
      </Badge>
      {withHelp && (
        <span className="text-xs leading-relaxed text-steel-500">
          {verificationHelp[status]}
        </span>
      )}
    </span>
  );
}
