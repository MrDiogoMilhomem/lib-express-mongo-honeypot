"use strict";
/**
 * Middleware Honeypot - exportação principal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRAP_SETS = exports.NODE_TRAPS = exports.PHP_TRAPS = exports.WORDPRESS_TRAPS = exports.EXTENDED_TRAPS = exports.MINIMAL_TRAPS = exports.ROUTES_DEFAULT_TRAPS = exports.DEFAULT_INTERNAL_NETWORKS = exports.resetInternalNetworks = exports.getInternalNetworks = exports.setInternalNetworks = exports.getClientIp = exports.isUnblockableIp = exports.normalizeIp = exports.productionLogger = exports.debugLogger = exports.defaultLogger = exports.createNoopLogger = exports.createConsoleLogger = exports.MongoBlocklist = exports.createMongoBlocklist = exports.DEFAULT_TRAPS = void 0;
exports.createHoneypot = createHoneypot;
exports.waitForTraps = waitForTraps;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const routes_1 = require("./routes");
const ip_1 = require("./ip");
const logger_1 = require("./logger");
/**
 * Converte padrão glob para RegExp
 */
function globToRegex(glob) {
    const escaped = glob
        .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*");
    return new RegExp(`^${escaped}$`);
}
/**
 * Carrega armadilhas de arquivo JSON
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
            const merged = new Set([...routes_1.DEFAULT_TRAPS, ...customTraps]);
            logger.debug("Armadilhas do honeypot carregadas do arquivo", { file: filePath, count: merged.size, traps: Array.from(merged) });
            return Array.from(merged);
        }
        else {
            logger.warn("Arquivo de armadilhas não contém array JSON válido, usando padrões", { file: filePath });
        }
    }
    catch (error) {
        const err = error;
        if (err.code === "ENOENT") {
            logger.info("Arquivo de armadilhas não encontrado, usando padrões", { file: filePath });
        }
        else {
            logger.warn("Erro ao carregar arquivo de armadilhas, usando padrões", { file: filePath, error: String(error) });
        }
    }
    return routes_1.DEFAULT_TRAPS;
}
/**
 * Compila armadilhas para padrões regex
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
 * Encontra armadilha correspondente para um caminho
 */
function findTrap(path, traps, logger) {
    const lowerPath = path.toLowerCase();
    for (const trap of traps) {
        if (trap.isGlob && trap.regex) {
            const matches = trap.regex.test(lowerPath);
            if (matches) {
                logger.debug("Correspondência de armadilha (glob)", { path, trap: trap.pattern });
                return trap;
            }
        }
        else {
            const exact = lowerPath === trap.pattern || lowerPath.startsWith(`${trap.pattern}/`);
            if (exact) {
                logger.debug("Correspondência de armadilha (exata)", { path, trap: trap.pattern });
                return trap;
            }
        }
    }
    logger.debug("Sem correspondência de armadilha", { path });
    return undefined;
}
/**
 * Handler padrão quando armadilha é disparada
 */
async function defaultOnTriggered(req, res, _trap, _ip) {
    res.status(404).end();
}
/**
 * Cria middleware honeypot
 */
function createHoneypot(options) {
    const { traps = [], trapsFile, blocklist, logger: loggerOption = logger_1.defaultLogger, getIp = ip_1.getClientIp, internalNetworks, onTriggered = defaultOnTriggered, autoLoadTraps = true, } = options;
    // Configura logger
    let logger;
    if (loggerOption === false) {
        logger = (0, logger_1.createNoopLogger)();
    }
    else {
        logger = loggerOption;
    }
    // Configura redes internas
    if (internalNetworks !== undefined) {
        (0, ip_1.setInternalNetworks)(internalNetworks);
        if (internalNetworks === false) {
            logger.info("Verificação de redes internas do honeypot desabilitada");
        }
        else {
            logger.debug("Redes internas customizadas configuradas no honeypot");
        }
    }
    // Mescla armadilhas padrão com customizadas
    const allTraps = Array.from(new Set([...routes_1.DEFAULT_TRAPS, ...traps.map((t) => t.toLowerCase())]));
    let compiledTraps = compileTraps(allTraps);
    let trapsLoaded = Promise.resolve();
    // Carrega armadilhas do arquivo se especificado
    if (trapsFile && autoLoadTraps) {
        trapsLoaded = loadTrapsFromFile(trapsFile, logger).then((loadedTraps) => {
            compiledTraps = compileTraps(loadedTraps);
        });
    }
    // Inicializa blocklist
    const blocklistReady = blocklist.init();
    logger.info("Middleware honeypot inicializado", { trapsCount: allTraps.length });
    return async (req, res, next) => {
        // Aguarda armadilhas e blocklist estarem prontas
        await Promise.all([trapsLoaded, blocklistReady]);
        const ip = (0, ip_1.normalizeIp)(getIp(req));
        // Verifica blocklist para TODAS as requisições - bloqueia IPs conhecidos imediatamente
        if (ip && blocklist.isBlocked(ip)) {
            logger.debug("IP bloqueado pela blocklist", { ip, path: req.path });
            res.status(403).json({ error: "Forbidden" });
            return;
        }
        const trap = findTrap(req.path, compiledTraps, logger);
        if (!trap) {
            next();
            return;
        }
        // Verifica se IP é indesbloqueável (redes internas)
        if ((0, ip_1.isUnblockableIp)(ip)) {
            logger.warn("Armadilha disparada por IP indesbloqueável", { trap: trap.pattern, ip });
            await onTriggered(req, res, trap.pattern, ip);
            return;
        }
        // Bloqueia o IP
        try {
            await blocklist.block(ip, `Honeypot: ${trap.pattern}`);
            logger.warn("IP bloqueado pelo honeypot", { trap: trap.pattern, ip });
        }
        catch (error) {
            logger.error("Falha ao bloquear IP do honeypot", { trap: trap.pattern, ip, error: String(error) });
        }
        // Chama handler customizado ou padrão
        await onTriggered(req, res, trap.pattern, ip);
    };
}
/**
 * Aguarda carregamento das armadilhas (útil para testes)
 */
function waitForTraps() {
    // Será sobrescrito pela promise real no createHoneypot
    return Promise.resolve();
}
// Re-exporta tipos e utilitários
var routes_2 = require("./routes");
Object.defineProperty(exports, "DEFAULT_TRAPS", { enumerable: true, get: function () { return routes_2.DEFAULT_TRAPS; } });
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
var routes_3 = require("./routes");
Object.defineProperty(exports, "ROUTES_DEFAULT_TRAPS", { enumerable: true, get: function () { return routes_3.DEFAULT_TRAPS; } });
Object.defineProperty(exports, "MINIMAL_TRAPS", { enumerable: true, get: function () { return routes_3.MINIMAL_TRAPS; } });
Object.defineProperty(exports, "EXTENDED_TRAPS", { enumerable: true, get: function () { return routes_3.EXTENDED_TRAPS; } });
Object.defineProperty(exports, "WORDPRESS_TRAPS", { enumerable: true, get: function () { return routes_3.WORDPRESS_TRAPS; } });
Object.defineProperty(exports, "PHP_TRAPS", { enumerable: true, get: function () { return routes_3.PHP_TRAPS; } });
Object.defineProperty(exports, "NODE_TRAPS", { enumerable: true, get: function () { return routes_3.NODE_TRAPS; } });
Object.defineProperty(exports, "TRAP_SETS", { enumerable: true, get: function () { return routes_3.TRAP_SETS; } });
