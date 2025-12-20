import {create} from 'zustand';

type MoveStore = {
    moves: string[],
    setMoves: (moves: string[]) => void,
    addMove: (move: string) => void,
    reset: () => void,
};

export const useMoveStore = create<MoveStore>((set) => ({
  moves: [],

  setMoves: (moves) => set({ moves }),

  addMove: (move) =>

    set((state) => ({
      moves: [...state.moves, move],
    })),
    

  reset: () => set({ moves: [] }),
}));