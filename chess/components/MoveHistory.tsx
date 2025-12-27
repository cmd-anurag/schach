type MoveHistoryProps = {
  moves: string[];
  currentIndex: number;
  onJump: (index: number) => void;
};

export default function MoveHistory({moves, currentIndex, onJump} : MoveHistoryProps) {
  
  return (
    <div className="p-4">
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