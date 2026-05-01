import Link from "next/link"
import { Music } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-[#4C1D95] p-12 text-white relative overflow-hidden">
        {/* Background decorative circle */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#5B21B6] rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#5B21B6] rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl opacity-50 pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-20 w-fit hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <Music size={18} className="text-white" />
            </div>
            <span className="font-display text-xl">BandFlow</span>
          </Link>

          <div className="max-w-lg">
            <h1 className="font-display text-5xl leading-tight mb-6">
              Музика — <br />
              твій бізнес. <br />
              Ми — платформа.
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Керуй бронюваннями, презентуй свій гурт та знаходь нових клієнтів — все в одному місці.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <p className="text-lg italic mb-6">
              "BandFlow повністю змінив спосіб роботи нашого гурту. Більше часу на музику, менше на адмін."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Music size={20} />
              </div>
              <div>
                <p className="font-bold">Velvet Storm</p>
                <p className="text-sm text-white/60">Рок-гурт, Київ</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-8">
            <div className="w-8 h-2 bg-white rounded-full" />
            <div className="w-2 h-2 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center bg-[#FDFCFB] p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
