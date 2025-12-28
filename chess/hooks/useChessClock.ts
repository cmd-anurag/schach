import { useEffect, useRef, useState } from "react";

type Color = 'white' | 'black';
type SyncPayload = {
    whiteMs: number,
    blackMs: number,
    turnStartedAt: number,
    turn: Color,
}

export function useChessClock() {
    
    // these values are what the server thinks each color has left
    const baseWhite = useRef(0);
    const baseBlack = useRef(0);
    const turnStartedAt = useRef(0);

    // these are the values which will be displayed on UI derived from base values;
    const [whiteTime, setWhiteTime] = useState(0);
    const [blackTime, setBlackTime] = useState(0);

    const [turn, setTurn] = useState<Color>('white'); // just in case if i need any ui update for the clock depending on turn
    const turnRef = useRef<Color>('white'); 

    const [timedOut, setTimedOut] = useState<'white' | 'black' | null>(null);
    const timedOutRef = useRef(false); 

    const rafID = useRef<number | null>(null);
    const running = useRef(false);

    function tick() {
        if(!running.current) return;
        
        // its not called during render
        // eslint-disable-next-line react-hooks/purity
        const elapsed = Date.now() - turnStartedAt.current;

        let nextWhite = baseWhite.current;
        let nextBlack = baseBlack.current;

        if(turnRef.current === 'white') {
            nextWhite = Math.max(0, baseWhite.current - elapsed);
        } else {
            nextBlack = Math.max(0, baseBlack.current - elapsed);
        }

        setWhiteTime(nextWhite);
        setBlackTime(nextBlack);

        if(!timedOutRef.current) {
            if(nextWhite === 0) {
                timedOutRef.current = true;
                setTimedOut('white');
            } else if(nextBlack === 0) {
                timedOutRef.current = true;
                setTimedOut('black');
            }
        }
        rafID.current = requestAnimationFrame(tick);
    }

    function start() {
        if(running.current) return;

        running.current = true;
        rafID.current = requestAnimationFrame(tick);
    }

    function pause() {
        running.current = false;
        if(rafID.current !== null) {
            cancelAnimationFrame(rafID.current);
            rafID.current = null;
        }
    }

    function sync(payload: SyncPayload) {
        baseWhite.current = payload.whiteMs;
        baseBlack.current = payload.blackMs;
        turnStartedAt.current = payload.turnStartedAt;
        turnRef.current = payload.turn;

        setTimedOut(null);
        timedOutRef.current = false;

        setTurn(payload.turn);
        start();
    }

    useEffect(() => {
        return () => pause();
    }, []);


    return {
        whiteTime,
        blackTime,
        timedOut,
        sync,
        pause,
    }
}