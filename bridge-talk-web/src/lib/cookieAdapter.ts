// bridge-talk-web/src/lib/cookieAdapter.ts
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export function cookieAdapter(cookieStore: ReadonlyRequestCookies) {
  return {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    getAll() {
      return Array.from(cookieStore.getAll()).map((c) => ({
        name: c.name,
        value: c.value,
      }));
    },
    set() {
      // Not implemented (no-op for SSR)
    },
    remove() {
      // Not implemented (no-op for SSR)
    },
  };
}
