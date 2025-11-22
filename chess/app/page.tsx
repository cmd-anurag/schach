import Navbar from "@/components/Navbar"
import DarkVeil from "@/components/reactbits/DarkVeil"

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <DarkVeil />
      </div>

      <div className="relative z-10">
        <Navbar />
      </div>
    </div>
  )
}