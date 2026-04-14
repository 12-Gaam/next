'use client'

import React from 'react'
import HeaderPage from '@/components/common/HeaderPage'
import FooterPage from '@/components/common/FooterPage'
import { FileText, ShieldCheck, Scale, AlertCircle } from 'lucide-react'

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfaf6]">
      <HeaderPage />

      <main className="flex-1 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl font-black tracking-tight text-primary mb-4">
              Terms of <span className="text-secondary">Use</span>
            </h1>
            <p className="text-slate-500 text-lg">Last updated: April 14, 2026</p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            <section className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-white shadow-sm text-slate-700 leading-relaxed space-y-6">
              <div className="space-y-2 text-sm text-slate-500 mb-8 border-b border-slate-100 pb-4">
                <p><strong>Effective Date:</strong> April 14, 2026</p>
                <p><strong>Last Updated:</strong> April 14, 2026</p>
              </div>
              
              <p>
                These Terms of Use (“Terms”) govern your access to and use of 12Gaam.com and related services (collectively, the “Platform”), operated by [Legal Entity Name] (“12Gaam,” “we,” “us,” or “our”). By creating an account, accessing the Platform, or using any part of the Platform, you agree to be bound by these Terms. If you do not agree, do not use the Platform.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">1. Nature of the Platform</h2>
              <p>
                12Gaam.com is a private community member directory intended to help approved members connect in a respectful, secure, and community-focused environment. The Platform is not a public directory. Access is limited to approved users and authorized administrators.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">2. Eligibility</h2>
              <p>
                By using the Platform, you represent and warrant that you are at least 18 years old, or otherwise legally authorized to use the Platform; the information you provide is accurate and current; you are eligible for membership or have been authorized to participate in the community; and your use of the Platform will comply with these Terms and all applicable laws.
              </p>
              <p>
                We may deny, revoke, suspend, or limit access at our discretion, subject to applicable law.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">3. Account Registration and Approval</h2>
              <p>
                Access to the Platform may require registration and approval. We may review applications, request verification information, and approve or reject accounts in our discretion to maintain the safety, relevance, and integrity of the Platform.
              </p>
              <p>
                You are responsible for maintaining the confidentiality of your login credentials and for all activity occurring under your account. You must notify us promptly if you believe your account has been compromised or used without authorization.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">4. Member Profile Information</h2>
              <p>
                You are responsible for the accuracy of information you submit to the Platform. You may not knowingly submit false, misleading, infringing, or unlawful content. You may request correction, updating, or deletion of certain profile information, subject to our operational, legal, and security requirements.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">5. Permitted Use</h2>
              <p>
                You may use the Platform only for legitimate personal, family, social, religious, cultural, or community-related purposes consistent with the purpose of the directory.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">6. Prohibited Conduct</h2>
              <p>You agree that you will not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>copy, scrape, harvest, export, download, or compile member information into any external database, directory, spreadsheet, or contact list;</li>
                <li>use the Platform or member information for commercial solicitation, lead generation, advertising, sales outreach, or unrelated business promotion;</li>
                <li>send spam, bulk messages, chain messages, or unauthorized marketing communications;</li>
                <li>post, disclose, forward, publish, or share screenshots or member information outside the Platform without authorization;</li>
                <li>impersonate another person or misrepresent your identity or affiliation;</li>
                <li>use the Platform to harass, threaten, intimidate, discriminate against, stalk, or defame any individual;</li>
                <li>upload malware, attempt unauthorized access, interfere with Platform security, or bypass technical restrictions;</li>
                <li>use bots, scripts, crawlers, or automated tools to access or extract data from the Platform;</li>
                <li>violate any applicable law, regulation, or third-party right; or</li>
                <li>assist or encourage any other person to do any of the foregoing.</li>
              </ul>

              <h2 className="text-xl font-bold text-primary pt-4">7. Confidentiality of Member Information</h2>
              <p>
                Member information made available through the Platform is intended solely for use within the approved community context. You agree to treat member information as private and confidential and to use it only for legitimate community-related purposes.
              </p>
              <p>
                You may not disclose member information to third parties except with the consent of the affected individual or as otherwise expressly authorized by us or required by law.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">8. Communications</h2>
              <p>
                We may send you service-related communications regarding your account, platform operations, security events, policy changes, and other administrative matters. If we offer promotional or community marketing communications, you may opt out where required by law and as described in our Privacy Policy.
              </p>
              <p>
                Your use of the Platform does not authorize you to send unsolicited commercial emails or marketing text messages to other members.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">9. Privacy</h2>
              <p>
                Your use of the Platform is also subject to our Privacy Policy, which explains how we collect, use, disclose, retain, and protect personal information. If there is a conflict between these Terms and the Privacy Policy regarding privacy practices, the Privacy Policy will control with respect to privacy matters.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">10. Intellectual Property</h2>
              <p>
                The Platform, including its design, structure, text, graphics, logos, software, and other content made available by us, is owned by or licensed to us and is protected by applicable intellectual property and other laws.
              </p>
              <p>
                Except as expressly permitted in writing, you may not copy, reproduce, distribute, modify, create derivative works from, publicly display, or exploit any part of the Platform.
              </p>
              <p>
                You retain rights in content you submit to the extent provided by law, but you grant us a non-exclusive, worldwide, royalty-free license to host, store, use, reproduce, display, and process that content as reasonably necessary to operate, administer, secure, and improve the Platform.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">11. Monitoring and Enforcement</h2>
              <p>
                We reserve the right, but not the obligation, to monitor use of the Platform for security, administrative, legal, and compliance purposes. We may remove content, suspend access, restrict features, or terminate accounts if we believe a user has violated these Terms, created risk for members, interfered with the Platform, or engaged in unlawful or inappropriate conduct.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">12. Suspension and Termination</h2>
              <p>
                We may suspend, limit, or terminate your account or access to the Platform at any time, with or without notice, if you violate these Terms; your membership status changes; we suspect fraud, misuse, or unauthorized activity; continued access could harm the Platform, members, or community; or we discontinue or materially change the Platform.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">13. No Warranty</h2>
              <p className="uppercase">
                THE PLATFORM IS PROVIDED “AS IS” AND “AS AVAILABLE,” WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, EXCEPT TO THE EXTENT SUCH WARRANTIES CANNOT BE DISCLAIMED UNDER APPLICABLE LAW.
              </p>
              <p>
                To the maximum extent permitted by law, we disclaim all implied warranties, including warranties of merchantability, fitness for a particular purpose, title, non-infringement, accuracy, and quiet enjoyment.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">14. Limitation of Liability</h2>
              <p className="uppercase">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, [LEGAL ENTITY NAME], ITS OFFICERS, DIRECTORS, ADMINISTRATORS, AFFILIATES, CONTRACTORS, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR BUSINESS OPPORTUNITY, ARISING OUT OF OR RELATED TO THE PLATFORM OR THESE TERMS.
              </p>
              <p className="uppercase">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE PLATFORM OR THESE TERMS SHALL NOT EXCEED THE GREATER OF: (A) THE AMOUNT YOU PAID US, IF ANY, IN THE TWELVE MONTHS PRECEDING THE CLAIM; OR (B) US$100.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">15. Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless [Legal Entity Name], its officers, directors, administrators, affiliates, contractors, and agents from and against any claims, liabilities, damages, judgments, losses, costs, and expenses, including reasonable attorneys’ fees, arising out of or related to your use or misuse of the Platform, your violation of these Terms, your violation of any law or third-party right, or content or information you submit or disclose through the Platform.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">16. Governing Law and Venue</h2>
              <p>
                These Terms are governed by the laws of the State of North Carolina, without regard to conflict-of-law principles, except to the extent superseded by applicable federal or state law.
              </p>
              <p>
                Unless applicable law requires otherwise, any dispute arising out of or relating to these Terms or the Platform shall be brought exclusively in the state or federal courts located in [County], North Carolina, and you consent to the personal jurisdiction of those courts.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">17. Changes to These Terms</h2>
              <p>
                We may modify these Terms from time to time. When we do, we will update the “Last Updated” date above and may provide additional notice where appropriate. Your continued use of the Platform after revised Terms become effective constitutes your acceptance of the updated Terms.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">18. Severability</h2>
              <p>
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect to the maximum extent permitted by law.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">19. Entire Agreement</h2>
              <p>
                These Terms, together with our Privacy Policy and any other policies or rules expressly incorporated by reference, constitute the entire agreement between you and us regarding the Platform and supersede prior understandings relating to the subject matter covered here.
              </p>

              <h2 className="text-xl font-bold text-primary pt-4">20. Contact Information</h2>
              <p>
                [Legal Entity Name]<br />
                [Mailing Address]<br />
                [Privacy or Support Email]<br />
                [Phone Number, if applicable]
              </p>
            </section>
          </div>
        </div>
      </main>

      <FooterPage />
    </div>
  )
}