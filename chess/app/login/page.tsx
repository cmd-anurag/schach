"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CircleAlert, Loader2 } from "lucide-react";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import Particles from "@/components/reactbits/Particles";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const router = useRouter();
  const {refreshUser} = useAuth();

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Login failed");
        return;
      }
      // to make auth context re hit the api/me endpoint to check auth status. 
      await refreshUser();
      router.replace("/lobby");
    } catch {
      setError("Network error");
    } finally {
      setProcessing(false);
    }
  }


  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white selection:bg-blue-500/30">

      {/* --- 1. Background Layer (Same as Landing) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* --- 2. Error Toast/Alert --- */}
      <div className="absolute top-6 right-6 z-50 w-full max-w-sm px-4 md:px-0">
        {error && (
          <div className="animate-in slide-in-from-top-5 fade-in duration-300">
            <Alert variant="destructive" className="border-red-500/50 bg-red-950/50 text-red-200 backdrop-blur-md">
              <CircleAlert className="h-4 w-4" />
              <AlertTitle className="ml-2 font-bold text-white">Access Denied</AlertTitle>
              <AlertDescription className="ml-2 text-red-100/80">
                <p>{error}</p>
                <p className="mt-2 text-xs opacity-70">Check credentials or register.</p>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* --- 3. Content Layer --- */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">

        {/* Glass Container */}
        <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl md:p-10">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 shadow-inner">
              <Logo />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
            <p className="mt-2 text-sm text-white/40">Enter your credentials to access the lobby.</p>
          </div>

          <form onSubmit={handleLogin}>
            <FieldSet className="space-y-6">
              <FieldGroup className="space-y-4">

                {/* Username Field */}
                <Field>
                  <FieldLabel htmlFor="username" className="text-sm font-medium text-white/80">Username</FieldLabel>
                  <Input
                    autoComplete="off"
                    value={username}
                    onChange={(e) => setU(e.target.value)}
                    id="username"
                    type="text"
                    placeholder="Grandmaster"
                    className="mt-1.5 h-12 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/20 hover:border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </Field>

                {/* Password Field */}
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password" className="text-sm font-medium text-white/80">Password</FieldLabel>
                  </div>
                  <Input
                    value={password}
                    onChange={e => setP(e.target.value)}
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="mt-1.5 h-12 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/20 hover:border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                  <FieldDescription className="mt-1.5 text-xs text-white/40">
                    Must be at least 8 characters long.
                  </FieldDescription>
                </Field>

              </FieldGroup>

              {/* Submit Button */}
              <Button
                disabled={processing}
                onClick={handleLogin}
                className="group relative h-12 w-full overflow-hidden rounded-xl bg-white text-black font-semibold transition-all hover:bg-blue-50 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Log In</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              </Button>
            </FieldSet>
          </form>
          <div className="mt-8 text-center text-sm text-white/40">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-blue-400 hover:text-blue-300 hover:underline">
              Create one now
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}