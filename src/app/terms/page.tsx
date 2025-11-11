import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: November 11, 2025</p>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using MISHTEH ("the Platform"), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services. MISHTEH is a platform that 
                connects donors with individuals in need of financial assistance.
              </p>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. User Accounts</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-gray-800">2.1 Account Creation</h3>
                <p className="text-gray-700 leading-relaxed">
                  To use certain features, you must create an account. You agree to provide accurate, current, 
                  and complete information during registration and to update such information as needed.
                </p>

                <h3 className="text-xl font-medium text-gray-800">2.2 Account Security</h3>
                <p className="text-gray-700 leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials and for 
                  all activities that occur under your account. Notify us immediately of any unauthorized use.
                </p>

                <h3 className="text-xl font-medium text-gray-800">2.3 Account Types</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li><strong>Donors:</strong> Users who contribute funds to help others</li>
                  <li><strong>Requesters:</strong> Users seeking financial assistance</li>
                  <li><strong>Administrators:</strong> Platform staff managing verification and moderation</li>
                </ul>
              </div>
            </section>

            {/* For Donors */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Donor Terms</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-gray-800">3.1 Donations</h3>
                <p className="text-gray-700 leading-relaxed">
                  All donations made through MISHTEH are voluntary. Once processed, donations are generally 
                  non-refundable except in cases of fraudulent activity or technical errors.
                </p>

                <h3 className="text-xl font-medium text-gray-800">3.2 Tax Deductibility</h3>
                <p className="text-gray-700 leading-relaxed">
                  MISHTEH facilitates peer-to-peer giving. Donations may not be tax-deductible. Consult with 
                  a tax professional regarding your specific situation.
                </p>

                <h3 className="text-xl font-medium text-gray-800">3.3 Due Diligence</h3>
                <p className="text-gray-700 leading-relaxed">
                  While we verify requests to the best of our ability, donors are encouraged to exercise their 
                  own judgment when choosing which requests to support.
                </p>
              </div>
            </section>

            {/* For Requesters */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Requester Terms</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-gray-800">4.1 Request Accuracy</h3>
                <p className="text-gray-700 leading-relaxed">
                  All information provided in requests must be truthful and accurate. Misrepresentation or 
                  fraud will result in immediate account termination and potential legal action.
                </p>

                <h3 className="text-xl font-medium text-gray-800">4.2 Documentation</h3>
                <p className="text-gray-700 leading-relaxed">
                  Requesters may be required to provide supporting documentation to verify their need. This 
                  may include bills, medical records, proof of income, or other relevant documents.
                </p>

                <h3 className="text-xl font-medium text-gray-800">4.3 Fund Usage</h3>
                <p className="text-gray-700 leading-relaxed">
                  Funds received should be used for the stated purpose in the request. Misuse of funds may 
                  result in account suspension and reporting to authorities.
                </p>

                <h3 className="text-xl font-medium text-gray-800">4.4 Platform Fees</h3>
                <p className="text-gray-700 leading-relaxed">
                  MISHTEH may deduct a small platform fee (currently 0%) from donations to cover operational 
                  costs. Any fees will be clearly disclosed before creating a request.
                </p>
              </div>
            </section>

            {/* Prohibited Activities */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Prohibited Activities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">Users must not:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide false, misleading, or fraudulent information</li>
                <li>Impersonate another person or entity</li>
                <li>Use the platform for illegal activities</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Attempt to gain unauthorized access to the platform</li>
                <li>Create duplicate accounts to circumvent restrictions</li>
                <li>Use automated tools to scrape or collect data</li>
                <li>Share or sell account credentials</li>
              </ul>
            </section>

            {/* Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Privacy and Data</h2>
              <p className="text-gray-700 leading-relaxed">
                Your use of MISHTEH is also governed by our Privacy Policy. We collect and use personal 
                information as described in that policy. By using the platform, you consent to such 
                collection and use.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                <strong>Data Security:</strong> We implement reasonable security measures to protect your 
                data, but cannot guarantee absolute security. Users are responsible for safeguarding their 
                own account information.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                All content on MISHTEH, including text, graphics, logos, and software, is owned by or 
                licensed to us and is protected by intellectual property laws. Users retain ownership of 
                content they upload but grant us a license to use, display, and distribute it as needed 
                to operate the platform.
              </p>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimers</h2>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  <strong>THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.</strong> We do not 
                  guarantee the accuracy, completeness, or reliability of any content. We are not responsible 
                  for the actions of users or the outcome of any requests or donations.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, MISHTEH and its operators shall not be liable for 
                any indirect, incidental, special, consequential, or punitive damages arising from your use 
                of the platform, including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
                <li>Loss of funds due to fraudulent requests</li>
                <li>Technical errors or system failures</li>
                <li>Unauthorized access to accounts</li>
                <li>Disputes between users</li>
                <li>Changes or interruptions to the service</li>
              </ul>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Modifications to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective 
                immediately upon posting. Continued use of the platform after changes constitutes acceptance 
                of the modified terms.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Account Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate these terms or engage in 
                fraudulent activity. Users may also close their accounts at any time by contacting support.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed">
                Any disputes arising from these terms shall be resolved through binding arbitration in 
                accordance with the rules of the American Arbitration Association. You waive the right 
                to participate in class action lawsuits.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of 
                the State of California, without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  Email: <a href="mailto:legal@mishteh.com" className="text-primary-600 hover:underline">legal@mishteh.com</a><br />
                  Mail: MISHTEH Legal Department, 123 Charity Lane, San Francisco, CA 94102
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              By using MISHTEH, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
            <div className="mt-6 flex justify-center space-x-6">
              <Link href="/" className="text-primary-600 hover:underline">
                Return Home
              </Link>
              <Link href="/contact" className="text-primary-600 hover:underline">
                Contact Us
              </Link>
              <Link href="/about" className="text-primary-600 hover:underline">
                About Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
