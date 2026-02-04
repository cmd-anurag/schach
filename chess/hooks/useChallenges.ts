import { ChallengeContext } from "@/context/ChallengeContext";
import { useContext } from "react";

export function useChallenges() {
    const context = useContext(ChallengeContext);
    if(!context) {
        throw new Error('did you forget to wrap the app with provider');
    };
    return context;
}