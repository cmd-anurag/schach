import FinishedGame from "@/components/FinishedGame";

export default function Test() {
    const fen = "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2";

    const gameDetails = {
        finalPosition: fen,
        whiteUsername: 'anurag',
        blackUsername: 'john',
        reason: 'CheckMate!',
    }

  return (
    <div>
        <FinishedGame gameDetails={{...gameDetails, winner: 'white'}} />    
    </div>
  )
}
