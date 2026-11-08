/**
 * Core types for express-mongo-honeypot
 */
import type { Request, Response, NextFunction } from "express";
import { BlockList } from "node:net";
/**
 * Logger interface - implement your own or use the built-in console logger
 */
export interface HoneypotLogger {
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
    child(meta: Record<string, unknown>): HoneypotLogger;
}
/**
 * Blocklist storage interface - implement for your storage backend
 */
export interface BlocklistStorage {
    /** Initialize the storage (create indexes, connect, etc.) */
    init(): Promise<void>;
    /** Check if an IP is blocked */
    isBlocked(ip: string): boolean;
    /** Block an IP with a reason */
    block(ip: string, reason: string): Promise<void>;
    /** Optional: unblock an IP */
    unblock?(ip: string): Promise<void>;
    /** Optional: get all blocked IPs */
    getAll?(): Promise<string[]>;
    /** Optional: close connections */
    close?(): Promise<void>;
}
/**
 * Internal networks configuration
 * - undefined: use library defaults (RFC1918, localhost, link-local)
 * - BlockList: use custom BlockList instance
 * - false: disable internal network checks (block all IPs)
 */
export type InternalNetworksConfig = BlockList | false | undefined;
/**
 * Configuration options for the honeypot
 */
export interface HoneypotOptions {
    /** Paths to trap - exact matches or glob patterns (e.g., "/admin", "/api/*") */
    traps?: string[];
    /** Path to JSON file with custom traps (merged with defaults) */
    trapsFile?: string;
    /** Blocklist storage implementation */
    blocklist: BlocklistStorage;
    /** Logger implementation - set to false to disable logging, or provide custom logger */
    logger?: HoneypotLogger | false;
    /** Function to extract client IP from request */
    getIp?: (req: Request) => string | undefined;
    /** Internal networks that should never be blocked - provide custom BlockList, false to disable, or omit for defaults */
    internalNetworks?: InternalNetworksConfig;
    /** Custom handler when trap is triggered (default: 404 + block) */
    onTriggered?: (req: Request, res: Response, trap: string, ip: string) => Promise<void> | void;
    /** Whether to load traps from file on startup */
    autoLoadTraps?: boolean;
}
/**
 * Internal trap representation
 */
export interface Trap {
    pattern: string;
    regex?: RegExp;
    isGlob: boolean;
}
/**
 * Default traps that are always included
 * @deprecated Use DEFAULT_TRAPS from "express-mongo-honeypot/routes" instead
 */
export declare const DEFAULT_TRAPS: string[];
/**
 * Express middleware type
 */
export type HoneypotMiddleware = (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=types.d.ts.map