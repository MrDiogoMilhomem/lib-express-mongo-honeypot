/**
 * Middleware Honeypot - exportação pública
 *
 * Este arquivo apenas re-exporta a API pública da biblioteca. A implementação
 * fica organizada nos módulos:
 *
 * - honeypot.ts  -> lógica do middleware (createHoneypot, waitForTraps)
 * - types.ts     -> tipos públicos (HoneypotOptions, HoneypotMiddleware, ...)
 * - routes.ts    -> conjuntos de armadilhas predefinidos
 * - blocklist.ts -> armazenamento da blocklist (MongoDB)
 * - logger.ts    -> loggers embutidos (console, noop, ...)
 * - ip.ts        -> utilitários de IP e redes internas
 */

export { createHoneypot, waitForTraps } from "./honeypot";

export { DEFAULT_TRAPS } from "./routes";

export type {
  HoneypotOptions,
  HoneypotMiddleware,
  Trap,
  HoneypotLogger,
  BlocklistStorage,
  InternalNetworksConfig,
} from "./types";

export { createMongoBlocklist, MongoBlocklist } from "./blocklist";

export {
  createConsoleLogger,
  createNoopLogger,
  defaultLogger,
  debugLogger,
  productionLogger,
} from "./logger";

export {
  normalizeIp,
  isUnblockableIp,
  getClientIp,
  setInternalNetworks,
  getInternalNetworks,
  resetInternalNetworks,
  DEFAULT_INTERNAL_NETWORKS,
} from "./ip";

export {
  DEFAULT_TRAPS as ROUTES_DEFAULT_TRAPS,
  MINIMAL_TRAPS,
  EXTENDED_TRAPS,
  WORDPRESS_TRAPS,
  PHP_TRAPS,
  NODE_TRAPS,
  TRAP_SETS,
  type TrapSetName,
} from "./routes";