"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import PhoneIcon from "@/app/images/phone-icon.svg";
import MailIcon from "@/app/images/email-icon.svg";

interface StickyContactButtonsProps {
  show: boolean;
}

/* ---------- button definitions ---------- */
type ButtonConfig = {
  id: string;
  href: string;
  label: string;
  bg: string;
  icon: string;
  layoutId?: string;
  appearDelay: number; // ⏱ small delay to sync arrival
};

const BUTTONS: readonly ButtonConfig[] = [
  {
    id: "call",
    href: "tel:+16045185129",
    label: "Call Us",
    bg: "bg-red-700",
    icon: PhoneIcon.src,
    layoutId: "call-button", // morph source
    appearDelay: 0, // morph starts immediately
  },
  {
    id: "email",
    href: "mailto:info@actfast.ca",
    label: "Email Us",
    bg: "bg-blue-600",
    icon: MailIcon.src,
    appearDelay: 0.18, // waits ~180 ms so it lines up
  },
] as const;

/* ---------- animation variants ---------- */
const pillVariants = {
  collapsed: { width: 48, scale: 1, boxShadow: "0 2px 4px rgba(0,0,0,.25)" },
  expanded: {
    width: 152,
    scale: 1.02,
    boxShadow: "0 6px 12px rgba(0,0,0,.30)",
  },
};

const iconVariants = {
  collapsed: { scale: 1 },
  expanded: { scale: 1.12 },
};

const textVariants = {
  collapsed: { opacity: 0, x: -8 },
  expanded: { opacity: 1, x: 0 },
};

/* ---------- component ---------- */
const StickyContactButtons: React.FC<StickyContactButtonsProps> = ({
  show,
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        key="sticky-buttons"
        className="fixed right-4 bottom-20 z-50 flex -translate-y-1/2 flex-col gap-4"
        initial={{ opacity: 0, x: 96 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 96 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
      >
        {BUTTONS.map(({ id, href, label, bg, icon, layoutId, appearDelay }) => (
          <Link href={href} key={id} legacyBehavior>
            <motion.a
              {...(layoutId ? { layoutId } : {})}
              className={`group flex items-center overflow-hidden rounded-full ${bg} text-white`}
              style={{ height: 48 }}
              variants={pillVariants}
              initial="collapsed"
              whileHover="expanded"
              whileTap="expanded"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 22,
                delay: appearDelay, // <- sync start
              }}
            >
              {/* icon wrapper keeps icon centred */}
              <div className="grid h-12 w-12 flex-none place-items-center">
                <motion.img
                  src={icon}
                  alt={label}
                  className="h-6 w-6"
                  variants={iconVariants}
                  transition={{ duration: 0.2, delay: appearDelay }}
                />
              </div>

              <motion.span
                className="mr-4 whitespace-nowrap font-semibold"
                variants={textVariants}
                transition={{ duration: 0.25, delay: appearDelay }}
              >
                {label}
              </motion.span>
            </motion.a>
          </Link>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

export default StickyContactButtons;
