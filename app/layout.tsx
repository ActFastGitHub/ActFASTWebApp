// import "./globals.css";
// import 'swiper/css';

// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import Provider from "@/app/context/AuthContext";
// import ToasterContext from "@/app/context/ToasterConster";
// import { ModeProvider } from "@/app/context/ModeContext";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
// 	title: "ActFAST Restoration and Repairs",
// 	description: "ActFAST is a restoration and repairs company specializing in flood, mold, and fire insurance claims."
// };

// export default function RootLayout({
// 	children
// }: Readonly<{
// 	children: React.ReactNode;
// }>) {
// 	return (
// 		<html lang='en'>
// 			<body className={inter.className}>
// 				<Provider>
// 					<ToasterContext />
// 					<ModeProvider>{children}</ModeProvider>
// 				</Provider>
// 			</body>
// 		</html>
// 	);
// }
import "./globals.css";
import "swiper/css";

import { Inter } from "next/font/google";
import Provider from "@/app/context/AuthContext";
import ToasterContext from "@/app/context/ToasterContext";
import { ModeProvider } from "@/app/context/ModeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ActFAST Restoration and Repairs | Surrey, Metro Vancouver",
  description:
    "ActFAST is a restoration and repairs company based in Surrey, covering the Metro Vancouver area. We specialize in flood, mold, and fire insurance claims, catering mainly to the Filipino community.",
  robots: "index, follow",
  keywords:
    "Restoration, Repairs, Flood Damage, Mold Removal, Fire Damage, Insurance Claims, Surrey, Metro Vancouver, Filipino Community",
  openGraph: {
    title: "ActFAST Restoration and Repairs",
    description:
      "ActFAST is a restoration and repairs company based in Surrey, covering the Metro Vancouver area. We specialize in flood, mold, and fire insurance claims.",
    url: "https://www.actfast.ca",
    type: "website",
    images: [
      {
        url: "/images/CompanyAssets/Logo/actfast-logo.jpg", // Image path in the public folder
        width: 800,
        height: 600,
        alt: "ActFAST Restoration and Repairs",
      },
    ],
  },
  alternates: {
    canonical: "https://www.actfast.ca",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-region="CA" data-subregion="BC">
      <body className={inter.className}>
        <Provider>
          <ToasterContext />
          <ModeProvider>{children}</ModeProvider>
        </Provider>
      </body>
    </html>
  );
}
