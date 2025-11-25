"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initSocket, getSocket, sendChallenge, acceptChallenge, rejectChallenge } from "@/lib/gameClient";
import { getToken } from "@/lib/auth";

type IncomingChallenge = {
  fromUsername: string;
  color: "white" | "black" | "random";
};

export default function LobbyPage() {
  const router = useRouter();
  const [online, setOnline] = useState<string[]>([]);
  const [colorPref, setColorPref] = useState<"white" | "black" | "random">("random");
  const [incoming, setIncoming] = useState<IncomingChallenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    // init socket with token (safe to call multiple times)
    initSocket(token);

    const socket = getSocket();

    // handlers
    const onlineHandler = (list: string[]) => setOnline(list);
    const incomingHandler = (payload: any) => {
      // server sends: { fromUsername, color }
      setIncoming({
        fromUsername: payload.fromUsername,
        color: payload.color,
      });
    };
    const acceptedHandler = (payload: any) => {
      // server sends: { roomID, color, opponent }
      // navigate to play page where PlayPage will call joinRoom(roomID)
      if (payload?.roomID) {
        router.push(`/play?room=${payload.roomID}`);
      }
    };
    const rejectedHandler = (payload: any) => {
      // optional: show toast
      alert(`${payload?.by ?? "Opponent"} rejected the challenge`);
    };

    // register listeners
    socket.on("online-users", onlineHandler);
    socket.on("incoming-challenge", incomingHandler);
    socket.on("challenge-accepted", acceptedHandler);
    socket.on("challenge-rejected", rejectedHandler);

    // request current online list if server supports it
    // otherwise rely on server pushing online-users on connect
    socket.emit("request-online-users");

    setLoading(false);

    // cleanup
    return () => {
      try {
        socket.off("online-users", onlineHandler);
        socket.off("incoming-challenge", incomingHandler);
        socket.off("challenge-accepted", acceptedHandler);
        socket.off("challenge-rejected", rejectedHandler);
      } catch (_) {}
    };
  }, [router]);

  function getLocalUsername() {
    try {
      const t = getToken();
      if (!t) return null;
      const payload = JSON.parse(atob(t.split(".")[1]));
      return payload.username as string | null;
    } catch {
      return null;
    }
  }

  function handleSendChallenge(toUsername: string) {
    sendChallenge(toUsername, colorPref);
  }

  function handleAccept() {
    if (!incoming) return;
    acceptChallenge(incoming.fromUsername, incoming.color);
    setIncoming(null);
    // server will emit challenge-accepted -> we navigate in that handler
  }

  function handleReject() {
    if (!incoming) return;
    rejectChallenge(incoming.fromUsername);
    setIncoming(null);
  }

  const me = getLocalUsername();

  return (
    <div style={{ padding: 20 }}>
      <h2>Lobby</h2>
      {loading && <p>Connecting...</p>}

      <div style={{ marginTop: 12 }}>
        <label style={{ marginRight: 8 }}>Preferred color:</label>
        <select value={colorPref} onChange={(e) => setColorPref(e.target.value as any)}>
          <option value="random">Random</option>
          <option value="white">White</option>
          <option value="black">Black</option>
        </select>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Online players</h3>
        <ul>
          {online
            .filter((u) => u !== me)
            .map((u) => (
              <li key={u} style={{ marginBottom: 8 }}>
                {u}{" "}
                <button
                  onClick={() => handleSendChallenge(u)}
                  style={{ marginLeft: 8 }}
                >
                  Challenge
                </button>
              </li>
            ))}

          {online.length <= 1 && <li>No other players online</li>}
        </ul>
      </div>

      {incoming && (
        <div style={{ border: "1px solid #ccc", padding: 12, marginTop: 20 }}>
          <p>
            <strong>{incoming.fromUsername}</strong> challenged you{" "}
            {incoming.color !== "random" ? `as ${incoming.color}` : "(random)"}.
          </p>
          <button onClick={handleAccept}>Accept</button>
          <button onClick={handleReject} style={{ marginLeft: 8 }}>
            Reject
          </button>
        </div>
      )}
    </div>
  );
}