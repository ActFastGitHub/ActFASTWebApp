"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import PhoneIcon from "@/app/images/phone-icon.svg";
import MailIcon  from "@/app/images/email-icon.svg";

interface StickyContactButtonsProps {
  show: boolean;
}

/* ---------- 1. button definitions ---------- */
type ButtonConfig = {
  id: string;
  href: string;
  label: string;
  bg: string;
  icon: string;
  rotate: number;
  layoutId?: string;
};

const BUTTONS: readonly ButtonConfig[] = [
  {
    id: "call",
    href: "tel:+16045185129",
    label: "Call Us",
    bg: "bg-red-700",
    icon: PhoneIcon.src,
    rotate: 4,
    layoutId: "call-button",
  },
  {
    id: "email",
    href: "mailto:info@actfast.ca",
    label: "Email Us",
    bg: "bg-blue-600",
    icon: MailIcon.src,
    rotate: -4,
  },
] as const;

/* ---------- 2. component ---------- */
const StickyContactButtons: React.FC<StickyContactButtonsProps> = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        key="sticky-buttons"
        className="fixed right-4 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-4"
        initial={{ opacity: 0, x: 96 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 96 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
      >
        {BUTTONS.map(
          ({ id, href, label, bg, icon, rotate, layoutId }) => (
            <Link href={href} key={id} legacyBehavior>
              <motion.a
                {...(layoutId ? { layoutId } : {})}
                /* --- parent pill --- */
                className={`group flex h-12 w-12 overflow-hidden rounded-full ${bg} text-white shadow-lg`}
                variants={{
                  collapsed: { width: 48, rotate: 0 },
                  expanded:  { width: 160, rotate },
                }}
                initial="collapsed"
                whileHover="expanded"
                whileTap="expanded"
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* icon */}
                <motion.img
                  src={icon}
                  alt={label}
                  className="m-auto h-6 w-6"
                  variants={{
                    collapsed: { scale: 1 },
                    expanded:  { scale: 1.15 },
                  }}
                  transition={{ duration: 0.2 }}
                />

                {/* label */}
                <motion.span
                  className="ml-2 mr-4 whitespace-nowrap font-semibold"
                  variants={{
                    collapsed: { opacity: 0, x: -8 },
                    expanded:  { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {label}
                </motion.span>
              </motion.a>
            </Link>
          ),
        )}
      </motion.div>
    )}
  </AnimatePresence>
);

export default StickyContactButtons;
