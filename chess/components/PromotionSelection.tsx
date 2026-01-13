import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { ChessBishop, ChessKnight, ChessQueen, ChessRook } from "lucide-react";


type Props = {
  open: boolean;
  anchorElement: HTMLElement | null;
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
  onCancel: () => void;
};

export default function PromotionSelection({
  open,
  anchorElement,
  onSelect,
  onCancel,
}: Props) {
  return (
    <Popover open={open} onOpenChange={(o) => !o && onCancel()}>
      {anchorElement && <PopoverAnchor virtualRef={{ current: anchorElement }} />}
      <PopoverContent className="p-3 flex items-center justify-between bg-white text-black">
        <button className="cursor-pointer" onClick={() => onSelect('q')}><ChessQueen size={56} /></button>
        <button className="cursor-pointer" onClick={() => onSelect('r')}><ChessRook size={56} /></button>
        <button className="cursor-pointer" onClick={() => onSelect('b')}><ChessBishop size={56} /></button>
        <button className="cursor-pointer" onClick={() => onSelect('n')}><ChessKnight size={56} /></button>
      </PopoverContent>
    </Popover>
  );
}
