/**
 * Implementação simples de logger de console para honeypot
 */

import type { HoneypotLogger } from "./types";

const LEVEL_COLOR: Record<string, string> = {
  debug: "\x1b[36m",
  info: "\x1b[34m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};
const KEY_COLOR = "\x1b[34m";
const EQUALS_COLOR = "\x1b[37m";
const VALUE_COLOR = "\x1b[33m";
const RESET_COLOR = "\x1b[0m";

const WEIGHT: Record<string, number> = { debug: 0, info: 1, warn: 2, error: 3 } as const;

type Level = keyof typeof WEIGHT;

function timestamp(date: Date = new Date()): string {
  const pad = (value: number, size = 2) => String(value).padStart(size, "0");
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  return `${day} ${time}.${pad(date.getMilliseconds(), 3)}`;
}

function formatMeta(meta: Record<string, unknown>, color = true): string {
  const pairs = Object.entries(meta)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      const k = color ? `${KEY_COLOR}${key}${RESET_COLOR}` : key;
      const eq = color ? `${EQUALS_COLOR}=${RESET_COLOR}` : "=";
      const v = color ? `${VALUE_COLOR}${JSON.stringify(value)}${RESET_COLOR}` : JSON.stringify(value);
      return `${k}${eq}${v}`;
    });
  return pairs.length > 0 ? ` {${pairs.join(" ")}}` : "";
}

function write(level: Level, message: string, meta: Record<string, unknown>, minLevel: Level, color: boolean): void {
  const levelWeight = WEIGHT[level]!;
  const minWeight = WEIGHT[minLevel]!;
  if (levelWeight < minWeight) return;

  const label = level.toUpperCase().padEnd(5);
  const metaStr = formatMeta(meta, color);
  const line = `${timestamp()} ${color ? LEVEL_COLOR[level] : ""}[${label}]${color ? RESET_COLOR : ""} ${message}${metaStr}`;

  if (color) {
    console.log(line);
  } else {
    console.log(`${timestamp()} [${label}] ${message}${formatMeta(meta, false)}`);
  }
}

function createLogger(baseMeta: Record<string, unknown> = {}, options: { minLevel?: Level; color?: boolean } = {}): HoneypotLogger {
  const { minLevel = "info", color = true } = options;

  const forLevel = (level: Level) => (message: string, meta: Record<string, unknown> = {}) =>
    write(level, message, { ...baseMeta, ...meta }, minLevel, color);

  return {
    debug: forLevel("debug"),
    info: forLevel("info"),
    warn: forLevel("warn"),
    error: forLevel("error"),
    child: (extra) => createLogger({ ...baseMeta, ...extra }, { minLevel, color }),
  };
}

/**
 * Cria um logger de console
 * @param baseMeta - Metadados base incluídos em todas as entradas de log
 * @param options - { minLevel: "debug" | "info" | "warn" | "error", color: boolean }
 */
export function createConsoleLogger(
  baseMeta?: Record<string, unknown>,
  options?: { minLevel?: "debug" | "info" | "warn" | "error"; color?: boolean }
): HoneypotLogger {
  return createLogger(baseMeta, options);
}

/**
 * Cria um logger desabilitado/noop (logging completamente desabilitado)
 */
export function createNoopLogger(): HoneypotLogger {
  const noop = (_message: string, _meta?: Record<string, unknown>) => {};
  return {
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
    child: () => createNoopLogger(),
  };
}

/**
 * Instância do logger padrão (nível info, colorido)
 */
export const defaultLogger = createConsoleLogger();

/**
 * Instância do logger de debug (nível debug, colorido)
 */
export const debugLogger = createConsoleLogger(undefined, { minLevel: "debug" });

/**
 * Instância do logger de produção (nível warn, sem cores)
 */
export const productionLogger = createConsoleLogger(undefined, { minLevel: "warn", color: false });