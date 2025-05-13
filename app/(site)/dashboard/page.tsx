"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";

import Navbar from "@/app/components/navBar";
import Modal from "@/app/components/modal";
import { UserProps } from "@/app/libs/interfaces";

/* ───────────── ACL MAP ───────────── */
const ACL: Record<string, string[]> = {
  "pods-mapping": [],
  "memberpage": [],
  "projectspage": [],
  "contentspage": [],
  "projectcosting": ["admin", "owner"], // protected
  "projectmanagement": [],
  "inventorymanagementpage": [],
};
const norm = (s?: string) => s?.toLowerCase().trim() ?? "";
const canAccess = (slug: string, role: string) =>
  !(ACL[slug]?.length) || ACL[slug].includes(role);

/* small card */
const Card = ({
  color,
  title,
  desc,
}: {
  color: string;
  title: string;
  desc: string;
}) => (
  <div
    className={`block rounded-lg bg-${color}-500 p-4 text-white shadow-lg transition hover:bg-${color}-600`}
  >
    <h2 className="mb-1 text-lg font-semibold">{title}</h2>
    <p className="text-sm text-gray-200">{desc}</p>
  </div>
);

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [user, setUser] = useState<UserProps | null>(null); // null = still loading
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toastShownRef = useRef(false);

  /* ——— toast on provider login ——— */
  useEffect(() => {
    if (typeof window === "undefined" || status !== "authenticated") return;
    const provider = new URLSearchParams(window.location.search).get("provider");
    if (provider && !toastShownRef.current) {
      toast.success(`${provider} successful login`);
      toastShownRef.current = true;
    }
  }, [status]);

  /* ——— redirects ——— */
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.user.isNewUser) router.push("/create-profile");
  }, [status, session?.user.isNewUser, router]);

  /* ——— fetch profile once logged in ——— */
  useEffect(() => {
    if (status !== "authenticated" || !session?.user.email) return;
    (async () => {
      try {
        const res = await fetch(`/api/user/profile/${session.user.email}`);
        const data = await res.json();
        setUser(data);
      } catch {
        setUser({ role: session.user.role } as UserProps); // fallback
      }
    })();
  }, [status, session?.user.email]);

  /* show spinner until BOTH session & profile resolved */
  if (status === "loading" || user === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  /* guard again in rare case */
  if (session?.user.isNewUser) return null;

  /* role resolution priority: profile role → session role → "" */
  const role = norm(user?.role ?? session?.user.role);

  return (
    <div className="relative bg-gray-100">
      <Navbar />

      <div className="flex">
        {/* ——— sidebar ——— */}
        <aside
          className={`fixed inset-y-0 left-0 w-32 transform bg-gray-800 text-white sm:w-48 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300`}
        >
          <div className="p-4">
            <h2 className="pt-20 text-2xl font-bold">Sidebar</h2>
            <ul>
              <li>(For Future Content)</li>
              <li>(For Future Content)</li>
              <li>(For Future Content)</li>
            </ul>
          </div>
        </aside>

        {/* ——— main ——— */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-32 sm:ml-48" : "ml-0"
          }`}
        >
          <div className="p-6 pt-24">
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="mb-4 rounded bg-blue-500 px-4 py-2 text-white"
            >
              Toggle Sidebar
            </button>

            <h1 className="mb-4 text-2xl font-bold">
              Welcome to your dashboard{" "}
              <span className="text-3xl text-red-600">{user?.nickname}</span>
            </h1>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {canAccess("pods-mapping", role) && (
                <Link href="/pods-mapping">
                  <Card
                    color="blue"
                    title="Pods Mapping"
                    desc="Check availability & contents of each pod."
                  />
                </Link>
              )}

              {canAccess("memberpage", role) && (
                <Link href="/memberpage">
                  <Card
                    color="green"
                    title="Member View"
                    desc="View and edit employee details."
                  />
                </Link>
              )}

              {canAccess("projectspage", role) && (
                <Link href="/projectspage">
                  <Card
                    color="purple"
                    title="Project Details"
                    desc="Create, edit, view projects."
                  />
                </Link>
              )}

              {canAccess("contentspage", role) && (
                <Link href="/contentspage">
                  <Card
                    color="yellow"
                    title="Contents Management"
                    desc="Manage client contents."
                  />
                </Link>
              )}

              {/* 🔒 admin / owner only */}
              {canAccess("projectcosting", role) && (
                <Link href="/projectcosting">
                  <Card
                    color="red"
                    title="Project Costing (Final Repairs)"
                    desc="Project costing & management."
                  />
                </Link>
              )}

              {canAccess("projectmanagement", role) && (
                <Link href="/projectmanagement">
                  <Card
                    color="orange"
                    title="Project Management (Prototype)"
                    desc="Digitized project board."
                  />
                </Link>
              )}

              {canAccess("inventorymanagementpage", role) && (
                <Link href="/inventorymanagementpage">
                  <Card
                    color="pink"
                    title="Inventory Management"
                    desc="Manage inventory & supplies."
                  />
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>

      <Modal showModal={false} onClose={() => null} />
    </div>
  );
}
