export const isDev = import.meta.env.MODE === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log('[NanoAI]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn('[NanoAI] WARNING:', ...args);
    }
  },
  error: (...args: any[]) => {
    if (isDev) {
      console.error('[NanoAI] ERROR:', ...args);
    }
  }
};
