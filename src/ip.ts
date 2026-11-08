/**
 * IP utilities for honeypot
 */

import { BlockList, isIP } from "node:net";

/**
 * Default internal networks that should never be blocked (RFC1918, localhost, link-local)
 */
export const DEFAULT_INTERNAL_NETWORKS = new BlockList();
DEFAULT_INTERNAL_NETWORKS.addSubnet("127.0.0.0", 8, "ipv4");
DEFAULT_INTERNAL_NETWORKS.addSubnet("10.0.0.0", 8, "ipv4");
DEFAULT_INTERNAL_NETWORKS.addSubnet("172.16.0.0", 12, "ipv4");
DEFAULT_INTERNAL_NETWORKS.addSubnet("192.168.0.0", 16, "ipv4");
DEFAULT_INTERNAL_NETWORKS.addSubnet("169.254.0.0", 16, "ipv4");
DEFAULT_INTERNAL_NETWORKS.addAddress("::1", "ipv6");
DEFAULT_INTERNAL_NETWORKS.addSubnet("fc00::", 7, "ipv6");
DEFAULT_INTERNAL_NETWORKS.addSubnet("fe80::", 10, "ipv6");

let internalNetworks: BlockList | false = DEFAULT_INTERNAL_NETWORKS;

/**
 * Configure internal networks
 * @param networks - BlockList instance, false to disable, or undefined to reset to defaults
 * @returns The configured networks instance
 */
export function setInternalNetworks(networks: BlockList | false | undefined): BlockList | false {
  internalNetworks = networks ?? DEFAULT_INTERNAL_NETWORKS;
  return internalNetworks;
}

/**
 * Get current internal networks configuration
 */
export function getInternalNetworks(): BlockList | false {
  return internalNetworks;
}

/**
 * Reset internal networks to defaults
 */
export function resetInternalNetworks(): void {
  internalNetworks = DEFAULT_INTERNAL_NETWORKS;
}

/**
 * Normalize IP address - removes IPv6 mapped IPv4 prefix (::ffff:)
 */
export function normalizeIp(ip: string | undefined): string {
  if (!ip) return "unknown";
  return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
}

/**
 * Check if an IP is internal/unblockable
 * @returns true if IP is internal (localhost, private ranges, link-local, etc.) or if internal networks are disabled
 */
export function isUnblockableIp(ip: string): boolean {
  // If internal networks check is disabled, no IP is unblockable
  if (internalNetworks === false) return false;
  
  const family = isIP(ip);
  if (family === 0) return true;
  return internalNetworks.check(ip, family === 4 ? "ipv4" : "ipv6");
}

/**
 * Default IP extractor for Express requests
 * Works with trust proxy - configure app.set("trust proxy", true) in Express
 */
export function getClientIp(req: { ip?: string }): string | undefined {
  return req.ip;
}