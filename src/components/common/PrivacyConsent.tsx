import Link from "next/link";

/**
 * Casilla de consentimiento para formularios que recogen datos personales
 * (nombre, teléfono, correo). Obligatoria antes de enviar.
 */
export function PrivacyConsent({
  id,
  checked,
  onChange,
  error,
  purpose = "responder mi consulta",
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  purpose?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={`flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-3 transition-colors hover:border-steel-300 has-checked:border-brand-500 has-checked:bg-brand-50 ${
          error ? "border-danger-500" : "border-steel-200"
        }`}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-4.5 shrink-0 accent-brand-600"
        />
        <span className="text-sm leading-relaxed text-steel-700">
          Acepto que MaquiFly use mis datos para {purpose}, según la{" "}
          <Link
            href="/privacidad"
            target="_blank"
            className="font-semibold text-brand-700 underline underline-offset-2"
          >
            Política de privacidad
          </Link>
          .
        </span>
      </label>
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-danger-700">
          {error}
        </p>
      )}
    </div>
  );
}
