import { useEffect, useRef, useState } from "react";

type Color = 'white' | 'black';
type SyncPayload = {
    whiteMs: number,
    blackMs: number,
    turn: Color,
}

export function useChessClock() {
    const [whiteTime, setWhiteTime] = useState(0);
    const [blackTime, setBlackTime] = useState(0);
    const [turn, setTurn] = useState<Color>('white'); // just in case if i need any ui update for the clock depending on turn
    const turnRef = useRef<Color>('white'); 

    const rafID = useRef<number | null>(null);
    const lastFrame = useRef<number>(0);
    const running = useRef(false);

    function tick(now: number) {
        if(!running.current) return;

        if(lastFrame.current !== 0) {
            const delta = now - lastFrame.current;

            if(turnRef.current === 'white') {
                setWhiteTime(t => Math.max(0, t - delta));
            } else {
                setBlackTime(t => Math.max(0, t - delta));
            }
        }

        lastFrame.current = now;
        rafID.current = requestAnimationFrame(tick);
    }

    function start() {
        if(running.current) return;

        running.current = true;
        lastFrame.current = 0;
        rafID.current = requestAnimationFrame(tick);
    }

    function pause() {
        running.current = false;
        lastFrame.current = 0;
        if(rafID.current !== null) {
            cancelAnimationFrame(rafID.current);
            rafID.current = null;
        }
    }

    function sync(payload: SyncPayload) {
        setWhiteTime(payload.whiteMs);
        setBlackTime(payload.blackMs);
        setTurn(payload.turn);
        turnRef.current = payload.turn;
        start();
    }

    useEffect(()=> {
        return ()=> {
            if(rafID.current !== null) {
                cancelAnimationFrame(rafID.current);
                rafID.current = null;
            }
        }
    }, []);

    return {
        whiteTime,
        blackTime,
        sync,
        pause,
    }
}