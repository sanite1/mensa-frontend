// /privacy policy. Working draft pending legal review for full NDPR compliance.

import { LegalLayout, type LegalSection } from './LegalLayout'
import { useSeo } from '@/lib/seo'

const SECTIONS: LegalSection[] = [
  {
    heading: 'What we collect',
    body: (
      <>
        <p className="m-0">
          When you shop or sign up to a Mensa surface we collect the information you give us:
        </p>
        <ul className="m-0 pl-5 flex flex-col gap-1.5">
          <li>Your name, email address and phone number.</li>
          <li>Your delivery address.</li>
          <li>The contents of any order you place.</li>
          <li>Messages you send us via the contact form or email.</li>
          <li>If you become a partner, your social handle and bank account details.</li>
        </ul>
        <p className="m-0">
          We never see or store your full card number. Payments are processed by Paystack on their
          own infrastructure and they hand us back only a payment reference.
        </p>
      </>
    ),
  },
  {
    heading: 'Why we collect it',
    body: (
      <>
        <ul className="m-0 pl-5 flex flex-col gap-1.5">
          <li>To fulfil and ship the orders you place.</li>
          <li>
            To send order, shipping, and account emails (these are transactional, not marketing).
          </li>
          <li>To send our newsletter only if you opt in. You can unsubscribe at any time.</li>
          <li>To answer the messages you send us.</li>
          <li>To pay partners the commission they earn through the referral programme.</li>
        </ul>
      </>
    ),
  },
  {
    heading: 'Who we share it with',
    body: (
      <>
        <p className="m-0">
          We share only the minimum data needed with the services that help us run Mensa:
        </p>
        <ul className="m-0 pl-5 flex flex-col gap-1.5">
          <li>
            <span className="text-ink">Paystack</span> — payment processing.
          </li>
          <li>
            <span className="text-ink">Sendbox</span> — nationwide shipping (your name, address,
            phone, and parcel weight).
          </li>
          <li>
            <span className="text-ink">Mailerlite</span> — newsletter delivery, if you have
            subscribed. We share only your email and your subscribe source.
          </li>
          <li>
            <span className="text-ink">Cloudinary</span> — image hosting (product photography and
            any cover images you upload).
          </li>
        </ul>
        <p className="m-0">
          We do not sell your data to anyone, for any reason. We do not run third-party advertising
          trackers on this site.
        </p>
      </>
    ),
  },
  {
    heading: 'Cookies and analytics',
    body: (
      <>
        <p className="m-0">
          We use a small number of first-party cookies and browser storage entries to keep your cart
          working, remember your selected display currency, and track partner referral attribution.
          We use{' '}
          <a
            href="https://plausible.io"
            target="_blank"
            rel="noreferrer"
            className="text-ink underline underline-offset-2"
          >
            Plausible
          </a>{' '}
          for privacy-friendly, cookie-less aggregate analytics.
        </p>
      </>
    ),
  },
  {
    heading: 'How long we keep it',
    body: (
      <>
        <p className="m-0">
          Orders and the data attached to them are kept indefinitely for accounting and
          customer-service reasons. Newsletter subscribers can unsubscribe and ask to be removed at
          any time. Contact-form submissions live in our support inbox and are deleted on request.
        </p>
      </>
    ),
  },
  {
    heading: 'Your rights under NDPR',
    body: (
      <>
        <p className="m-0">The Nigeria Data Protection Regulation gives you the right to:</p>
        <ul className="m-0 pl-5 flex flex-col gap-1.5">
          <li>Ask what we hold about you.</li>
          <li>Correct anything that is wrong.</li>
          <li>Delete your account and the personal data attached to it.</li>
          <li>Withdraw consent for the newsletter or any other optional use.</li>
        </ul>
        <p className="m-0">
          Email{' '}
          <a href="mailto:hi@mensaproducts.com" className="text-ink underline underline-offset-2">
            hi@mensaproducts.com
          </a>{' '}
          to make any of these requests. We will reply within 30 days.
        </p>
      </>
    ),
  },
  {
    heading: 'Children',
    body: (
      <p className="m-0">
        Our products are for menstruators of any age. If you are under 18, please ask a parent or
        guardian to place orders on your behalf. We do not knowingly create accounts for users under
        13.
      </p>
    ),
  },
  {
    heading: 'Changes to this policy',
    body: (
      <p className="m-0">
        We will update this page when our practices change. The "last updated" date at the top
        always reflects the current version. Material changes that affect existing customers will
        also be sent to subscribed email addresses.
      </p>
    ),
  },
  {
    heading: 'Contact',
    body: (
      <p className="m-0">
        Questions about how we handle your data? Reach us at{' '}
        <a href="mailto:hi@mensaproducts.com" className="text-ink underline underline-offset-2">
          hi@mensaproducts.com
        </a>{' '}
        and we will get back to you.
      </p>
    ),
  },
]

export function PrivacyPage() {
  useSeo({
    title: 'Privacy policy',
    description:
      'How Mensa collects, uses, and protects your data. We never sell anything to anyone, and you can ask us to delete your data at any time.',
  })
  return (
    <LegalLayout
      eyebrow="Privacy · How we handle your data"
      title="The honest privacy policy."
      lastUpdated="Draft"
      intro={
        <>
          We collect only what we need to run Mensa, we never sell anything to anyone, and you can
          ask us to delete your data at any time. This page is the full version of that short
          summary.
        </>
      }
      sections={SECTIONS}
    />
  )
}
