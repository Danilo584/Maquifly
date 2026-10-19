import { Section } from "@/components/ui/Section";
import { IconCheck } from "@/components/ui/Icon";
import { MachineRequestForm } from "@/components/request/MachineRequestForm";

const steps = [
  "Nos dices qué máquina necesitas, dónde y para cuándo.",
  "La buscamos entre los propietarios de tu zona.",
  "Te escribimos por WhatsApp con las opciones que encontremos.",
];

/** Bloque de portada «¿No encuentras la máquina? Te la conseguimos». */
export function MachineRequestSection() {
  return (
    <Section tone="dark" id="te-la-conseguimos">
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-volt-400">
            Te la conseguimos
          </p>
          <h2 className="text-[1.6rem] font-extrabold leading-tight text-white sm:text-3xl">
            ¿No encuentras la máquina que necesitas?
          </h2>
          <p className="mt-3 max-w-xl text-[0.98rem] leading-relaxed text-ink-200">
            Dinos qué necesitas y te buscamos un propietario en tu zona. Es gratis
            y no te compromete a nada.
          </p>
          <ol className="mt-7 flex flex-col gap-4">
            {steps.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-volt-400 text-sm font-extrabold text-ink-950">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-[0.95rem] leading-relaxed text-ink-100">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-7 hidden items-center gap-2 text-sm text-ink-300 lg:flex">
            <IconCheck size={16} className="text-volt-400" />
            Una persona de MaquiFly revisa cada pedido.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 text-ink-900 shadow-card sm:p-7">
          <MachineRequestForm context="portada" />
        </div>
      </div>
    </Section>
  );
}
