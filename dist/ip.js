"use strict";
/**
 * IP utilities for honeypot
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_INTERNAL_NETWORKS = void 0;
exports.setInternalNetworks = setInternalNetworks;
exports.getInternalNetworks = getInternalNetworks;
exports.resetInternalNetworks = resetInternalNetworks;
exports.normalizeIp = normalizeIp;
exports.isUnblockableIp = isUnblockableIp;
exports.getClientIp = getClientIp;
const node_net_1 = require("node:net");
/**
 * Default internal networks that should never be blocked (RFC1918, localhost, link-local)
 */
exports.DEFAULT_INTERNAL_NETWORKS = new node_net_1.BlockList();
exports.DEFAULT_INTERNAL_NETWORKS.addSubnet("127.0.0.0", 8, "ipv4");
exports.DEFAULT_INTERNAL_NETWORKS.addSubnet("10.0.0.0", 8, "ipv4");
exports.DEFAULT_INTERNAL_NETWORKS.addSubnet("172.16.0.0", 12, "ipv4");
exports.DEFAULT_INTERNAL_NETWORKS.addSubnet("192.168.0.0", 16, "ipv4");
exports.DEFAULT_INTERNAL_NETWORKS.addSubnet("169.254.0.0", 16, "ipv4");
exports.DEFAULT_INTERNAL_NETWORKS.addAddress("::1", "ipv6");
exports.DEFAULT_INTERNAL_NETWORKS.addSubnet("fc00::", 7, "ipv6");
exports.DEFAULT_INTERNAL_NETWORKS.addSubnet("fe80::", 10, "ipv6");
let internalNetworks = exports.DEFAULT_INTERNAL_NETWORKS;
/**
 * Configure internal networks
 * @param networks - BlockList instance, false to disable, or undefined to reset to defaults
 * @returns The configured networks instance
 */
function setInternalNetworks(networks) {
    internalNetworks = networks ?? exports.DEFAULT_INTERNAL_NETWORKS;
    return internalNetworks;
}
/**
 * Get current internal networks configuration
 */
function getInternalNetworks() {
    return internalNetworks;
}
/**
 * Reset internal networks to defaults
 */
function resetInternalNetworks() {
    internalNetworks = exports.DEFAULT_INTERNAL_NETWORKS;
}
/**
 * Normalize IP address - removes IPv6 mapped IPv4 prefix (::ffff:)
 */
function normalizeIp(ip) {
    if (!ip)
        return "unknown";
    return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
}
/**
 * Check if an IP is internal/unblockable
 * @returns true if IP is internal (localhost, private ranges, link-local, etc.) or if internal networks are disabled
 */
function isUnblockableIp(ip) {
    // If internal networks check is disabled, no IP is unblockable
    if (internalNetworks === false)
        return false;
    const family = (0, node_net_1.isIP)(ip);
    if (family === 0)
        return true;
    return internalNetworks.check(ip, family === 4 ? "ipv4" : "ipv6");
}
/**
 * Default IP extractor for Express requests
 * Works with trust proxy - configure app.set("trust proxy", true) in Express
 */
function getClientIp(req) {
    return req.ip;
}
