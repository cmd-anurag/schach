import { Clock10, User } from "lucide-react";
import Clock from "@/components/Clock";

type Props = {
    myUsername: string,
    oppUsername: string,
    whiteTime: number,
    blackTime: number,
    myColor: 'white' | 'black'
}

export default function PlayersInfo({ myUsername, oppUsername, whiteTime, blackTime, myColor }: Props) {
    return (
        <>
            {/* Player Info Section */}
            {/* Width is 100% on mobile, 400px on large screens */}
            <div className="border w-full lg:w-[400px] h-auto lg:h-[40vh] p-4 rounded-lg flex flex-row lg:flex-col justify-around items-center lg:items-stretch">
                {/* Opponent */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 lg:gap-4">
                        <User fill={myColor === "white" ? "black" : "white"} />
                        <span className="text-lg lg:text-xl font-bold">{oppUsername}</span>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4">
                        <Clock10 size={20} />
                        <Clock timeMs={myColor === "white" ? blackTime : whiteTime} />
                    </div>
                </div>

                <div className="hidden lg:flex justify-center">
                    <h1 className="font-bold">VS</h1>
                </div>

                {/* Me */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 lg:gap-4">
                        <User size={25} fill={myColor === "white" ? "white" : "black"} />
                        <span className="text-lg lg:text-xl font-bold">{myUsername}</span>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4">
                        <Clock10 size={25} />
                        <Clock timeMs={myColor === "white" ? whiteTime : blackTime} />
                    </div>
                </div>
            </div>
        </>
    )
}
