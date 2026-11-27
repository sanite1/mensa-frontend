// /returns in the design system's InfoPage layout. The returns copy is word
// for word from the old returns page; the delivery and payment sections are
// new to this layout.

import { Link } from 'react-router-dom'
import { HelpCard, InfoPage } from '@/components/design/InfoPage'
import { useSeo } from '@/lib/seo'

export function ReturnsPage() {
  useSeo({
    title: 'Returns policy',
    description:
      'For hygiene reasons we do not accept returns or exchanges on period products. Wrong, damaged, or wrong-size items reported within three days of delivery, we make right.',
  })
  return (
    <InfoPage
      eyebrow="Returns and exchanges · All sales final"
      title="The honest"
      accent="returns policy."
      lede="Period products are personal and intimate, so the rules are different from most online shopping. Here is exactly how Mensa handles returns, exchanges, and the rare time something arrives not quite right."
      aside={<HelpCard />}
    >
      <h2 id="rule">No returns or exchanges on period products.</h2>
      <div className="callout">
        <p>
          For hygiene and safety reasons, we do not accept returns or exchanges on period products,
          including our reusable period pants. <strong>All sales are final.</strong>
        </p>
      </div>

      <h2 id="exception">If something is wrong, we fix it.</h2>
      <p>
        If you receive the wrong item, the wrong size, or your product arrives damaged, please
        contact us within <strong>three days of delivery</strong>. We will review your case and
        offer a replacement where appropriate.
      </p>
      <ul>
        <li>
          <strong>01 · Wrong item:</strong> We sent the pads instead of the pants, or the wrong
          colour landed in your bag.
        </li>
        <li>
          <strong>02 · Wrong size:</strong> The size on the label does not match what you ordered.
        </li>
        <li>
          <strong>03 · Damaged in transit:</strong> Visible tears, stains, or packaging failure that
          affected the product.
        </li>
      </ul>
      <p>
        Three-day window starts on the day your courier marks the order as delivered, or the day our
        in-house rider hands it to you. We treat it generously, so reach out even if you are a day
        late.
      </p>

      <h2 id="report">Three things, one email.</h2>
      <ol>
        <li>
          <strong>Email us:</strong> hi@mensaproducts.com. Drop us a note within three days of
          delivery.
        </li>
        <li>
          <strong>Include your order number:</strong> It looks like MS-2026-00001 and is in your
          confirmation email.
        </li>
        <li>
          <strong>Attach a clear photo:</strong> A single photo of the item showing the issue, plus
          a short note on what is wrong, is usually enough.
        </li>
      </ol>
      <p>
        <Link className="btn text-(--fg) no-underline" to="/contact?topic=order">
          Report an issue
        </Link>{' '}
        <a className="btn btn--ghost text-(--fg) no-underline" href="mailto:hi@mensaproducts.com">
          Email directly
        </a>
      </p>

      <h2 id="delivery">Delivery</h2>
      <p>
        We deliver across Nigeria from our studio in Abuja. At checkout you pick a delivery option
        for your state, and you see its fee and the expected delivery time before you pay. When your
        order leaves the studio we email you, and you can follow it on the{' '}
        <Link to="/orders/track">order tracking page</Link>.
      </p>

      <h2 id="payment">Payment</h2>
      <p>
        Payments are processed securely by Paystack. You can pay by card, bank transfer or USSD, and
        we never see or store your card details.
      </p>

      <h2 id="promise">Mensa products are made to last.</h2>
      <p>If something is not right, we will make it right.</p>
      <p>
        <Link className="btn text-(--fg) no-underline" to="/contact?topic=order">
          Contact our team
        </Link>{' '}
        <Link className="btn btn--ghost text-(--fg) no-underline" to="/shop">
          Back to shop
        </Link>
      </p>
    </InfoPage>
  )
}
