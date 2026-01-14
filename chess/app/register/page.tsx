"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import LightPillar from "@/components/reactbits/LightPillar";
import { UserPlus, CircleAlert, Loader2 } from "lucide-react";

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

export default function RegisterPage() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message ?? "Registration failed");
      }

      const loginres = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const logindata = await loginres.json();
      
      if (!logindata.success) {
         router.push("/login?registered=true");
         return;
      }

      login(logindata.token, username);
      router.push("/lobby");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setProcessing(false);
    }
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white selection:bg-blue-500/30">
      
      {/* --- 1. Background Layer --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <LightPillar
          topColor="#3b82f6"
          bottomColor="#ec4899"
          intensity={1.0}
          rotationSpeed={0.3}
          glowAmount={0.002}
          pillarWidth={3.0}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          pillarRotation={25}
          interactive={false}
          mixBlendMode="screen"
        />
      </div>

      {/* --- 2. Error Toast --- */}
      <div className="absolute top-6 right-6 z-50 w-full max-w-sm px-4 md:px-0">
        {error && (
          <div className="animate-in slide-in-from-top-5 fade-in duration-300">
             <Alert variant="destructive" className="border-red-500/50 bg-red-950/50 text-red-200 backdrop-blur-md">
              <CircleAlert className="h-4 w-4" />
              <AlertTitle className="ml-2 font-bold text-white">Registration Error</AlertTitle>
              <AlertDescription className="ml-2 text-red-100/80">
                {error}
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
            <h1 className="text-3xl font-bold tracking-tight text-white">Join the Ranks</h1>
            <p className="mt-2 text-sm text-white/40">Create your account to start your journey.</p>
          </div>

          <form onSubmit={handleRegister}>
            <FieldSet className="space-y-6">
              <FieldGroup className="space-y-4">
                
                {/* Username */}
                <Field>
                  <FieldLabel htmlFor="username" className="text-sm font-medium text-white/80">Choose Username</FieldLabel>
                  <Input 
                    autoComplete="off" 
                    value={username} 
                    onChange={(e) => setU(e.target.value)} 
                    id="username" 
                    type="text" 
                    placeholder="Gary Kasparov"
                    className="mt-1.5 h-12 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/20 hover:border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </Field>

                {/* Password */}
                <Field>
                  <FieldLabel htmlFor="password" className="text-sm font-medium text-white/80">Choose Password</FieldLabel>
                  <Input 
                    value={password} 
                    onChange={e => setP(e.target.value)} 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="mt-1.5 h-12 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/20 hover:border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                  <FieldDescription className="mt-1.5 text-xs text-white/40">
                    We recommend a strong, unique password.
                  </FieldDescription>
                </Field>

              </FieldGroup>

              {/* Submit Button */}
              <Button 
                disabled={processing} 
                onClick={handleRegister} 
                className="group relative h-12 w-full overflow-hidden rounded-xl bg-white text-black font-semibold transition-all hover:bg-blue-50 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                    {processing ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Creating Account...</span>
                        </>
                    ) : (
                        <>
                            <span>Register & Play</span>
                            <UserPlus className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </div>
                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              </Button>
            </FieldSet>
          </form>

          {/* Footer / Login Link */}
          <div className="mt-8 text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-400 hover:text-blue-300 hover:underline">
              Log in instead
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}