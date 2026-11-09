/**
 * Rotas comuns de armadilhas/bloqueio para uso como honeypot.
 * São caminhos que usuários legítimos tipicamente nunca acessam,
 * tornando-os ideais para detectar scanners e bots.
 */
/**
 * Armadilhas padrão incluídas automaticamente
 * @example
 * import { createHoneypot, DEFAULT_TRAPS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: DEFAULT_TRAPS });
 */
export declare const DEFAULT_TRAPS: string[];
/**
 * Armadilhas estendidas para proteção mais agressiva
 * Inclui painéis admin comuns, endpoints de debug e arquivos sensíveis
 * @example
 * import { createHoneypot, EXTENDED_TRAPS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: EXTENDED_TRAPS });
 */
export declare const EXTENDED_TRAPS: string[];
/**
 * Armadilhas mínimas - apenas os caminhos mais escaneados
 * Use para proteção mais leve com menos falsos positivos
 * @example
 * import { createHoneypot, MINIMAL_TRAPS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: MINIMAL_TRAPS });
 */
export declare const MINIMAL_TRAPS: string[];
/**
 * Armadilhas específicas para WordPress
 * @example
 * import { createHoneypot, WORDPRESS_TRAPS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: WORDPRESS_TRAPS });
 */
export declare const WORDPRESS_TRAPS: string[];
/**
 * Armadilhas específicas para PHP
 * @example
 * import { createHoneypot, PHP_TRAPS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: PHP_TRAPS });
 */
export declare const PHP_TRAPS: string[];
/**
 * Armadilhas específicas para Node.js/Express
 * @example
 * import { createHoneypot, NODE_TRAPS } from "express-mongo-honeypot";
 * const honeypot = createHoneypot({ blocklist, traps: NODE_TRAPS });
 */
export declare const NODE_TRAPS: string[];
/**
 * Todos os conjuntos de armadilhas predefinidos para acesso fácil
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