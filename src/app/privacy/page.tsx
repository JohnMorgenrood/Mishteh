import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-8 shadow-soft md:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">
              Privacy Policy
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
              POPIA and Privacy Commitment
            </h1>
            <p className="mt-4 text-base leading-7 text-gray-600">
              Mishteh processes personal information in line with the Protection of Personal Information Act, 2013
              (POPIA), and only for the purposes needed to run the platform safely and responsibly.
            </p>
          </div>

          <div className="space-y-8 text-sm leading-7 text-gray-700 md:text-base">
            <section>
              <h2 className="text-xl font-semibold text-gray-900">What We Collect</h2>
              <p className="mt-2">
                We may collect account details, contact information, profile details, payment-related records,
                identity-verification documents, device and login information, and messages or comments you submit on the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">Why We Collect It</h2>
              <p className="mt-2">
                We use personal information to verify users, process donations, prevent fraud, respond to support requests,
                improve platform safety, and meet legal and operational obligations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">Donor Privacy</h2>
              <p className="mt-2">
                Donor identities are private by default. Public supporter lists will show <strong>Private Donor</strong> unless
                the donor turns on name visibility in dashboard settings and also chooses not to keep a specific donation private.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">Sharing and Security</h2>
              <p className="mt-2">
                We limit access to personal information to people and services that need it to operate the platform.
                We use reasonable technical and organisational safeguards, but no online service can guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">Your Rights Under POPIA</h2>
              <p className="mt-2">
                Subject to applicable law, you may ask to access, correct, delete, or object to certain processing of your
                personal information. You may also ask how your information is being used or withdraw consent where consent is the legal basis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
              <p className="mt-2">
                If you have a privacy question or POPIA request, please contact us through the{' '}
                <Link href="/contact" className="font-medium text-primary-600 hover:text-primary-700">
                  contact page
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
