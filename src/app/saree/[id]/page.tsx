"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Saree } from "@/types/saree";
import { fetchSareeById, fetchAllSarees } from "@/lib/saree-service";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { InquiryModal } from "@/components/InquiryModal";
import { SareeCard } from "@/components/SareeCard";
import {
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Minus,
  Plus,
  MessageCircle,
  ArrowLeft,
  Truck,
  RotateCcw,
  Scissors,
  Share2,
  Check,
} from "lucide-react";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productIdOrSlug = resolvedParams.id;

  const [saree, setSaree] = useState<Saree | null>(null);
  const [relatedItems, setRelatedItems] = useState<Saree[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data } = await fetchSareeById(productIdOrSlug);
      if (data) {
        setSaree(data);
        setSelectedImage(data.imageUrl);

        // Fetch related products from same category
        const all = await fetchAllSarees();
        const related = all.data
          .filter((s) => s.id !== data.id && s.type === data.type)
          .slice(0, 3);
        setRelatedItems(related);
      }
      setLoading(false);
    }
    loadData();
  }, [productIdOrSlug]);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 flex-grow flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#722F37] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-serif-luxury text-sm text-stone-600">Unfolding product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!saree) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 flex-grow text-center space-y-4">
          <h2 className="font-serif-luxury text-2xl font-bold text-[#722F37]">Product Not Found</h2>
          <p className="text-sm text-stone-600">
            The requested design may have been removed or updated in our digital collection.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#722F37] text-[#F4E5BD] text-xs font-semibold hover:bg-[#54151C]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Anandam Collection</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Exactly 2 images per product
  const productImages = [saree.imageUrl];
  if (saree.secondaryImageUrl) {
    productImages.push(saree.secondaryImageUrl);
  }

  const totalPrice = saree.price * quantity;

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

  const formattedTotalPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalPrice);

  const discountPercent =
    saree.originalPrice && saree.originalPrice > saree.price
      ? Math.round(((saree.originalPrice - saree.price) / saree.originalPrice) * 100)
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <Header />

      {/* Breadcrumb Trail */}
      <div className="bg-[#F8F3EA] border-b border-[#EADBCE] py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-xs text-stone-600 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-[#722F37] transition-colors">
              Collection
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <Link href={`/?type=${encodeURIComponent(saree.type)}`} className="text-[#B8860B] font-semibold hover:underline">
              {saree.type}s
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-[#722F37] font-bold truncate max-w-xs">{saree.name}</span>
          </div>
        </div>
      </div>

      {/* Main Product Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: 2 Images Gallery Showcase */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#F7F3EB] border border-[#EADBCE] shadow-sm">
              <ImageWithFallback
                key={selectedImage || saree.imageUrl}
                src={selectedImage || saree.imageUrl}
                alt={saree.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top transition-all duration-300"
              />
              {saree.featured && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#722F37] text-[#F4E5BD] shadow border border-[#D4AF37]/50">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Atelier Signature
                  </span>
                </div>
              )}
            </div>

            {/* Exactly 2 Image Selectors */}
            {productImages.length > 1 && (
              <div className="flex items-center gap-3">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-24 h-32 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? "border-[#722F37] shadow-md scale-95"
                        : "border-[#EADBCE] opacity-75 hover:opacity-100"
                    }`}
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`Photo View ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                      View {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & WhatsApp Action */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Product Type Badge */}
              <div>
                <span className="px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#722F37] text-[#F4E5BD] border border-[#D4AF37]/40">
                  {saree.type}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-serif-luxury text-2xl sm:text-4xl font-bold text-[#241416] tracking-tight leading-tight">
                {saree.name}
              </h1>

              {/* Price Block */}
              <div className="p-4 rounded-xl bg-[#F8F3EA] border border-[#EADBCE] space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#722F37]">
                    {formattedPrice}
                  </span>
                  {formattedOriginalPrice && (
                    <span className="text-base text-stone-400 line-through">
                      {formattedOriginalPrice}
                    </span>
                  )}
                  {discountPercent && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                      Save {discountPercent}%
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500">
                  Inclusive of all taxes. Direct boutique dispatch across India.
                </p>
              </div>

              {/* Craftsmanship Description */}
              <div className="space-y-2">
                <h3 className="font-serif-luxury text-base font-semibold text-[#241416]">
                  Product Details & Weave
                </h3>
                <p className="text-sm text-stone-700 leading-relaxed">
                  {saree.description}
                </p>
              </div>

              {/* Specifications Grid (Dimension removed) */}
              <div className="border border-[#EADBCE] rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-2 divide-x divide-[#EADBCE] border-b border-[#EADBCE] bg-[#FDFBF7]">
                  <div className="p-3">
                    <span className="text-stone-500 block">Fabric</span>
                    <strong className="text-stone-800 font-semibold">{saree.fabric || "Pure Handcrafted Fabric"}</strong>
                  </div>
                  <div className="p-3">
                    <span className="text-stone-500 block">Color Hue</span>
                    <strong className="text-stone-800 font-semibold">{saree.color || "Authentic Royal Hue"}</strong>
                  </div>
                </div>

                <div className="p-3 bg-[#FDFBF7]">
                  <span className="text-stone-500 block">Blouse / Dupatta</span>
                  <strong className="text-stone-800 font-semibold">
                    {saree.blouseIncluded ? "Included with Ensemble" : "Ensemble as Shown"}
                  </strong>
                </div>
              </div>

              {/* Trust Guarantees */}
              <div className="grid grid-cols-2 gap-3 text-xs text-stone-600 pt-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#B8860B]" />
                  <span>100% Authentic Quality Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#B8860B]" />
                  <span>Safe Express Dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#B8860B]" />
                  <span>Customization available via WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#B8860B]" />
                  <span>Dedicated Atelier Support</span>
                </div>
              </div>
            </div>

            {/* Ordering & Inquiry Bar */}
            <div className="pt-6 border-t border-[#EADBCE] space-y-4">
              {/* Quantity Selector + Subtotal Bar */}
              <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-[#D4AF37]/40 shadow-sm">
                <div>
                  <span className="text-xs text-stone-600 block">Select Quantity</span>
                  <div className="inline-flex items-center border border-[#D4AF37]/50 rounded-lg bg-[#FDFBF7] p-0.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded text-stone-700 hover:bg-[#F4E5BD]/50 disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-[#722F37]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      disabled={quantity >= 10}
                      className="w-8 h-8 flex items-center justify-center rounded text-stone-700 hover:bg-[#F4E5BD]/50 disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-stone-500 block">Estimated Amount:</span>
                  <strong className="text-xl font-bold text-[#722F37]">
                    {formattedTotalPrice}
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Place Query via WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full py-3.5 px-4 rounded-xl border border-[#D4AF37]/60 text-[#722F37] hover:bg-[#F8F3EA] font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-[#B8860B]" />
                      <span>Share Product</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar / Related Items */}
        {relatedItems.length > 0 && (
          <div className="mt-16 sm:mt-24 pt-12 border-t border-[#EADBCE]">
            <div className="text-center mb-8">
              <span className="text-xs uppercase tracking-widest text-[#B8860B] font-semibold">
                More in {saree.type}s
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#241416] mt-1">
                You May Also Cherish
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {relatedItems.map((item) => (
                <SareeCard
                  key={item.id}
                  saree={item}
                  onOpenInquiry={(s, q) => {
                    setSaree(s);
                    setQuantity(q);
                    setIsModalOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Inquiry Modal */}
      <InquiryModal
        saree={saree}
        initialQuantity={quantity}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
