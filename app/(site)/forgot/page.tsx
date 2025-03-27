"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      setLoading(false);
      if (res.ok) {
        toast.success("If that email exists, a reset link has been sent.");
        router.push("/login");
      } else {
        toast.error(data?.error || "An error occurred");
      }
    } catch (error) {
      setLoading(false);
      console.error("Forgot password error:", error);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleForgotPassword}
        className="w-full max-w-sm space-y-4 rounded bg-white p-6 shadow"
      >
        <h1 className="text-2xl font-semibold">Forgot Password</h1>
        <p className="text-gray-600">
          Enter your email address to receive a password reset link.
        </p>
        <input
          type="email"
          placeholder="Your email"
          className="w-full rounded border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-500 py-2 font-bold text-white hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
