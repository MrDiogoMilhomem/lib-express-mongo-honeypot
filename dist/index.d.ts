/**
 * Honeypot middleware - main export
 */
import type { HoneypotOptions, HoneypotMiddleware } from "./types";
/**
 * Create honeypot middleware
 */
export declare function createHoneypot(options: HoneypotOptions): HoneypotMiddleware;
/**
 * Wait for traps to load (useful for testing)
 */
export declare function waitForTraps(): Promise<void>;
export { DEFAULT_TRAPS } from "./types";
export type { HoneypotOptions, HoneypotMiddleware, Trap, HoneypotLogger, BlocklistStorage, InternalNetworksConfig } from "./types";
export { createMongoBlocklist, MongoBlocklist } from "./blocklist";
export { createConsoleLogger, createNoopLogger, defaultLogger, debugLogger, productionLogger } from "./logger";
export { normalizeIp, isUnblockableIp, getClientIp, setInternalNetworks, getInternalNetworks, resetInternalNetworks, DEFAULT_INTERNAL_NETWORKS } from "./ip";
export { DEFAULT_TRAPS as ROUTES_DEFAULT_TRAPS, MINIMAL_TRAPS, EXTENDED_TRAPS, WORDPRESS_TRAPS, PHP_TRAPS, NODE_TRAPS, TRAP_SETS, type TrapSetName, } from "./routes";
//# sourceMappingURL=index.d.ts.map