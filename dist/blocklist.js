"use strict";
/**
 * MongoDB blocklist storage implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoBlocklist = void 0;
exports.createMongoBlocklist = createMongoBlocklist;
const mongodb_1 = require("mongodb");
const logger_1 = require("./logger");
const DEFAULT_UPDATE_INTERVAL_MS = 30_000;
/**
 * MongoDB-based blocklist storage
 */
class MongoBlocklist {
    options;
    client;
    db;
    collection;
    blockedIps = new Set();
    updateInterval;
    updateIntervalMs;
    ownClient;
    logger;
    constructor(options) {
        this.options = options;
        this.updateIntervalMs = options.updateIntervalMs ?? DEFAULT_UPDATE_INTERVAL_MS;
        this.ownClient = !options.client && !options.db;
        this.logger = options.logger === false ? (0, logger_1.createNoopLogger)() : (options.logger ?? (0, logger_1.createNoopLogger)());
        if (options.client) {
            this.client = options.client;
            this.db = options.db ?? this.client.db(options.database);
        }
        else {
            this.client = new mongodb_1.MongoClient(options.url, { serverSelectionTimeoutMS: 5000 });
            this.db = this.client.db(options.database);
        }
        this.collection = this.db.collection(options.collectionName ?? "BlockedIPs");
    }
    async init() {
        if (this.ownClient) {
            await this.client.connect();
        }
        try {
            await this.collection.createIndex({ ip: 1 }, { unique: true });
        }
        catch {
            // Index may already exist
        }
        await this.loadBlocklist();
        this.updateInterval = setInterval(() => {
            this.loadBlocklist().catch((err) => {
                this.logger.error("Failed to update blocked IPs", { error: String(err) });
            });
        }, this.updateIntervalMs);
        this.updateInterval.unref();
    }
    async loadBlocklist() {
        const docs = await this.collection.find({}, { projection: { ip: 1 } }).toArray();
        this.blockedIps = new Set(docs.map((doc) => doc.ip));
        this.logger.debug("Blocklist loaded", { count: this.blockedIps.size });
    }
    isBlocked(ip) {
        return this.blockedIps.has(ip);
    }
    async block(ip, reason) {
        this.blockedIps.add(ip);
        await this.collection.updateOne({ ip }, { $setOnInsert: { reason, blockedAt: new Date() } }, { upsert: true });
        this.logger.info("IP blocked", { ip, reason });
    }
    async unblock(ip) {
        this.blockedIps.delete(ip);
        await this.collection.deleteOne({ ip });
        this.logger.info("IP unblocked", { ip });
    }
    async getAll() {
        return Array.from(this.blockedIps);
    }
    async close() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.ownClient) {
            await this.client.close();
        }
        this.logger.debug("Blocklist closed");
    }
}
exports.MongoBlocklist = MongoBlocklist;
/**
 * Create a MongoDB blocklist instance
 */
function createMongoBlocklist(options) {
    return new MongoBlocklist(options);
}
