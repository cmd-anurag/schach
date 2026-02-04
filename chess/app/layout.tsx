import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { Toaster } from "@/components/ui/sonner";
import { Preahvihear } from "next/font/google";
import { ChallengeProvider } from "@/context/ChallengeContext";

const preahvihear = Preahvihear({
  weight: "400",
  subsets: ['latin']
})

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
      <body
        className={` ${preahvihear.className} antialiased`}
      >
        <AuthProvider>
          <SocketProvider>
            <ChallengeProvider>
              <main>
                {children}
              </main>
            </ChallengeProvider>
            <Toaster richColors />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
