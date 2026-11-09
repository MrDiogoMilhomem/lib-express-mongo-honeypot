/**
 * Implementação simples de logger de console para honeypot
 */
import type { HoneypotLogger } from "./types";
/**
 * Cria um logger de console
 * @param baseMeta - Metadados base incluídos em todas as entradas de log
 * @param options - { minLevel: "debug" | "info" | "warn" | "error", color: boolean }
 */
export declare function createConsoleLogger(baseMeta?: Record<string, unknown>, options?: {
    minLevel?: "debug" | "info" | "warn" | "error";
    color?: boolean;
}): HoneypotLogger;
/**
 * Cria um logger desabilitado/noop (logging completamente desabilitado)
 */
export declare function createNoopLogger(): HoneypotLogger;
/**
 * Instância do logger padrão (nível info, colorido)
 */
export declare const defaultLogger: HoneypotLogger;
/**
 * Instância do logger de debug (nível debug, colorido)
 */
export declare const debugLogger: HoneypotLogger;
/**
 * Instância do logger de produção (nível warn, sem cores)
 */
export declare const productionLogger: HoneypotLogger;
//# sourceMappingURL=logger.d.ts.map