import { useId, type SelectHTMLAttributes } from "react";
import { cn } from "../lib/cn";

interface Option {
  value: string;
  label: string;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  placeholder?: string;
  hint?: string;
  error?: string;
}

export default function FormSelect({
  label,
  options,
  placeholder,
  hint,
  error,
  className,
  id,
  ...rest
}: Props) {
  const autoId = useId();
  const selectId = id ?? autoId;

  return (
    <div>
      <label
        htmlFor={selectId}
        className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-500"
      >
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full rounded-control border border-line bg-white/90 px-3 py-2.5 text-sm text-ink-900 shadow-sm outline-none transition duration-150 focus:ring-2",
          error && "border-red-300",
          className
        )}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="mt-1 text-[11px] font-semibold text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}
