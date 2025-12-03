"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [error, setError] = useState<string|null>(null);

  const {login} = useAuth();

  const router = useRouter();

  async function handleLogin(e:any) {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if(!data.success){
      setError(data.message ?? "Login failed");
      return;
    }

    login(data.token, username);
    router.push("/lobby");
  }

  return (
    <form onSubmit={handleLogin} style={{padding:40}}>
      <h2>Login</h2>

      <input placeholder="username"
        value={username}
        onChange={e=>setU(e.target.value)}
      /><br/>

      <input placeholder="password" type="password"
        value={password}
        onChange={e=>setP(e.target.value)}
      /><br/>

      <button>Login</button>

      {error && <p style={{color:"red"}}>{error}</p>}
    </form>
  );
}
