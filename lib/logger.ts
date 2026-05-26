type LogLevel = 'info' | 'warn' | 'error';

const log = (level: LogLevel, message: string, context?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  const entry = {
    timestamp,
    level,
    message,
    ...context,
  };

  if (process.env.NODE_ENV === 'production') {
    // In production, we'd send this to a logging service
    console.log(JSON.stringify(entry));
  } else {
    // In development, pretty print
    const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[32m';
    console.log(`${color}[${level.toUpperCase()}]\x1b[0m ${message}`, context || '');
  }
};

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => log('error', message, context),
};
