"use strict";
/**
 * Utilitários de IP para honeypot
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
 * Redes internas padrão que nunca devem ser bloqueadas (RFC1918, localhost, link-local)
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
 * Configura redes internas
 * @param networks - Instância BlockList, false para desabilitar, ou undefined para resetar aos padrões
 * @returns Instância de redes configurada
 */
function setInternalNetworks(networks) {
    internalNetworks = networks ?? exports.DEFAULT_INTERNAL_NETWORKS;
    return internalNetworks;
}
/**
 * Obtém configuração atual de redes internas
 */
function getInternalNetworks() {
    return internalNetworks;
}
/**
 * Reseta redes internas para os padrões
 */
function resetInternalNetworks() {
    internalNetworks = exports.DEFAULT_INTERNAL_NETWORKS;
}
/**
 * Normaliza endereço IP - remove prefixo IPv6 mapeado para IPv4 (::ffff:)
 */
function normalizeIp(ip) {
    if (!ip)
        return "unknown";
    return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
}
/**
 * Verifica se um IP é interno/indesbloqueável
 * @returns true se IP é interno (localhost, ranges privados, link-local, etc.) ou se redes internas estão desabilitadas
 */
function isUnblockableIp(ip) {
    // Se verificação de redes internas está desabilitada, nenhum IP é indesbloqueável
    if (internalNetworks === false)
        return false;
    const family = (0, node_net_1.isIP)(ip);
    if (family === 0)
        return true;
    return internalNetworks.check(ip, family === 4 ? "ipv4" : "ipv6");
}
/**
 * Extrator de IP padrão para requisições Express
 * Funciona com trust proxy - configure app.set("trust proxy", true) no Express
 */
function getClientIp(req) {
    return req.ip;
}
