// TODO - Investigate the time lag in production

import FinishedGame from "@/components/FinishedGame";

export default function Test() {
    const fen = "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2";

    const gameDetails = {
        timeControl: 5 * 60 * 1000,
        increment: 2 * 1000,
        finalPosition: fen,
        whiteUsername: 'anurag',
        blackUsername: 'john',
        reason: 'CheckMate!',
        startedAt: 1769843239281,
        endedAt: 1769843450923,
    }

  return (
    <div>
        {/* <FinishedGame gameDetails={{...gameDetails, winner: 'white', type: 'blitz'}} />     */}
    </div>
  )
}
