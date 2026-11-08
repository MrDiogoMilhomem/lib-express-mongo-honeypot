"use strict";
/**
 * Core types for express-mongo-honeypot
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TRAPS = void 0;
/**
 * Default traps that are always included
 * @deprecated Use DEFAULT_TRAPS from "express-mongo-honeypot/routes" instead
 */
exports.DEFAULT_TRAPS = [
    "/phpmyadmin",
    "/wp-admin",
    "/admin",
    "/api/v1",
    "/backup",
    "/.env",
    "/.git",
];
