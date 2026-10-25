"use client";

import { useState } from "react";
import Link from "next/link";
import { Saree } from "@/types/saree";
import { ImageWithFallback } from "./ImageWithFallback";
import { Sparkles, Minus, Plus, MessageCircle, ArrowRight } from "lucide-react";

interface SareeCardProps {
  saree: Saree;
  onOpenInquiry: (saree: Saree, quantity: number) => void;
}

export function SareeCard({ saree, onOpenInquiry }: SareeCardProps) {
  const [quantity, setQuantity] = useState<number>(1);

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < 10) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleOrderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenInquiry(saree, quantity);
  };

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(saree.price);

  const formattedOriginalPrice = saree.originalPrice
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(saree.originalPrice)
    : null;

  const discountPercent =
    saree.originalPrice && saree.originalPrice > saree.price
      ? Math.round(((saree.originalPrice - saree.price) / saree.originalPrice) * 100)
      : null;

  return (
    <div className="group relative bg-[#FFFFFF] rounded-xl sm:rounded-2xl overflow-hidden border border-[#EADBCE] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Clickable Image Area */}
      <Link
        href={`/saree/${saree.slug || saree.id}`}
        className="block relative aspect-[3/4] overflow-hidden bg-[#F7F3EB]"
      >
        <ImageWithFallback
          src={saree.imageUrl}
          alt={saree.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Soft Royal Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Featured Badge */}
        {saree.featured && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-semibold bg-[#722F37] text-[#F4E5BD] shadow-md border border-[#D4AF37]/50 backdrop-blur-sm">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D4AF37]" />
              <span className="hidden sm:inline">Signature</span>
              <span className="sm:hidden">Top</span>
            </span>
          </div>
        )}

        {/* Product Type Pill */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-10">
          <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-md text-[10px] sm:text-xs font-semibold tracking-wide bg-[#FFFFFF]/95 text-[#722F37] backdrop-blur-md shadow border border-[#EADBCE]">
            {saree.type}
          </span>
        </div>
      </Link>

      {/* Card Content Details */}
      <div className="p-2.5 sm:p-5 flex flex-col flex-grow justify-between bg-white">
        <div>
          {/* Title */}
          <Link
            href={`/saree/${saree.slug || saree.id}`}
            className="block group-hover:text-[#722F37] transition-colors"
          >
            <h3 className="font-serif-luxury text-xs sm:text-base font-bold text-[#241416] line-clamp-2 leading-tight">
              {saree.name}
            </h3>
          </Link>

          {/* Price Section */}
          <div className="mt-1.5 sm:mt-2.5 flex flex-wrap items-baseline gap-1 sm:gap-2">
            <span className="text-sm sm:text-xl font-bold text-[#722F37] tracking-tight">
              {formattedPrice}
            </span>
            {formattedOriginalPrice && (
              <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                {formattedOriginalPrice}
              </span>
            )}
            {discountPercent && (
              <span className="text-[9px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">
                {discountPercent}%
              </span>
            )}
          </div>

          {/* Fabric detail */}
          <p className="text-[11px] sm:text-xs text-stone-600 mt-1 line-clamp-1 font-medium">
            {saree.fabric || "Pure Handcrafted Ethnic Wear"}
          </p>
        </div>

        {/* Card Action Area: Quantity Selector + Place Query Button */}
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3.5 border-t border-[#F2ECE4] space-y-2">
          {/* Quantity Selector Bar */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-stone-700">
            <span className="font-medium text-stone-600 hidden sm:inline">Quantity:</span>
            <span className="font-medium text-stone-600 sm:hidden">Qty:</span>
            <div className="inline-flex items-center border border-[#D4AF37]/50 rounded-lg bg-[#FDFBF7] shadow-inner p-0.5">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-md text-stone-700 hover:bg-[#F4E5BD]/50 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 sm:w-8 text-center font-bold text-xs sm:text-sm text-[#722F37]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrease}
                disabled={quantity >= 10}
                aria-label="Increase quantity"
                className="w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-md text-stone-700 hover:bg-[#F4E5BD]/50 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Place Query Button & Details */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleOrderClick}
              className="w-full flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2.5 px-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#722F37] to-[#54151C] hover:from-[#54151C] hover:to-[#380E13] text-[#F4E5BD] font-semibold text-[11px] sm:text-xs tracking-wide shadow-sm hover:shadow transition-all active:scale-[0.98]"
            >
              <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#25D366]" />
              <span>Query</span>
            </button>

            <Link
              href={`/saree/${saree.slug || saree.id}`}
              className="w-full flex items-center justify-center gap-1 py-1.5 sm:py-2.5 px-2 rounded-lg sm:rounded-xl border border-[#D4AF37]/60 text-[#722F37] hover:bg-[#FDFBF7] font-semibold text-[11px] sm:text-xs transition-colors"
            >
              <span>Details</span>
              <ArrowRight className="w-3 h-3 text-[#B8860B]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
