"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRAP_SETS = exports.NODE_TRAPS = exports.PHP_TRAPS = exports.WORDPRESS_TRAPS = exports.EXTENDED_TRAPS = exports.MINIMAL_TRAPS = exports.ROUTES_DEFAULT_TRAPS = exports.DEFAULT_INTERNAL_NETWORKS = exports.resetInternalNetworks = exports.getInternalNetworks = exports.setInternalNetworks = exports.getClientIp = exports.isUnblockableIp = exports.normalizeIp = exports.productionLogger = exports.debugLogger = exports.defaultLogger = exports.createNoopLogger = exports.createConsoleLogger = exports.MongoBlocklist = exports.createMongoBlocklist = exports.DEFAULT_TRAPS = exports.waitForTraps = exports.createHoneypot = void 0;
var honeypot_1 = require("./honeypot");
Object.defineProperty(exports, "createHoneypot", { enumerable: true, get: function () { return honeypot_1.createHoneypot; } });
Object.defineProperty(exports, "waitForTraps", { enumerable: true, get: function () { return honeypot_1.waitForTraps; } });
var routes_1 = require("./routes");
Object.defineProperty(exports, "DEFAULT_TRAPS", { enumerable: true, get: function () { return routes_1.DEFAULT_TRAPS; } });
var blocklist_1 = require("./blocklist");
Object.defineProperty(exports, "createMongoBlocklist", { enumerable: true, get: function () { return blocklist_1.createMongoBlocklist; } });
Object.defineProperty(exports, "MongoBlocklist", { enumerable: true, get: function () { return blocklist_1.MongoBlocklist; } });
var logger_1 = require("./logger");
Object.defineProperty(exports, "createConsoleLogger", { enumerable: true, get: function () { return logger_1.createConsoleLogger; } });
Object.defineProperty(exports, "createNoopLogger", { enumerable: true, get: function () { return logger_1.createNoopLogger; } });
Object.defineProperty(exports, "defaultLogger", { enumerable: true, get: function () { return logger_1.defaultLogger; } });
Object.defineProperty(exports, "debugLogger", { enumerable: true, get: function () { return logger_1.debugLogger; } });
Object.defineProperty(exports, "productionLogger", { enumerable: true, get: function () { return logger_1.productionLogger; } });
var ip_1 = require("./ip");
Object.defineProperty(exports, "normalizeIp", { enumerable: true, get: function () { return ip_1.normalizeIp; } });
Object.defineProperty(exports, "isUnblockableIp", { enumerable: true, get: function () { return ip_1.isUnblockableIp; } });
Object.defineProperty(exports, "getClientIp", { enumerable: true, get: function () { return ip_1.getClientIp; } });
Object.defineProperty(exports, "setInternalNetworks", { enumerable: true, get: function () { return ip_1.setInternalNetworks; } });
Object.defineProperty(exports, "getInternalNetworks", { enumerable: true, get: function () { return ip_1.getInternalNetworks; } });
Object.defineProperty(exports, "resetInternalNetworks", { enumerable: true, get: function () { return ip_1.resetInternalNetworks; } });
Object.defineProperty(exports, "DEFAULT_INTERNAL_NETWORKS", { enumerable: true, get: function () { return ip_1.DEFAULT_INTERNAL_NETWORKS; } });
var routes_2 = require("./routes");
Object.defineProperty(exports, "ROUTES_DEFAULT_TRAPS", { enumerable: true, get: function () { return routes_2.DEFAULT_TRAPS; } });
Object.defineProperty(exports, "MINIMAL_TRAPS", { enumerable: true, get: function () { return routes_2.MINIMAL_TRAPS; } });
Object.defineProperty(exports, "EXTENDED_TRAPS", { enumerable: true, get: function () { return routes_2.EXTENDED_TRAPS; } });
Object.defineProperty(exports, "WORDPRESS_TRAPS", { enumerable: true, get: function () { return routes_2.WORDPRESS_TRAPS; } });
Object.defineProperty(exports, "PHP_TRAPS", { enumerable: true, get: function () { return routes_2.PHP_TRAPS; } });
Object.defineProperty(exports, "NODE_TRAPS", { enumerable: true, get: function () { return routes_2.NODE_TRAPS; } });
Object.defineProperty(exports, "TRAP_SETS", { enumerable: true, get: function () { return routes_2.TRAP_SETS; } });
