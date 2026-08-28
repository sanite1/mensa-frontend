import type { AppModule } from './getModule'

const PROD_URLS: Record<AppModule, string> = {
  platform: 'https://mensaproducts.com',
  admin: 'https://admin.mensaproducts.com',
  app: 'https://app.mensaproducts.com',
}

const DEV_PORTS: Record<AppModule, string> = {
  platform: 'http://localhost:3000',
  admin: 'http://localhost:3002',
  app: 'http://localhost:3001',
}

export function buildAppUrl(module: AppModule, path = ''): string {
  const base = import.meta.env.DEV ? DEV_PORTS[module] : PROD_URLS[module]
  return `${base}${path}`
}
