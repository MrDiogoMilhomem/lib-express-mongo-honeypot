/**
 * MongoDB blocklist storage implementation
 */
import type { BlocklistStorage, HoneypotLogger } from "./types";
import { Db, MongoClient } from "mongodb";
export interface MongoBlocklistOptions {
    /** MongoDB connection string */
    url: string;
    /** Database name */
    database: string;
    /** Collection name (default: "BlockedIPs") */
    collectionName?: string;
    /** Refresh interval in ms (default: 30000) */
    updateIntervalMs?: number;
    /** Existing MongoDB client (optional) */
    client?: MongoClient;
    /** Existing Db instance (optional) */
    db?: Db;
    /** Logger instance (optional) */
    logger?: HoneypotLogger | false;
}
/**
 * MongoDB-based blocklist storage
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
 * Create a MongoDB blocklist instance
 */
export declare function createMongoBlocklist(options: MongoBlocklistOptions): MongoBlocklist;
//# sourceMappingURL=blocklist.d.ts.map