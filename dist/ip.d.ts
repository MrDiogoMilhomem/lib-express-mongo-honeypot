/**
 * IP utilities for honeypot
 */
import { BlockList } from "node:net";
/**
 * Default internal networks that should never be blocked (RFC1918, localhost, link-local)
 */
export declare const DEFAULT_INTERNAL_NETWORKS: BlockList;
/**
 * Configure internal networks
 * @param networks - BlockList instance, false to disable, or undefined to reset to defaults
 * @returns The configured networks instance
 */
export declare function setInternalNetworks(networks: BlockList | false | undefined): BlockList | false;
/**
 * Get current internal networks configuration
 */
export declare function getInternalNetworks(): BlockList | false;
/**
 * Reset internal networks to defaults
 */
export declare function resetInternalNetworks(): void;
/**
 * Normalize IP address - removes IPv6 mapped IPv4 prefix (::ffff:)
 */
export declare function normalizeIp(ip: string | undefined): string;
/**
 * Check if an IP is internal/unblockable
 * @returns true if IP is internal (localhost, private ranges, link-local, etc.) or if internal networks are disabled
 */
export declare function isUnblockableIp(ip: string): boolean;
/**
 * Default IP extractor for Express requests
 * Works with trust proxy - configure app.set("trust proxy", true) in Express
 */
export declare function getClientIp(req: {
    ip?: string;
}): string | undefined;
//# sourceMappingURL=ip.d.ts.map