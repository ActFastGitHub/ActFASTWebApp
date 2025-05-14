/* app/not-found.tsx */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    /* full-screen black canvas */
    <main className="relative flex h-dvh w-screen flex-col items-center justify-center overflow-hidden bg-black text-white">
      {/* ───── logo ───── */}
      <Image
        src="/images/actfast-logo.png"
        alt="ActFast"
        width={180}
        height={56}
        priority
        className="absolute top-5 left-1/2 -translate-x-1/2"
      />

      {/* ───── 404 label ───── */}
      <h1 className="absolute top-20 left-1/2 -translate-x-1/2 text-5xl font-extrabold tracking-wider text-gray-200 sm:text-6xl">
        404
      </h1>

      {/* ───── Morpheus + pills ───── */}
      <div className="relative w-[80vw] max-w-[420px] pt-10 sm:pt-14">
        <Image
          src="/images/morpheus-pills.png"      /* transparent-BG version */
          alt="Morpheus offering pills"
          width={420}
          height={360}
          priority
          className="h-auto w-full select-none"
        />

        {/* red pill → back */}
        <button
          onClick={() => router.back()}
          className="absolute left-[20%] bottom-[18%] flex aspect-video w-[96px] -translate-x-1/2 items-center justify-center rounded-full bg-red-600 font-semibold shadow-md transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 sm:w-[112px]"
        >
          Go Back
        </button>

        {/* blue pill → home */}
        <Link
          href="/"
          className="absolute right-[20%] bottom-[18%] flex aspect-video w-[96px] translate-x-1/2 items-center justify-center rounded-full bg-blue-600 font-semibold shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 sm:w-[112px]"
        >
          Home
        </Link>
      </div>

      {/* caption */}
      <p className="mt-6 text-center text-sm text-gray-400">
        You’ve stepped out of the Matrix. Pick a pill to continue.
      </p>
    </main>
  );
}
