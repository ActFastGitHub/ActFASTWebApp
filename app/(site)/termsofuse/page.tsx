import React from "react";
import Link from "next/link";

import LegalPageShell from "@/app/components/legal/LegalPageShell";

const sectionTitle = "mb-2 text-xl font-semibold text-red-600";
const linkClass = "text-red-600 underline hover:text-red-400";

export default function TermsOfUse() {
  return (
    <LegalPageShell title="Terms of Use" effectiveDate="July 8, 2026">
      <section>
        <h2 className={sectionTitle}>Use of This Website</h2>
        <p>
          This website provides information about ActFAST Restoration and
          Repairs, our services, locations, featured projects, and contact
          options. By using the website, you agree to use it lawfully and not to
          interfere with its security, availability, or operation.
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>No Emergency Guarantee Online</h2>
        <p>
          Website forms and messages are not guaranteed emergency-response
          channels. For urgent restoration or repair help, call ActFAST directly
          at{" "}
          <a href="tel:+16045185129" className={linkClass}>
            604-518-5129
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>Employee Portal</h2>
        <p>
          Protected portal areas are for authorized ActFAST users only. Do not
          share access codes, passwords, project information, or portal data
          with unauthorized people.
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>Website Content</h2>
        <p>
          Website text, photos, logos, and other content are provided for
          informational purposes and remain owned by ActFAST or their respective
          owners. You may not copy, reuse, or republish them without permission
          except where allowed by law.
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>Third-Party Links and Services</h2>
        <p>
          The website may link to or display content from third-party services,
          including social media, YouTube, Google, Facebook, Dropbox, and
          Cloudinary. Those services are governed by their own terms and
          policies.
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>Privacy and Cookies</h2>
        <p>
          Your use of the website is also described in our{" "}
          <Link href="/privacypolicy" className={linkClass}>
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/cookiepolicy" className={linkClass}>
            Cookie Policy
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>Changes</h2>
        <p>
          ActFAST may update these Terms of Use from time to time. The effective
          date above shows when this page was last updated.
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>Contact</h2>
        <p>
          Questions about these terms can be sent to{" "}
          <a href="mailto:info@actfast.ca" className={linkClass}>
            info@actfast.ca
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
