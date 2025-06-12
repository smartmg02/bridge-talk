"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Configuration for type-safe environment variables.
 * Imported through src/app/page.tsx
 * @see https://x.com/mattpocockuk/status/1760991147793449396
 */
const zod_1 = require("zod");
const envVariables = zod_1.z.object({
    NEXT_PUBLIC_SHOW_LOGGER: zod_1.z.enum(['true', 'false']).optional(),
});
envVariables.parse(process.env);
