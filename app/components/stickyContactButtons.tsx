// app\components\stickyContactButtons.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import PhoneIcon from "@/app/images/phone-icon.svg";
import MailIcon from "@/app/images/email-icon.svg";
import WhatsAppIcon from "@/app/images/whatsapp.svg";
import MessengerIcon from "@/app/images/messenger.svg";

interface StickyContactButtonsProps {
  show: boolean;
  phone?: string;
  email?: string;
}

type ButtonConfig = {
  id: string;
  href: string;
  label: string;
  bg: string;
  icon: string;
  layoutId?: string;
  appearDelay: number;
  external?: boolean;
};

const pillVariants = {
  collapsed: {
    width: 48,
    scale: 1,
    boxShadow: "0 2px 4px rgba(0,0,0,.25)",
  },
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

const StickyContactButtons: React.FC<StickyContactButtonsProps> = ({
  show,
  phone = "+16045185129",
  email = "info@actfast.ca",
}) => {
  const whatsappNumber = "16047636306";
  const messengerUsername = "ActFASTVancouver";

  const BUTTONS: readonly ButtonConfig[] = [
    {
      id: "call",
      href: `tel:${phone}`,
      label: "Call Us",
      bg: "bg-red-700",
      icon: PhoneIcon.src,
      layoutId: "call-button",
      appearDelay: 0,
      external: false,
    },
    {
      id: "email",
      href: `mailto:${email}`,
      label: "Email Us",
      bg: "bg-blue-600",
      icon: MailIcon.src,
      appearDelay: 0.12,
      external: false,
    },
    {
      id: "whatsapp",
      href: `https://wa.me/${whatsappNumber}`,
      label: "WhatsApp",
      bg: "bg-green-500",
      icon: WhatsAppIcon.src,
      appearDelay: 0.24,
      external: true,
    },
    {
      id: "messenger",
      href: `https://m.me/${messengerUsername}`,
      label: "Messenger",
      bg: "bg-sky-500",
      icon: MessengerIcon.src,
      appearDelay: 0.36,
      external: true,
    },
  ] as const;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="sticky-buttons"
          className="fixed bottom-20 right-4 z-50 flex -translate-y-1/2 flex-col gap-4"
          initial={{ opacity: 0, x: 96 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 96 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
        >
          {BUTTONS.map(
            ({
              id,
              href,
              label,
              bg,
              icon,
              layoutId,
              appearDelay,
              external,
            }) => (
              <motion.a
                key={id}
                href={href}
                {...(external
                  ? {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }
                  : {})}
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
                  delay: appearDelay,
                }}
                aria-label={label}
                title={label}
              >
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
            ),
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyContactButtons;
