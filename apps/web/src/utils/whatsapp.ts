/**
 * Utility functions for WhatsApp integration
 */

/**
 * Normalizes phone number to WhatsApp format (only digits, with country code)
 * @param phone - Phone number in any format
 * @returns Normalized phone number (only digits)
 */
export function normalizePhoneForWhatsApp(phone: string): string {
  if (!phone) return ''
  // Remove todos os caracteres não numéricos usando regex global
  // SonarQube sugere replaceAll, mas replaceAll não aceita regex, então usamos replace com flag global
  // NOSONAR: S7781 - replaceAll não aceita regex, replace com flag global é necessário
  return phone.replace(/\D/g, '')
}

/**
 * Formats WhatsApp message with access code and activation link
 * @param personName - Name of the person
 * @param accessCode - Access code for activation
 * @param activationLink - Full URL to activation page
 * @returns Formatted message text
 */
export function formatWhatsAppMessage(
  personName: string,
  accessCode: string,
  activationLink: string
): string {
  const message = `Olá ${personName}! 👋

Você foi convidado(a) para ativar sua conta no sistema MINC Teams.

📋 *Código de Acesso:* ${accessCode}

🔗 *Link de Ativação:*
${activationLink}

Por favor, acesse o link acima e use o código fornecido para completar sua ativação.`

  return message
}

/**
 * Detects if the current device is mobile
 * @returns true if mobile device, false otherwise
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  )
}

/**
 * Opens WhatsApp with a pre-filled message
 * @param phone - Phone number (will be normalized)
 * @param message - Message text to send
 */
export function openWhatsApp(phone: string, message: string): void {
  const normalizedPhone = normalizePhoneForWhatsApp(phone)

  if (!normalizedPhone || normalizedPhone.length < 10) {
    throw new Error('Número de telefone inválido')
  }

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message)

  // Check if mobile or desktop
  const isMobile = isMobileDevice()

  if (isMobile) {
    // Mobile: Use WhatsApp app URL scheme
    // Format: whatsapp://send?phone=5511999999999&text=message
    const whatsappUrl = `whatsapp://send?phone=${normalizedPhone}&text=${encodedMessage}`
    window.location.href = whatsappUrl
  } else {
    // Desktop: Use WhatsApp Web
    // Format: https://web.whatsapp.com/send?phone=5511999999999&text=message
    const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${normalizedPhone}&text=${encodedMessage}`
    window.open(whatsappWebUrl, '_blank')
  }
}

/**
 * Gets the activation link URL for a person
 * @param baseUrl - Base URL of the application (optional, defaults to current origin)
 * @returns Full activation page URL
 */
export function getActivationLink(baseUrl?: string): string {
  const origin = baseUrl ?? (typeof window !== 'undefined' ? window.location.origin : '')
  return `${origin}/activate`
}
