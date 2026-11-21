// Footer: the design system's dark footer with the newsletter signup and the
// oversized wordmark. Link columns cover our full site map.
import { Link } from 'react-router-dom'
import logoSrc from '@/assets/mensa_logo.png'
import { Newsletter } from '@/components/design/Newsletter'

type FootLink = { label: string; href: string; external?: boolean }

const COLUMNS: { title: string; links: FootLink[] }[] = [
  {
    title: 'Shop',
    links: [
      { label: 'Shop everything', href: '/shop' },
      { label: 'Period pants', href: '/shop?category=pants' },
      { label: 'Reusable pads', href: '/shop?category=pads' },
      { label: 'The starter set', href: '/shop?category=bundles' },
      { label: 'Education', href: '/shop?category=education' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Find your fit quiz', href: '/find-my-starter-set' },
      { label: 'Size guide', href: '/size-guide' },
      { label: 'Education library', href: '/education' },
      { label: 'Journal', href: '/journal' },
    ],
  },
  {
    title: 'Mensa',
    links: [
      { label: 'Our story', href: '/about' },
      { label: 'Partnerships', href: '/partnerships' },
      { label: 'Track an order', href: '/orders/track' },
      { label: 'Delivery and returns', href: '/returns' },
      { label: 'Contact us', href: '/contact' },
      { label: 'Instagram', href: 'https://instagram.com/shopmensa_', external: true },
      { label: 'TikTok', href: 'https://www.tiktok.com/@shopmensa', external: true },
    ],
  },
]

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <div>
            <h2>Practical tips. Better periods.</h2>
            <p className="footer__note">
              Period care, restocks, the occasional 10% off. Two emails a month, max.
            </p>
          </div>
          <Newsletter source="footer" />
        </div>
        <div className="footer__cols">
          <div className="footer__logo">
            <img src={logoSrc} alt="Mensa Period Products" />
            <p className="footer__note max-w-[30ch]">
              Reusable period products. Made in Abuja.
              <br />
              support@mensaproducts.com
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noreferrer">
                        {l.label}
                      </a>
                    ) : (
                      <Link to={l.href}>{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer__wordmark" aria-hidden="true">
          mensa.
        </div>
        <div className="footer__legal">
          <span>© {new Date().getFullYear()} Mensa Period Products · Abuja, Nigeria</span>
          <span className="footer__links">
            <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link> ·{' '}
            <Link to="/returns">Returns</Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
