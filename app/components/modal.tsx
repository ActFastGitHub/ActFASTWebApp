"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";

interface ModalProps {
  showModal: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ showModal, onClose }) => {
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  /* single source of truth for submit logic */
  const handleAccessCodeSubmit = () => {
    if (accessCode === process.env.NEXT_PUBLIC_ACTFAST_ACCESS_CODE) {
      setCookie("accessCode", accessCode, {
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
      localStorage.setItem("accessCode", accessCode);
      router.push("/login");
    } else {
      setError("Invalid access code. Please try again.");
    }
  };

  /* submit on ⏎ press */
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // stop form-submit/default beep
      handleAccessCodeSubmit();
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-50" />
      <div className="relative mx-auto w-11/12 max-w-md rounded bg-white p-8 text-center shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="mb-4 text-2xl font-bold">
          Please enter Employee Access Code
        </h2>

        {/* input listens for ⏎ */}
        <input
          type="password"
          value={accessCode}
          onChange={(e) => {
            setAccessCode(e.target.value);
            if (error) setError(""); // clear old errors on edit
          }}
          onKeyDown={handleKeyDown}
          placeholder="Access Code"
          className="mb-4 w-full rounded border p-2"
        />

        {error && <p className="mb-4 text-red-500">{error}</p>}

        <button
          onClick={handleAccessCodeSubmit}
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default Modal;
