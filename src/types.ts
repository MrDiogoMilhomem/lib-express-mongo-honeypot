/**
 * Tipos principais do express-mongo-honeypot
 */

import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";
import { BlockList } from "node:net";

/**
 * Interface do logger - implemente a sua ou use o logger de console integrado
 */
export interface HoneypotLogger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  child(meta: Record<string, unknown>): HoneypotLogger;
}

/**
 * Interface de armazenamento da blocklist - implemente para seu backend de armazenamento
 */
export interface BlocklistStorage {
  /** Inicializa o armazenamento (cria índices, conecta, etc.) */
  init(): Promise<void>;
  /** Verifica se um IP está bloqueado */
  isBlocked(ip: string): boolean;
  /** Bloqueia um IP com motivo */
  block(ip: string, reason: string): Promise<void>;
  /** Opcional: desbloqueia um IP */
  unblock?(ip: string): Promise<void>;
  /** Opcional: obtém todos os IPs bloqueados */
  getAll?(): Promise<string[]>;
  /** Opcional: fecha conexões */
  close?(): Promise<void>;
}

/**
 * Configuração de redes internas
 * - undefined: usa padrões da biblioteca (RFC1918, localhost, link-local)
 * - BlockList: usa instância BlockList customizada
 * - false: desabilita verificação de redes internas (bloqueia todos IPs)
 */
export type InternalNetworksConfig = BlockList | false | undefined;

/**
 * Opções de configuração do honeypot
 *
 * Os callbacks getIp/onTriggered são tipados com os tipos do Express resolvidos
 * pela biblioteca. O middleware retornado por createHoneypot é uma função genérica,
 * portanto aceito pelo app.use() tanto no Express 4 quanto no Express 5.
 */
export interface HoneypotOptions {
  /** Caminhos para armadilha - correspondência exata ou padrões glob (ex: "/admin", "/api/*") */
  traps?: string[];
  /** Caminho para arquivo JSON com armadilhas customizadas (mesclado com padrões) */
  trapsFile?: string;
  /** Implementação de armazenamento da blocklist */
  blocklist: BlocklistStorage;
  /** Implementação do logger - defina como false para desabilitar, ou forneça logger customizado */
  logger?: HoneypotLogger | false;
  /** Função para extrair IP do cliente da requisição */
  getIp?: (req: ExpressRequest) => string | undefined;
  /** Redes internas que nunca devem ser bloqueadas - forneça BlockList customizado, false para desabilitar, ou omita para padrões */
  internalNetworks?: InternalNetworksConfig;
  /** Handler customizado quando armadilha é disparada (padrão: 404 + bloqueio) */
  onTriggered?: (req: ExpressRequest, res: ExpressResponse, trap: string, ip: string) => Promise<void> | void;
  /** Se deve carregar armadilhas do arquivo na inicialização */
  autoLoadTraps?: boolean;
}

/**
 * Representação interna de uma armadilha
 */
export interface Trap {
  pattern: string;
  regex?: RegExp;
  isGlob: boolean;
}

/**
 * Tipo do middleware Express
 *
 * Declarado como função genérica (sem restrição nos parâmetros Req/Res) para ser
 * estruturalmente compatível com o RequestHandler do Express 4 E do Express 5 —
 * o TypeScript infere os tipos concretos no ponto de uso (ex.: app.use(honeypot)),
 * independente de qual versão dos tipos do Express a biblioteca resolve.
 */
export type HoneypotMiddleware = <
  Req = ExpressRequest,
  Res = ExpressResponse,
>(
  req: Req,
  res: Res,
  next: NextFunction,
) => Promise<void> | void;
