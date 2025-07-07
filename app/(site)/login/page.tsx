"use client";

import { useState, FormEvent, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AFBuilding from "@/app/images/actfast-building.jpg";
import AFlogo from "@/app/images/actfast-logo.jpg";
import google from "@/app/images/googleIcon.svg";
import facebook from "@/app/images/facebookIcon.svg";
import { handleEnterKeyPress } from "@/app/libs/actions";
import Link from "next/link";
import { Suspense } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [disabled, setDisabled] = useState(false);
  const [data, setData] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (session) {
      if (session.user.isNewUser) router.replace("/create-profile");
      else if (session.user.provider === "credentials")
        router.push("/dashboard?provider=credentials");
    }
    const err = new URLSearchParams(window.location.search).get("error");
    if (err) {
      toast.error(
        "Email already exists, please login using the provider you initially used to register"
      );
      router.replace("/login");
    }
  }, [session, status, router]);

  const loginWithFacebook = () => {
    signIn("facebook", {
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?provider=facebook`,
    })
      .then(() =>
        toast.loading("Logging in using your Facebook account...", {
          duration: 4000,
        })
      )
      .catch(() => toast.error("Something went wrong"));
  };

  const loginWithGoogle = () => {
    toast.loading("Logging in...", { duration: 4000 });
    setTimeout(
      () =>
        toast.loading("Redirecting to Google sign-up...", { duration: 4000 }),
      4000
    );
    setTimeout(() => {
      signIn("google", {
        callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?provider=google`,
      }).catch(() => toast.error("Something went wrong"));
    }, 4000);
  };

  const loginUser = (e: FormEvent) => {
    e.preventDefault();
    setDisabled(true);
    toast.loading("Logging in...", { duration: 2000 });
    setTimeout(() => setDisabled(false), 5000);
    setTimeout(() => {
      signIn("credentials", { ...data, redirect: false }).then((cb) => {
        if (cb?.error) toast.error(cb.error);
      });
    }, 2000);
  };

  return (
    <Suspense fallback={<>Loading...</>}>
      <div className="flex flex-col md:flex-row w-full min-h-screen">
        {/* Left: form (100% mobile, 1/2 on md+) */}
        <div className="flex w-full md:w-1/2 items-center justify-center p-4">
          <div className="w-full max-w-[400px]">
            <div className="flex justify-center">
              <Link href="/">
                <img
                  src={AFlogo.src}
                  alt="ActFAST logo"
                  className="w-[250px]"
                />
              </Link>
            </div>

            <h1 className="mt-4 text-center text-3xl font-bold">
              Welcome to{" "}
              <span className="text-4xl italic text-red-600">ActFAST</span>{" "}
              Login Portal
            </h1>

            <form
              className="mt-6 flex flex-col"
              onKeyDown={(e) =>
                handleEnterKeyPress(e, loginUser, disabled, setDisabled)
              }
            >
              <input
                className="h-[45px] rounded-md border-2 border-gray-300 px-4"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email"
                value={data.email}
                onChange={(e) =>
                  setData((p) => ({ ...p, email: e.target.value }))
                }
              />

              <div className="relative mt-4">
                <input
                  className="h-[45px] w-full rounded-md border-2 border-gray-300 px-4 pr-10"
                  id="password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Password"
                  value={data.password}
                  onChange={(e) =>
                    setData((p) => ({ ...p, password: e.target.value }))
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>

              <Link
                href="/forgot"
                className="mt-2 text-[12px] text-blue-500"
              >
                Forgot-password?
              </Link>

              <button
                type="submit"
                className={`mt-4 h-[45px] rounded font-bold text-white transition ${
                  disabled
                    ? "bg-blue-500 opacity-50 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-white hover:text-blue-500 hover:border-2 border-blue-500"
                }`}
                onClick={loginUser}
                disabled={disabled}
              >
                Sign in
              </button>
            </form>

            <div className="my-8 flex items-center">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-4 text-[12px] text-gray-700">OR</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <button
              className="mb-4 flex h-[45px] w-full items-center justify-center gap-2 rounded border-2 bg-white font-bold hover:opacity-80"
              onClick={loginWithGoogle}
            >
              <Image src={google} alt="Google" className="h-5 w-5" />
              Sign in with Google
            </button>

            <button
              className="mb-4 flex h-[45px] w-full items-center justify-center gap-2 rounded bg-blue-500 text-white font-bold hover:bg-blue-600"
              onClick={loginWithFacebook}
            >
              <Image src={facebook} alt="Facebook" className="h-5 w-5" />
              Sign in with Facebook
            </button>

            <Link
              href="/register"
              className="text-[12px] text-blue-600"
            >
              Don’t have an account? Sign up
            </Link>
          </div>
        </div>

        {/* Right: image (hidden on mobile, shown 1/2 md+) */}
        <div className="hidden md:block md:w-1/2">
          <Image
            src={AFBuilding}
            alt="ActFAST building"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </Suspense>
  );
}
