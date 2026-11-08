"use strict";
/**
 * Honeypot middleware - main export
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRAP_SETS = exports.NODE_TRAPS = exports.PHP_TRAPS = exports.WORDPRESS_TRAPS = exports.EXTENDED_TRAPS = exports.MINIMAL_TRAPS = exports.ROUTES_DEFAULT_TRAPS = exports.DEFAULT_INTERNAL_NETWORKS = exports.resetInternalNetworks = exports.getInternalNetworks = exports.setInternalNetworks = exports.getClientIp = exports.isUnblockableIp = exports.normalizeIp = exports.productionLogger = exports.debugLogger = exports.defaultLogger = exports.createNoopLogger = exports.createConsoleLogger = exports.MongoBlocklist = exports.createMongoBlocklist = exports.DEFAULT_TRAPS = void 0;
exports.createHoneypot = createHoneypot;
exports.waitForTraps = waitForTraps;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const types_1 = require("./types");
const ip_1 = require("./ip");
const logger_1 = require("./logger");
/**
 * Convert glob pattern to RegExp
 */
function globToRegex(glob) {
    const escaped = glob
        .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*");
    return new RegExp(`^${escaped}$`);
}
/**
 * Load traps from JSON file
 */
async function loadTrapsFromFile(filePath, logger) {
    const fullPath = (0, node_path_1.join)(process.cwd(), filePath);
    try {
        const content = await node_fs_1.promises.readFile(fullPath, "utf-8");
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
            const customTraps = data
                .filter((item) => typeof item === "string" && (item.startsWith("/") || item.startsWith("*")))
                .map((item) => item.toLowerCase());
            const merged = new Set([...types_1.DEFAULT_TRAPS, ...customTraps]);
            logger.debug("Honeypot traps loaded from file", { file: filePath, count: merged.size, traps: Array.from(merged) });
            return Array.from(merged);
        }
        else {
            logger.warn("Honeypot traps file does not contain valid JSON array, using defaults", { file: filePath });
        }
    }
    catch (error) {
        const err = error;
        if (err.code === "ENOENT") {
            logger.info("Honeypot traps file not found, using defaults", { file: filePath });
        }
        else {
            logger.warn("Error loading honeypot traps file, using defaults", { file: filePath, error: String(error) });
        }
    }
    return types_1.DEFAULT_TRAPS;
}
/**
 * Compile traps to regex patterns
 */
function compileTraps(traps) {
    return traps.map((pattern) => {
        const lowerPattern = pattern.toLowerCase();
        const isGlob = lowerPattern.includes("*");
        return {
            pattern: lowerPattern,
            regex: isGlob ? globToRegex(lowerPattern) : undefined,
            isGlob,
        };
    });
}
/**
 * Find matching trap for a path
 */
function findTrap(path, traps, logger) {
    const lowerPath = path.toLowerCase();
    for (const trap of traps) {
        if (trap.isGlob && trap.regex) {
            const matches = trap.regex.test(lowerPath);
            if (matches) {
                logger.debug("Honeypot match (glob)", { path, trap: trap.pattern });
                return trap;
            }
        }
        else {
            const exact = lowerPath === trap.pattern || lowerPath.startsWith(`${trap.pattern}/`);
            if (exact) {
                logger.debug("Honeypot match (exact)", { path, trap: trap.pattern });
                return trap;
            }
        }
    }
    logger.debug("Honeypot no match", { path });
    return undefined;
}
/**
 * Default handler when trap is triggered
 */
async function defaultOnTriggered(req, res, _trap, _ip) {
    res.status(404).end();
}
/**
 * Create honeypot middleware
 */
