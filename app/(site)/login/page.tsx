"use client";

import { useState, FormEvent, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import AFBuilding from "@/app/images/actfast-building.jpg";
import AFlogo from "@/app/images/actfast-logo.jpg";
import google from "@/app/images/googleIcon.svg";
import facebook from "@/app/images/facebookIcon.svg";
import { handleEnterKeyPress } from "@/app/libs/actions";
import Link from "next/link";
import { Suspense } from "react";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [disabled, setDisabled] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // Check if the session is still loading
    if (status === "loading") {
      return;
    }

    // If there is a session, redirect to the login page
    if (session) {
      if (session?.user.isNewUser) {
        router.replace("/create-profile");
      } else {
        if (session?.user.provider === "credentials") {
          router.push("/dashboard?provider=credentials");
        }
      }
    }

    // Handle errorParams
    const searchParams = new URLSearchParams(window.location.search);
    const errorParams = searchParams.get("error");

    if (errorParams) {
      toast.error(
        "Email already exists, please login using the provider you initially used to register",
      );
      router.replace("/login");
    }
  }, [session, status, router]);

  const loginWithFacebook = async () => {
    const response = signIn("facebook", {
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?provider=facebook`,
    });

    response
      .then(() => {
        toast.loading("Logging in using your facebook account...", {
          duration: 4000,
        });
      })
      .catch(() => {
        toast.error("Something went wrong");
      });
  };

  const loginWithGoogle = async () => {
    toast.loading("Logging in...", {
      duration: 4000,
    });

    setTimeout(() => {
      toast.loading("Redirecting to Google Sign up", {
        duration: 4000,
      });
    }, 4000);

    setTimeout(() => {
      const response = signIn("google", {
        callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?provider=google`,
      });

      response
        .then(() => {})
        .catch((error) => {
          toast.error("Something went wrong", error);
        });
    }, 4000);
  };

  const loginUser = async (e: FormEvent) => {
    setDisabled(true);
    e.preventDefault();

    toast.loading("Logging in...", {
      duration: 2000,
    });
    setTimeout(() => setDisabled(false), 5000);
    setTimeout(() => {
      signIn("credentials", {
        ...data,
        redirect: false,
      }).then((callback) => {
        if (callback?.error) {
          toast.error(callback.error);
        }
      });
    }, 2000);
  };

  return (
    <Suspense fallback={<>Loading...</>}>
      <div className="flex w-full">
        <div className="flex w-full items-center justify-center">
          <div className="flex w-full justify-center md:w-full md:max-w-full lg:w-1/2 xl:w-1/2">
            <div className="mt-4 flex w-full justify-center px-4">
              <div className="w-full max-w-[400px]">
                <div className="flex justify-center">
                  <Link href="/">
                    <img
                      src={AFlogo.src}
                      alt="Login"
                      className="block w-[250px] md:block"
                    />
                  </Link>
                </div>
                <h1 className="mb-2 mt-4 text-center text-3xl font-bold">
                  Welcome to{" "}
                  <span className="inline-block text-4xl italic text-red-600">
                    ActFAST
                  </span>{" "}
                  <span className="inline-block">Login Portal</span>
                </h1>
                <div
                  className="mt-4 flex min-w-full flex-col xl:w-[340px]"
                  onKeyDown={(e) =>
                    handleEnterKeyPress(e, loginUser, disabled, setDisabled)
                  }
                >
                  <input
                    className="h-[45px] rounded-md border-2 border-gray-300 pl-4"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email"
                    value={data.email}
                    onChange={(e) =>
                      setData({ ...data, email: e.target.value })
                    }
                  />
                  <input
                    className="mt-4 h-[45px] rounded-md border-2 border-gray-300 pl-4"
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    value={data.password}
                    onChange={(e) =>
                      setData({ ...data, password: e.target.value })
                    }
                  />
                  <a className="mt-4 text-[12px] text-blue-500" href="/forgot">
                    Forgot-password?
                  </a>
                  <button
                    className={`${
                      disabled
                        ? "mt-4 h-[45px] w-auto cursor-not-allowed rounded bg-blue-500 text-center font-bold text-white opacity-50"
                        : "mt-4 h-[45px] w-auto rounded bg-blue-500 text-center font-bold text-white duration-300 hover:border-[2px] hover:border-blue-500 hover:bg-white hover:text-blue-500 hover:ease-in-out"
                    }`}
                    onClick={loginUser}
                    disabled={disabled}
                  >
                    Sign in
                  </button>
                </div>

                <div className="inline-flex w-full items-center">
                  <hr className="my-8 h-px w-full border-0 bg-gray-200 bg-gray-700"></hr>
                  <span className="ml-4 mr-4 bg-white text-[12px] text-gray-900">
                    OR
                  </span>
                  <hr className="my-8 h-px w-full border-0 bg-gray-200 bg-gray-700"></hr>
                </div>
                <div className="flex flex-col">
                  <button
                    className="flex h-[45px] w-auto flex-row items-center justify-center rounded border-2 bg-white text-[12px] font-bold hover:opacity-80"
                    onClick={loginWithGoogle}
                  >
                    <Image
                      src={google}
                      alt="google"
                      className="mr-2 h-[20px] w-[20px]"
                    />
                    <p className="">Sign in with google</p>
                  </button>

                  <button
                    className="mb-2 mt-4 flex h-[45px] w-auto flex-row items-center justify-center rounded border-2 bg-blue-500 text-[12px] font-bold text-white hover:bg-blue-600"
                    onClick={loginWithFacebook}
                  >
                    <Image
                      src={facebook}
                      alt="google"
                      className="mr-2 h-[20px] w-[20px]"
                    />
                    <p className="">Sign in with Facebook</p>
                  </button>
                  <a className="text-[12px] text-blue-600" href="/register">
                    Dont have an account? Sign up
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="relative w-[0%] lg:w-1/2">
            <img
              src={AFBuilding.src}
              alt="Login"
              className="hidden h-screen w-screen object-cover md:block lg:block xl:block"
            />
          </div>
        </div>
      </div>
    </Suspense>
  );
}
