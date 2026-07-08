import React from "react";
import Link from "next/link";

import LegalPageShell from "@/app/components/legal/LegalPageShell";

const sectionTitle = "mb-2 text-xl font-semibold text-red-600";
const linkClass = "text-red-600 underline hover:text-red-400";

export default function CookiePolicy() {
  return (
    <LegalPageShell title="Cookie Policy" effectiveDate="July 8, 2026">
      <section>
        <h2 className={sectionTitle}>How We Use Cookies</h2>
        <p>
          ActFAST uses necessary cookies and similar browser storage to make the
          website and employee portal work. Based on the current site code, we
          use these technologies for access-code checks, login sessions, CSRF
          protection, saved preferences, local drafts, and remembering that you
          accepted the cookie notice.
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>What We Did Not Identify</h2>
        <p>
          We did not identify advertising cookies, retargeting pixels, Hotjar,
          Meta Pixel, Google Analytics, or similar analytics trackers in the
          current site code. If ActFAST adds optional analytics or marketing
          tools later, this policy and the consent flow should be updated before
          those tools are enabled.
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>Necessary Cookies and Storage</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>
            <strong>Employee access cookie:</strong> used to confirm that a
            visitor has entered the employee portal access code before reaching
            login or registration.
          </li>
          <li>
            <strong>Authentication cookies:</strong> used by NextAuth for secure
            employee portal sessions and CSRF protection.
          </li>
          <li>
            <strong>Local browser storage:</strong> used for preferences,
            dashboard favourites, equipment workflow queues, project-update
            drafts, and this cookie notice acknowledgement.
          </li>
        </ul>
      </section>

      <section>
        <h2 className={sectionTitle}>Third-Party Content</h2>
        <p>
          Some pages include third-party services, such as YouTube video embeds,
          Google Places review information, and social links. These third
          parties may use their own technologies when you interact with their
          content or leave our site.
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>Managing Cookies</h2>
        <p>
          You can control or delete cookies through your browser settings.
          Blocking necessary cookies may prevent employee portal access,
          login/session features, or saved preferences from working correctly.
          For privacy questions, email{" "}
          <a href="mailto:info@actfast.ca" className={linkClass}>
            info@actfast.ca
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className={sectionTitle}>Related Pages</h2>
        <p>
          Please also review our{" "}
          <Link href="/privacypolicy" className={linkClass}>
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/termsofuse" className={linkClass}>
            Terms of Use
          </Link>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
