import { getPasswordStrength } from "../lib/passwordStrength";

interface Props {
  password: string;
}

/** Medidor visual de 4 segmentos; no reemplaza la validación del backend. */
export default function PasswordStrengthMeter({ password }: Props) {
  const strength = getPasswordStrength(password);

  return (
    <div aria-live="polite">
      <div className="mt-2 flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-150 ${
              segment <= strength.score ? strength.bar : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className="mt-1 text-[11px] font-semibold text-ink-500">
        Seguridad: <span className="text-ink-700">{strength.label}</span>
        <span className="font-normal"> · la contraseña necesita al menos 6 caracteres</span>
      </p>
    </div>
  );
}
