import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { FaEye, FaEyeSlash } from "react-icons/fa";  // Fa = Font Awesome

interface ModalProps {
  showModal: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ showModal, onClose }) => {
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);      // toggle visibility
  const router = useRouter();

  const handleAccessCodeSubmit = () => {
    if (accessCode === process.env.NEXT_PUBLIC_ACTFAST_ACCESS_CODE) {
      setCookie("accessCode", accessCode, { path: "/", maxAge: 7 * 24 * 60 * 60 });
      localStorage.setItem("accessCode", accessCode);
      router.push("/login");
    } else {
      setError("Invalid access code. Please try again.");
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAccessCodeSubmit();
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center text-black">
      <div className="fixed inset-0 bg-black opacity-50" />
      <div className="relative mx-auto w-11/12 max-w-md rounded bg-white p-8 text-center shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          {/* Close icon */}
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="mb-4 text-2xl font-bold">
          Please enter Employee Access Code
        </h2>

        <div className="relative mb-4 w-full">
          <input
            type={show ? "text" : "password"}
            value={accessCode}
            onChange={(e) => {
              setAccessCode(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="Access Code"
            className="w-full rounded border p-2 pr-10"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
            aria-label={show ? "Hide access code" : "Show access code"}
          >
            {show ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        </div>

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

