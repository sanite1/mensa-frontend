// /privacy policy. Working draft pending legal review for full NDPR compliance.

import { LegalLayout, type LegalSection } from './LegalLayout'
import { useSeo } from '@/lib/seo'

const SECTIONS: LegalSection[] = [
  {
    heading: 'What we collect',
    body: (
      <>
        <p>When you shop or sign up to a Mensa surface we collect the information you give us:</p>
        <ul>
          <li>Your name, email address and phone number.</li>
          <li>Your delivery address.</li>
          <li>The contents of any order you place.</li>
          <li>Messages you send us via the contact form or email.</li>
          <li>If you become a partner, your social handle and bank account details.</li>
        </ul>
        <p>
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
        <ul>
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
        <p>We share only the minimum data needed with the services that help us run Mensa:</p>
        <ul>
          <li>
            <span>Paystack</span> — payment processing.
          </li>
          <li>
            <span>Sendbox</span> — nationwide shipping (your name, address, phone, and parcel
            weight).
          </li>
          <li>
            <span>Mailerlite</span> — newsletter delivery, if you have subscribed. We share only
            your email and your subscribe source.
          </li>
          <li>
            <span>Cloudinary</span> — image hosting (product photography and any cover images you
            upload).
          </li>
        </ul>
        <p>
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
        <p>
          We use a small number of first-party cookies and browser storage entries to keep your cart
          working, remember your selected display currency, and track partner referral attribution.
          We use{' '}
          <a href="https://plausible.io" target="_blank" rel="noreferrer">
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
        <p>
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
        <p>The Nigeria Data Protection Regulation gives you the right to:</p>
        <ul>
          <li>Ask what we hold about you.</li>
          <li>Correct anything that is wrong.</li>
          <li>Delete your account and the personal data attached to it.</li>
          <li>Withdraw consent for the newsletter or any other optional use.</li>
        </ul>
        <p>
          Email <a href="mailto:hi@mensaproducts.com">hi@mensaproducts.com</a> to make any of these
          requests. We will reply within 30 days.
        </p>
      </>
    ),
  },
  {
    heading: 'Children',
    body: (
      <p>
        Our products are for menstruators of any age. If you are under 18, please ask a parent or
        guardian to place orders on your behalf. We do not knowingly create accounts for users under
        13.
      </p>
    ),
  },
  {
    heading: 'Changes to this policy',
    body: (
      <p>
        We will update this page when our practices change. The "last updated" date at the top
        always reflects the current version. Material changes that affect existing customers will
        also be sent to subscribed email addresses.
      </p>
    ),
  },
  {
    heading: 'Contact',
    body: (
      <p>
        Questions about how we handle your data? Reach us at{' '}
        <a href="mailto:hi@mensaproducts.com">hi@mensaproducts.com</a> and we will get back to you.
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
