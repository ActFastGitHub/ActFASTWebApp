import type { Metadata } from "next";

import FaqPageClient from "./FaqPageClient";
import { faqJsonLdItems } from "./faqContent";

export const metadata: Metadata = {
  title: "Restoration FAQ | ActFAST Restoration and Repairs",
  description:
    "Answers about ActFAST emergency restoration, water damage, fire and smoke damage, mold remediation, asbestos considerations, contents pack-out, repairs, insurance coordination, and service areas.",
  alternates: {
    canonical: "https://www.actfast.ca/faq",
  },
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqJsonLdItems,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FaqPageClient />
    </>
  );
}
