"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showLogger = exports.isLocal = exports.isProd = void 0;
exports.isProd = process.env.NODE_ENV === 'production';
exports.isLocal = process.env.NODE_ENV === 'development';
exports.showLogger = exports.isLocal || process.env.NEXT_PUBLIC_SHOW_LOGGER === 'true';
