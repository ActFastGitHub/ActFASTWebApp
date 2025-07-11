"use client";

import React, { useEffect, useState, useRef, useCallback, ReactNode } from "react";
import Image from "next/image";
import Navbar from "@/app/components/siteNavBar";
import Modal from "@/app/components/modal";
import Footer from "@/app/components/footer";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import phoneIcon from "@/app/images/phone-icon.svg";

/* ------------------------------------------------------------------ */
/* 🔧 helper to build ["/images/WaterDamage/Water (1).jpg", …]        */
/* ------------------------------------------------------------------ */
const gen = (folder: string, prefix: string, count: number): string[] =>
  Array.from(
    { length: count },
    (_, i) => `/images/${folder}/${prefix} (${i + 1}).jpg`,
  );

/* ------------------------------------------------------------------ */
/* 📁 static image arrays                                             */
/* ------------------------------------------------------------------ */
const water     = gen("WaterDamage",       "Water",    45);
const fire      = gen("FireDamage",        "Fire",     52);
const mold      = gen("MoldRemediation",   "Mold",     31);
const asbestos  = gen("AsbestosAbatement", "Asbestos", 9);
const repairs   = gen("GeneralRepairs",    "Repairs",  14);
const contents  = gen("ContentsRestoration","Contents",35);

/* ------------------------------------------------------------------ */
/* 0️⃣  Light-box hook with swipe support                              */
/* ------------------------------------------------------------------ */
type Viewer = { imgs: string[]; idx: number } | null;

function useLightbox() {
  const [viewer, setViewer] = useState<Viewer>(null);
  const touchStartX = useRef<number>(0);

  const open = (imgs: string[], idx: number) => setViewer({ imgs, idx });
  const close = () => setViewer(null);
  const next = () =>
    setViewer((v) => v && { ...v, idx: (v.idx + 1) % v.imgs.length });
  const prev = () =>
    setViewer(
      (v) => v && { ...v, idx: (v.idx - 1 + v.imgs.length) % v.imgs.length },
    );

  const onKey = useCallback((e: KeyboardEvent) => {
    if (!viewer) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  }, [viewer]);

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next(); else prev();
    }
  };

  const overlay: ReactNode = viewer && (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      onClick={close}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        className="absolute right-4 top-4 rounded bg-black/60 p-2 text-white"
        onClick={(e) => { e.stopPropagation(); close(); }}
      >✕</button>
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-black/60 p-2 text-white"
        onClick={(e) => { e.stopPropagation(); prev(); }}
      >◀</button>
      <img
        src={viewer.imgs[viewer.idx]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-full object-contain"
      />
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-black/60 p-2 text-white"
        onClick={(e) => { e.stopPropagation(); next(); }}
      >▶</button>
    </div>
  );

  return { open, overlay };
}

/* ------------------------------------------------------------------ */
/* 2️⃣  Auto-scroll carousel                                            */
/* ------------------------------------------------------------------ */
type IntervalId = ReturnType<typeof setInterval>;

