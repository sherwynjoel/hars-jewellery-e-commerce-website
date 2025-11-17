import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const timelineItems = [
  {
    title: 'Order Acceptance',
    description:
      'Orders are confirmed immediately after successful payment. You will receive an order confirmation email/SMS within a few minutes.'
  },
  {
    title: 'Order Processing Window',
    description:
      'Every order enters production or dispatch planning within 24 hours. Requests to modify or cancel an order must be raised within this timeline.'
  },
  {
    title: 'Dispatch Timeline',
    description:
      'Ready-to-ship products are dispatched within 1-2 business days. Made-to-order designs may require up to 7 business days. You will be notified if additional time is needed.'
  }
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-gray-800">
        <p className="text-sm text-gray-500 mb-2">Last updated: 17 November 2025</p>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6">Terms &amp; Conditions</h1>
        <p className="mb-6 text-gray-600 leading-relaxed">
          These Terms &amp; Conditions govern your relationship with Hars Jewellery. By accessing our website or
          purchasing from us, you agree to the terms outlined below. Please review them carefully.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Order Timelines</h2>
          <div className="space-y-4">
            {timelineItems.map((item) => (
              <div key={item.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Pricing &amp; Payments</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              All prices are listed in INR and may change without prior notice. Payments are processed securely through
              Razorpay. Orders are accepted only after successful payment authorization.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Information</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              We take great care to display accurate product images, specifications, and weights. Minor variations may
              occur due to screen settings, handcrafted finishes, or metal purity tolerances. These differences do not
              qualify as product defects.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Use of Website</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
              <li>Do not misuse the website for unlawful, fraudulent, or harmful activities.</li>
              <li>Content and designs on the website remain the intellectual property of Hars Jewellery.</li>
              <li>
                We reserve the right to refuse service, cancel orders, or block accounts that violate these terms.
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Service Interruptions</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              We may temporarily pause order processing for maintenance, festival rush, or safety checks. In such cases
              we update the &quot;Services Stopped&quot; banner on the website and notify impacted customers within 12
              hours.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Liability</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Hars Jewellery is not liable for delays beyond our control (courier disruptions, governmental actions, or
              natural calamities). Our maximum liability is limited to the value of the product purchased.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Us</h2>
          <p className="text-gray-600 text-sm">
            For questions about these Terms &amp; Conditions, reach us at{' '}
            <a href="mailto:harsjewellery2005@gmail.com" className="text-gray-900 underline">
              harsjewellery2005@gmail.com
            </a>{' '}
            or +91&nbsp;98765&nbsp;43210.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}

