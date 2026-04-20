'use client'

import React from 'react'
import HeaderPage from '@/components/common/HeaderPage'
import FooterPage from '@/components/common/FooterPage'
import { FileText } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfaf6]">
      <HeaderPage />

      <main className="flex-1 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl font-black tracking-tight text-primary mb-4">
              Privacy <span className="text-secondary">Policy</span>
            </h1>
            <p className="text-slate-500 text-lg">Last updated: April 17, 2026</p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            <section className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-white shadow-sm text-slate-700 leading-relaxed space-y-6">
              <div className="space-y-2 text-sm text-slate-500 mb-8 border-b border-slate-100 pb-4">
                <p><strong>Effective Date:</strong> April 17, 2026</p>
                <p><strong>Last Updated:</strong> April 17, 2026</p>
              </div>

              <p>
                12Gaam.com, doing business as 12Gaam.com (“12Gaam,” “we,” “us,” or “our”), operates a private community member directory and related services (collectively, the “Platform”). This Privacy Policy explains how we collect, use, disclose, retain, and protect personal information in connection with the Platform.
              </p>
              <p>
                By accessing or using the Platform, creating an account, submitting information, or otherwise interacting with us, you acknowledge this Privacy Policy.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">1. Scope of This Privacy Policy</h2>
              <p>This Privacy Policy applies to personal information collected through:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>our website and member directory;</li>
                <li>account registration and profile management;</li>
                <li>member communications and support;</li>
                <li>community administration and security operations; and</li>
                <li>other online or offline interactions that reference this Privacy Policy.</li>
              </ul>
              <p>
                The Platform is a private member directory and is not intended for public access. Access is limited to approved users and authorized administrators.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">2. Who We Are</h2>
              <ul className="space-y-2">
                <li><strong>Operator:</strong> 12Gaam.com</li>
                <li><strong>Email:</strong> <a href='mailto:12gaamsamaj@gmail.com'>12gaamsamaj@gmail.com</a></li>
              </ul>

              <h2 className="text-xl font-bold text-primary pt-4">3. Personal Information We Collect</h2>
              <p>
                We may collect personal information that you provide directly to us, that we collect automatically when you use the Platform, and that we receive from authorized administrators or committee members in connection with community operations.
              </p>
              
              <h3 className="text-lg font-bold text-primary/80 pt-2">A. Information You Provide to Us</h3>
              <p>Depending on how you use the Platform, we may collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>full name;</li>
                <li>email address;</li>
                <li>phone number;</li>
                <li>mailing address, city, state, country, or ZIP code;</li>
                <li>date of birth, age range, anniversary, or similar profile details;</li>
                <li>family relationship information;</li>
                <li>profile photo;</li>
                <li>profession, business, or organization details;</li>
                <li>social media links;</li>
                <li>community affiliation details;</li>
                <li>login credentials;</li>
                <li>communications you send to us; and</li>
                <li>any other information you choose to submit.</li>
              </ul>
              <p>
                Some profile fields may be optional. We encourage you to provide only information you are comfortable sharing within the private community environment.
              </p>

              <h3 className="text-lg font-bold text-primary/80 pt-2">B. Information About Other Individuals</h3>
              <p>
                If you submit personal information about family members or other individuals, you represent that you have the authority to provide that information and to permit us to process it for the purposes described in this Privacy Policy.
              </p>

              <h3 className="text-lg font-bold text-primary/80 pt-2">C. Information Collected Automatically</h3>
              <p>When you access or use the Platform, we may automatically collect certain technical and usage information, such as:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address;</li>
                <li>browser type and version;</li>
                <li>device type and operating system;</li>
                <li>referring URLs;</li>
                <li>login timestamps and session activity;</li>
                <li>pages viewed and features used;</li>
                <li>approximate geolocation derived from IP address; and</li>
                <li>security, audit, and diagnostic logs.</li>
              </ul>

              <h3 className="text-lg font-bold text-primary/80 pt-2">D. Cookies and Similar Technologies</h3>
              <p>We may use cookies, local storage, and similar technologies for purposes such as:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>authenticating users;</li>
                <li>maintaining session state;</li>
                <li>remembering preferences;</li>
                <li>measuring usage and performance;</li>
                <li>improving functionality; and</li>
                <li>protecting the Platform against fraud, abuse, and unauthorized access.</li>
              </ul>
              <p>
                You may be able to manage cookies through your browser settings, but doing so may affect Platform functionality.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">4. How We Use Personal Information</h2>
              <p>We may use personal information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>review, verify, and approve membership applications;</li>
                <li>create, maintain, and display member profiles within the private directory;</li>
                <li>enable approved members to connect with one another;</li>
                <li>provide account management, authentication, and customer support;</li>
                <li>send administrative, service, security, and transactional communications;</li>
                <li>maintain directory accuracy and allow profile updates;</li>
                <li>protect against fraud, abuse, scraping, harassment, and unauthorized access;</li>
                <li>monitor, troubleshoot, improve, and secure the Platform;</li>
                <li>comply with legal obligations and enforce our terms, policies, and community rules; and</li>
                <li>carry out other purposes disclosed at the time of collection or otherwise permitted by law.</li>
              </ul>

              <h2 className="text-xl font-bold text-primary pt-4">5. How Directory Information Is Visible</h2>
              <p>
                The Platform is intended to function as a private community directory. Personal information included in member profiles may be visible to approved members, authorized administrators, and designated committee or management personnel with a legitimate need to access the information.
              </p>
              <p>
                Not all profile fields must necessarily be visible to all users. We may offer privacy settings or field-level visibility controls where technically feasible.
              </p>
              <p>
                Because this is a member directory, information that you choose to include in your profile may be viewed by other approved members. For that reason, you should avoid posting information you do not wish to be accessible within the private member community.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">6. How We Disclose Personal Information</h2>
              <h3 className="text-lg font-bold text-primary/80 pt-2">A. Service Providers</h3>
              <p>
                We may disclose personal information to vendors and service providers that perform services on our behalf, such as web hosting, cloud storage, email delivery, authentication, security monitoring, customer support, analytics, and technical maintenance. These parties may process personal information only as needed to provide services to us and subject to appropriate contractual restrictions.
              </p>
              
              <h3 className="text-lg font-bold text-primary/80 pt-2">B. Authorized Administrators and Committee Personnel</h3>
              <p>
                We may disclose personal information to authorized administrators, moderators, or committee members who need access to operate the Platform, maintain directory integrity, assist members, investigate misuse, or support legitimate community functions.
              </p>

              <h3 className="text-lg font-bold text-primary/80 pt-2">C. Legal Compliance and Protection</h3>
              <p>
                We may disclose personal information when we believe in good faith that disclosure is necessary to comply with applicable law, regulation, court order, subpoena, or lawful request; enforce our agreements, policies, or rules; detect, investigate, or prevent fraud, harassment, abuse, or security incidents; or protect the rights, safety, property, or security of the Platform, our members, our organization, or others.
              </p>

              <h3 className="text-lg font-bold text-primary/80 pt-2">D. Organizational Transactions</h3>
              <p>
                We may disclose personal information in connection with a merger, restructuring, reorganization, transfer of operations, financing, or similar transaction involving the Platform, subject to applicable law.
              </p>

              <h3 className="text-lg font-bold text-primary/80 pt-2">E. With Consent or Direction</h3>
              <p>
                We may disclose personal information with your consent or at your direction.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">7. Sale, Rental, and Advertising Use of Personal Information</h2>
              <p>We do not sell or rent member personal information for money.</p>
              <p>
                We do not disclose member personal information to marketers or advertisers for their own independent marketing use unless we clearly tell you otherwise and obtain any consent required by law.
              </p>
              <p>
                We do not use the private directory as a public lead-generation database, and members may not use directory information for solicitation, bulk outreach, or unrelated commercial purposes.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">8. Member Communications and Marketing</h2>
              <p>
                We may send service and administrative communications, such as account notices, security alerts, password reset messages, profile reminders, and important policy updates, as well as community or promotional communications where permitted by law.
              </p>
              <p>
                You may opt out of non-essential marketing emails by using the unsubscribe link or contacting us. Even if you opt out of marketing messages, we may still send you service-related or legally required communications.
              </p>
              <p>
                If we offer marketing text messages, we will seek any consent required by applicable law and provide an opt-out method, such as replying STOP.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">9. Data Retention</h2>
              <p>
                We retain personal information for as long as reasonably necessary to provide and operate the Platform; maintain member records and profile history; support legitimate community administration; resolve disputes and investigate incidents; enforce our terms and policies; comply with legal, tax, accounting, reporting, or regulatory obligations; and protect the security and integrity of the Platform.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">10. Secure Disposal of Personal Information</h2>
              <p>
                When personal information is no longer reasonably needed, we will take reasonable steps to securely delete, erase, anonymize, or dispose of it in a manner designed to prevent unauthorized access, use, or reconstruction, consistent with applicable law and our record-retention practices.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">11. Data Security</h2>
              <p>
                We use reasonable administrative, technical, and physical safeguards designed to protect personal information from unauthorized access, acquisition, destruction, use, modification, or disclosure. These measures may include access controls and role-based permissions, password protections and account authentication, encryption in transit and other appropriate security technologies, logging and monitoring, restrictions on administrative access, and ongoing maintenance and updates.
              </p>
              <p>
                No system can guarantee absolute security. You are responsible for maintaining the confidentiality of your login credentials and notifying us promptly if you suspect unauthorized account activity.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">12. Security Incidents and Breach Response</h2>
              <p>
                If we become aware of unauthorized access to personal information, we may investigate the incident, take steps to contain and remediate it, and provide notices to affected individuals, regulators, law enforcement, or others as required by applicable law.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">13. Your Choices and Requests</h2>
              <p>
                Subject to applicable law, you may request to access or review certain personal information associated with your account, update or correct inaccurate profile information, request deletion of your account or profile information, adjust available profile visibility settings, opt out of marketing emails, and withdraw consent where processing is based on consent.
              </p>
              <p>
                We may need to verify your identity before acting on certain requests. We may also deny or limit requests where permitted by law, such as where retention is necessary for security, legal compliance, fraud prevention, or internal recordkeeping.
              </p>
              <p>
                To submit a request, contact us at <a href='mailto:12gaamsamaj@gmail.com'>12gaamsamaj@gmail.com</a>.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">14. Children’s Privacy</h2>
              <p>
                The Platform is not directed to children under 13, and we do not knowingly collect personal information directly from children under 13 without legally required consent. If you believe a child under 13 has provided personal information to us without appropriate authorization, please contact us so we can review and take appropriate action.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">15. State-Specific Privacy Rights</h2>
              <p>
                Residents of certain U.S. states may have additional privacy rights under applicable law. We will honor rights requests to the extent required by the laws that apply to us and to the particular request.
              </p>
              
              <h3 className="text-lg font-bold text-primary/80 pt-2">California Privacy Notice</h3>
              <p>
                If California privacy law applies to our processing of your personal information, California residents may have the right, subject to exceptions and verification, to know what personal information we collect, use, disclose, and retain; request deletion of personal information; request correction of inaccurate personal information; opt out of the sale or sharing of personal information, if applicable; limit the use and disclosure of sensitive personal information, if applicable; and receive equal service and price even if they exercise privacy rights, subject to lawful exceptions.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">16. Do Not Track</h2>
              <p>
                Some web browsers offer a “Do Not Track” setting. Because there is not yet a universally accepted standard for responding to these signals in all contexts, the Platform may not respond to Do Not Track signals except as otherwise required by applicable law.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">17. Third-Party Links and Services</h2>
              <p>
                The Platform may contain links to third-party websites, platforms, or services. We are not responsible for the privacy, security, or content practices of those third parties. We encourage you to review their privacy policies before providing information to them.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">18. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. When we do, we will revise the “Last Updated” date above and, where required by law, provide additional notice. Your continued use of the Platform after an updated Privacy Policy becomes effective means you acknowledge the updated policy.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">19. Contact Us</h2>
              <p>
                Effective Date: April 17, 2026<br />
                Entity Name: 12Gaam.com<br />
                Email: <a href='mailto:12gaamsamaj@gmail.com'>12gaamsamaj@gmail.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <FooterPage />
    </div>
  )
}
