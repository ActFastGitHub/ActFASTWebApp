"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FaBoxes,
  FaCamera,
  FaClipboardList,
  FaFileSignature,
  FaCogs,
  FaDollarSign,
  FaHardHat,
  FaHome,
  FaIdBadge,
  FaQrcode,
  FaRegStar,
  FaStar,
  FaTruckMoving,
  FaUsers,
  FaWarehouse,
} from "react-icons/fa";

import Navbar from "@/app/components/navBar";
import Modal from "@/app/components/modal";
import { UserProps } from "@/app/libs/interfaces";

const ACL: Record<string, string[]> = {
  "pods-mapping": [],
  memberpage: [],
  projectspage: [],
  contentspage: [],
  "field-photos": [],
  "project-updates": [],
  projectcosting: ["admin", "owner"],
  projectmanagement: ["admin", "owner"],
  inventorymanagementpage: ["admin", "owner"],
};

const norm = (s?: string) => s?.toLowerCase().trim() ?? "";

const canAccess = (slug: string, role: string) =>
  !ACL[slug]?.length || ACL[slug].includes(role);

type AppItem = {
  id: string;
  title: string;
  desc: string;
  href: string;
  accessSlug?: string;
  adminOnly?: boolean;
  icon: React.ReactNode;
  gradient: string;
};

const apps: AppItem[] = [
  {
    id: "pods-mapping",
    title: "Pods Mapping",
    desc: "Availability and pod contents.",
    href: "/pods-mapping",
    accessSlug: "pods-mapping",
    icon: <FaWarehouse />,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "memberpage",
    title: "Member View",
    desc: "Employee profiles and details.",
    href: "/memberpage",
    accessSlug: "memberpage",
    icon: <FaUsers />,
    gradient: "from-emerald-500 to-green-600",
  },
  {
    id: "projectspage",
    title: "Project Details",
    desc: "Create, edit, and view projects.",
    href: "/projectspage",
    accessSlug: "projectspage",
    icon: <FaClipboardList />,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "contentspage",
    title: "Contents",
    desc: "Manage client contents.",
    href: "/contentspage",
    accessSlug: "contentspage",
    icon: <FaBoxes />,
    gradient: "from-amber-400 to-yellow-600",
  },
  {
    id: "projectcosting",
    title: "Project Costing",
    desc: "Final repairs costs and budgets.",
    href: "/projectcosting",
    accessSlug: "projectcosting",
    icon: <FaDollarSign />,
    gradient: "from-rose-500 to-red-600",
  },
  {
    id: "projectmanagement",
    title: "Project Board",
    desc: "Prototype project management.",
    href: "/projectmanagement",
    accessSlug: "projectmanagement",
    icon: <FaHardHat />,
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "inventorymanagementpage",
    title: "Inventory",
    desc: "Office supplies and inventory.",
    href: "/inventorymanagementpage",
    accessSlug: "inventorymanagementpage",
    icon: <FaIdBadge />,
    gradient: "from-teal-500 to-emerald-600",
  },
  {
    id: "equipment",
    title: "Equipment",
    desc: "Warehouse vs. deployed equipment.",
    href: "/equipment",
    icon: <FaTruckMoving />,
    gradient: "from-sky-500 to-blue-600",
  },
  {
    id: "equipment-move",
    title: "Equipment Move",
    desc: "Record OUT and IN movements.",
    href: "/equipment/move",
    icon: <FaCogs />,
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    id: "equipment-admin",
    title: "Equipment Admin",
    desc: "Add, edit, or archive equipment.",
    href: "/equipment/admin/manage",
    adminOnly: true,
    icon: <FaHome />,
    gradient: "from-red-500 to-rose-700",
  },
  {
    id: "field-photos",
    title: "Field Photos",
    desc: "Upload project photos to Dropbox.",
    href: "/field-photos",
    accessSlug: "field-photos",
    icon: <FaCamera />,
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    id: "project-updates",
    title: "Project Updates",
    desc: "Daily updates, photos, and WhatsApp reports.",
    href: "/project-updates",
    accessSlug: "project-updates",
    icon: <FaFileSignature />,
    gradient: "from-lime-500 to-green-600",
  },
  {
    id: "qr-labels",
    title: "QR Labels",
    desc: "Generate bulk asset stickers.",
    href: "/equipment/qr-labels",
    adminOnly: true,
    icon: <FaQrcode />,
    gradient: "from-slate-600 to-gray-800",
  },
];

