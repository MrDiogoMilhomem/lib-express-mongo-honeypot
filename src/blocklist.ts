/**
 * Implementação de armazenamento da blocklist usando MongoDB
 */

import type { BlocklistStorage, HoneypotLogger } from "./types";
import { Db, Collection, MongoClient } from "mongodb";
import { createNoopLogger } from "./logger";

interface BlockedIpDoc {
  ip: string;
  reason: string;
  blockedAt: Date;
}

const DEFAULT_UPDATE_INTERVAL_MS = 30_000;

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
export class MongoBlocklist implements BlocklistStorage {
  private client: MongoClient;
  private db: Db;
  private collection: Collection<BlockedIpDoc>;
  private blockedIps = new Set<string>();
  private updateInterval?: ReturnType<typeof setInterval>;
  private readonly updateIntervalMs: number;
  private readonly ownClient: boolean;
  private readonly logger: HoneypotLogger;

  constructor(private readonly options: MongoBlocklistOptions) {
    this.updateIntervalMs = options.updateIntervalMs ?? DEFAULT_UPDATE_INTERVAL_MS;
    this.ownClient = !options.client && !options.db;
    this.logger = options.logger === false ? createNoopLogger() : (options.logger ?? createNoopLogger());

    if (options.client) {
      this.client = options.client;
      this.db = options.db ?? this.client.db(options.database);
    } else {
      this.client = new MongoClient(options.url, { serverSelectionTimeoutMS: 5000 });
      this.db = this.client.db(options.database);
    }

    this.collection = this.db.collection<BlockedIpDoc>(options.collectionName ?? "BlockedIPs");
  }

  async init(): Promise<void> {
    if (this.ownClient) {
      await this.client.connect();
    }

    try {
      await this.collection.createIndex({ ip: 1 }, { unique: true });
    } catch {
      // Índice pode já existir
    }

    await this.loadBlocklist();

    this.updateInterval = setInterval(() => {
      this.loadBlocklist().catch((err) => {
        this.logger.error("Falha ao atualizar IPs bloqueados", { error: String(err) });
      });
    }, this.updateIntervalMs);
    this.updateInterval.unref();
  }

  private async loadBlocklist(): Promise<void> {
    const docs = await this.collection.find({}, { projection: { ip: 1 } }).toArray();
    this.blockedIps = new Set(docs.map((doc) => doc.ip));
    this.logger.debug("Blocklist carregada", { count: this.blockedIps.size });
  }

  isBlocked(ip: string): boolean {
    return this.blockedIps.has(ip);
  }

  async block(ip: string, reason: string): Promise<void> {
    this.blockedIps.add(ip);
    await this.collection.updateOne(
      { ip },
      { $setOnInsert: { reason, blockedAt: new Date() } },
      { upsert: true }
    );
    this.logger.info("IP bloqueado", { ip, reason });
  }

  async unblock(ip: string): Promise<void> {
    this.blockedIps.delete(ip);
    await this.collection.deleteOne({ ip });
    this.logger.info("IP desbloqueado", { ip });
  }

  async getAll(): Promise<string[]> {
    return Array.from(this.blockedIps);
  }

  async close(): Promise<void> {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.ownClient) {
      await this.client.close();
    }
    this.logger.debug("Blocklist fechada");
  }
}

/**
 * Cria uma instância de blocklist MongoDB
 */
export function createMongoBlocklist(options: MongoBlocklistOptions): MongoBlocklist {
  return new MongoBlocklist(options);
}