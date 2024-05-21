"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserProps } from "@/app/libs/interfaces";
import toast from "react-hot-toast";
import { useMode } from "@/app/context/ModeContext";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserProps | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);
  const [providerParams, setProviderParams] = useState<string | null>(null);
  const toastShownRef = useRef(false);

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

  return (
    session?.user.isNewUser === false && (
      <main>
        Welcome to Dashboard
        <a className='text-blue-500 hover:cursor-pointer' onClick={() => signOut()}>
          {" "}Sign Out
        </a>
      </main>
    )
  );
}
