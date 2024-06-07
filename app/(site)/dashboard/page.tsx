"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import Navbar from "@/app/components/navBar";
import { useRouter } from "next/navigation";
import { UserProps } from "@/app/libs/interfaces";
import toast from "react-hot-toast";
import { useMode } from "@/app/context/ModeContext";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserProps | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);
  const [providerParams, setProviderParams] = useState<string | null>(null);
  const toastShownRef = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setProviderParams(searchParams.get("provider"));
    }
  }, []);

  useEffect(() => {
    if (isMounted && session) {
      if (providerParams === "google" && !toastShownRef.current) {
        toast.success("Google successful login");
        toastShownRef.current = true;
      }
      if (providerParams === "facebook" && !toastShownRef.current) {
        toast.success("Facebook successful login");
        toastShownRef.current = true;
      }
      if (providerParams === "credentials" && !toastShownRef.current) {
        toast.success("Credentials successful login");
        toastShownRef.current = true;
      }
    }
  }, [isMounted, providerParams, session]);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
    if (session?.user.isNewUser) {
      router.push("/create-profile");
    }
    setIsMounted(true);
  }, [session, status, router]);

  useEffect(() => {
    const getUser = async () => {
      const response = await fetch(`/api/user/profile/${session?.user.email}`);
      const data = await response.json();
      setUser(data);
    };
    if (session?.user.email) getUser();
  }, [session?.user.email]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    session?.user.isNewUser === false && (
      <div className="relative bg-gray-100">
        <Navbar />
        <div className="flex">
          <div
            className={`fixed inset-y-0 left-0 w-32 transform bg-gray-800 text-white sm:w-48 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } transition-transform duration-300 ease-in-out`}
          >
            <div className="p-4">
              <h2 className="pt-20 text-2xl font-bold">Sidebar</h2>
              {/* Add sidebar items here */}
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
                <li>Item 3</li>
              </ul>
            </div>
          </div>
          <div
            className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-32 sm:ml-48" : "ml-0"}`}
          >
            <main className="p-6 pt-24">
              <button
                onClick={toggleSidebar}
                className="mb-4 rounded bg-blue-500 px-4 py-2 text-white"
              >
                Toggle Sidebar
              </button>
              <h1 className="mb-4 text-2xl font-bold">
                Welcome to your dashboard{" "}
                <span className="text-3xl text-red-600">{user?.nickname}</span>
              </h1>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link href="/pods-mapping">
                  <div className="block rounded-lg bg-blue-500 p-4 text-white shadow-lg transition duration-200 ease-in-out hover:bg-blue-600">
                    <div className="flex items-center">
                      <div className="mr-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8c1.104.002 2.162-.43 2.95-1.2A4.146 4.146 0 0016 4.5 4.144 4.144 0 0012 3a4.143 4.143 0 00-4 1.5A4.146 4.146 0 007.05 6.8C6.267 7.57 5.209 8 4.5 8m7.5 4v4m-3-4v4m6-4v4M12 4v1M6.27 10H4.13a1.121 1.121 0 00-1.13 1.1V19a1.1 1.1 0 001.1 1.1h15.74a1.1 1.1 0 001.1-1.1v-7.9a1.1 1.1 0 00-1.1-1.1h-2.14M7.5 16h.01M12 16h.01M16.5 16h.01"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="mb-1 text-lg font-semibold">
                          Pods Mapping
                        </h2>
                        <p className="text-sm text-gray-200">
                          Check the availability and contents of each pod.
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
                <Link href="/memberpage">
                  <div className="block rounded-lg bg-green-500 p-4 text-white shadow-lg transition duration-200 ease-in-out hover:bg-green-600">
                    <div className="flex items-center">
                      <div className="mr-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8c1.104.002 2.162-.43 2.95-1.2A4.146 4.146 0 0016 4.5 4.144 4.144 0 0012 3a4.143 4.143 0 00-4 1.5A4.146 4.146 0 007.05 6.8C6.267 7.57 5.209 8 4.5 8m7.5 4v4m-3-4v4m6-4v4M12 4v1M6.27 10H4.13a1.121 1.121 0 00-1.13 1.1V19a1.1 1.1 0 001.1 1.1h15.74a1.1 1.1 0 001.1-1.1v-7.9a1.1 1.1 0 00-1.1-1.1h-2.14M7.5 16h.01M12 16h.01M16.5 16h.01"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="mb-1 text-lg font-semibold">
                          Member View
                        </h2>
                        <p className="text-sm text-gray-200">View and edit details of ActFast employees.</p>
                      </div>
                    </div>
                  </div>
                </Link>
                <Link href="/projectspage">
                  <div className="block rounded-lg bg-purple-500 p-4 text-white shadow-lg transition duration-200 ease-in-out hover:bg-purple-600">
                    <div className="flex items-center">
                      <div className="mr-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8c1.104.002 2.162-.43 2.95-1.2A4.146 4.146 0 0016 4.5 4.144 4.144 0 0012 3a4.143 4.143 0 00-4 1.5A4.146 4.146 0 007.05 6.8C6.267 7.57 5.209 8 4.5 8m7.5 4v4m-3-4v4m6-4v4M12 4v1M6.27 10H4.13a1.121 1.121 0 00-1.13 1.1V19a1.1 1.1 0 001.1 1.1h15.74a1.1 1.1 0 001.1-1.1v-7.9a1.1 1.1 0 00-1.1-1.1h-2.14M7.5 16h.01M12 16h.01M16.5 16h.01"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="mb-1 text-lg font-semibold">
                          Project Details
                        </h2>
                        <p className="text-sm text-gray-200">Create, Edit, View ActFast projects.</p>
                      </div>
                    </div>
                  </div>
                </Link>
                <Link href="/contentspage">
                  <div className="block rounded-lg bg-yellow-500 p-4 text-white shadow-lg transition duration-200 ease-in-out hover:bg-yellow-600">
                    <div className="flex items-center">
                      <div className="mr-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8c1.104.002 2.162-.43 2.95-1.2A4.146 4.146 0 0016 4.5 4.144 4.144 0 0012 3a4.143 4.143 0 00-4 1.5A4.146 4.146 0 007.05 6.8C6.267 7.57 5.209 8 4.5 8m7.5 4v4m-3-4v4m6-4v4M12 4v1M6.27 10H4.13a1.121 1.121 0 00-1.13 1.1V19a1.1 1.1 0 001.1 1.1h15.74a1.1 1.1 0 001.1-1.1v-7.9a1.1 1.1 0 00-1.1-1.1h-2.14M7.5 16h.01M12 16h.01M16.5 16h.01"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="mb-1 text-lg font-semibold">
                          Contents Management
                        </h2>
                        <p className="text-sm text-gray-200">Create, Edit, Search, Delete Contents for ActFast clients.</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  );
}
