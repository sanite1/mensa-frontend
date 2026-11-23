// /returns: delivery and returns in the design system's InfoPage layout.
// No returns on hygiene items; wrong, damaged or wrong size items reported
// within three days of delivery are made right.

import { Link } from 'react-router-dom'
import { HelpCard, InfoPage } from '@/components/design/InfoPage'
import { useSeo } from '@/lib/seo'

export function ReturnsPage() {
  useSeo({
    title: 'Delivery and returns',
    description:
      'For hygiene reasons we do not accept returns or exchanges on period products. Wrong, damaged, or wrong size items reported within three days of delivery, we make right.',
  })
  return (
    <InfoPage
      eyebrow="Help"
      title="Delivery and"
      accent="returns."
      lede="Everything ships from our studio in Abuja. Here's how delivery works, and exactly what happens if something isn't right."
      aside={<HelpCard />}
    >
      <h2 id="delivery">Delivery</h2>
      <p>
        We deliver across Nigeria from our studio in Abuja. At checkout you pick a delivery option
        for your state, and you see its fee and the expected delivery time before you pay.
      </p>
      <p>
        Times count from when your payment is confirmed. When your order leaves the studio we email
        you, and you can follow it on the <Link to="/orders/track">order tracking page</Link> with
        your order number and email.
      </p>

      <h2 id="returns">Returns</h2>
      <div className="callout">
        <p>
          For hygiene and safety reasons we don't accept returns or exchanges on period products,
          including our reusable period pants. <strong>All sales are final.</strong> But if anything
          arrives <strong>wrong, damaged or in the wrong size</strong>, tell us within{' '}
          <strong>three days of delivery</strong> and we'll make it right.
        </p>
      </div>
      <p>That covers three cases:</p>
      <ul>
        <li>
          <strong>Wrong item:</strong> we sent the pads instead of the pants, or the wrong colour
          landed in your bag.
        </li>
        <li>
          <strong>Wrong size:</strong> the size on the label does not match what you ordered.
        </li>
        <li>
          <strong>Damaged in transit:</strong> visible tears, stains, or packaging failure that
          affected the product.
        </li>
      </ul>
      <p>
        The three days start on the day your courier marks the order as delivered, or the day our
        rider hands it to you. We treat it generously, so reach out even if you are a day late.
      </p>

      <h3>How to report a problem</h3>
      <ol>
        <li>
          Email <a href="mailto:hi@mensaproducts.com">hi@mensaproducts.com</a> or use the{' '}
          <Link to="/contact?topic=order">contact form</Link> within three days of delivery.
        </li>
        <li>
          Include your order number. It looks like MS-2026-00001 and is in your confirmation email.
        </li>
        <li>
          Attach a clear photo of the item showing the issue, with a short note on what is wrong.
        </li>
      </ol>
      <p>We review every case ourselves and offer a replacement where appropriate.</p>
      <p>
        Not sure what to buy before you order? The <Link to="/size-guide">size guide</Link> and the{' '}
        <Link to="/find-my-starter-set">starter set finder</Link> each take a minute.
      </p>

      <h2 id="payment">Payment</h2>
      <p>
        Payments are processed securely by Paystack. You can pay by card, bank transfer or USSD, and
        we never see or store your card details.
      </p>
    </InfoPage>
  )
}
