import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-gray-800">
        <p className="text-sm text-gray-500 mb-2">Last updated: 17 November 2025</p>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="mb-6 text-gray-600 leading-relaxed">
          Hars Jewellery is committed to safeguarding the data you share with us. This Privacy Policy explains the type
          of information we collect, how we store and use it, and the choices available to you.
        </p>

        <section className="space-y-5 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Data We Collect</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
              <li>Account data: name, email, phone number, and encrypted password.</li>
              <li>Order data: billing/delivery addresses, product selections, payment status.</li>
              <li>Device data: IP address, browser user-agent, and interaction logs for security.</li>
              <li>Subscriber data: 10-digit phone numbers submitted for offers/alerts.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">How We Use Your Data</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Data is used to process orders, provide customer support, detect fraud, personalize recommendations, and
              send transactional as well as promotional updates (only if you opt in). We never sell customer data.
            </p>
          </div>
        </section>

        <section className="space-y-5 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Storage &amp; Retention Timeline</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
              <li>Order and invoice records are retained for 8 years to meet statutory requirements.</li>
              <li>Inactive user accounts are reviewed every 24 months and anonymized if unused.</li>
              <li>Subscriber phone numbers can be deleted within 5 business days of request.</li>
              <li>Error logs are retained for up to 30 days to investigate performance issues.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Third-Party Services</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We rely on secure partners such as Razorpay for payments, Msg91 for OTP delivery, and trusted courier
              partners for shipping. These partners receive only the information required to complete their services.
            </p>
          </div>
        </section>

        <section className="space-y-5 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Rights</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
              <li>Request a copy of the personal data we hold.</li>
              <li>Request correction or deletion of inaccurate information.</li>
              <li>Opt out of marketing SMS/WhatsApp by replying STOP or contacting our support.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Security</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Access to your data is strictly limited to trained staff. We use industry-standard encryption, role-based
              access control, and audit trails to keep your information safe.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Us</h2>
          <p className="text-gray-600 text-sm">
            If you have privacy-related questions, please email{' '}
            <a href="mailto:harsjewellery2005@gmail.com" className="text-gray-900 underline">
              harsjewellery2005@gmail.com
            </a>{' '}
            or call +91&nbsp;98765&nbsp;43210. We respond to such requests within 3 business days.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}

