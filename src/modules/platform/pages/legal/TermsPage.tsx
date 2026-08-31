// /terms of service. Working draft, counsel must approve the final version before launch.

import { Link } from 'react-router-dom'
import { LegalLayout, type LegalSection } from './LegalLayout'
import { useSeo } from '@/lib/seo'

const SECTIONS: LegalSection[] = [
  {
    heading: 'Using this site',
    body: (
      <>
        <p className="m-0">
          By browsing, buying, or signing up on mensaproducts.com you agree to these terms. If you
          do not agree, please stop using the site.
        </p>
        <p className="m-0">
          We may update these terms from time to time. The "last updated" date at the top of this
          page is always the current version.
        </p>
      </>
    ),
  },
  {
    heading: 'Your account',
    body: (
      <>
        <p className="m-0">
          You do not need an account to shop, but you need one to track orders from your dashboard,
          save addresses, or earn partner commission. You are responsible for keeping your password
          safe. Tell us at{' '}
          <a href="mailto:hi@mensaproducts.com" className="text-ink underline underline-offset-2">
            hi@mensaproducts.com
          </a>{' '}
          if you think your account has been used without permission.
        </p>
      </>
    ),
  },
  {
    heading: 'Orders and payment',
    body: (
      <>
        <p className="m-0">
          All prices are in Nigerian Naira. If you have selected a different display currency, you
          are seeing an indicative conversion — your card is still charged in NGN by Paystack. Your
          bank may apply a foreign-exchange fee.
        </p>
        <p className="m-0">
          We accept orders subject to availability. Stock is decremented when you start the
          checkout, and restored automatically if your payment does not complete within ten minutes.
          We reserve the right to refuse or cancel any order for legitimate reasons (suspected
          fraud, pricing errors, unavailable stock).
        </p>
      </>
    ),
  },
  {
    heading: 'Shipping and delivery',
    body: (
      <>
        <p className="m-0">
          We ship nationwide via Sendbox and offer an in-house rider in FCT (Abuja) and Lagos.
          Delivery windows are estimates, not guarantees — most orders arrive within 1 to 5 working
          days from dispatch.
        </p>
        <p className="m-0">
          You will receive a shipping email with a tracking number when your order leaves our
          studio. If a parcel does not arrive within ten working days, please reach us.
        </p>
      </>
    ),
  },
  {
    heading: 'Returns and exchanges',
    body: (
      <>
        <p className="m-0">
          Period products are personal and intimate, so the rules are different from most online
          shopping. The full policy lives on its own page:{' '}
          <Link to="/returns" className="text-ink underline underline-offset-2">
            Returns
          </Link>
          .
        </p>
        <p className="m-0">
          The short version: no general returns or exchanges; report wrong / damaged / wrong- size
          items within three days of delivery and we will make it right.
        </p>
      </>
    ),
  },
  {
    heading: 'Partner programme',
    body: (
      <>
        <p className="m-0">
          Individuals and organisations can apply to partner with Mensa. Approved individual
          partners earn a commission on every paid order placed through their referral link.
          Commission becomes cashable once the order is delivered. Commissions for orders that are
          later cancelled or refunded are reversed.
        </p>
        <p className="m-0">
          Partners must not impersonate Mensa, make claims we have not approved, or use the referral
          link for spam. We may suspend or remove partners who breach these rules and any commission
          balance at the time of suspension may be withheld.
        </p>
      </>
    ),
  },
  {
    heading: 'Acceptable use',
    body: (
      <>
        <p className="m-0">You agree not to use this site to:</p>
        <ul className="m-0 pl-5 flex flex-col gap-1.5">
          <li>Submit false, fraudulent, or impersonated orders or contact-form messages.</li>
          <li>Attempt to circumvent rate limits, paywalls, or other technical controls.</li>
          <li>
            Reproduce our editorial copy, product photography, or branding without permission.
          </li>
          <li>Probe, scan, or stress-test our systems.</li>
        </ul>
      </>
    ),
  },
  {
    heading: 'Intellectual property',
    body: (
      <p className="m-0">
        The Mensa name, wordmark, product photography, editorial copy, and packaging design are all
        our work and remain ours. You may share links to our pages freely. Republishing substantial
        portions of our content requires written permission.
      </p>
    ),
  },
  {
    heading: 'Liability',
    body: (
      <p className="m-0">
        Mensa products are designed to be safe and effective for menstrual use. They are not medical
        devices and are not a substitute for medical advice. If you experience discomfort,
        irritation, or any health concern related to your period, please consult a qualified
        healthcare provider. To the maximum extent allowed by Nigerian law, Mensa is not liable for
        indirect or consequential losses arising from use of our products.
      </p>
    ),
  },
  {
    heading: 'Governing law',
    body: (
      <p className="m-0">
        These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes we
        cannot resolve directly will go before the courts of the Federal Capital Territory, Abuja.
      </p>
    ),
  },
  {
    heading: 'Contact',
    body: (
      <p className="m-0">
        Questions about these terms? Reach us at{' '}
        <a href="mailto:hi@mensaproducts.com" className="text-ink underline underline-offset-2">
          hi@mensaproducts.com
        </a>
        .
      </p>
    ),
  },
]

export function TermsPage() {
  useSeo({
    title: 'Terms of service',
    description:
      'The rules of using mensaproducts.com. Plain English, no surprises — covering accounts, orders, shipping, the partner programme, and acceptable use.',
  })
  return (
    <LegalLayout
      eyebrow="Terms · The rules of using Mensa"
      title="The honest terms of service."
      lastUpdated="Draft"
      intro={
        <>
          These terms cover everything from how we sell to how the partner programme works to what
          to do if something goes wrong. Plain English, no surprises.
        </>
      }
      sections={SECTIONS}
    />
  )
}
