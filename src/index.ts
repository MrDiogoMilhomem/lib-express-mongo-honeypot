/**
 * Honeypot middleware - main export
 */

import type { Request, Response, NextFunction } from "express";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { DEFAULT_TRAPS } from "./types";
import type {
  HoneypotOptions,
  HoneypotMiddleware,
  Trap,
  HoneypotLogger,
  BlocklistStorage,
  InternalNetworksConfig,
} from "./types";
import { normalizeIp, isUnblockableIp, getClientIp, setInternalNetworks } from "./ip";
import { createConsoleLogger, createNoopLogger, defaultLogger } from "./logger";
import { DEFAULT_TRAPS as ROUTES_DEFAULT_TRAPS } from "./routes";

/**
 * Convert glob pattern to RegExp
 */
function globToRegex(glob: string): RegExp {
  const escaped = glob
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`);
}

/**
 * Load traps from JSON file
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
      logger.debug("Honeypot traps loaded from file", { file: filePath, count: merged.size, traps: Array.from(merged) });
      return Array.from(merged);
    } else {
      logger.warn("Honeypot traps file does not contain valid JSON array, using defaults", { file: filePath });
    }
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      logger.info("Honeypot traps file not found, using defaults", { file: filePath });
    } else {
      logger.warn("Error loading honeypot traps file, using defaults", { file: filePath, error: String(error) });
    }
  }

  return DEFAULT_TRAPS;
}

/**
 * Compile traps to regex patterns
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
 * Find matching trap for a path
 */
function findTrap(path: string, traps: Trap[], logger: HoneypotLogger): Trap | undefined {
  const lowerPath = path.toLowerCase();

  for (const trap of traps) {
    if (trap.isGlob && trap.regex) {
      const matches = trap.regex.test(lowerPath);
      if (matches) {
        logger.debug("Honeypot match (glob)", { path, trap: trap.pattern });
        return trap;
      }
    } else {
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
async function defaultOnTriggered(req: Request, res: Response, _trap: string, _ip: string): Promise<void> {
  res.status(404).end();
}

/**
 * Create honeypot middleware
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

  // Configure logger
  let logger: HoneypotLogger;
  if (loggerOption === false) {
    logger = createNoopLogger();
  } else {
    logger = loggerOption;
  }

  // Configure internal networks
  if (internalNetworks !== undefined) {
    setInternalNetworks(internalNetworks);
    if (internalNetworks === false) {
      logger.info("Honeypot internal networks check disabled");
    } else {
      logger.debug("Honeypot custom internal networks configured");
    }
  }

  // Merge default traps with custom traps
  const allTraps = Array.from(new Set([...DEFAULT_TRAPS, ...traps.map((t) => t.toLowerCase())]));
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

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Wait for traps and blocklist to be ready
    await Promise.all([trapsLoaded, blocklistReady]);

    const trap = findTrap(req.path, compiledTraps, logger);

    if (!trap) {
      next();
      return;
    }

    const ip = normalizeIp(getIp(req));

    // Check if IP is unblockable (internal networks)
    if (isUnblockableIp(ip)) {
      logger.warn("Honeypot triggered by unblockable IP", { trap: trap.pattern, ip });
      await onTriggered(req, res, trap.pattern, ip);
      return;
    }

    // Block the IP
    try {
      await blocklist.block(ip, `Honeypot: ${trap.pattern}`);
      logger.warn("IP blocked by honeypot", { trap: trap.pattern, ip });
    } catch (error) {
      logger.error("Failed to block IP from honeypot", { trap: trap.pattern, ip, error: String(error) });
    }

    // Call custom handler or default
    await onTriggered(req, res, trap.pattern, ip);
  };
}

/**
 * Wait for traps to load (useful for testing)
 */
export function waitForTraps(): Promise<void> {
  // This will be overridden by the actual promise in createHoneypot
  return Promise.resolve();
}

// Re-export types and utilities
export { DEFAULT_TRAPS } from "./types";
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