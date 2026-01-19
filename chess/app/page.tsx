import Link from "next/link";
import { ArrowRight, } from "lucide-react";
import Particles from "@/components/reactbits/Particles";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white selection:bg-blue-500/30">

      {/* 1. Background Layer */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* 3. Content Layer */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">

        {/*Container */}
        <div className="group relative flex max-w-4xl flex-col items-center gap-6 rounded-[2rem] p-12 text-center transition-all duration-500 md:p-20">

          <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 shadow-inner">
            <Logo />
          </div>


          <div className="space-y-2">
            <h1 className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-5xl font-black tracking-tighter drop-shadow-sm md:text-6xl lg:text-7xl">
              Schach
            </h1>
            <p className="mx-auto max-w-md text-lg font-light text-blue-100/60 md:text-xl">
              Online Chess Multiplayer. <br className="hidden md:block" />
              
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">


            <Link
              href="/lobby"
              className="group/btn relative flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-white px-8 py-4 font-semibold text-black transition-all hover:scale-[1.02] hover:bg-blue-50 active:scale-95"
            >
              <span>Let&apos;s Play</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />


              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 group-hover/btn:translate-x-full" />
            </Link>


            <Link
              href="/register"
              className="group/btn flex items-center justify-center rounded-xl border border-white/20 bg-black/20 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 active:scale-95"
            >
              <span>Create Account</span>
            </Link>
          </div>

        </div>


        <p className="absolute bottom-8 text-xs font-medium tracking-widest text-white/20 uppercase">
          v1.0.0 &bull; Google En Passant!
        </p>
      </div>
    </main>
  );
}