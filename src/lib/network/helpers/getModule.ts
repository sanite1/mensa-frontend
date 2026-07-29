export type AppModule = 'platform' | 'admin' | 'app'

export function getModule(): AppModule {
  const hostname = window.location.hostname
  const port = window.location.port

  if (hostname === 'admin.mensaproducts.com' || port === '3001') return 'admin'
  if (hostname === 'app.mensaproducts.com' || port === '3002') return 'app'
  return 'platform'
}
