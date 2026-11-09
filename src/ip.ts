/**
 * Utilitários de IP para honeypot
 */

import { BlockList, isIP } from "node:net";

/**
 * Redes internas padrão que nunca devem ser bloqueadas (RFC1918, localhost, link-local)
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
 * Configura redes internas
 * @param networks - Instância BlockList, false para desabilitar, ou undefined para resetar aos padrões
 * @returns Instância de redes configurada
 */
export function setInternalNetworks(networks: BlockList | false | undefined): BlockList | false {
  internalNetworks = networks ?? DEFAULT_INTERNAL_NETWORKS;
  return internalNetworks;
}

/**
 * Obtém configuração atual de redes internas
 */
export function getInternalNetworks(): BlockList | false {
  return internalNetworks;
}

/**
 * Reseta redes internas para os padrões
 */
export function resetInternalNetworks(): void {
  internalNetworks = DEFAULT_INTERNAL_NETWORKS;
}

/**
 * Normaliza endereço IP - remove prefixo IPv6 mapeado para IPv4 (::ffff:)
 */
export function normalizeIp(ip: string | undefined): string {
  if (!ip) return "unknown";
  return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
}

/**
 * Verifica se um IP é interno/indesbloqueável
 * @returns true se IP é interno (localhost, ranges privados, link-local, etc.) ou se redes internas estão desabilitadas
 */
export function isUnblockableIp(ip: string): boolean {
  // Se verificação de redes internas está desabilitada, nenhum IP é indesbloqueável
  if (internalNetworks === false) return false;
  
  const family = isIP(ip);
  if (family === 0) return true;
  return internalNetworks.check(ip, family === 4 ? "ipv4" : "ipv6");
}

/**
 * Extrator de IP padrão para requisições Express
 * Funciona com trust proxy - configure app.set("trust proxy", true) no Express
 */
export function getClientIp(req: { ip?: string }): string | undefined {
  return req.ip;
}