function AppTile({
  app,
  isFavorite,
  onToggleFavorite,
}: {
  app: AppItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite(app.id);
        }}
        className="absolute right-2 top-2 z-20 rounded-full bg-white/90 p-2 text-yellow-500 shadow-sm transition hover:scale-110"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorite ? <FaStar /> : <FaRegStar />}
      </button>

      <Link
        href={app.href}
        className="block rounded-[2rem] bg-white/80 p-4 shadow-lg ring-1 ring-black/5 backdrop-blur transition duration-200 hover:-translate-y-1 hover:shadow-2xl"
      >
        <div
          className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.6rem] bg-gradient-to-br ${app.gradient} text-3xl text-white shadow-md transition group-hover:scale-105`}
        >
          {app.icon}
        </div>

        <div className="text-center">
          <h2 className="text-base font-bold text-gray-900">{app.title}</h2>
          <p className="mt-1 min-h-[40px] text-xs leading-5 text-gray-500">
            {app.desc}
          </p>
        </div>
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [user, setUser] = useState<UserProps | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || status !== "authenticated") return;

    const provider = new URLSearchParams(window.location.search).get(
      "provider",
    );

    if (provider && !toastShownRef.current) {
      toast.success(`${provider} successful login`);
      toastShownRef.current = true;
    }
  }, [status]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.user?.isNewUser) router.push("/create-profile");
  }, [status, session?.user?.isNewUser, router]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;

    (async () => {
      try {
        const res = await fetch(`/api/user/profile/${session.user.email}`);
        const data = await res.json();
        setUser(data);
      } catch {
        setUser({ role: session?.user?.role } as UserProps);
      }
    })();
  }, [status, session?.user?.email, session?.user?.role]);

  const favoriteStorageKey = useMemo(() => {
    return session?.user?.email
      ? `actfast-dashboard-favorites-${session.user.email}`
      : "actfast-dashboard-favorites";
  }, [session?.user?.email]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = window.localStorage.getItem(favoriteStorageKey);
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch {
        setFavorites([]);
      }
    }
  }, [favoriteStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(favoriteStorageKey, JSON.stringify(favorites));
  }, [favoriteStorageKey, favorites]);

  if (status === "loading" || user === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (session?.user?.isNewUser) return null;

  const role = norm(user?.role ?? session?.user?.role);

  const visibleApps = apps.filter((app) => {
    if (app.adminOnly && role !== "admin" && role !== "owner") return false;
    if (app.accessSlug && !canAccess(app.accessSlug, role)) return false;
    return true;
  });

  const favoriteApps = visibleApps.filter((app) => favorites.includes(app.id));
  const regularApps = visibleApps.filter((app) => !favorites.includes(app.id));

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-[2rem] bg-white/70 p-6 shadow-xl ring-1 ring-white/70 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            ActFAST App Launcher
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">
                Welcome back,{" "}
                <span className="text-blue-600">
                  {user?.nickname || session?.user?.name || "User"}
                </span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                Choose an app below. Tap the star to pin your favorite tools at
                the top.
              </p>
            </div>

            <div className="rounded-2xl bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">
              Role:{" "}
              <span className="font-bold uppercase">{role || "user"}</span>
            </div>
          </div>
        </section>

        {favoriteApps.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900">Favorites</h2>
              <p className="text-xs text-gray-500">
                Saved on this browser for your account.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {favoriteApps.map((app) => (
                <AppTile
                  key={app.id}
                  app={app}
                  isFavorite={favorites.includes(app.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-xl font-black text-gray-900">All Apps</h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {regularApps.map((app) => (
              <AppTile
                key={app.id}
                app={app}
                isFavorite={favorites.includes(app.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </section>
      </main>

      <Modal showModal={false} onClose={() => null} />
    </div>
  );
}
