/**
 * Utilitário para formatação e validação de telefones brasileiros
 */

/**
 * Formata um telefone brasileiro no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 * @param phone Telefone sem formatação ou parcialmente formatado
 * @returns Telefone formatado
 */
export function formatPhone(phone: string): string {
  if (!phone) return ''

  // Remove todos os caracteres não numéricos
  const numbers = phone.replace(/\D/g, '')

  // Limita a 11 dígitos (máximo para celular brasileiro)
  const limitedNumbers = numbers.slice(0, 11)

  // Aplica a máscara conforme o tamanho
  if (limitedNumbers.length <= 2) {
    return `(${limitedNumbers}`
  } else if (limitedNumbers.length <= 6) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`
  } else if (limitedNumbers.length <= 10) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`
  } else {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`
  }
}

/**
 * Remove formatação do telefone, retornando apenas números
 * @param phone Telefone formatado ou não
 * @returns Telefone apenas com números
 */
export function unformatPhone(phone: string): string {
  if (!phone) return ''
  return phone.replace(/\D/g, '')
}

/**
 * Valida se um telefone brasileiro está completo
 * @param phone Telefone formatado ou não
 * @returns true se o telefone está completo (10 ou 11 dígitos)
 */
export function isValidPhone(phone: string): boolean {
  const numbers = unformatPhone(phone)
  // Telefone brasileiro deve ter 10 dígitos (fixo) ou 11 dígitos (celular)
  return numbers.length === 10 || numbers.length === 11
}

/**
 * Hook para usar máscara de telefone em inputs
 * @param value Valor atual do input
 * @returns Objeto com valor formatado e função para atualizar
 */
export function usePhoneMask(value: string) {
  const formatted = formatPhone(value)
  const unformatted = unformatPhone(value)
  const isValid = isValidPhone(value)

  return {
    formatted,
    unformatted,
    isValid,
  }
}
