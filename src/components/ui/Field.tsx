import type {
  ComponentPropsWithoutRef,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { IconChevronDown } from "@/components/ui/Icon";

/**
 * Primitivas de formulario accesibles.
 * Cada control recibe siempre un <label> asociado por id, el error se anuncia
 * con aria-describedby + role="alert", y el estado inválido no depende solo
 * del color (se añade texto).
 */

const controlBase =
  "w-full rounded-lg border bg-white px-3.5 text-[0.95rem] text-ink-900 placeholder:text-steel-400 transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none disabled:bg-steel-100 disabled:text-steel-500";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-900">
        {label}
        {required && (
          <span className="ml-1 text-danger-500" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (obligatorio)</span>}
      </label>
      {hint && (
        <p id={`${htmlFor}-hint`} className="text-xs leading-relaxed text-steel-500">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="text-xs font-medium text-danger-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({
  invalid,
  className = "",
  ...rest
}: ComponentPropsWithoutRef<"input"> & { invalid?: boolean }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={`${controlBase} h-11 ${
        invalid ? "border-danger-500" : "border-steel-300"
      } ${className}`}
      {...rest}
    />
  );
}

export function Textarea({
  invalid,
  className = "",
  ...rest
}: ComponentPropsWithoutRef<"textarea"> & { invalid?: boolean }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={`${controlBase} min-h-32 resize-y py-2.5 leading-relaxed ${
        invalid ? "border-danger-500" : "border-steel-300"
      } ${className}`}
      {...rest}
    />
  );
}

export function Select({
  invalid,
  className = "",
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={`${controlBase} h-11 appearance-none pr-10 ${
          invalid ? "border-danger-500" : "border-steel-300"
        } ${className}`}
        {...rest}
      >
        {children}
      </select>
      <IconChevronDown
        size={18}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-steel-500"
      />
    </div>
  );
}

export function Checkbox({
  label,
  description,
  id,
  ...rest
}: ComponentPropsWithoutRef<"input"> & { label: string; description?: string }) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-steel-200 bg-white p-3 transition-colors hover:border-steel-300 has-checked:border-brand-500 has-checked:bg-brand-50"
    >
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 size-4.5 shrink-0 accent-brand-600"
        {...rest}
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink-900">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs leading-relaxed text-steel-500">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

export function RadioCard({
  label,
  description,
  id,
  ...rest
}: ComponentPropsWithoutRef<"input"> & { label: string; description?: string }) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-steel-200 bg-white p-3 transition-colors hover:border-steel-300 has-checked:border-brand-500 has-checked:bg-brand-50"
    >
      <input
        id={id}
        type="radio"
        className="mt-0.5 size-4.5 shrink-0 accent-brand-600"
        {...rest}
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink-900">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs leading-relaxed text-steel-500">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
