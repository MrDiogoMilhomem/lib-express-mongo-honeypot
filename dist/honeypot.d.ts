/**
 * Middleware Honeypot - implementação
 *
 * Contém a lógica do middleware honeypot (createHoneypot, waitForTraps e
 * funções auxiliares de armadilhas). A exportação pública fica em index.ts.
 */
import type { HoneypotOptions, HoneypotMiddleware } from "./types";
/**
 * Cria middleware honeypot
 *
 * O middleware retornado é declarado como função genérica (HoneypotMiddleware),
 * o que o torna aceito pelo app.use() no Express 4 e no Express 5 — o TypeScript
 * infere os tipos do Request/Response no ponto de uso, independente de qual versão
 * dos tipos do Express a biblioteca resolve.
 */
export declare function createHoneypot(options: HoneypotOptions): HoneypotMiddleware;
/**
 * Aguarda carregamento das armadilhas (útil para testes)
 */
export declare function waitForTraps(): Promise<void>;
//# sourceMappingURL=honeypot.d.ts.map