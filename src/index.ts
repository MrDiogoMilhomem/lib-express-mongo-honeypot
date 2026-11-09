/**
 * Middleware Honeypot - exportação principal
 */

import type { Request, Response, NextFunction } from "express";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { DEFAULT_TRAPS } from "./routes";
import type {
  HoneypotOptions,
  HoneypotMiddleware,
  Trap,
  HoneypotLogger,
} from "./types";
import { normalizeIp, isUnblockableIp, getClientIp, setInternalNetworks } from "./ip";
import { createNoopLogger, defaultLogger } from "./logger";

/**
 * Converte padrão glob para RegExp
 */
function globToRegex(glob: string): RegExp {
  const escaped = glob
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`);
}

/**
 * Carrega armadilhas de arquivo JSON
 */
async function loadTrapsFromFile(filePath: string, logger: HoneypotLogger): Promise<string[]> {
  const fullPath = join(process.cwd(), filePath);

  try {
    const content = await fs.readFile(fullPath, "utf-8");
    const data = JSON.parse(content);

    if (Array.isArray(data)) {
      const customTraps = data
        .filter((item): item is string => typeof item === "string" && (item.startsWith("/") || item.startsWith("*")))
        .map((item) => item.toLowerCase());

      const merged = new Set([...DEFAULT_TRAPS, ...customTraps]);
      logger.debug("Armadilhas do honeypot carregadas do arquivo", { file: filePath, count: merged.size, traps: Array.from(merged) });
      return Array.from(merged);
    } else {
      logger.warn("Arquivo de armadilhas não contém array JSON válido, usando padrões", { file: filePath });
    }
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      logger.info("Arquivo de armadilhas não encontrado, usando padrões", { file: filePath });
    } else {
      logger.warn("Erro ao carregar arquivo de armadilhas, usando padrões", { file: filePath, error: String(error) });
    }
  }

  return DEFAULT_TRAPS;
}

/**
 * Compila armadilhas para padrões regex
 */
function compileTraps(traps: string[]): Trap[] {
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
function findTrap(path: string, traps: Trap[], logger: HoneypotLogger): Trap | undefined {
  const lowerPath = path.toLowerCase();

  for (const trap of traps) {
    if (trap.isGlob && trap.regex) {
      const matches = trap.regex.test(lowerPath);
      if (matches) {
        logger.debug("Correspondência de armadilha (glob)", { path, trap: trap.pattern });
        return trap;
      }
    } else {
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
async function defaultOnTriggered(req: Request, res: Response, _trap: string, _ip: string): Promise<void> {
  res.status(404).end();
}

/**
 * Cria middleware honeypot
 */
export function createHoneypot(options: HoneypotOptions): HoneypotMiddleware {
  const {
    traps = [],
    trapsFile,
    blocklist,
    logger: loggerOption = defaultLogger,
    getIp = getClientIp,
    internalNetworks,
    onTriggered = defaultOnTriggered,
    autoLoadTraps = true,
  } = options;

  // Configura logger
  let logger: HoneypotLogger;
  if (loggerOption === false) {
    logger = createNoopLogger();
  } else {
    logger = loggerOption;
  }

  // Configura redes internas
  if (internalNetworks !== undefined) {
    setInternalNetworks(internalNetworks);
    if (internalNetworks === false) {
      logger.info("Verificação de redes internas do honeypot desabilitada");
    } else {
      logger.debug("Redes internas customizadas configuradas no honeypot");
    }
  }

  // Mescla armadilhas padrão com customizadas
  const allTraps = Array.from(new Set([...DEFAULT_TRAPS, ...traps.map((t) => t.toLowerCase())]));
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

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Aguarda armadilhas e blocklist estarem prontas
    await Promise.all([trapsLoaded, blocklistReady]);

    const ip = normalizeIp(getIp(req));

    // Verifica blocklist para TODAS as requisições - bloqueia IPs conhecidos imediatamente
    if (ip && blocklist.isBlocked(ip)) {
      logger.debug("IP bloqueado pela blocklist", { ip, path: req.path });
      res.status(403);
      return;
    }

    const trap = findTrap(req.path, compiledTraps, logger);

    if (!trap) {
      next();
      return;
    }

    // Verifica se IP é indesbloqueável (redes internas)
    if (isUnblockableIp(ip)) {
      logger.warn("Armadilha disparada por IP indesbloqueável", { trap: trap.pattern, ip });
      await onTriggered(req, res, trap.pattern, ip);
      return;
    }

    // Bloqueia o IP
    try {
      await blocklist.block(ip, `Honeypot: ${trap.pattern}`);
      logger.warn("IP bloqueado pelo honeypot", { trap: trap.pattern, ip });
    } catch (error) {
      logger.error("Falha ao bloquear IP do honeypot", { trap: trap.pattern, ip, error: String(error) });
    }

    // Chama handler customizado ou padrão
    await onTriggered(req, res, trap.pattern, ip);
  };
}

/**
 * Aguarda carregamento das armadilhas (útil para testes)
 */
export function waitForTraps(): Promise<void> {
  // Será sobrescrito pela promise real no createHoneypot
  return Promise.resolve();
}

// Re-exporta tipos e utilitários
export { DEFAULT_TRAPS } from "./routes";
export type { HoneypotOptions, HoneypotMiddleware, Trap, HoneypotLogger, BlocklistStorage, InternalNetworksConfig } from "./types";
export { createMongoBlocklist, MongoBlocklist } from "./blocklist";
export { createConsoleLogger, createNoopLogger, defaultLogger, debugLogger, productionLogger } from "./logger";
export { normalizeIp, isUnblockableIp, getClientIp, setInternalNetworks, getInternalNetworks, resetInternalNetworks, DEFAULT_INTERNAL_NETWORKS } from "./ip";
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