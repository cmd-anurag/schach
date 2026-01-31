"use client";
import { ChallangeContext } from "@/context/ChallengeContext"
import { useContext } from "react"

const useChallangesContext = ()=>{
    const context = useContext(ChallangeContext);
    if(!context) throw new Error("Use challanges inside Valid component");
    return context;
}
export default useChallangesContext;