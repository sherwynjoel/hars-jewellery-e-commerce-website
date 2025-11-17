import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const deliveryMatrix = [
  { region: 'Metro Cities', timeline: '3-4 business days after dispatch' },
  { region: 'Tier-2 & Tier-3 Cities', timeline: '4-6 business days after dispatch' },
  { region: 'Remote / North-East / J&K', timeline: '6-9 business days after dispatch' }
]

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-gray-800">
        <p className="text-sm text-gray-500 mb-2">Last updated: 17 November 2025</p>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6">Shipping Policy</h1>
        <p className="mb-6 text-gray-600 leading-relaxed">
          We ship across India with insured logistics partners. This policy explains our processing window, delivery
          timelines, and how to track your parcel.
        </p>

        <section className="mb-8 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Time</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Ready inventory is packed within 24 hours and handed over to the courier within 1-2 business days.
              Personalized / made-to-order designs may require up to 7 business days before dispatch. We keep you posted
              if any additional time is required.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Delivery Timelines</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y">
              {deliveryMatrix.map((row) => (
                <div key={row.region} className="flex items-center justify-between p-4 text-sm">
                  <span className="font-semibold text-gray-900">{row.region}</span>
                  <span className="text-gray-600">{row.timeline}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-8 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Shipping Charges</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
              <li>Orders above ₹5,000 ship free. Below this value, a nominal ₹149 shipping fee applies.</li>
              <li>Cash-on-delivery (if enabled) attracts an additional ₹75 handling charge.</li>
              <li>International shipping is currently not available directly from the website. Contact us for bespoke arrangements.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Tracking &amp; Communication</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Tracking details are shared via SMS/email immediately after dispatch. In case the courier experiences a
              delay, we proactively follow up and update you every 24 hours until the parcel is delivered.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Delivery Attempts &amp; Re-Delivery</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Couriers make up to 3 delivery attempts. If the parcel returns to us due to non-availability, we contact
              you to arrange re-shipment. Re-delivery charges (if any) are communicated in advance.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Support</h2>
          <p className="text-gray-600 text-sm">
            For shipping questions email{' '}
            <a href="mailto:harsjewellery2005@gmail.com" className="text-gray-900 underline">
              harsjewellery2005@gmail.com
            </a>{' '}
            or call +91&nbsp;98765&nbsp;43210. We respond within one business day.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}

