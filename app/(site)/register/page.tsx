"use client";

import { useState, FormEvent } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AFBuilding from "@/app/images/actfast-building.jpg";
import AFlogo from "@/app/images/actfast-logo.jpg";
import google from "@/app/images/googleIcon.svg";
import facebook from "@/app/images/facebookIcon.svg";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { handleEnterKeyPress } from "@/app/libs/actions";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Register() {
  const router = useRouter();
  const [disabled, setDisabled] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmpassword: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const registerUser = async (e: FormEvent) => {
    e.preventDefault();
    setDisabled(true);
    try {
      const response = await axios.post(`/api/register`, data);
      if (response.data.status !== 200) {
        toast.error(response.data.error || "An error occurred");
        setTimeout(() => setDisabled(false), 4000);
      } else {
        toast.success("Registration successful!");
        setTimeout(
          () =>
            toast.loading("Redirecting now to the login page...", {
              duration: 4000,
            }),
          1000
        );
        setTimeout(() => {
          toast.dismiss();
          router.push("/login");
        }, 2000);
      }
    } catch {
      toast.error("An error occurred");
      setTimeout(() => setDisabled(false), 4000);
    }
  };

  const loginWithFacebook = () => {
    signIn("facebook", {
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?provider=facebook`,
    })
      .then(() =>
        toast.loading("Signing in using your Facebook account...", {
          duration: 4000,
        })
      )
      .catch(() => toast.error("Something went wrong"));
  };

  const loginWithGoogle = () => {
    toast.loading("Signing in...", { duration: 4000 });
    setTimeout(
      () =>
        toast.loading("Redirecting to Google Sign up", { duration: 4000 }),
      4000
    );
    setTimeout(() => {
      signIn("google", {
        callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?provider=google`,
      });
    }, 4000);
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      {/* Left: form */}
      <div className="flex w-full md:w-1/2 justify-center items-center p-4">
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

          <h1 className="text-3xl font-bold mb-2 mt-4 text-center">
            Welcome to{" "}
            <span className="text-4xl text-red-600 italic">ActFAST</span>{" "}
            Registration Portal
          </h1>

          <form
            className="flex flex-col mt-4"
            onKeyDown={(e) =>
              handleEnterKeyPress(e, registerUser, disabled, setDisabled)
            }
          >
            <input
              type="text"
              placeholder="Name"
              className="border-2 border-gray-300 h-[45px] rounded-md pl-4"
              value={data.name}
              onChange={(e) =>
                setData((p) => ({ ...p, name: e.target.value }))
              }
            />

            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              className="border-2 border-gray-300 h-[45px] rounded-md pl-4 mt-4"
              value={data.email}
              onChange={(e) =>
                setData((p) => ({ ...p, email: e.target.value }))
              }
            />

            {/* Password with toggle */}
            <div className="relative mt-4">
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                className="border-2 border-gray-300 h-[45px] w-full rounded-md pl-4 pr-10"
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

            {/* Confirm password with toggle */}
            <div className="relative mt-4">
              <input
                type={showConfirmPwd ? "text" : "password"}
                placeholder="Confirm Password"
                className="border-2 border-gray-300 h-[45px] w-full rounded-md pl-4 pr-10"
                value={data.confirmpassword}
                onChange={(e) =>
                  setData((p) => ({ ...p, confirmpassword: e.target.value }))
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPwd((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                aria-label={
                  showConfirmPwd ? "Hide confirm password" : "Show confirm password"
                }
              >
                {showConfirmPwd ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <button
              className={`mt-4 h-[45px] rounded font-bold text-white transition ${
                disabled
                  ? "bg-blue-500 opacity-50 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-white hover:text-blue-500 hover:border-2 border-blue-500"
              }`}
              onClick={registerUser}
              disabled={disabled}
            >
              Sign up
            </button>
          </form>

          {/* OR divider */}
          <div className="inline-flex items-center w-full my-8">
            <hr className="w-full h-px bg-gray-200 border-0" />
            <span className="mx-4 text-[12px] text-gray-900 bg-white">
              OR
            </span>
            <hr className="w-full h-px bg-gray-200 border-0" />
          </div>

          {/* Social buttons */}
          <button
            className="flex h-[45px] w-full items-center justify-center gap-2 rounded border-2 bg-white font-bold hover:opacity-80"
            onClick={loginWithGoogle}
          >
            <Image src={google} alt="google" className="h-5 w-5" />
            Sign in with Google
          </button>

          <button
            className="mt-4 flex h-[45px] w-full items-center justify-center gap-2 rounded bg-blue-500 text-white font-bold hover:bg-blue-600"
            onClick={loginWithFacebook}
          >
            <Image src={facebook} alt="facebook" className="h-5 w-5" />
            Sign in with Facebook
          </button>

          <Link href="/login" className="mt-4 block text-[12px] text-blue-600">
            Already have an account? Sign in
          </Link>
        </div>
      </div>

      {/* Right: image */}
      <div className="hidden md:block md:w-1/2">
        <Image
          src={AFBuilding}
          alt="ActFAST building"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
