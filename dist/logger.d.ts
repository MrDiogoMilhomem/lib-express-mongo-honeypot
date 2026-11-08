/**
 * Simple console logger implementation for honeypot
 */
import type { HoneypotLogger } from "./types";
/**
 * Create a console logger
 * @param baseMeta - Base metadata to include in all log entries
 * @param options - { minLevel: "debug" | "info" | "warn" | "error", color: boolean }
 */
export declare function createConsoleLogger(baseMeta?: Record<string, unknown>, options?: {
    minLevel?: "debug" | "info" | "warn" | "error";
    color?: boolean;
}): HoneypotLogger;
/**
 * Create a disabled/noop logger (logging completely disabled)
 */
export declare function createNoopLogger(): HoneypotLogger;
/**
 * Default logger instance (info level, colored)
 */
export declare const defaultLogger: HoneypotLogger;
/**
 * Debug logger instance (debug level, colored)
 */
export declare const debugLogger: HoneypotLogger;
/**
 * Production logger instance (warn level, no colors)
 */
export declare const productionLogger: HoneypotLogger;
//# sourceMappingURL=logger.d.ts.map