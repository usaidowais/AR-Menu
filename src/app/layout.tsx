import type { Metadata } from "next";
import { Inter, Playfair_Display, Manrope, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-manrope" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-hanken" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "VisionDine — AR Menu Platform for Restaurants",
  description:
    "Transform your restaurant menu into an immersive 3D AR experience. VisionDine is a web-native platform that helps restaurants boost conversions with a single QR scan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} ${manrope.variable} ${hanken.variable} ${jetbrains.variable} font-sans antialiased bg-[#fbf9f8]`}
      >
        {children}
      </body>
    </html>
  );
}
