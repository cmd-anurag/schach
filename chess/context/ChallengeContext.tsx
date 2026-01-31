"use client";
import  { createContext, Dispatch, ReactNode, useReducer } from "react";
import { ChallengeColor } from "@/types/socketEvents";

type IncomingChallenge = {
  fromUsername: string;
  color: ChallengeColor;
  time: number;
  increment: number;
};
export const ACTION = {
  ADD_CHALLANGE: "ADD_CHALLANGE",
  REMOVE_CHALLANGE: "REMOVE_CHALLANGE",
} as const;

type Action =
  | {
      type: typeof ACTION.ADD_CHALLANGE;
      payload: {
        challange: IncomingChallenge;
      };
    }
  | {
      type: typeof ACTION.REMOVE_CHALLANGE;
      payload: {
        challange: Pick<IncomingChallenge, "fromUsername">;
      };
    };

type contextType = {
  state: IncomingChallenge[];
  dispatch: Dispatch<Action>;
};
  export const ChallangeContext = createContext<contextType | null>(null);


const ChallangeContextProvider = ({ children }: { children: ReactNode }) => {
  const challangesReducer = (state: IncomingChallenge[], action: Action) => {
    switch (action.type) {
      case ACTION.ADD_CHALLANGE:
        return [...state, action.payload.challange];
      case ACTION.REMOVE_CHALLANGE:
        return state.filter(
          (chllanges) =>
            chllanges.fromUsername != action.payload.challange.fromUsername,
        );
      default:
        return state;
    }
  };

  const initialState: IncomingChallenge[] = [];
  const [state, dispatch] = useReducer(challangesReducer, initialState);


  return (
    <>
      <ChallangeContext.Provider value={{ state, dispatch }}>
        {children}
      </ChallangeContext.Provider>
    </>
  );
};

export default ChallangeContextProvider;
