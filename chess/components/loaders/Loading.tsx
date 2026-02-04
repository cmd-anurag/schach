import { ChessKnight, ChessPawn, ChessRook } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
      {/* Container for the pieces */}
      <div className="flex items-end gap-2">
        
        {/* White Pawn */}
        <div className="w-8 h-8 md:w-12 md:h-12 animate-bounce [animation-delay:-0.3s]">
          <ChessPawn fill="black" size={48} />
        </div>

        {/* Black Knight */}
        <div className="w-8 h-8 md:w-12 md:h-12 animate-bounce [animation-delay:-0.15s]">
          <ChessKnight fill="white" size={48} />
        </div>

        {/* White Rook */}
        <div className="w-8 h-8 md:w-12 md:h-12 animate-bounce">
          <ChessRook fill="black" size={48} />
        </div>
      </div>
      
      {/* Loading Text */}
      <div className="text-neutral-400 font-mono text-sm tracking-widest animate-pulse uppercase">
        Please wait...
      </div>
    </div>
  )
}