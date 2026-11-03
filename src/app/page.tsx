"use client";

import { useState, useEffect, useMemo } from "react";
import { Saree, ProductType } from "@/types/saree";
import { fetchAllSarees } from "@/lib/saree-service";
import { PRODUCT_CATEGORIES } from "@/lib/mock-data";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SareeCard } from "@/components/SareeCard";
import { InquiryModal } from "@/components/InquiryModal";
import { Search, Sparkles, RefreshCw, X } from "lucide-react";

export default function CatalogPage() {
  const [sarees, setSarees] = useState<Saree[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "newest">("featured");

  // Modal State
  const [activeInquirySaree, setActiveInquirySaree] = useState<Saree | null>(null);
  const [inquiryQuantity, setInquiryQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination State (12 products initially + Load More)
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data } = await fetchAllSarees();
      setSarees(data);
      setLoading(false);
    }
    loadData();

    // Check URL parameters for category filtering (e.g. ?type=Saree)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const typeParam = params.get("type");
      if (typeParam && (PRODUCT_CATEGORIES as string[]).includes(typeParam)) {
        setSelectedCategory(typeParam);
      }
    }
  }, []);

  // Reset pagination whenever filters or search query change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedCategory, sortBy]);

  const handleOpenInquiry = (saree: Saree, quantity: number) => {
    setActiveInquirySaree(saree);
    setInquiryQuantity(quantity);
    setIsModalOpen(true);
  };

  const handleCloseInquiry = () => {
    setIsModalOpen(false);
    setActiveInquirySaree(null);
  };

  // Filter & Sort Logic
  const filteredSarees = useMemo(() => {
    return sarees
      .filter((saree) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = saree.name.toLowerCase().includes(q);
          const matchType = saree.type.toLowerCase().includes(q);
          const matchFabric = saree.fabric?.toLowerCase().includes(q);
          const matchColor = saree.color?.toLowerCase().includes(q);
          if (!matchName && !matchType && !matchFabric && !matchColor) {
            return false;
          }
        }

        // Category filter (Saree, Suit, Lehenga, Indo-Western)
        if (selectedCategory !== "All") {
          if (saree.type.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        // default: featured first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [sarees, searchQuery, selectedCategory, sortBy]);

  // Paginated Products (12 items per batch)
  const displayedSarees = useMemo(() => {
    return filteredSarees.slice(0, visibleCount);
  }, [filteredSarees, visibleCount]);

  const hasMore = filteredSarees.length > visibleCount;
  const remainingCount = filteredSarees.length - visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredSarees.length));
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortBy("featured");
    setVisibleCount(PAGE_SIZE);
  };

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "All" || sortBy !== "featured";

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <Header />

      {/* Hero Showcase Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#54151C] to-[#722F37] text-[#FDFBF7] py-8 sm:py-14 px-3 sm:px-4 border-b border-[#D4AF37]/40 shadow-inner">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-[#D4AF37]/20 text-[#F4E5BD] border border-[#D4AF37]/40">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37]" />
            <span>आनन्दम् • Authentic Ethnic Atelier</span>
          </div>

          <h1 className="font-serif-luxury text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#FDFBF7] leading-tight px-2">
            Where Affordability Meets Premiumness
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-[#F4E5BD]/90 font-light leading-relaxed px-3">
            Handcrafted Sarees, bespoke Suits, bridal Lehengas, and Indo-Western wear sourced directly from authentic weaver hubs. Pure fabrics, transparent fair pricing, and personal support on WhatsApp — luxury ethnic wear made genuinely accessible.
          </p>

          {/* Grounded Trust Pillars for Mobile & Desktop */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-[#F4E5BD]">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/20 border border-[#D4AF37]/30">
              ✓ Direct Weaver Sourcing
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/20 border border-[#D4AF37]/30">
              ✓ No Middleman Markups
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/20 border border-[#D4AF37]/30">
              ✓ Personal WhatsApp Ordering
            </span>
          </div>

          {sarees.length > 0 && (
            <div className="pt-1 text-[11px] sm:text-xs text-[#D4AF37] font-semibold tracking-widest uppercase">
              {sarees.length} Designs in Collection
            </div>
          )}
        </div>
      </section>

      {/* Main Catalog Workspace */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-10 flex-grow w-full">
        {/* Category Tabs & Filter Toolbar */}
        <div className="bg-[#FFFFFF] p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-[#EADBCE] shadow-sm mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          {/* 4 Category Pill Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === "All"
                  ? "bg-[#722F37] text-[#F4E5BD] shadow-md border border-[#D4AF37]"
                  : "bg-[#FDFBF7] text-stone-700 border border-[#EADBCE] hover:border-[#722F37]"
              }`}
            >
              All Collection
            </button>
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-[#722F37] text-[#F4E5BD] shadow-md border border-[#D4AF37]"
                    : "bg-[#FDFBF7] text-stone-700 border border-[#EADBCE] hover:border-[#722F37]"
                }`}
              >
                {cat}s
              </button>
            ))}

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="ml-auto flex items-center gap-1 text-xs text-[#722F37] hover:underline font-semibold whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search and Sort Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-[#F2ECE4]">
            <div className="md:col-span-8 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name, fabric, or color..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] text-sm text-[#241416] rounded-xl border border-[#EADBCE] focus:border-[#722F37] focus:outline-none focus:ring-1 focus:ring-[#722F37]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="md:col-span-4">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full py-2.5 px-3.5 bg-[#FDFBF7] text-sm text-[#241416] rounded-xl border border-[#EADBCE] focus:border-[#722F37] focus:outline-none focus:ring-1 focus:ring-[#722F37]"
              >
                <option value="featured">Sort: Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs sm:text-sm text-stone-600 font-medium">
            Showing <strong className="text-[#722F37] font-bold">{displayedSarees.length}</strong> of{" "}
            <strong className="text-[#722F37] font-bold">{filteredSarees.length}</strong> items
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl sm:rounded-2xl border border-[#EADBCE] p-3 sm:p-4 space-y-3 sm:space-y-4 animate-pulse"
              >
                <div className="aspect-[3/4] bg-stone-200 rounded-lg sm:rounded-xl" />
                <div className="h-3 sm:h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-3 sm:h-4 bg-stone-200 rounded w-1/3" />
                <div className="h-7 sm:h-9 bg-stone-200 rounded-lg sm:rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredSarees.length === 0 && (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-[#D4AF37]/50 max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#F8F3EA] border border-[#D4AF37]/40 flex items-center justify-center text-[#722F37]">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="font-serif-luxury text-xl font-bold text-[#241416]">
              No Products Found
            </h3>
            <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
              We could not find any items matching your selected criteria. Try searching for a different keyword or resetting filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#722F37] text-[#F4E5BD] text-xs font-semibold hover:bg-[#54151C] transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Show All Products</span>
            </button>
          </div>
        )}

        {/* Product Cards Grid: 2 columns on mobile, 3-4 columns on desktop */}
        {!loading && displayedSarees.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {displayedSarees.map((saree) => (
              <SareeCard
                key={saree.id}
                saree={saree}
                onOpenInquiry={handleOpenInquiry}
              />
            ))}
          </div>
        )}

        {/* Load More Button (Only if total products > 12 and more remain) */}
        {!loading && hasMore && (
          <div className="mt-10 sm:mt-12 text-center space-y-2.5">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-white hover:bg-[#F8F3EA] text-[#722F37] font-bold text-xs sm:text-sm border-2 border-[#D4AF37]/60 hover:border-[#722F37] shadow-sm hover:shadow-md transition-all active:scale-[0.99] group"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37] group-hover:rotate-12 transition-transform" />
              <span>Load More Products ({Math.min(PAGE_SIZE, remainingCount)} more)</span>
            </button>
            <p className="text-[11px] text-stone-500 font-medium">
              Showing {displayedSarees.length} of {filteredSarees.length} creations
            </p>
          </div>
        )}
      </main>

      <Footer />

      {/* Inquiry & WhatsApp Ordering Modal */}
      <InquiryModal
        saree={activeInquirySaree}
        initialQuantity={inquiryQuantity}
        isOpen={isModalOpen}
        onClose={handleCloseInquiry}
      />
    </div>
  );
}
