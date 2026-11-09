/**
 * Middleware Honeypot - exportação principal
 */
import type { HoneypotOptions, HoneypotMiddleware } from "./types";
/**
 * Cria middleware honeypot
 */
export declare function createHoneypot(options: HoneypotOptions): HoneypotMiddleware;
/**
 * Aguarda carregamento das armadilhas (útil para testes)
 */
export declare function waitForTraps(): Promise<void>;
export { DEFAULT_TRAPS } from "./routes";
export type { HoneypotOptions, HoneypotMiddleware, Trap, HoneypotLogger, BlocklistStorage, InternalNetworksConfig } from "./types";
export { createMongoBlocklist, MongoBlocklist } from "./blocklist";
export { createConsoleLogger, createNoopLogger, defaultLogger, debugLogger, productionLogger } from "./logger";
export { normalizeIp, isUnblockableIp, getClientIp, setInternalNetworks, getInternalNetworks, resetInternalNetworks, DEFAULT_INTERNAL_NETWORKS } from "./ip";
export { DEFAULT_TRAPS as ROUTES_DEFAULT_TRAPS, MINIMAL_TRAPS, EXTENDED_TRAPS, WORDPRESS_TRAPS, PHP_TRAPS, NODE_TRAPS, TRAP_SETS, type TrapSetName, } from "./routes";
//# sourceMappingURL=index.d.ts.map