function ImageCarousel({ images, onImageClick }: { images: string[]; onImageClick?: (idx: number) => void }) {
  const [cur, setCur] = useState(0);
  const t = useRef<IntervalId | null>(null);

  useEffect(() => {
    if (!images.length) return;
    t.current = setInterval(() => setCur((i) => (i + 1) % images.length), 3000);
    return () => { if (t.current) clearInterval(t.current); };
  }, [images]);

  const jump = (d: number) => { if (t.current) clearInterval(t.current); setCur((i) => (i + d + images.length) % images.length); };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-xl">
      {images.map((src, i) => (
        <div key={src} className={`absolute inset-0 transition-opacity duration-700 ${i === cur ? "opacity-100" : "opacity-0"}`}>
          <img src={src} alt="" onClick={() => onImageClick?.(i)} className="h-full w-full cursor-pointer object-cover object-center" />
        </div>
      ))}
      {images.length > 1 && (
        <>
          <button onClick={() => jump(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70">◀</button>
          <button onClick={() => jump(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70">▶</button>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3️⃣  Services Menu sidebar                                            */
/* ------------------------------------------------------------------ */
function TableOfContents({ onJump }: { onJump: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const items: [string, string][] = [
    ["water-damage", "Water Damage"],
    ["fire-damage", "Fire Damage"],
    ["mold-remediation", "Mold Remediation"],
    ["asbestos-abatement", "Asbestos Abatement"],
    ["general-repairs", "General Repairs"],
    ["contents-restoration", "Contents Restoration"],
  ];
  return (
    <>
      <div className="fixed left-0 top-24 z-20 hidden w-48 px-2 md:block">
        <div className="rounded-md bg-black/40 p-4 backdrop-blur-sm">
          <h2 className="mb-3 font-bold">Services Menu</h2>
          <ul className="space-y-2 text-sm">
            {items.map(([id, label]) => (
              <li key={id}><button onClick={() => { onJump(id); setOpen(false); }} className="hover:underline">{label}</button></li>
            ))}
          </ul>
        </div>
      </div>
      <button onClick={() => setOpen(!open)} className="fixed bottom-4 right-4 z-20 block rounded-md bg-black/70 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm md:hidden">
        {open ? "Close Menu" : "Services Menu"}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 p-6 md:hidden">
          <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-2xl text-white">✕</button>
          <h2 className="mb-6 mt-12 text-2xl font-bold text-white">Services Menu</h2>
          <ul className="space-y-4 text-lg">
            {items.map(([id, label]) => (
              <li key={id}><button onClick={() => { onJump(id); setOpen(false); }} className="text-white underline">{label}</button></li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 4️⃣  Main Page Component                                              */
/* ------------------------------------------------------------------ */
export default function ServicesPage() {
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.2 });
  const controls = useAnimation();

  useEffect(() => setMounted(true), []);
  useEffect(() => { controls.start(inView ? "visible" : "hidden"); }, [inView, controls]);

  const fade = (dir: "left" | "right" | "up" | "down" = "up") => {
    const d = { left: [-50, 0], right: [50, 0], up: [0, -50], down: [0, 50] }[dir] as [number, number];
    return { hidden: { opacity: 0, x: d[0], y: d[1] }, visible: { opacity: 1 } };
  };

  const lightbox = useLightbox();
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="relative bg-gray-900 text-white">
      {lightbox.overlay}
      <div className="fixed left-0 top-0 z-50 w-full bg-gray-900"><Navbar onPortalClick={() => setShowModal(true)} /></div>
      <TableOfContents onJump={jump} />
      <main className="container mx-auto px-4 pb-16 pt-28 md:pl-52 md:pt-36">
        <section id="intro" ref={ref} className="mb-12">
          <motion.h1 className="mb-6 text-4xl font-extrabold md:text-5xl" variants={fade("up")} initial="hidden" animate={controls} transition={{ duration: 0.5 }}>
            Our Services
          </motion.h1>
          <motion.p className="max-w-3xl text-lg leading-relaxed text-gray-200" variants={fade("up")} initial="hidden" animate={controls} transition={{ duration: 0.5, delay: 0.2 }}>
            At ActFast Restoration & Repairs we handle insurance claims for water, fire, mold, asbestos, repairs, and contents restoration across Metro Vancouver and Surrey. We respond fast and restore your property efficiently.
          </motion.p>
        </section>
        <ServiceBlock id="water-damage" num={1} title="Water Damage Restoration 🚰" bullets={["Rapid response to leaks, floods, and pipe bursts.", "Water extraction, drying, and moisture control.", "Works with insurance claims for hassle-free processing."]} services={["Emergency Water Removal","Structural Drying","Mold Prevention","Sewage Cleanup"]} images={water} cta="Call Us Now for 24/7 Water Damage Restoration!" open={lightbox.open} />
        <ServiceBlock id="fire-damage" num={2} title="Fire Damage Restoration 🔥" bullets={["Smoke & soot removal for homes and businesses.", "Odor elimination and structural cleaning.", "Insurance claims assistance for fire-related damages."]} services={["Fire Damage Cleanup","Smoke & Soot Removal","Odor Neutralization","Structural Repairs"]} images={fire} cta="Get Your Property Restored After Fire Damage Today!" open={lightbox.open} />
        <ServiceBlock id="mold-remediation" num={3} title="Mold Remediation 🦠" bullets={["Safe and certified mold removal to prevent health risks.", "Inspection, testing, and full mold treatment.", "Works with homeowners & insurance adjusters."]} services={["Mold Inspection","Containment & Removal","Air Purification","Moisture Control"]} images={mold} cta="Protect Your Home from Dangerous Mold – Contact Us!" open={lightbox.open} />
        <ServiceBlock id="asbestos-abatement" num={4} title="Asbestos Abatement ⚠️" bullets={["Licensed testing and removal of asbestos-containing materials.", "Containment, safe disposal, and air-quality clearance reports.", "Meets all WorkSafeBC and federal regulations."]} services={["Asbestos Inspection & Sampling","Hazard Containment","Certified Removal & Disposal","Air Monitoring / Clearance"]} images={asbestos} cta="Need Safe Asbestos Removal? Call Our Certified Team!" open={lightbox.open} />
        <ServiceBlock id="general-repairs" num={5} title="General Repairs & Renovations 🛠" bullets={["Full restoration & repair services after water/fire damage.", "Residential & commercial rebuilds and renovations.", "Work with insurance claims and private projects."]} services={["Drywall & Painting","Flooring & Carpentry","Electrical & Plumbing Repairs","Roofing & Structural Work"]} images={repairs} cta="Need Property Repairs? We’ve Got You Covered!" open={lightbox.open} />
        <ServiceBlock id="contents-restoration" num={6} title="Contents Restoration & Pack-Out Services 📦" bullets={["Secure storage and management of your belongings during repairs.", "Professional pack-out & pack-back services, ensuring safe handling.", "Cleaning & decontamination of items affected by fire, smoke, mold, or water.", "We coordinate directly with insurers for smooth claims."]} services={["Secure Off-Site Storage","Pack-Out & Inventory Management","Contents Cleaning & Restoration","Pack-Back Services"]} images={contents} cta="Need Pack-Out or Storage? Call Us Today!" open={lightbox.open} />
        <section id="final-cta">
          <motion.div className="rounded bg-red-700 p-6 text-center md:mx-auto md:max-w-4xl" whileInView="visible" initial="hidden" viewport={{ once: true }} variants={fade("up")} transition={{ duration: 0.5 }}>
            <h3 className="mb-2 text-2xl font-bold text-white md:text-3xl">We are ready to assist you 24/7!</h3>
            <p className="mb-4 text-white md:text-lg">If you need emergency restoration services in Metro Vancouver, Surrey, or the Okanagan Area, contact us today!</p>
            <p className="text-white md:text-lg">📞 <a href="tel:+1-604-518-5129" className="font-bold underline hover:no-underline">604-518-5129</a> | 📧 <a href="mailto:info@actfast.ca" className="font-bold underline hover:no-underline">info@actfast.ca</a></p>
          </motion.div>
        </section>
      </main>
      {mounted && <Modal showModal={showModal} onClose={() => setShowModal(false)} />}      
      {/* <Footer /> */}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5️⃣  Re-usable ServiceBlock component                              */
/* ------------------------------------------------------------------ */
function ServiceBlock({ id, num, title, bullets, services, images, cta, open }: {
  id: string;
  num: number;
  title: string;
  bullets: string[];
  services: string[];
  images: string[];
  cta: string;
  open: (imgs: string[], idx: number) => void;
}) {
  const fade = (dir: "left" | "right") => ({ hidden: { opacity: 0, x: dir === "left" ? -50 : 50 }, visible: { opacity: 1, x: 0 } });
  return (
    <section id={id} className="mb-16 scroll-mt-40 md:scroll-mt-48">
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <motion.div className="overflow-hidden rounded-lg shadow-xl" variants={fade("left")} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <ImageCarousel images={images} onImageClick={(i) => open(images, i)} />
        </motion.div>
        <motion.div variants={fade("right")} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="mb-4 text-2xl font-bold">{num}. {title}</h2>
          <ul className="mb-4 ml-4 list-disc pl-4 text-gray-300">{bullets.map((b) => <li key={b}>{b}</li>)}</ul>
          <div className="mb-4 ml-4"><p className="mb-2 font-semibold">Services Include:</p><ul className="ml-4 list-disc pl-4 text-gray-300">{services.map((s) => <li key={s}>✔ {s}</li>)}</ul></div>
          <motion.a href="tel:+1-604-518-5129" className="inline-flex items-center gap-2 rounded bg-red-600 px-5 py-3 font-bold text-white transition-all duration-300 hover:bg-red-500" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Image src={phoneIcon} alt="Call" width={20} height={20} priority />{cta}
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
