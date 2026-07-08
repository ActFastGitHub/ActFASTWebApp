import React from "react";
import Link from "next/link";

import LegalPageShell from "@/app/components/legal/LegalPageShell";

const sectionTitle = "mb-2 text-xl font-semibold text-red-600";
const linkClass = "text-red-600 underline hover:text-red-400";

export default function PrivacyPolicy() {
  return (
    <LegalPageShell title="Privacy Policy" effectiveDate="July 8, 2026">
      <section>
        <h2 className={sectionTitle}>Information We Collect</h2>
        <p>
          We collect personal information you voluntarily provide through the
          website, including contact form details such as your full name, phone
          number, optional email address, inquiry category, and message. If you
          use the employee portal, we may also collect account, profile,
          project, equipment, photo, inventory, and activity information needed
          to operate that portal.
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>How We Use Your Information</h2>
        <p>
          We use personal information to respond to inquiries, provide
          restoration and repair services, manage employee portal accounts,
          support project and inventory workflows, protect the website, and
          comply with legal or operational requirements.
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>Contact Form Messages</h2>
        <p>
          Contact form submissions are sent to ActFAST by email for review and
          response. The public contact form does not create a public account or
          marketing subscription.
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>Cookies and Browser Storage</h2>
        <p>
          The current site code uses necessary cookies and browser storage for
          functions such as employee access-code checks, secure login sessions,
          CSRF protection, saved portal preferences, local drafts, and this
          cookie notice. We did not identify advertising cookies or analytics
          trackers in the current site code. See our{" "}
          <Link href="/cookiepolicy" className={linkClass}>
            Cookie Policy
          </Link>{" "}
          for more detail.
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>Third-Party Services</h2>
        <p>
          The website and employee portal may use service providers to operate
          core features, including email delivery, Google and Facebook login,
          Google Places review information, YouTube video embeds, Dropbox file
          workflows, Cloudinary image handling, and hosting/database services.
          These providers may process information as needed to deliver their
          services.
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>How We Protect Your Information</h2>
        <p>
          We use reasonable administrative and technical safeguards, including
          HTTPS, authentication controls, role-based access for protected portal
          areas, and limited access to business communications and records.
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>Sharing Your Information</h2>
        <p>
          We do not sell personal information. We may share information with
          service providers that help us operate the website, respond to
          requests, manage projects, or comply with legal obligations.
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>Your Rights and Choices</h2>
        <p>
          You may request access to personal information we hold about you, ask
          for corrections, withdraw consent where applicable, or request
          deletion subject to legal and operational retention requirements. To
          make a request, email{" "}
          <a href="mailto:info@actfast.ca" className={linkClass}>
            info@actfast.ca
          </a>
          . You can also review our{" "}
          <Link href="/delete-my-data" className={linkClass}>
            Data Deletion Instructions
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy to reflect changes in our practices,
          website features, or legal requirements. The effective date above
          shows when this page was last updated.
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>Contact Us</h2>
        <address className="space-y-1 not-italic text-gray-300">
          ActFAST Restoration and Repairs
          <br />
          Email:{" "}
          <a href="mailto:info@actfast.ca" className={linkClass}>
            info@actfast.ca
          </a>
          <br />
          Phone: (604) 518-5129
          <br />
          Address: Unit 108 - 11539 136 St. Surrey, BC V3R 0G3, CA
        </address>
      </section>
    </LegalPageShell>
  );
}
