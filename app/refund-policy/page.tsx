import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const refundSteps = [
  {
    title: 'Cancellation Window',
    detail: 'Orders can be cancelled within 12 hours of placement. After dispatch, cancellation is no longer possible.'
  },
  {
    title: 'Inspection Timeline',
    detail:
      'Once we receive your return package, we inspect the jewellery within 48 hours to verify condition and accessories.'
  },
  {
    title: 'Refund Initiation',
    detail:
      'Approved refunds are initiated within 2 business days after quality check. Bank reflection may take 5-7 working days depending on your issuer.'
  }
]

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-gray-800">
        <p className="text-sm text-gray-500 mb-2">Last updated: 17 November 2025</p>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="mb-6 text-gray-600 leading-relaxed">
          We make every effort to deliver perfect jewellery. If you need to cancel or return an order, the following
          policy applies.
        </p>

        <section className="mb-8 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Eligibility</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
              <li>Only unused, unworn items with original packaging and certificates are eligible for return.</li>
              <li>Customized or engraved items are non-refundable unless damaged on arrival.</li>
              <li>Return requests must be raised within 2 days of delivery by emailing our support team.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Timelines</h2>
            <div className="space-y-4">
              {refundSteps.map((step) => (
                <div key={step.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Pickup &amp; Shipping</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We arrange reverse pickup in most metro cities. In remote areas you may be asked to ship the parcel via
              insured courier. Please share tracking details once dispatched.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Modes of Refund</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Refunds are issued to the original payment method. Cash-on-delivery orders are refunded via bank transfer
              after you share account details. Wallet or gift card refunds can be requested if you prefer future
              purchases with us.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Need Help?</h2>
          <p className="text-gray-600 text-sm">
            Write to{' '}
            <a href="mailto:harsjewellery2005@gmail.com" className="text-gray-900 underline">
              harsjewellery2005@gmail.com
            </a>{' '}
            or call +91&nbsp;98765&nbsp;43210. Return/Refund queries are answered within 24 hours on business days.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}

