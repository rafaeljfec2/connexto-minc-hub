/**
 * Utilitário para testar violações CSP no frontend
 *
 * Use no console do navegador ou em um componente de teste:
 *
 * import { triggerCspViolation } from '@/utils/test-csp-violation'
 * triggerCspViolation('script-src', 'inline')
 */

/* eslint-disable no-console -- Este arquivo é para testes e precisa usar console para debug */

/**
 * Dispara uma violação CSP de teste
 * @param directive Diretiva CSP violada (ex: 'script-src', 'style-src')
 * @param blockedUri URI bloqueada (ex: 'inline', 'eval', 'javascript:')
 */
export function triggerCspViolation(directive: string, blockedUri: string): void {
  if (globalThis.window === undefined) {
    console.warn('CSP violation test can only run in browser')
    return
  }

  console.log(`🧪 Triggering CSP violation: ${directive} -> ${blockedUri}`)

  switch (directive) {
    case 'script-src':
      if (blockedUri === 'inline') {
        // Tentar executar script inline (será bloqueado pelo CSP)
        const script = document.createElement('script')
        script.textContent = "console.log('This inline script should be blocked by CSP')"
        document.head.appendChild(script)
      } else if (blockedUri === 'eval') {
        // Tentar usar eval (será bloqueado pelo CSP)
        try {
          eval("console.log('This eval should be blocked by CSP')")
        } catch (e) {
          console.log('Eval blocked (expected):', e)
        }
      }
      break

    case 'style-src':
      if (blockedUri === 'inline') {
        // Tentar adicionar estilo inline (será bloqueado pelo CSP)
        const style = document.createElement('style')
        style.textContent = 'body { background: red !important; }'
        document.head.appendChild(style)
      }
      break

    case 'img-src':
      if (blockedUri.startsWith('http://')) {
        // Tentar carregar imagem de origem não permitida
        const img = document.createElement('img')
        img.src = blockedUri
        document.body.appendChild(img)
      }
      break

    default:
      console.warn(`Unknown directive: ${directive}`)
  }

  console.log('✅ CSP violation triggered. Check browser console and API logs for the report.')
}

/**
 * Testa múltiplas violações CSP comuns
 */
export function testCommonCspViolations(): void {
  console.log('🧪 Testing common CSP violations...\n')

  // Test inline script
  triggerCspViolation('script-src', 'inline')

  // Test eval
  setTimeout(() => {
    triggerCspViolation('script-src', 'eval')
  }, 1000)

  // Test inline style
  setTimeout(() => {
    triggerCspViolation('style-src', 'inline')
  }, 2000)

  console.log('\n✅ All test violations triggered. Check browser console and API logs.')
}
