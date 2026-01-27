import Link from "next/link";
import Logo from "./Logo"
import Toolbar from "./Toolbar"
import { Caveat_Brush } from "next/font/google";

const caveatBrush = Caveat_Brush({
  weight: "400",
  subsets: ['latin'],
});

export default function Navbar() {
  return (
    <div className="flex flex-col md:flex-row md:justify-around items-center gap-4 p-4">
        <div className="font-bold flex items-center text-3xl md:text-5xl">
            <Logo />
            <span className={caveatBrush.className}>Schach</span>
        </div>
        <div className="flex gap-4 text-sm md:text-base">
          <Link href='/'>Home</Link>
          <Link href='/lobby'>Lobby</Link>
        </div>
        <Toolbar />
    </div>
  )
}
