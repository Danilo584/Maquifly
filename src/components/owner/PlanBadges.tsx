import { Badge } from "@/components/ui/Badge";
import { IconAward, IconBolt } from "@/components/ui/Icon";
import { isBoostActive, plans, type PlanId } from "@/lib/plans";

/**
 * Insignias comerciales. Solo se muestran cuando el estado es real:
 * - «Destacado»: el propietario tiene Fly Plus/Pro activo, o la máquina tiene
 *   un Destacado Express vigente (los activa la administración tras verificar
 *   el pago).
 * - «Socio Fundador»: uno de los 10 primeros propietarios con plan de pago.
 *   Es permanente.
 */
export function FeaturedBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <Badge tone="volt" size={size} title="Publicación con visibilidad preferente en MaquiFly">
      <IconBolt size={size === "sm" ? 12 : 14} />
      Destacado
    </Badge>
  );
}

export function FounderBadge({
  size = "sm",
  number,
}: {
  size?: "sm" | "md";
  number?: number | null;
}) {
  return (
    <Badge
      tone="dark"
      size={size}
      title="Uno de los 10 primeros propietarios que confiaron en MaquiFly"
      className="!text-volt-300"
    >
      <IconAward size={size === "sm" ? 12 : 14} />
      Socio Fundador{number ? ` #${number}` : ""}
    </Badge>
  );
}

/** ¿Esta máquina lleva la etiqueta «Destacado»? */
export function machineIsFeatured(machine: {
  ownerPlan: PlanId;
  featuredUntil: string | null;
}): boolean {
  return plans[machine.ownerPlan].featuredBadge || isBoostActive(machine.featuredUntil);
}
