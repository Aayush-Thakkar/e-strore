import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#EADBCE]">
      {/* Top Heritage Notice Bar */}
      <div className="bg-[#54151C] text-[#F4E5BD] text-[10.5px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4 text-center tracking-normal sm:tracking-wider flex items-center justify-center gap-1.5 sm:gap-2">
        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37] animate-pulse flex-shrink-0" />
        <span className="truncate sm:overflow-visible">
          Authentic Sarees, Suits, Lehengas & Indo-Western • Direct Atelier Inquiries
        </span>
        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37] animate-pulse flex-shrink-0" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center sm:justify-between h-18 sm:h-22">
          {/* Brand Logo & Typography */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 group min-w-0">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-[#D4AF37]/50 shadow-sm group-hover:scale-105 transition-all duration-300 bg-[#FDFBF7] flex-shrink-0">
              <Image
                src="/logo.png"
                alt="आनन्दम् - Sarees, Suits, Lehenga, Indo-Western"
                fill
                priority
                className="object-contain p-0.5"
              />
            </div>
            <div className="text-left min-w-0">
              <span className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-wide text-[#722F37] block leading-none">
                आनन्दम्
              </span>
              <span className="text-[8.5px] xs:text-[9.5px] sm:text-[11px] uppercase tracking-tight sm:tracking-[0.2em] text-[#B8860B] font-semibold block mt-1 whitespace-nowrap">
                Sarees • Suits • Lehenga • Indo-Western
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
