export type AppModule = 'platform' | 'admin' | 'app' | 'construction'

// Pre-launch: the bare production domain shows an under construction page
// while the storefront lives on app.mensaproducts.com. Localhost and Vercel
// previews keep the full storefront so development is unaffected. At launch,
// drop the 'construction' branch so the apex serves the storefront again.
export function getModule(): AppModule {
  const hostname = window.location.hostname
  const port = window.location.port

  if (hostname === 'admin.mensaproducts.com' || port === '3001') return 'admin'
  if (hostname === 'app.mensaproducts.com' || port === '3002') return 'app'
  if (hostname === 'mensaproducts.com' || hostname === 'www.mensaproducts.com')
    return 'construction'
  return 'platform'
}
