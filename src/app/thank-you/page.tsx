"use client";

import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Heart } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <Header />

      <main className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full bg-[#FFFFFF] rounded-3xl shadow-xl border border-[#D4AF37]/40 p-8 sm:p-12 text-center relative overflow-hidden space-y-6">
          {/* Subtle Royal Aura Background */}
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-[#722F37]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Logo Monogram */}
          <div className="relative w-20 h-20 mx-auto rounded-2xl overflow-hidden border border-[#D4AF37] bg-[#FDFBF7] shadow-md p-1">
            <Image
              src="/logo.png"
              alt="Anandam"
              fill
              className="object-contain p-1"
            />
          </div>

          {/* Golden Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-semibold bg-[#F8F3EA] text-[#722F37] border border-[#D4AF37]/50 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Inquiry Dispatched Successfully</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif-luxury text-2xl sm:text-4xl font-bold text-[#241416]">
              Thank You for Visiting Anandam
            </h1>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
              Your inquiry has been directed to our boutique concierge team on WhatsApp. We look forward to assisting you with your royal ethnic ensemble.
            </p>
          </div>

          {/* Assurance Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
            <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#EADBCE] flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#25D366] flex-shrink-0" />
              <span className="text-xs text-stone-700 font-medium">Prompt WhatsApp Response</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#EADBCE] flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <span className="text-xs text-stone-700 font-medium">100% Handloom Authenticity</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4 space-y-3">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#722F37] via-[#54151C] to-[#380E13] text-[#F4E5BD] font-semibold text-sm hover:shadow-lg transition-all active:scale-[0.99] border border-[#D4AF37]/50 group"
            >
              <span>Explore More Creations</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-[11px] text-stone-500 flex items-center justify-center gap-1">
              <Heart className="w-3 h-3 text-[#722F37]" />
              <span>Crafted with royal passion at Anandam Sarees</span>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
