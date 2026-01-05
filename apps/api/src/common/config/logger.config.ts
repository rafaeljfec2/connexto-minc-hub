import { IncomingMessage, ServerResponse } from 'http';
import { LevelWithSilent } from 'pino';

/**
 * Shared serializers for requests and responses
 */
const sharedSerializers = {
  req: (req: IncomingMessage) => ({
    method: req.method,
    url: req.url,
    route: (req as any).route?.path,
  }),
  res: (res: ServerResponse) => ({
    statusCode: res.statusCode,
    body: (res as any).body,
  }),
};

/**
 * Function to determine log level based on status code
 */
const getCustomLogLevel = (
  req: IncomingMessage,
  res: ServerResponse,
  err?: Error,
): LevelWithSilent => {
  if (res.statusCode >= 400 && res.statusCode < 500) {
    return 'warn';
  }
  if (res.statusCode >= 500 || err) {
    return 'error';
  }
  return 'info';
};

/**
 * Custom message for successful requests
 */
const getCustomSuccessMessage = (req: IncomingMessage): string => {
  const route = (req as any).route?.path;
  const url = req.url || route || '-';
  return `request completed - ${req.method} ${url}`;
};

/**
 * Logger configuration for production
 */
const productionLoggerConfig = {
  serializers: sharedSerializers,
  customLogLevel: getCustomLogLevel,
  customSuccessMessage: getCustomSuccessMessage,
};

/**
 * Logger configuration for development
 */
const developmentLoggerConfig = {
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname,context',
      singleLine: true,
      hideObject: false,
    },
  },
  serializers: sharedSerializers,
  formatters: {
    log: (object: any) => {
      if (object.context && object.msg) {
        object.msg = `[${object.context}] ${object.msg}`;
      }
      return object;
    },
  },
  customLogLevel: getCustomLogLevel,
  customSuccessMessage: getCustomSuccessMessage,
};

/**
 * Returns logger configuration based on environment
 */
export const getLoggerConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    pinoHttp: isProduction ? productionLoggerConfig : developmentLoggerConfig,
  };
};
