/**
 * Normaliza números de telefone removendo caracteres não numéricos
 * e validando o tamanho mínimo
 */
export function normalizePhone(phone: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '') // Remove non-digits
  // Basic validation: assume a valid Brazilian phone has at least 10 digits (DDD + 8/9 dígitos)
  if (cleaned.length < 10) {
    return '' // Or throw an error, depending on desired strictness
  }
  return cleaned
}
