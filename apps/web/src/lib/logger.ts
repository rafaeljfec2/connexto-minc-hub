/**
 * Sistema de Logging Profissional
 *
 * Níveis de log:
 * - DEBUG: Informações detalhadas para desenvolvimento
 * - INFO: Informações gerais sobre o funcionamento
 * - WARN: Avisos que não impedem o funcionamento
 * - ERROR: Erros que precisam atenção
 *
 * Em produção, apenas WARN e ERROR são logados no console.
 * Todos os logs podem ser enviados para o backend para análise.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  context?: string
  data?: unknown
  timestamp: string
  userAgent?: string
  url?: string
}

const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

// Buffer para armazenar logs antes de enviar ao backend
let logBuffer: LogEntry[] = []
const MAX_BUFFER_SIZE = 50
const FLUSH_INTERVAL = 30000 // 30 segundos

/**
 * Obtém informações do contexto atual
 */
function getContext(): { url: string; userAgent: string } {
  if (globalThis.window === undefined) {
    return { url: '', userAgent: '' }
  }

  return {
    url: globalThis.window.location.href,
    userAgent: navigator.userAgent,
  }
}

/**
 * Cria uma entrada de log
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: string,
  data?: unknown
): LogEntry {
  const { url, userAgent } = getContext()

  return {
    level,
    message,
    context,
    data,
    timestamp: new Date().toISOString(),
    userAgent,
    url,
  }
}

/**
 * Formata log para exibição no console
 */
function formatLogForConsole(entry: LogEntry): string {
  const contextPart = entry.context ? `[${entry.context}]` : ''
  return `${entry.timestamp} ${entry.level.toUpperCase()} ${contextPart} ${entry.message}`
}

/**
 * Exibe log no console (apenas em desenvolvimento ou para WARN/ERROR)
 */
function logToConsole(entry: LogEntry): void {
  const shouldLog = isDevelopment || entry.level === 'warn' || entry.level === 'error'

  if (!shouldLog) {
    return
  }

  const formattedMessage = formatLogForConsole(entry)
  const logData = entry.data ? [formattedMessage, entry.data] : [formattedMessage]

  /* eslint-disable no-console -- Logger precisa usar console para exibir logs */
  switch (entry.level) {
    case 'debug':
      console.debug(...logData)
      break
    case 'info':
      console.info(...logData)
      break
    case 'warn':
      console.warn(...logData)
      break
    case 'error':
      console.error(...logData)
      break
  }
  /* eslint-enable no-console */
}

/**
 * Adiciona log ao buffer para envio ao backend
 */
function addToBuffer(entry: LogEntry): void {
  logBuffer.push(entry)

  // Limitar tamanho do buffer
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer.shift()
  }
}

/**
 * Envia logs ao backend (apenas em produção)
 */
async function sendLogsToBackend(logs: LogEntry[]): Promise<void> {
  if (!isProduction || logs.length === 0) {
    return
  }

  try {
    // Importar dinamicamente para evitar dependência circular
    const { api } = await import('./api')

    await api.post('/logs/batch', {
      logs,
    })
  } catch (error) {
    // Não logar erro de envio de logs para evitar loop infinito
    // Apenas em desenvolvimento para debug
    if (isDevelopment) {
      console.warn('[Logger] Failed to send logs to backend:', error)
    }
  }
}

/**
 * Envia logs do buffer ao backend
 */
async function flushLogs(): Promise<void> {
  if (logBuffer.length === 0) {
    return
  }

  const logsToSend = [...logBuffer]
  logBuffer = []

  await sendLogsToBackend(logsToSend)
}

/**
 * Logger principal
 */
export const logger = {
  /**
   * Log de debug - apenas em desenvolvimento
   */
  debug: (message: string, context?: string, data?: unknown): void => {
    const entry = createLogEntry('debug', message, context, data)
    logToConsole(entry)
    if (isDevelopment) {
      addToBuffer(entry)
    }
  },

  /**
   * Log de informação
   */
  info: (message: string, context?: string, data?: unknown): void => {
    const entry = createLogEntry('info', message, context, data)
    logToConsole(entry)
    addToBuffer(entry)
  },

  /**
   * Log de aviso
   */
  warn: (message: string, context?: string, data?: unknown): void => {
    const entry = createLogEntry('warn', message, context, data)
    logToConsole(entry)
    addToBuffer(entry)
  },

  /**
   * Log de erro
   */
  error: (message: string, context?: string, error?: unknown): void => {
    const entry = createLogEntry('error', message, context, error)
    logToConsole(entry)
    addToBuffer(entry)

    // Em produção, sempre tentar enviar erros imediatamente
    if (isProduction) {
      sendLogsToBackend([entry]).catch(() => {
        // Ignorar erros de envio
      })
    }
  },

  /**
   * Força envio de logs pendentes
   */
  flush: async (): Promise<void> => {
    await flushLogs()
  },
}

// Enviar logs periodicamente em produção
if (isProduction && globalThis.window !== undefined) {
  setInterval(() => {
    flushLogs().catch(() => {
      // Ignorar erros de flush
    })
  }, FLUSH_INTERVAL)

  // Enviar logs ao fechar a página
  globalThis.window.addEventListener('beforeunload', () => {
    // Usar sendBeacon para garantir envio mesmo ao fechar
    if (logBuffer.length > 0 && navigator.sendBeacon) {
      // Importar dinamicamente para evitar dependência circular
      import('./api')
        .then(({ api }) => {
          const url = `${api.defaults.baseURL}/logs/batch`
          const blob = new Blob([JSON.stringify({ logs: logBuffer })], {
            type: 'application/json',
          })
          navigator.sendBeacon(url, blob)
        })
        .catch(() => {
          // Ignorar erros silenciosamente
        })
    }
  })
}
