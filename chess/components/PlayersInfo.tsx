import { Clock10, User } from "lucide-react";
import Clock from "@/components/Clock";

type Props = {
    whiteUsername: string,
    blackUsername: string,
    whiteTime: number,
    blackTime: number,
    orientation: 'white' | 'black'
}

export default function PlayersInfo({ whiteUsername, blackUsername, whiteTime, blackTime, orientation }: Props) {
    return (
        <>
            {/* Player Info Section */}
            {/* Width is 100% on mobile, 400px on large screens */}
            <div className="border w-full lg:w-[400px] h-auto lg:h-[40vh] p-4 rounded-lg flex flex-row lg:flex-col justify-around items-center lg:items-stretch">
                {/* Opponent */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 lg:gap-4">
                        <User fill={orientation === "white" ? "black" : "white"} />
                        <span className="text-lg lg:text-xl font-bold">{orientation === 'white'? blackUsername : whiteUsername}</span>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4">
                        <Clock10 size={20} />
                        <Clock timeMs={orientation === "white" ? blackTime : whiteTime} />
                    </div>
                </div>

                <div className="hidden lg:flex justify-center">
                    <h1 className="font-bold">VS</h1>
                </div>

                {/* Me */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 lg:gap-4">
                        <User size={25} fill={orientation === "white" ? "white" : "black"} />
                        <span className="text-lg lg:text-xl font-bold">{orientation === 'white'? whiteUsername : blackUsername}</span>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4">
                        <Clock10 size={25} />
                        <Clock timeMs={orientation === "white" ? whiteTime : blackTime} />
                    </div>
                </div>
            </div>
        </>
    )
}
