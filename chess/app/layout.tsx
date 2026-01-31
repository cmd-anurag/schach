import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { Toaster } from "@/components/ui/sonner";
import { Preahvihear } from "next/font/google";
import ChallangeContextProvider from "@/context/ChallengeContext";

const preahvihear = Preahvihear({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Schach - Online Chess Multiplayer",
  description: "Chess Multiplayer Web App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="en">
      <body className={` ${preahvihear.className} antialiased`}>
        <ChallangeContextProvider>
          <AuthProvider>
            <SocketProvider>
              <main>{children}</main>
              <Toaster position="top-right" />
            </SocketProvider>
          </AuthProvider>
        </ChallangeContextProvider>
      </body>
    </html>
  );
}
