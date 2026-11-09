/**
 * Utilitários de IP para honeypot
 */
import { BlockList } from "node:net";
/**
 * Redes internas padrão que nunca devem ser bloqueadas (RFC1918, localhost, link-local)
 */
export declare const DEFAULT_INTERNAL_NETWORKS: BlockList;
/**
 * Configura redes internas
 * @param networks - Instância BlockList, false para desabilitar, ou undefined para resetar aos padrões
 * @returns Instância de redes configurada
 */
export declare function setInternalNetworks(networks: BlockList | false | undefined): BlockList | false;
/**
 * Obtém configuração atual de redes internas
 */
export declare function getInternalNetworks(): BlockList | false;
/**
 * Reseta redes internas para os padrões
 */
export declare function resetInternalNetworks(): void;
/**
 * Normaliza endereço IP - remove prefixo IPv6 mapeado para IPv4 (::ffff:)
 */
export declare function normalizeIp(ip: string | undefined): string;
/**
 * Verifica se um IP é interno/indesbloqueável
 * @returns true se IP é interno (localhost, ranges privados, link-local, etc.) ou se redes internas estão desabilitadas
 */
export declare function isUnblockableIp(ip: string): boolean;
/**
 * Extrator de IP padrão para requisições Express
 * Funciona com trust proxy - configure app.set("trust proxy", true) no Express
 */
export declare function getClientIp(req: {
    ip?: string;
}): string | undefined;
//# sourceMappingURL=ip.d.ts.map