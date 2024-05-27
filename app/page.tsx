"use client";

import React, { useState } from "react";
import Link from "next/link";

// Components
import HeroSection from "@/app/components/heroSection";
import ServicesSection from "@/app/components/servicesSection";
import AboutSection from "@/app/components/aboutSection";
import TestimonialsSection from "@/app/components/testimonialSection";
import Footer from "@/app/components/footer";
import Modal from "@/app/components/modal";

export default function Home() {
	const [showModal, setShowModal] = useState(false);

	const handlePortalClick = () => {
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
	};

	return (
		<div className='relative'>
			<div className={`${showModal ? "blur-sm" : ""}`}>
				<HeroSection onPortalClick={handlePortalClick} />
				<ServicesSection />
				<AboutSection />
				<TestimonialsSection />
				<Footer />
			</div>
			<Modal showModal={showModal} onClose={handleCloseModal} />
		</div>
	);
}
