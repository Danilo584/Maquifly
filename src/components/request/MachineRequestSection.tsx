import { Section } from "@/components/ui/Section";
import { MachineRequestForm } from "@/components/request/MachineRequestForm";
import { VideoComoPedir } from "@/components/request/VideoComoPedir";

/**
 * Bloque de portada «¿No encuentras la máquina? Te la conseguimos».
 * A la izquierda, el video de demostración (ya trae el título y los pasos);
 * a la derecha, el formulario. El título queda para lectores de pantalla.
 */
export function MachineRequestSection() {
  return (
    <Section tone="dark" id="te-la-conseguimos">
      <h2 className="sr-only">¿No encuentras la máquina que necesitas? Te la conseguimos</h2>
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <VideoComoPedir className="mx-auto w-full max-w-xl lg:max-w-none" />

        <div className="rounded-2xl bg-white p-5 text-ink-900 shadow-card sm:p-7">
          <MachineRequestForm context="portada" />
        </div>
      </div>
    </Section>
  );
}
