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
    <div className="flex justify-around items-center">
        <div className="font-bold flex items-center text-5xl">
            <Logo />
            <span className={caveatBrush.className}>Schach</span>
        </div>
        <div className="flex gap-4">
          <Link href='/'>Home</Link>
          <Link href='/lobby'>Lobby</Link>
        </div>
        <Toolbar />
    </div>
  )
}
