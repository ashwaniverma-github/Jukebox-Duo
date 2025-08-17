export const metadata = {
  title: "Terms of Service | Jukebox Duo",
  description: "Read the Terms of Service for Jukebox Duo, including your rights, responsibilities, and our policies.",
};

import Footer from "../../components/Footer";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-gray-900/40 to-black" />
        <div className="absolute top-20 left-20 w-32 h-32 bg-red-700/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-800/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10">
        <main className="mx-auto max-w-4xl px-6 pt-20 pb-24">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Terms of Service
          </h1>
          <p className="mt-4 text-gray-300">Effective date: {new Date().getFullYear()}</p>
          <p className="mt-2">
            <Link href="/" className="text-red-400 hover:text-red-300 underline underline-offset-4">Return to Homepage</Link>
          </p>

          <div className="mt-10 space-y-10">
            <section>
              <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
              <p className="mt-3 text-gray-300">
                By accessing or using Jukebox Duo (the "Service"), you agree to be bound by these Terms of
                Service (the "Terms"). If you do not agree to the Terms, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">2. Eligibility</h2>
              <p className="mt-3 text-gray-300">
                You must be at least 13 years old to use the Service. If you are under the age of majority in your
                jurisdiction, you may only use the Service with the consent of a parent or legal guardian.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">3. Accounts</h2>
              <p className="mt-3 text-gray-300">
                You are responsible for maintaining the confidentiality of your account credentials and for all
                activities that occur under your account. Notify us immediately of any unauthorized use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">4. Subscriptions and Payments</h2>
              <p className="mt-3 text-gray-300">
                Certain features may require a paid subscription. Fees, billing cycles, and refund policies will be
                presented at the point of purchase. Unless otherwise stated, subscriptions renew automatically until
                cancelled. You can cancel at any time in your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">5. Acceptable Use</h2>
              <ul className="mt-3 text-gray-300 list-disc list-inside space-y-2">
                <li>Do not use the Service for unlawful, infringing, or harmful activities.</li>
                <li>Do not attempt to access accounts or data without authorization.</li>
                <li>Do not interfere with or disrupt the integrity or performance of the Service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">6. Your Content and Licenses</h2>
              <p className="mt-3 text-gray-300">
                You retain ownership of content you submit. By submitting content, you grant us a worldwide,
                non-exclusive, royalty-free license to host, store, reproduce, and display that content solely to
                operate and improve the Service. You represent you have all rights necessary to grant this license.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">7. Intellectual Property</h2>
              <p className="mt-3 text-gray-300">
                The Service, including its design, text, graphics, and software, is owned by Jukebox Duo or its
                licensors and is protected by intellectual property laws. Except as expressly permitted, you may not
                copy, modify, distribute, sell, or lease any part of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">8. Third-Party Services</h2>
              <p className="mt-3 text-gray-300">
                The Service may link to or integrate with third-party services. We are not responsible for the
                content or practices of those services. Your use of third-party services is governed by their terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">9. Termination</h2>
              <p className="mt-3 text-gray-300">
                We may suspend or terminate your access to the Service at any time, with or without notice, for
                conduct that we believe violates these Terms or is otherwise harmful to the Service or other users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">10. Disclaimers</h2>
              <p className="mt-3 text-gray-300">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
                IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">11. Limitation of Liability</h2>
              <p className="mt-3 text-gray-300">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, JUKEBOX DUO AND ITS AFFILIATES WILL NOT BE LIABLE FOR ANY
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES,
                WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">12. Indemnification</h2>
              <p className="mt-3 text-gray-300">
                You agree to indemnify and hold harmless Jukebox Duo and its affiliates from any claims, liabilities,
                damages, losses, and expenses, including reasonable attorneys' fees, arising from your use of the
                Service or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">13. Changes to These Terms</h2>
              <p className="mt-3 text-gray-300">
                We may update these Terms from time to time. If we make material changes, we will provide notice by
                posting the updated Terms on this page with a new effective date. Your continued use of the Service
                after changes become effective constitutes your acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">14. Contact Us</h2>
              <p className="mt-3 text-gray-300">
                Questions about these Terms? Contact us at <span className="font-medium">ap8606574@gmail.com</span>.
              </p>
            </section>

            <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </main>
        
      </div>
    </div>
  );
}


