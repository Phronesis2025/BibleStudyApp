// Dev-only logger. log/warn are no-ops in production so debug output (user
// data, API payloads, stage traces) never reaches production consoles;
// error always logs. Production builds additionally strip console.* via
// compiler.removeConsole in next.config.js.
const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  log: isDev ? console.log.bind(console) : () => {},
  warn: isDev ? console.warn.bind(console) : () => {},
  error: console.error.bind(console),
};
