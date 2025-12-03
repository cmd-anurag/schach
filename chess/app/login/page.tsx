"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CircleAlert } from 'lucide-react';

export default function LoginPage() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const { login } = useAuth();

  const router = useRouter();

  async function handleLogin(e: any) {
    e.preventDefault();
    setProcessing(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message ?? "Login failed");
        setTimeout(() => {
          setError(null);
        }, 10000);
        return;
      }

      login(data.token, username);
      router.push("/lobby");
    } catch (error: any) {
      setError(error.message)
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="relative">
      <div className="absolute top-10 right-10">
        {error &&
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>{error}</AlertTitle>
            <AlertDescription>
              <p>Please verify your credentials and try again.</p>
              <ul className="list-inside list-disc text-sm">
                <li>Check your username for typos</li>
                <li>Ensure the password is correct</li>
                <li>If you dont have an account, register instead</li>
              </ul>
            </AlertDescription>
          </Alert>
        }
      </div>
      <div className="flex justify-center items-center h-screen">
        <div className="w-full max-w-md p-10 border border-gray-500 rounded-2xl">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <FieldDescription>
                  Enter your unique username.
                </FieldDescription>
                <Input autoComplete="off" value={username} onChange={(e) => setU(e.target.value)} id="username" type="text" placeholder="Max Leiter" />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
                <Input value={password} onChange={e => setP(e.target.value)} id="password" type="password" placeholder="••••••••" />
              </Field>
            </FieldGroup>
            <Button disabled={processing} className="cursor-pointer" onClick={handleLogin} variant={'default'}>{processing? 'Please Wait...' : 'Login'}</Button>
          </FieldSet>
        </div>
      </div>
    </div>
  );
}
