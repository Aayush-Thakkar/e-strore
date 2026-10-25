import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#EADBCE]">
      {/* Top Heritage Notice Bar */}
      <div className="bg-[#54151C] text-[#F4E5BD] text-xs py-2 px-4 text-center tracking-wider flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
        <span>Authentic Sarees, Suits, Lehengas & Indo-Western • Direct Atelier Inquiries</span>
        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center sm:justify-between h-20 sm:h-22">
          {/* Brand Logo & Typography */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-[#D4AF37]/50 shadow-sm group-hover:scale-105 transition-all duration-300 bg-[#FDFBF7] flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Anandam - Royal Sarees, Suits, Lehenga, Indo-Western"
                fill
                priority
                className="object-contain p-0.5"
              />
            </div>
            <div className="text-left">
              <span className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-wider text-[#722F37] block leading-none">
                ANANDAM
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#B8860B] font-semibold block mt-1.5">
                Sarees • Suits • Lehenga • Indo-Western
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
