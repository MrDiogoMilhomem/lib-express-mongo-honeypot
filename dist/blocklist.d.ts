/**
 * Implementação de armazenamento da blocklist usando MongoDB
 */
import type { BlocklistStorage, HoneypotLogger } from "./types";
import { Db, MongoClient } from "mongodb";
export interface MongoBlocklistOptions {
    /** String de conexão MongoDB */
    url: string;
    /** Nome do banco de dados */
    database: string;
    /** Nome da coleção (padrão: "BlockedIPs") */
    collectionName?: string;
    /** Intervalo de atualização em ms (padrão: 30000) */
    updateIntervalMs?: number;
    /** Cliente MongoDB existente (opcional) */
    client?: MongoClient;
    /** Instância Db existente (opcional) */
    db?: Db;
    /** Instância do logger (opcional) */
    logger?: HoneypotLogger | false;
}
/**
 * Armazenamento de blocklist baseado em MongoDB
 */
export declare class MongoBlocklist implements BlocklistStorage {
    private readonly options;
    private client;
    private db;
    private collection;
    private blockedIps;
    private updateInterval?;
    private readonly updateIntervalMs;
    private readonly ownClient;
    private readonly logger;
    constructor(options: MongoBlocklistOptions);
    init(): Promise<void>;
    private loadBlocklist;
    isBlocked(ip: string): boolean;
    block(ip: string, reason: string): Promise<void>;
    unblock(ip: string): Promise<void>;
    getAll(): Promise<string[]>;
    close(): Promise<void>;
}
/**
 * Cria uma instância de blocklist MongoDB
 */
export declare function createMongoBlocklist(options: MongoBlocklistOptions): MongoBlocklist;
//# sourceMappingURL=blocklist.d.ts.map