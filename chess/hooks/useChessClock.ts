import { useCallback, useEffect, useRef, useState } from "react";

type Color = "white" | "black";

type SyncPayload = {
  whiteMs: number;
  blackMs: number;
  turnStartedAt: number;
  serverNow: number,
  turn: Color;
};

export function useChessClock() {
  // authoritative values from server
  const baseWhite = useRef(0);
  const baseBlack = useRef(0);
  const turnStartedAt = useRef(0);
  const turnRef = useRef<Color>("white");
  const serverOffset = useRef(0);

  // runtime flags
  const running = useRef(false);
  const timedOutRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // UI state
  const [whiteTime, setWhiteTime] = useState(0);
  const [blackTime, setBlackTime] = useState(0);
  const [timedOut, setTimedOut] = useState<Color | null>(null);

  const tick = useCallback(() => {
    if (!running.current) return;

    const adjustedNow = Date.now() + serverOffset.current;
    const elapsed = adjustedNow - turnStartedAt.current;

    let nextWhite = baseWhite.current;
    let nextBlack = baseBlack.current;

    if (turnRef.current === "white") {
      nextWhite = Math.max(0, baseWhite.current - elapsed);
    } else {
      nextBlack = Math.max(0, baseBlack.current - elapsed);
    }

    setWhiteTime(nextWhite);
    setBlackTime(nextBlack);

    if (!timedOutRef.current) {
      if (nextWhite === 0) {
        timedOutRef.current = true;
        setTimedOut("white");
      } else if (nextBlack === 0) {
        timedOutRef.current = true;
        setTimedOut("black");
      }
    }
  }, []);

  const start = useCallback(() => {
    if (running.current) return;

    running.current = true;

    tick();

    intervalRef.current = setInterval(tick, 200);
  }, [tick]);

  const stop = useCallback(() => {
    if (!running.current) return;

    const adjustedNow = Date.now() + serverOffset.current;
    const elapsed = adjustedNow - turnStartedAt.current;

    if (turnRef.current === "white") {
      baseWhite.current = Math.max(0, baseWhite.current - elapsed);
    } else {
      baseBlack.current = Math.max(0, baseBlack.current - elapsed);
    }

    setWhiteTime(baseWhite.current);
    setBlackTime(baseBlack.current);

    if (!timedOutRef.current) {
      if (baseWhite.current === 0) {
        timedOutRef.current = true;
        setTimedOut("white");
      } else if (baseBlack.current === 0) {
        timedOutRef.current = true;
        setTimedOut("black");
      }
    }

    running.current = false;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const sync = useCallback(
    (payload: SyncPayload) => {

      serverOffset.current = payload.serverNow - Date.now();

      baseWhite.current = payload.whiteMs;
      baseBlack.current = payload.blackMs;
      turnStartedAt.current = payload.turnStartedAt;
      turnRef.current = payload.turn;

      timedOutRef.current = false;
      setTimedOut(null);

      start();
    },
    [start]
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    whiteTime,
    blackTime,
    timedOut,
    sync,
    stop,
  };
}
