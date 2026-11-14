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
          Authentic Sarees, Suits, Lehengas & Indo-Western • Direct Inquiries
        </span>
        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37] animate-pulse flex-shrink-0" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-2 sm:py-3">
          {/* Brand Logo, Title & Tagline Centered - Enlarged */}
          <Link href="/" className="flex items-center justify-center group" aria-label="आनन्दम Homepage">
            <div className="relative h-20 sm:h-24 md:h-28 lg:h-32 w-auto group-hover:scale-[1.02] transition-transform duration-300">
              <Image
                src="/brand-logo.png"
                alt="आनन्दम - Sarees • Suits • Lehenga • Indo-Western"
                width={940}
                height={378}
                priority
                className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto object-contain"
              />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
