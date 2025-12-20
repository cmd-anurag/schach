import { useMoveStore } from "@/lib/moveStore"

export default function MoveHistory() {
  const moves = useMoveStore((s) => s.moves);
  return (
    <div>
      {moves.map((move, index) => {
        const moveNumber = Math.floor(index / 2) + 1;
        const isWhite = index % 2 == 0;
        return (
          
          <span className={isWhite? 'mr-1' : 'mr-3'} key={index}>
              {isWhite && <i>{moveNumber}.</i>} {move}
          </span>
          
        )
      })}
    </div>
  )
}