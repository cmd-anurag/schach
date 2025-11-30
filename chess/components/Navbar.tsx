import Link from "next/link"

export default function Navbar() {
  return (
    <div className="flex justify-around items-center py-5">
        <h1 className="font-bold text-4xl">
            Schach
        </h1>
        <div className="flex gap-5">
            <Link href='#'>Play</Link>
            <Link href='/lobby'>Lobby</Link>
            <Link href='#'>About</Link>
            <Link href='#'>Login</Link>
        </div>
    </div>
  )
}
