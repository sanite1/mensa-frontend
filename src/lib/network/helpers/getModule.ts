export type AppModule = 'platform' | 'admin'

// The storefront lives on the apex domain (and everywhere else that is not
// the admin console). app.mensaproducts.com simply serves the storefront too.
export function getModule(): AppModule {
  const hostname = window.location.hostname
  const port = window.location.port

  if (hostname === 'admin.mensaproducts.com' || port === '3001') return 'admin'
  return 'platform'
}
