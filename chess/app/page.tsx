import Navbar from "@/components/Navbar"
import LightPillar from "@/components/reactbits/LightPillar"

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <LightPillar
        topColor="blue"
        bottomColor="red"
          intensity={1.0}
          rotationSpeed={0.3}
          glowAmount={0.002}
          pillarWidth={3.0}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          pillarRotation={25}
          interactive={false}
          mixBlendMode="screen" />
      </div>

      <div className="relative z-10">
        <Navbar />
      </div>
    </div>
  )
}