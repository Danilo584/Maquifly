import { IconSearch, IconFilter, IconWhatsApp, IconCheck } from "@/components/ui/Icon";

const steps = [
  {
    Icon: IconSearch,
    title: "Encuentra",
    text: "Busca la maquinaria que necesitas por categoría, ciudad o nombre del equipo.",
  },
  {
    Icon: IconFilter,
    title: "Compara",
    text: "Revisa características, ubicación, condiciones, si incluye operador y si hay transporte.",
  },
  {
    Icon: IconWhatsApp,
    title: "Contacta",
    text: "Escribe directamente al propietario por WhatsApp, con los datos de la máquina ya en el mensaje.",
  },
  {
    Icon: IconCheck,
    title: "Alquila",
    text: "Coordinan precio, fechas y condiciones entre ustedes. MaquiFly no interviene en el acuerdo.",
  },
];

export function HowItWorks({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className={`relative flex gap-3 rounded-2xl border p-4 sm:flex-col sm:gap-0 sm:p-5 ${
            dark
              ? "border-white/10 bg-white/5"
              : "border-steel-200 bg-white shadow-card"
          }`}
        >
          <div className="flex shrink-0 items-start justify-between">
            <span
              className={`flex size-11 items-center justify-center rounded-lg ${
                dark ? "bg-volt-400 text-ink-950" : "bg-ink-900 text-volt-400"
              }`}
            >
              <step.Icon size={22} />
            </span>
            <span
              aria-hidden="true"
              className={`hidden font-display text-3xl font-extrabold sm:block ${
                dark ? "text-white/10" : "text-steel-200"
              }`}
            >
              0{index + 1}
            </span>
          </div>
          <div>
          <h3
            className={`text-lg font-bold sm:mt-4 ${dark ? "text-white" : "text-ink-900"}`}
          >
            {step.title}
          </h3>
          <p
            className={`mt-1.5 text-sm leading-relaxed ${
              dark ? "text-ink-200" : "text-steel-600"
            }`}
          >
            {step.text}
          </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
