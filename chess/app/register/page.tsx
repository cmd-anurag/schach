"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [error, setError] = useState<string|null>(null);

  const router = useRouter();
  const {login} = useAuth();

  async function handleRegister(e: any) {
    e.preventDefault();

    const res = await fetch("/api/register", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if(!data.success){
      setError(data.message ?? "Register failed");
      return;
    }

    // NOW LOGIN AUTOMATICALLY

    const loginres = await fetch("/api/login", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ username, password })
    });

    const logindata = await loginres.json();

    login(logindata.token, username);
    router.push("/lobby");
  }

  return (
    <form onSubmit={handleRegister} style={{padding:40}}>
      <h2>Register</h2>

      <input placeholder="username"
        value={username}
        onChange={e=>setU(e.target.value)}
      /><br/>

      <input placeholder="password" type="password"
        value={password}
        onChange={e=>setP(e.target.value)}
      /><br/>

      <button>Register</button>

      {error && <p style={{color:"red"}}>{error}</p>}
    </form>
  );
}