function createHoneypot(options) {
    const { traps = [], trapsFile, blocklist, logger: loggerOption = logger_1.defaultLogger, getIp = ip_1.getClientIp, internalNetworks, onTriggered = defaultOnTriggered, autoLoadTraps = true, } = options;
    // Configure logger
    let logger;
    if (loggerOption === false) {
        logger = (0, logger_1.createNoopLogger)();
    }
    else {
        logger = loggerOption;
    }
    // Configure internal networks
    if (internalNetworks !== undefined) {
        (0, ip_1.setInternalNetworks)(internalNetworks);
        if (internalNetworks === false) {
            logger.info("Honeypot internal networks check disabled");
        }
        else {
            logger.debug("Honeypot custom internal networks configured");
        }
    }
    // Merge default traps with custom traps
    const allTraps = Array.from(new Set([...types_1.DEFAULT_TRAPS, ...traps.map((t) => t.toLowerCase())]));
    let compiledTraps = compileTraps(allTraps);
    let trapsLoaded = Promise.resolve();
    // Load traps from file if specified
    if (trapsFile && autoLoadTraps) {
        trapsLoaded = loadTrapsFromFile(trapsFile, logger).then((loadedTraps) => {
            compiledTraps = compileTraps(loadedTraps);
        });
    }
    // Initialize blocklist
    const blocklistReady = blocklist.init();
    logger.info("Honeypot middleware initialized", { trapsCount: allTraps.length });
    return async (req, res, next) => {
        // Wait for traps and blocklist to be ready
        await Promise.all([trapsLoaded, blocklistReady]);
        const trap = findTrap(req.path, compiledTraps, logger);
        if (!trap) {
            next();
            return;
        }
        const ip = (0, ip_1.normalizeIp)(getIp(req));
        // Check if IP is unblockable (internal networks)
        if ((0, ip_1.isUnblockableIp)(ip)) {
            logger.warn("Honeypot triggered by unblockable IP", { trap: trap.pattern, ip });
            await onTriggered(req, res, trap.pattern, ip);
            return;
        }
        // Block the IP
        try {
            await blocklist.block(ip, `Honeypot: ${trap.pattern}`);
            logger.warn("IP blocked by honeypot", { trap: trap.pattern, ip });
        }
        catch (error) {
            logger.error("Failed to block IP from honeypot", { trap: trap.pattern, ip, error: String(error) });
        }
        // Call custom handler or default
        await onTriggered(req, res, trap.pattern, ip);
    };
}
/**
 * Wait for traps to load (useful for testing)
 */
function waitForTraps() {
    // This will be overridden by the actual promise in createHoneypot
    return Promise.resolve();
}
// Re-export types and utilities
var types_2 = require("./types");
Object.defineProperty(exports, "DEFAULT_TRAPS", { enumerable: true, get: function () { return types_2.DEFAULT_TRAPS; } });
var blocklist_1 = require("./blocklist");
Object.defineProperty(exports, "createMongoBlocklist", { enumerable: true, get: function () { return blocklist_1.createMongoBlocklist; } });
Object.defineProperty(exports, "MongoBlocklist", { enumerable: true, get: function () { return blocklist_1.MongoBlocklist; } });
var logger_2 = require("./logger");
Object.defineProperty(exports, "createConsoleLogger", { enumerable: true, get: function () { return logger_2.createConsoleLogger; } });
Object.defineProperty(exports, "createNoopLogger", { enumerable: true, get: function () { return logger_2.createNoopLogger; } });
Object.defineProperty(exports, "defaultLogger", { enumerable: true, get: function () { return logger_2.defaultLogger; } });
Object.defineProperty(exports, "debugLogger", { enumerable: true, get: function () { return logger_2.debugLogger; } });
Object.defineProperty(exports, "productionLogger", { enumerable: true, get: function () { return logger_2.productionLogger; } });
var ip_2 = require("./ip");
Object.defineProperty(exports, "normalizeIp", { enumerable: true, get: function () { return ip_2.normalizeIp; } });
Object.defineProperty(exports, "isUnblockableIp", { enumerable: true, get: function () { return ip_2.isUnblockableIp; } });
Object.defineProperty(exports, "getClientIp", { enumerable: true, get: function () { return ip_2.getClientIp; } });
Object.defineProperty(exports, "setInternalNetworks", { enumerable: true, get: function () { return ip_2.setInternalNetworks; } });
Object.defineProperty(exports, "getInternalNetworks", { enumerable: true, get: function () { return ip_2.getInternalNetworks; } });
Object.defineProperty(exports, "resetInternalNetworks", { enumerable: true, get: function () { return ip_2.resetInternalNetworks; } });
Object.defineProperty(exports, "DEFAULT_INTERNAL_NETWORKS", { enumerable: true, get: function () { return ip_2.DEFAULT_INTERNAL_NETWORKS; } });
var routes_1 = require("./routes");
Object.defineProperty(exports, "ROUTES_DEFAULT_TRAPS", { enumerable: true, get: function () { return routes_1.DEFAULT_TRAPS; } });
Object.defineProperty(exports, "MINIMAL_TRAPS", { enumerable: true, get: function () { return routes_1.MINIMAL_TRAPS; } });
Object.defineProperty(exports, "EXTENDED_TRAPS", { enumerable: true, get: function () { return routes_1.EXTENDED_TRAPS; } });
Object.defineProperty(exports, "WORDPRESS_TRAPS", { enumerable: true, get: function () { return routes_1.WORDPRESS_TRAPS; } });
Object.defineProperty(exports, "PHP_TRAPS", { enumerable: true, get: function () { return routes_1.PHP_TRAPS; } });
Object.defineProperty(exports, "NODE_TRAPS", { enumerable: true, get: function () { return routes_1.NODE_TRAPS; } });
Object.defineProperty(exports, "TRAP_SETS", { enumerable: true, get: function () { return routes_1.TRAP_SETS; } });
