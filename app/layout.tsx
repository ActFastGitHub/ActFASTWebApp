import "./globals.css";
import "swiper/css";

import { Inter } from "next/font/google";
import Provider from "@/app/context/AuthContext";
import ToasterContext from "@/app/context/ToasterContext";
import { ModeProvider } from "@/app/context/ModeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ActFAST Restoration and Repairs | Surrey, Metro Vancouver, Okanagan",
  description:
    "ActFAST is a restoration and repairs company based in Surrey, Metro Vancouver, and the Okanagan region. We specialize in flood, mold, and fire insurance claims, serving communities across Kelowna, Vernon, and nearby cities.",
  robots: "index, follow",
  keywords:
    "Restoration, Repairs, Flood Damage, Mold Removal, Fire Damage, Insurance Claims, Surrey, Metro Vancouver, Okanagan, Kelowna, Vernon, Filipino Community",
  openGraph: {
    title: "ActFAST Restoration and Repairs | Surrey, Metro Vancouver, Okanagan",
    description:
      "ActFAST is a restoration and repairs company serving Surrey, Metro Vancouver, and the Okanagan region. Specializing in flood, mold, and fire insurance claims, we cater to a wide range of communities.",
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
