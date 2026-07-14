"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDownIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import Footer from "@/app/components/footer";
import Modal from "@/app/components/modal";
import Navbar from "@/app/components/siteNavBar";
import { faqSections } from "./faqContent";

export default function FaqPageClient() {
  const [showModal, setShowModal] = useState(false);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const allQuestions = useMemo(
    () =>
      faqSections.flatMap((section, sectionIndex) =>
        section.items.map((item, itemIndex) => ({
          id: `${sectionIndex}-${itemIndex}`,
          section: section.title,
          ...item,
        }))
      ),
    []
  );

  const toggleItem = (id: string) => {
    setOpenItems((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className={showModal ? "overflow-hidden blur-3xl filter" : ""}>
        <Navbar onPortalClick={() => setShowModal(true)} />

        <main>
          <section className="relative overflow-hidden bg-gray-950 px-6 pb-14 pt-28 sm:px-10 lg:px-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,28,28,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.2),transparent_30%)]" />
            <div className="relative mx-auto max-w-6xl">
              <div className="max-w-3xl">
                <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/40 px-4 py-2 text-sm font-semibold text-red-100">
                  <ShieldCheckIcon className="h-5 w-5" />
                  Restoration Help & FAQ
                </p>
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  Clear answers before, during, and after a property loss.
                </h1>
                <p className="mt-5 text-lg leading-8 text-gray-300">
                  Restoration projects can move quickly and involve safety,
                  insurance, contents, drying, cleaning, and repairs. These
                  answers explain ActFAST's typical process without replacing
                  advice from your insurer, adjuster, medical professional, or
                  other qualified specialist.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="tel:+16045185129"
                  className="inline-flex items-center justify-center gap-2 rounded bg-red-700 px-5 py-3 font-bold text-white shadow-lg shadow-black/30 transition hover:bg-red-600"
                >
                  <PhoneIcon className="h-5 w-5" />
                  Call 604-518-5129
                </a>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center rounded border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  View Services
                </Link>
              </div>
            </div>
          </section>

          <section className="bg-gray-900 px-6 py-12 sm:px-10 lg:px-16">
            <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-red-300">
                  Emergencies
                </p>
                <p className="mt-2 text-gray-200">
                  Call right away for urgent damage, especially water damage,
                  so mitigation can begin and help limit secondary damage such
                  as mold growth.
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-red-300">
                  Insurance
                </p>
                <p className="mt-2 text-gray-200">
                  ActFAST can help with documentation and coordination; your
                  insurer determines coverage.
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-red-300">
                  Safety
                </p>
                <p className="mt-2 text-gray-200">
                  Before assessment, avoid disturbing suspected mold,
                  asbestos, smoke residue, or other potentially unsafe
                  materials.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-950 px-6 py-14 sm:px-10 lg:px-16">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[280px_1fr]">
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                  <h2 className="text-lg font-bold">Topics</h2>
                  <nav className="mt-4 space-y-2">
                    {faqSections.map((section) => (
                      <a
                        key={section.title}
                        href={`#${section.title.toLowerCase().replaceAll(" ", "-").replaceAll("/", "")}`}
                        className="block rounded px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                      >
                        {section.title}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>

              <div className="space-y-10">
                {faqSections.map((section, sectionIndex) => (
                  <section
                    key={section.title}
                    id={section.title
                      .toLowerCase()
                      .replaceAll(" ", "-")
                      .replaceAll("/", "")}
                    className="scroll-mt-24"
                  >
                    <div className="mb-4">
                      <h2 className="text-2xl font-black text-white sm:text-3xl">
                        {section.title}
                      </h2>
                      <p className="mt-2 text-gray-300">{section.intro}</p>
                    </div>

                    <div className="space-y-3">
                      {section.items.map((item, itemIndex) => {
                        const id = `${sectionIndex}-${itemIndex}`;
                        const isOpen = openItems[id] ?? allQuestions.length < 1;

                        return (
                          <article
                            key={item.question}
                            className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]"
                          >
                            <button
                              type="button"
                              onClick={() => toggleItem(id)}
                              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.04]"
                              aria-expanded={isOpen}
                            >
                              <span className="font-semibold text-white">
                                {item.question}
                              </span>
                              <ChevronDownIcon
                                className={`h-5 w-5 flex-none text-red-300 transition ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            {isOpen ? (
                              <div className="border-t border-white/10 px-5 py-4 text-gray-300">
                                {item.answer}
                              </div>
                            ) : null}
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-red-800 px-6 py-10 text-center text-white sm:px-10">
            <h2 className="text-2xl font-black sm:text-3xl">
              Need help with an active loss?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-red-50">
              For urgent restoration help, phone contact is the clearest way to
              start. For non-urgent questions, the contact form is available on
              the homepage.
            </p>
            <a
              href="tel:+16045185129"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded bg-white px-5 py-3 font-bold text-red-800 transition hover:bg-red-50"
            >
              <PhoneIcon className="h-5 w-5" />
              Call ActFAST
            </a>
          </section>
        </main>

        <Footer />
      </div>

      <Modal showModal={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
