"use client";

import Link from "next/link";
import { useState } from "react";
import { Saree } from "@/types/saree";
import { submitInquiry } from "@/lib/saree-service";
import { ImageWithFallback } from "./ImageWithFallback";
import { X, MessageCircle, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";

interface InquiryModalProps {
  saree: Saree | null;
  initialQuantity?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function InquiryModal({ saree, initialQuantity = 1, isOpen, onClose }: InquiryModalProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string; address?: string }>({});

  if (!isOpen || !saree) return null;

  // Exact WhatsApp number requested: 8982776402 (with Indian country code 91)
  const whatsappNumber = "918982776402";
  const totalPrice = saree.price * quantity;

  const formattedUnitPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(saree.price);

  const formattedTotalPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalPrice);

  const validate = (): boolean => {
    const errors: { name?: string; phone?: string; address?: string } = {};
    if (!customerName.trim()) {
      errors.name = "Please enter your full name";
    }
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      errors.phone = "Please enter a valid 10-digit mobile / WhatsApp number";
    }
    if (!customerAddress.trim()) {
      errors.address = "Please enter your delivery / billing address";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendWhatsAppQuery = () => {
    if (!validate()) {
      setErrorMessage("Please complete your name, WhatsApp number, and address to place your query.");
      return;
    }

    setErrorMessage(null);

    // Build the prefilled automated message with product & customer details
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const productLink = `${origin}/saree/${saree.slug || saree.id}`;

    let message = `*Namaste Anandam Sarees* 🙏\n`;
    message += `I would like to place an order / query for:\n\n`;
    message += `*Product:* ${saree.name}\n`;
    message += `*Category:* ${saree.type}\n`;
    message += `*Price:* ${formattedUnitPrice} each\n`;
    message += `*Quantity:* ${quantity}\n`;
    message += `*Total Estimate:* ${formattedTotalPrice}\n`;
    message += `*Product Link:* ${productLink}\n\n`;

    message += `*Customer Details:*\n`;
    message += `- Name: ${customerName.trim()}\n`;
    message += `- Phone: ${customerPhone.trim()}\n`;
    message += `- Address: ${customerAddress.trim()}\n`;
    if (notes.trim()) {
      message += `- Special Notes: ${notes.trim()}\n`;
    }

    message += `\nPlease confirm availability and dispatch schedule.`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encoded}`;

    // Record the inquiry in the database and local storage so admin has a record
    submitInquiry({
      sareeId: saree.id,
      sareeName: saree.name,
      sareePrice: saree.price,
      quantity,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      customerCity: customerAddress.trim(),
      notes: notes.trim() ? `[Via WhatsApp] ${notes.trim()}` : "[Via WhatsApp]",
    });

    // Open WhatsApp in a new tab with the prefilled message.
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#D4AF37]/50 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#722F37] via-[#54151C] to-[#380E13] text-[#F4E5BD] flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="font-serif-luxury text-lg font-bold tracking-wide">
              Place Query on WhatsApp
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#F4E5BD]/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Product Summary Mini Card */}
          <div className="flex gap-4 p-3.5 bg-[#F8F3EA] rounded-xl border border-[#EADBCE]">
            <div className="relative w-18 h-22 rounded-lg overflow-hidden bg-stone-200 flex-shrink-0">
              <ImageWithFallback
                src={saree.imageUrl}
                alt={saree.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-between flex-grow">
              <div>
                <span className="text-[11px] font-bold tracking-wide uppercase text-[#722F37]">
                  {saree.type}
                </span>
                <h4 className="font-serif-luxury text-sm font-bold text-[#241416] line-clamp-1">
                  {saree.name}
                </h4>
                <p className="text-xs text-stone-600 font-medium">Unit Price: {formattedUnitPrice}</p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#EADBCE]/60">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-stone-600">Qty:</span>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="bg-white border border-[#D4AF37]/50 rounded px-2 py-0.5 text-xs font-bold text-[#722F37]"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-sm font-bold text-[#722F37]">
                  Total: {formattedTotalPrice}
                </span>
              </div>
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined });
                }}
                placeholder="e.g. Priya Sharma"
                className={`w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border ${
                  fieldErrors.name ? "border-red-400 focus:ring-red-400" : "border-[#EADBCE] focus:border-[#722F37]"
                } focus:outline-none focus:ring-1 focus:ring-[#722F37]`}
              />
              {fieldErrors.name && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                WhatsApp / Mobile No. <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: undefined });
                }}
                placeholder="e.g. 9876543210"
                className={`w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border ${
                  fieldErrors.phone ? "border-red-400 focus:ring-red-400" : "border-[#EADBCE] focus:border-[#722F37]"
                } focus:outline-none focus:ring-1 focus:ring-[#722F37]`}
              />
              {fieldErrors.phone && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={customerAddress}
                onChange={(e) => {
                  setCustomerAddress(e.target.value);
                  if (fieldErrors.address) setFieldErrors({ ...fieldErrors, address: undefined });
                }}
                placeholder="e.g. Flat 302, Royal Palms, MG Road, Indore - 452001"
                className={`w-full px-3.5 py-2 text-sm bg-white rounded-xl border ${
                  fieldErrors.address ? "border-red-400 focus:ring-red-400" : "border-[#EADBCE] focus:border-[#722F37]"
                } focus:outline-none focus:ring-1 focus:ring-[#722F37] resize-none`}
              />
              {fieldErrors.address && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Special Request / Sizing Query (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Inquire about blouse stitching or delivery schedule..."
                className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#EADBCE] focus:border-[#722F37] focus:outline-none focus:ring-1 focus:ring-[#722F37] resize-none"
              />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-[#B8860B]" />
              <span>Direct WhatsApp Concierge to +91 89827 76402</span>
            </div>

            {/* Direct WhatsApp Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSendWhatsAppQuery}
                className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Open WhatsApp with Prefilled Message</span>
              </button>
              <p className="text-[11px] text-stone-500 text-center mt-2">
                WhatsApp will open with your complete order & product details prefilled. You can review and hit send!
              </p>
            </div>

            {/* DPDP Privacy Policy Footer Link */}
            <div className="pt-3 border-t border-[#EADBCE]/70 text-center">
              <p className="text-[11px] text-stone-500">
                Your data is kept safe and confidential. Read our{" "}
                <Link
                  href="/privacy-policy"
                  target="_blank"
                  className="text-[#722F37] font-semibold underline hover:text-[#54151C] transition-colors"
                >
                  DPDP Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
