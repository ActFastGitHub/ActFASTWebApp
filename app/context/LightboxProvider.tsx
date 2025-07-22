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
  if (!ctx)
    throw new Error("useLightbox must be inside <LightboxProvider>");
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
        setViewer(
          (v) => v && { ...v, idx: (v.idx - 1 + v.imgs.length) % v.imgs.length },
        );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewer, close]);

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
        <button className="absolute right-4 top-4 rounded bg-black/60 p-2 text-white">
          ✕
        </button>
        {(() => {
          const item = viewer.imgs[viewer.idx];
          const src   = typeof item === "string" ? item : item.src;
          const label = typeof item === "string" ? undefined : item.label;

          return (
            <div className="relative">
              {label && (
                <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  {label}
                </span>
              )}
              <img
                src={src}
                alt=""
                className="max-h-screen max-w-screen object-contain"
                onClick={(e) => e.stopPropagation()}
              />
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
          viewer && "pointer-events-none filter blur-lg",
        )}
      >
        {children}
      </div>
      {overlay}
    </LightboxCtx.Provider>
  );
}
