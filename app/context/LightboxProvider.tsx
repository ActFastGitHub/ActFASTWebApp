"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

export type LightboxItem =
  | string
  | {
      src: string;
      label?: string;
    };

type OpenFn = (imgs: LightboxItem[], idx: number) => void;

type LightboxContextType = {
  open: OpenFn;
  isOpen: boolean;
};

const LightboxCtx = createContext<LightboxContextType | null>(null);

export const useLightbox = () => {
  const ctx = useContext(LightboxCtx);
  if (!ctx) throw new Error("useLightbox must be inside <LightboxProvider>");
  return ctx;
};

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [viewer, setViewer] = useState<{ imgs: LightboxItem[]; idx: number } | null>(null);

  const open = useCallback<OpenFn>((imgs, idx) => setViewer({ imgs, idx }), []);
  const close = useCallback(() => setViewer(null), []);

  useEffect(() => {
    if (!viewer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight")
        setViewer((v) => v && { ...v, idx: (v.idx + 1) % v.imgs.length });
      if (e.key === "ArrowLeft")
        setViewer((v) => v && { ...v, idx: (v.idx - 1 + v.imgs.length) % v.imgs.length });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewer, close]);

  // Swipe left/right support
  const startX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) =>
    (startX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!viewer || startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 50)
      setViewer(
        (v) =>
          v && {
            ...v,
            idx: (v.idx + (dx < 0 ? 1 : -1) + v.imgs.length) % v.imgs.length,
          },
      );
  };

  const overlay =
    viewer &&
    createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
        onClick={close}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white text-xl hover:bg-teal-600/70 transition"
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          aria-label="Close"
        >
          ✕
        </button>
        {(() => {
          const item = viewer.imgs[viewer.idx];
          const src = typeof item === "string" ? item : item.src;
          const label = typeof item === "string" ? undefined : item.label;

          return (
            <div
              className={clsx(
                "relative flex items-center justify-center mx-auto",
                "max-h-[calc(100vh-4rem)] max-w-full w-auto"
              )}
              style={{ aspectRatio: "auto" }}
            >
              <div className="relative group max-w-[90vw] max-h-[80vh] flex items-center justify-center">
                {/* Image & arrows within same container */}
                <img
                  src={src}
                  alt=""
                  className="block max-h-[80vh] max-w-[90vw] object-contain rounded-xl shadow-2xl bg-white/10"
                  onClick={(e) => e.stopPropagation()}
                />
                {/* Label (optional) */}
                {label && (
                  <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-white z-20">
                    {label}
                  </span>
                )}
                {/* Left Arrow */}
                <button
                  aria-label="Previous image"
                  onClick={e => {
                    e.stopPropagation();
                    setViewer(
                      v =>
                        v && {
                          ...v,
                          idx: (v.idx - 1 + v.imgs.length) % v.imgs.length,
                        }
                    );
                  }}
                  className={clsx(
                    "absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center",
                    "w-11 h-11 rounded-full transition-all duration-150",
                    "bg-white/25 backdrop-blur-sm shadow hover:bg-teal-500/90 hover:shadow-lg active:bg-teal-700/90",
                    "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                  )}
                  tabIndex={0}
                  style={{ transition: 'opacity 0.17s' }}
                >
                  <svg width="32" height="32" fill="none" viewBox="0 0 38 38" className="text-white">
                    <path d="M24 10l-8 9 8 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {/* Right Arrow */}
                <button
                  aria-label="Next image"
                  onClick={e => {
                    e.stopPropagation();
                    setViewer(
                      v =>
                        v && {
                          ...v,
                          idx: (v.idx + 1) % v.imgs.length,
                        }
                    );
                  }}
                  className={clsx(
                    "absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center",
                    "w-11 h-11 rounded-full transition-all duration-150",
                    "bg-white/25 backdrop-blur-sm shadow hover:bg-teal-500/90 hover:shadow-lg active:bg-teal-700/90",
                    "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                  )}
                  tabIndex={0}
                  style={{ transition: 'opacity 0.17s' }}
                >
                  <svg width="32" height="32" fill="none" viewBox="0 0 38 38" className="text-white">
                    <path d="M14 10l8 9-8 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          );
        })()}
      </div>,
      document.body,
    );

  return (
    <LightboxCtx.Provider value={{ open, isOpen: !!viewer }}>
      <div
        className={clsx(
          "transition-filter duration-200",
          viewer && "pointer-events-none filter blur-lg"
        )}
      >
        {children}
      </div>
      {overlay}
    </LightboxCtx.Provider>
  );
}
