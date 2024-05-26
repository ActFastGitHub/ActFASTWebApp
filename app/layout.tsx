import "./globals.css";
import 'swiper/css';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Provider from "@/app/context/AuthContext";
import ToasterContext from "@/app/context/ToasterConster";
import { ModeProvider } from "@/app/context/ModeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "ActFAST WebApp",
	description: "ActFAST is a restoration and repairs company specializing in flood, mold, and fire insurance claims."
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={inter.className}>
				<Provider>
					<ToasterContext />
					<ModeProvider>{children}</ModeProvider>
				</Provider>
			</body>
		</html>
	);
}
