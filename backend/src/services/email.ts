/**
 * Envío de correos transaccionales sin dependencias nuevas.
 *
 * Usa la API HTTP de Resend (https://resend.com) porque funciona con `fetch`
 * incluido en Node 20. Si no hay proveedor configurado, el flujo de
 * recuperación sigue operativo: el enlace queda disponible en el panel de
 * administración para que un admin se lo entregue al entrenador.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export function isEmailDeliveryConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface PasswordResetEmail {
  to: string;
  name: string;
  url: string;
  expiresAt: Date;
}

function buildHtml({ name, url, expiresAt }: PasswordResetEmail): string {
  const minutes = Math.max(1, Math.round((expiresAt.getTime() - Date.now()) / 60000));
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(url);

  return `<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="background:#dc2626;padding:20px 24px;color:#ffffff;font-size:20px;font-weight:bold;">⚡ PokeChile</td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 12px;font-size:16px;">Hola, ${safeName} 👋</p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta.
            Este enlace es de un solo uso y vence en ${minutes} minutos.
          </p>
          <p style="margin:0 0 20px;">
            <a href="${safeUrl}" style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 20px;border-radius:10px;">
              Restablecer mi contraseña
            </a>
          </p>
          <p style="margin:0 0 8px;font-size:12px;color:#6b7280;line-height:1.6;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:
          </p>
          <p style="margin:0 0 20px;font-size:11px;color:#dc2626;word-break:break-all;">${safeUrl}</p>
          <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
            Si no pediste este cambio, ignora este correo: tu contraseña actual sigue funcionando.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendPasswordResetEmail(message: PasswordResetEmail): Promise<boolean> {
  if (!isEmailDeliveryConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[email] Proveedor no configurado. Enlace de recuperación para ${message.to}: ${message.url}`
      );
    } else {
      console.warn(
        "[email] Proveedor no configurado. El enlace de recuperación quedó disponible en el panel de admin."
      );
    }
    return false;
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [message.to],
        subject: "Restablece tu contraseña de PokeChile",
        html: buildHtml(message),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`[email] Resend respondió ${response.status}: ${detail.slice(0, 300)}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[email] No se pudo enviar el correo:", error);
    return false;
  }
}
