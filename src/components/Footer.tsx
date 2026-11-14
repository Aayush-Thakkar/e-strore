import Image from "next/image";
import Link from "next/link";
import { Sparkles, ShieldCheck, Phone, Mail, MessageCircle } from "lucide-react";

export function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_SHOP_WHATSAPP_NUMBER || "919039035056";

  return (
    <footer className="bg-[#241416] text-[#F4E5BD] border-t border-[#D4AF37]/30 mt-auto">
      {/* Top Heritage Ribbon */}
      <div className="border-b border-[#D4AF37]/20 py-8 bg-[#1B0E10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#722F37] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-serif-luxury font-bold text-sm text-[#FDFBF7]">Certified Pure Handlooms</h5>
              <p className="text-xs text-[#EADBCE]/70">Silk Mark Certified authentic natural fabrics</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#722F37] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-serif-luxury font-bold text-sm text-[#FDFBF7]">Master Artisan Weaves</h5>
              <p className="text-xs text-[#EADBCE]/70">Handcrafted Sarees, Suits, Lehengas & Indo-Western</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#722F37] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-serif-luxury font-bold text-sm text-[#FDFBF7]">Direct WhatsApp Concierge</h5>
              <p className="text-xs text-[#EADBCE]/70">Immediate assistance, sizing & custom orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="आनंदम"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-serif-luxury text-xl font-bold tracking-wide text-[#F4E5BD] block leading-tight">
                आनंदम
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-tight sm:tracking-widest text-[#D4AF37] block mt-0.5 whitespace-nowrap">
                Suit • Saree • Lehenga • Indo-Western
              </span>
            </div>
          </div>
          <p className="text-xs text-[#EADBCE]/80 leading-relaxed">
            Where Affordability Meets Premiumness. Based in Raipur C.G India, Anandam is a trusted destination for curated suits, sarees, lehengas, and Indo-Western wear with boutique quality, transparent service, and reliable doorstep delivery.
          </p>
        </div>

        {/* Collections */}
        <div>
          <h4 className="font-serif-luxury text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-3">
            Collections
          </h4>
          <ul className="space-y-2 text-xs text-[#EADBCE]/80">
            <li><Link href="/?type=Suit" className="hover:text-white transition-colors">Suits</Link></li>
            <li><Link href="/?type=Saree" className="hover:text-white transition-colors">Sarees</Link></li>
            <li><Link href="/?type=Lehenga" className="hover:text-white transition-colors">Lehengas</Link></li>
            <li><Link href="/?type=Indo-Western" className="hover:text-white transition-colors">Indo-Western</Link></li>
            <li><Link href="/?type=Gown" className="hover:text-white transition-colors">Gowns</Link></li>
            <li className="pt-2">
              <Link href="/privacy-policy" className="text-[#D4AF37] hover:underline font-semibold transition-colors">
                DPDP Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div>
          <h4 className="font-serif-luxury text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-3">
            Contact Information
          </h4>
          <ul className="space-y-2.5 text-xs text-[#EADBCE]/80">
            <li>
              <a
                href="tel:9039035056"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>📞 9039035056</span>
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/919039035056"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-white transition-colors group"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-medium underline underline-offset-4 decoration-[#D4AF37]/50 group-hover:decoration-white">
                  Connect to WhatsApp
                </span>
              </a>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="leading-relaxed">📍 Pandri Textile Market, Gate No 1 (Second Left), Raipur C.G</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <span>Email: [Email Placeholder]</span>
            </li>
            <li className="flex items-center gap-2 pt-1 border-t border-[#D4AF37]/20">
              <span className="text-[#D4AF37] font-medium">GST Number:</span>
              <span>[GST Number Placeholder]</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar with DPDP Privacy Policy Link */}
      <div className="border-t border-[#D4AF37]/20 py-4 px-4 text-center text-[11px] text-[#EADBCE]/60 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <span>© {new Date().getFullYear()} Anandam Sarees. All designs and images protected.</span>
        <span className="hidden sm:inline text-stone-500">•</span>
        <Link href="/privacy-policy" className="text-[#EADBCE]/80 hover:text-white underline transition-colors">
          DPDP Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
