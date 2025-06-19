"use client";

import React, { useEffect } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import toast from "react-hot-toast";

const textVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function ContactUsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const controls = useAnimation();

  React.useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  const [form, setForm] = React.useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    category: "General Inquiry",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      toast.error("Full Name is required.");
      return;
    }
    if (!form.phoneNumber.trim()) {
      toast.error("Phone Number is required.");
      return;
    }
    if (!form.message.trim()) {
      toast.error("Message is required.");
      return;
    }

    const loadingToastId = toast.loading("Sending...");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      toast.dismiss(loadingToastId);

      if (res.ok) {
        toast.success("Message sent successfully!");
        setForm({
          fullName: "",
          phoneNumber: "",
          email: "",
          category: "General Inquiry",
          message: "",
        });
      } else {
        toast.error(data.error || "Failed to send message.");
      }
    } catch {
      toast.dismiss(loadingToastId);
      toast.error("Failed to send message.");
    }
  };

  return (
    <section
      ref={ref}
      className="bg-gray-900 px-6 py-16 text-white sm:px-12 md:px-24 lg:px-36"
      aria-label="Contact Us"
    >
      <motion.div
        initial="hidden"
        animate={controls}
        variants={textVariants}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-10 max-w-3xl text-center"
      >
        <h2 className="mb-2 text-4xl font-extrabold">Contact Us</h2>
        <p className="text-lg text-gray-300">
          Have questions or need a quote? Fill out the form below and we’ll get
          back to you promptly.
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial="hidden"
        animate={controls}
        variants={textVariants}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2"
        noValidate
      >
        {/* Full Name - required */}
        <label className="flex flex-col text-gray-200">
          <span className="inline-flex items-center space-x-1">
            <span>Full Name</span>
            <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Your full name"
            required
            className="mt-2 rounded border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700"
          />
        </label>

        {/* Phone Number */}
        <label className="flex flex-col text-gray-200">
          <span className="inline-flex items-center space-x-1">
            <span>Phone Number</span>
            <span className="text-red-500">*</span>
          </span>
          <input
            type="tel"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="Your phone number"
            required
            className="mt-2 rounded border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700"
          />
        </label>

        {/* Email */}
        <label className="flex flex-col text-gray-200">
          Email Address (optional)
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="mt-2 rounded border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700"
          />
        </label>

        {/* Category */}
        <label className="flex flex-col text-gray-200">
          Category
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="mt-2 rounded border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-700"
          >
            <option>General Inquiry</option>
            <option>Estimate</option>
            <option>Sub-con Inquiry</option>
            <option>Careers</option>
          </select>
        </label>

        {/* Message - full width */}
        <label className="flex flex-col text-gray-200 sm:col-span-2">
          <span className="inline-flex items-center space-x-1">
            <span>Message</span>
            <span className="text-red-500">*</span>
          </span>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Write your message here..."
            rows={5}
            required
            className="mt-2 resize-none rounded border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700"
          />
        </label>

        {/* Submit Button - full width */}
        <button
          type="submit"
          className="rounded bg-red-800 py-3 font-bold text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-700 sm:col-span-2"
        >
          Send Message
        </button>
      </motion.form>
    </section>
  );
}
