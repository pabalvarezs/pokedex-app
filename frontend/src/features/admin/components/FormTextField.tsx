import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/cn";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  icon?: ReactNode;
  hint?: string;
  error?: string;
  rightSlot?: ReactNode;
}

export default function FormTextField({
  label,
  icon,
  hint,
  error,
  rightSlot,
  className,
  id,
  ...rest
}: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-500"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            "w-full rounded-control border border-line bg-white/90 py-2.5 text-sm text-ink-900 shadow-sm outline-none transition duration-150 placeholder:text-ink-500/70 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-ink-500",
            icon ? "pl-9" : "pl-3",
            rightSlot ? "pr-10" : "pr-3",
            error && "border-red-300",
            className
          )}
          {...rest}
        />
        {rightSlot && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            {rightSlot}
          </span>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-[11px] font-semibold text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 text-[11px] text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
