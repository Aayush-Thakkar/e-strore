"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Saree, AVAILABLE_SIZES } from "@/types/saree";
import { submitInquiry } from "@/lib/saree-service";
import { ImageWithFallback } from "./ImageWithFallback";
import { INDIAN_STATES_AND_CITIES } from "@/lib/india-locations";
import {
  X,
  MessageCircle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  MapPin,
  Ruler,
  Wallet,
} from "lucide-react";

interface InquiryModalProps {
  saree: Saree | null;
  initialQuantity?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function InquiryModal({ saree, initialQuantity = 1, isOpen, onClose }: InquiryModalProps) {
  const router = useRouter();

  const [quantity, setQuantity] = useState(initialQuantity);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [preferredBudget, setPreferredBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
    address?: string;
    state?: string;
    city?: string;
    size?: string;
  }>({});

  // Dynamic city list based on selected state
  const availableCities = useMemo(() => {
    if (!selectedState) return [];
    const found = INDIAN_STATES_AND_CITIES.find((s) => s.state === selectedState);
    return found ? found.cities : [];
  }, [selectedState]);

  // Available sizes strictly respecting the product's configured sizes
  const displaySizes = useMemo(() => {
    if (!saree || saree.type === "Saree") return [];
    if (Array.isArray(saree.sizes)) {
      return saree.sizes;
    }
    return [];
  }, [saree]);

  // Synchronize size selection whenever modal opens or product changes
  useEffect(() => {
    if (isOpen && saree) {
      if (saree.type !== "Saree" && Array.isArray(saree.sizes) && saree.sizes.length === 1) {
        setSelectedSize(saree.sizes[0]);
      } else {
        setSelectedSize("");
      }
      setFieldErrors({});
      setErrorMessage(null);
    }
  }, [isOpen, saree]);

  if (!isOpen || !saree) return null;

  // Exact WhatsApp number requested: 9039035056 (with Indian country code 91)
  const whatsappNumber = process.env.NEXT_PUBLIC_SHOP_WHATSAPP_NUMBER || "919039035056";
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
    const errors: {
      name?: string;
      phone?: string;
      address?: string;
      state?: string;
      city?: string;
      size?: string;
    } = {};

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

    if (!selectedState) {
      errors.state = "Please select your state";
    }

    const finalCity = selectedCity === "Enter City Manually" ? manualCity.trim() : selectedCity;
    if (!finalCity) {
      errors.city = "Please select or enter your city";
    }

    // Require size selection only if specific sizes are configured for this ensemble
    if (saree.type !== "Saree" && displaySizes.length > 0 && !selectedSize) {
      errors.size = "Please select your preferred size";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendWhatsAppQuery = () => {
    if (!validate()) {
      setErrorMessage("Please complete all required fields to place your query.");
      return;
    }

    setErrorMessage(null);

    const finalCity =
      selectedCity === "Enter City Manually"
        ? manualCity.trim() || selectedCity
        : selectedCity.trim();

    // Build the prefilled automated message with product & customer details
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const productLink = `${origin}/saree/${saree.slug || saree.id}`;

    let message = `*Namaste Anandam Sarees* 🙏\n`;
    message += `I would like to place an order / query for:\n\n`;
    message += `*Product:* ${saree.name}\n`;
    message += `*Category:* ${saree.type}\n`;

    // Respective Product Details (Size & Budget)
    if (saree.type !== "Saree") {
      if (selectedSize) {
        message += `*Selected Size:* ${selectedSize}\n`;
      } else if (displaySizes.length === 0) {
        message += `*Size / Fit:* Free-size / Custom Tailored\n`;
      }
    }

    if (saree.type === "Lehenga") {
      if (preferredBudget) {
        message += `*Preferred Budget Range:* ${preferredBudget}\n`;
      } else {
        message += `*Preferred Budget Range:* Standard Catalogue Price\n`;
      }
    }

    message += `*Price:* ${formattedUnitPrice} each\n`;
    message += `*Quantity:* ${quantity}\n`;
    message += `*Total Estimate:* ${formattedTotalPrice}\n`;
    message += `*Product Link:* ${productLink}\n\n`;

    message += `*Customer & Delivery Details:*\n`;
    message += `- *Name:* ${customerName.trim()}\n`;
    message += `- *Phone / WhatsApp:* ${customerPhone.trim()}\n`;
    message += `- *City & State:* ${finalCity}, ${selectedState}\n`;
    message += `- *Delivery Address:* ${customerAddress.trim()}\n`;

    if (notes.trim()) {
      message += `- *Special Instructions / Notes:* ${notes.trim()}\n`;
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
      customerCity: finalCity,
      customerState: selectedState,
      selectedSize: saree.type !== "Saree" ? selectedSize : undefined,
      preferredBudget: saree.type === "Lehenga" && preferredBudget ? preferredBudget : undefined,
      notes: notes.trim() ? `[Via WhatsApp] ${notes.trim()}` : "[Via WhatsApp]",
    });

    // Send query payload in the background to Google Sheets
    const webhookUrl =
      process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL ||
      "https://script.google.com/macros/s/AKfycbxzQS-Uwj4sqsMMvdLkTENwbBy8DukI_mwFDDn2pVrgf_uN8MJEOTZp_6BFvP55HrvoFQ/exec";

    if (webhookUrl) {
      const payload = JSON.stringify({
        date: new Date().toISOString(),
        productName: saree.name,
        productLink,
        category: saree.type,
        size: saree.type !== "Saree" ? selectedSize : "",
        quantity,
        price: saree.price,
        totalAmount: saree.price * quantity,
        customerName: customerName.trim(),
        phone: customerPhone.trim(),
        city: finalCity,
        state: selectedState,
        address: customerAddress.trim(),
        budget: saree.type === "Lehenga" ? preferredBudget : "",
        notes: notes.trim(),
      });

      // keepalive: true ensures the request survives router navigation
      fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: payload,
      }).catch((err) => console.warn("Google Sheet webhook log error:", err));
    }

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    // Close modal & redirect current page to Thank You page
    onClose();
    router.push("/thank-you");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#D4AF37]/50 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-gradient-to-r from-[#722F37] via-[#54151C] to-[#380E13] text-[#F4E5BD] flex items-center justify-between border-b border-[#D4AF37]/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="font-serif-luxury text-base sm:text-lg font-bold tracking-wide">
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Product Summary Mini Card */}
          <div className="flex gap-3.5 p-3 sm:p-3.5 bg-[#F8F3EA] rounded-xl border border-[#EADBCE]">
            <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden bg-stone-200 flex-shrink-0">
              <ImageWithFallback
                src={saree.imageUrl}
                alt={saree.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-between flex-grow min-w-0">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#722F37]">
                  {saree.type}
                </span>
                <h4 className="font-serif-luxury text-xs sm:text-sm font-bold text-[#241416] line-clamp-1">
                  {saree.name}
                </h4>
                <p className="text-[11px] sm:text-xs text-stone-600 font-medium">
                  Unit Price: {formattedUnitPrice}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#EADBCE]/60">
                <div className="flex items-center gap-1.5 text-xs">
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
                <span className="text-xs sm:text-sm font-bold text-[#722F37]">
                  Total: {formattedTotalPrice}
                </span>
              </div>
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3.5">
            {/* Customer Name */}
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
                className={`w-full px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm bg-white rounded-xl border ${
                  fieldErrors.name ? "border-red-400 focus:ring-red-400" : "border-[#EADBCE] focus:border-[#722F37]"
                } focus:outline-none focus:ring-1 focus:ring-[#722F37]`}
              />
              {fieldErrors.name && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.name}</p>
              )}
            </div>

            {/* WhatsApp / Phone */}
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
                className={`w-full px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm bg-white rounded-xl border ${
                  fieldErrors.phone ? "border-red-400 focus:ring-red-400" : "border-[#EADBCE] focus:border-[#722F37]"
                } focus:outline-none focus:ring-1 focus:ring-[#722F37]`}
              />
              {fieldErrors.phone && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Sizes Selection (For Suit, Lehenga, Indo-Western - NOT Saree) */}
            {saree.type !== "Saree" && (
              <div className="p-3 bg-[#F8F3EA]/70 rounded-xl border border-[#EADBCE]">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                    <Ruler className="w-3.5 h-3.5 text-[#722F37]" />
                    <span>
                      Select Size{" "}
                      {displaySizes.length > 0 && <span className="text-red-500">*</span>}
                    </span>
                  </label>
                  {selectedSize && (
                    <span className="text-[11px] font-bold text-[#722F37]">
                      Size: {selectedSize}
                    </span>
                  )}
                </div>

                {displaySizes.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {displaySizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          setSelectedSize(sz);
                          if (fieldErrors.size) setFieldErrors({ ...fieldErrors, size: undefined });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedSize === sz
                            ? "bg-[#722F37] text-[#F4E5BD] border border-[#D4AF37] shadow-sm scale-105"
                            : "bg-white text-stone-700 border border-[#EADBCE] hover:border-[#722F37]"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-600 bg-white p-2.5 rounded-lg border border-[#EADBCE]">
                    Free-size / Semi-stitched ensemble. Custom sizing available on WhatsApp consultation.
                  </p>
                )}

                {fieldErrors.size && (
                  <p className="text-[11px] text-red-600 mt-1.5">{fieldErrors.size}</p>
                )}
              </div>
            )}

            {/* Preferred Budget Dropdown (For Lehenga products) */}
            {saree.type === "Lehenga" && (
              <div className="p-3 bg-[#F8F3EA]/70 rounded-xl border border-[#EADBCE]">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-1.5">
                  <Wallet className="w-3.5 h-3.5 text-[#722F37]" />
                  <span>Preferred Budget Range <span className="text-stone-400 font-normal">(Optional)</span></span>
                </label>
                <div className="relative">
                  <select
                    value={preferredBudget}
                    onChange={(e) => setPreferredBudget(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white rounded-xl border border-[#EADBCE] focus:border-[#722F37] focus:outline-none focus:ring-1 focus:ring-[#722F37] text-stone-800 appearance-none pr-8 cursor-pointer font-medium"
                  >
                    <option value="">Select Preferred Budget (Optional)</option>
                    <option value="5k - 10k">₹5,000 - ₹10,000 (5k - 10k)</option>
                    <option value="10k - 20k">₹10,000 - ₹20,000 (10k - 20k)</option>
                    <option value="20k - 30k">₹20,000 - ₹30,000 (20k - 30k)</option>
                    <option value="30k+">₹30,000+ (30k+)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                House / Street Address <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={customerAddress}
                onChange={(e) => {
                  setCustomerAddress(e.target.value);
                  if (fieldErrors.address) setFieldErrors({ ...fieldErrors, address: undefined });
                }}
                placeholder="e.g. Flat 302, Royal Palms, MG Road..."
                className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border ${
                  fieldErrors.address ? "border-red-400 focus:ring-red-400" : "border-[#EADBCE] focus:border-[#722F37]"
                } focus:outline-none focus:ring-1 focus:ring-[#722F37] resize-none`}
              />
              {fieldErrors.address && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.address}</p>
              )}
            </div>

            {/* Dynamic State & City Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-stone-700 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#722F37]" />
                  <span>State / UT <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedCity("");
                      setManualCity("");
                      if (fieldErrors.state) setFieldErrors({ ...fieldErrors, state: undefined });
                    }}
                    className={`w-full px-3 py-2 text-xs sm:text-sm bg-white rounded-xl border ${
                      fieldErrors.state ? "border-red-400 focus:ring-red-400" : "border-[#EADBCE] focus:border-[#722F37]"
                    } focus:outline-none focus:ring-1 focus:ring-[#722F37] text-stone-800 appearance-none pr-8 cursor-pointer font-medium`}
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES_AND_CITIES.map((s) => (
                      <option key={s.state} value={s.state}>
                        {s.state}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {fieldErrors.state && (
                  <p className="text-[11px] text-red-600 mt-1">{fieldErrors.state}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCity}
                    disabled={!selectedState}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      if (fieldErrors.city) setFieldErrors({ ...fieldErrors, city: undefined });
                    }}
                    className={`w-full px-3 py-2 text-xs sm:text-sm bg-white rounded-xl border ${
                      fieldErrors.city ? "border-red-400 focus:ring-red-400" : "border-[#EADBCE] focus:border-[#722F37]"
                    } focus:outline-none focus:ring-1 focus:ring-[#722F37] text-stone-800 appearance-none pr-8 cursor-pointer font-medium disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed`}
                  >
                    <option value="">{selectedState ? "Select City" : "Select State First"}</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {fieldErrors.city && (
                  <p className="text-[11px] text-red-600 mt-1">{fieldErrors.city}</p>
                )}
              </div>
            </div>

            {/* Manual City entry fallback if needed */}
            {selectedCity === "Enter City Manually" && (
              <div>
                <input
                  type="text"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  placeholder="Enter your specific city / district name"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-[#EADBCE] focus:border-[#722F37] focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                />
              </div>
            )}

            {/* Special Request */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Special Request / Sizing Query (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Inquire about blouse stitching or delivery schedule..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-[#EADBCE] focus:border-[#722F37] focus:outline-none focus:ring-1 focus:ring-[#722F37] resize-none"
              />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-[#B8860B]" />
              <span>Direct WhatsApp Concierge • Instant Response</span>
            </div>

            {/* Send Query Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSendWhatsAppQuery}
                className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Send Query</span>
              </button>
              <p className="text-[11px] text-stone-500 text-center mt-2">
                WhatsApp will open with your complete query prefilled. You can review and hit send!
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
