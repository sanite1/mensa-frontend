import type { AppModule } from './getModule'

// 'construction' is the apex domain's pre-launch state, it maps to the same
// base URL as platform.
const PROD_URLS: Record<AppModule, string> = {
  platform: 'https://mensaproducts.com',
  construction: 'https://mensaproducts.com',
  admin: 'https://admin.mensaproducts.com',
  app: 'https://app.mensaproducts.com',
}

const DEV_PORTS: Record<AppModule, string> = {
  platform: 'http://localhost:3000',
  construction: 'http://localhost:3000',
  admin: 'http://localhost:3001',
  app: 'http://localhost:3002',
}

export function buildAppUrl(module: AppModule, path = ''): string {
  const base = import.meta.env.DEV ? DEV_PORTS[module] : PROD_URLS[module]
  return `${base}${path}`
}
