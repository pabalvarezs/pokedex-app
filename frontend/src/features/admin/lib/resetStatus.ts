/** Las solicitudes vencidas se muestran igual, pero con estado en rojo. */
export function isResetExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}
