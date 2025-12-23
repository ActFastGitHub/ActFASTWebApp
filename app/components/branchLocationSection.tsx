"use client";

import React from "react";
import {
  MapPinIcon,
  ArrowLongRightIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

type Props = {
  title?: string;
  sinceLabel?: string;

  addressText: string;
  addressUrl?: string;

  mapEmbedSrc: string;

  phone: string; // can be "+1604..." or "(604)...", we’ll display as-is
  email: string;

  serviceAreas: string[];
};

export default function BranchLocationSection({
  title = "Find Us",
  sinceLabel,
  addressText,
  addressUrl,
  mapEmbedSrc,
  phone,
  email,
  serviceAreas,
}: Props) {
  return (
    <section className="relative overflow-hidden bg-[#0f1428]">
      {/* Background accents (match your AboutSection vibe) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 -top-10 h-80 w-80 rounded-full bg-[#684bb1]/30 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[#ffe066]/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-14">
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-semibold text-white md:text-3xl">
            {title}
          </h3>
          {sinceLabel ? (
            <p className="mt-2 text-sm text-white/70">{sinceLabel}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          {/* Map */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl md:col-span-2">
            <iframe
              title="Branch Location Map"
              src={mapEmbedSrc}
              width="100%"
              height="330"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </div>

          {/* Info cards */}
          <div className="flex flex-col gap-3">
            {/* Address */}
            {addressUrl ? (
              <a
                href={addressUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-start gap-3 rounded-xl border border-white/10 bg-white/10 p-4 text-white backdrop-blur hover:bg-white/15"
              >
                <MapPinIcon className="h-6 w-6 text-red-500" />
                <span className="flex-1">
                  <span className="block text-sm text-white/80">Address</span>
                  <span className="block font-semibold">{addressText}</span>
                </span>
                <ArrowLongRightIcon className="h-5 w-5 opacity-80 transition group-hover:translate-x-1" />
              </a>
            ) : (
              <div className="inline-flex items-start gap-3 rounded-xl border border-white/10 bg-white/10 p-4 text-white backdrop-blur">
                <MapPinIcon className="h-6 w-6 text-red-500" />
                <span className="flex-1">
                  <span className="block text-sm text-white/80">Address</span>
                  <span className="block font-semibold">{addressText}</span>
                </span>
              </div>
            )}

            {/* Hours */}
            <div className="rounded-xl border border-white/10 bg-white/10 p-4 text-white/90 backdrop-blur">
              <p className="text-sm text-white/80">Hours</p>
              <p className="font-medium">
                24/7 Emergency Response • By appointment for non-emergency
              </p>
            </div>

            {/* Phone + Email */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${phone}`}
                className="rounded-lg border border-white/10 bg-white/10 p-3 text-white/90 backdrop-blur hover:bg-white/15"
              >
                <div className="mb-1 flex items-center gap-2 text-xs text-white/70">
                  <PhoneIcon className="h-4 w-4" />
                  <span>Phone</span>
                </div>
                <p className="font-semibold">{phone}</p>
              </a>

              <a
                href={`mailto:${email}`}
                className="rounded-lg border border-white/10 bg-white/10 p-3 text-white/90 backdrop-blur hover:bg-white/15"
              >
                <div className="mb-1 flex items-center gap-2 text-xs text-white/70">
                  <EnvelopeIcon className="h-4 w-4" />
                  <span>Email</span>
                </div>
                <p className="font-semibold">{email}</p>
              </a>
            </div>

            {/* Service Areas */}
            <div className="rounded-xl border border-white/10 bg-white/10 p-4 text-white/90 backdrop-blur">
              <p className="text-sm text-white/80">Service Areas</p>

              <div className="mt-2 flex flex-wrap gap-2">
                {serviceAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/90"
                  >
                    {area}
                  </span>
                ))}
              </div>

              <p className="mt-3 text-xs text-white/70">
                Not sure if you’re covered? Call us anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Micro footer line (optional) */}
        <div className="mt-8 flex flex-col items-center justify-between gap-2 text-xs text-white/60 md:flex-row">
          <span>{addressText}</span>
          <span>www.actfast.ca</span>
        </div>
      </div>
    </section>
  );
}
