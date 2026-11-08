/**
 * Common blocked/trap routes that can be used as honeypot traps.
 * These are paths that legitimate users typically never access,
 * making them ideal for detecting scanners and bots.
 */
/**
 * Default trap paths included automatically
 * @example
 * import { createHoneypot, DEFAULT_TRAPS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: DEFAULT_TRAPS });
 */
export declare const DEFAULT_TRAPS: string[];
/**
 * Extended trap paths for more aggressive protection
 * Includes common admin panels, debug endpoints, and sensitive files
 * @example
 * import { createHoneypot, EXTENDED_TRAPS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: EXTENDED_TRAPS });
 */
export declare const EXTENDED_TRAPS: string[];
/**
 * Minimal trap paths - only the most commonly scanned paths
 * Use this for lighter protection with fewer false positives
 * @example
 * import { createHoneypot, MINIMAL_TRAPS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: MINIMAL_TRAPS });
 */
export declare const MINIMAL_TRAPS: string[];
/**
 * WordPress-specific traps
 * @example
 * import { createHoneypot, WORDPRESS_TRAPS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: WORDPRESS_TRAPS });
 */
export declare const WORDPRESS_TRAPS: string[];
/**
 * PHP-specific traps
 * @example
 * import { createHoneypot, PHP_TRAPS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: PHP_TRAPS });
 */
export declare const PHP_TRAPS: string[];
/**
 * Node.js/Express-specific traps
 * @example
 * import { createHoneypot, NODE_TRAPS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: NODE_TRAPS });
 */
export declare const NODE_TRAPS: string[];
/**
 * All predefined trap sets for easy access
 * @example
 * import { createHoneypot, TRAP_SETS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: TRAP_SETS.extended });
 */
export declare const TRAP_SETS: {
    readonly default: string[];
    readonly minimal: string[];
    readonly extended: string[];
    readonly wordpress: string[];
    readonly php: string[];
    readonly node: string[];
};
export type TrapSetName = keyof typeof TRAP_SETS;
//# sourceMappingURL=routes.d.ts.map