"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Saree, SareeFormData, ProductType } from "@/types/saree";
import {
  fetchAllSarees,
  createSaree,
  updateSaree,
  deleteSaree,
  uploadSareeImage,
  deleteStorageImages,
} from "@/lib/saree-service";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { PRODUCT_CATEGORIES } from "@/lib/mock-data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import {
  Sparkles,
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  LogOut,
  Eye,
  Layers,
  X,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();

  // Authentication check
  const [currentUser, setCurrentUser] = useState<string>("admin@anandamsarees.in");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Data states
  const [sarees, setSarees] = useState<Saree[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSaree, setEditingSaree] = useState<Saree | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Deferred Image Upload states (Files held locally until final Save/Update button is clicked)
  const [pendingFile1, setPendingFile1] = useState<File | null>(null);
  const [previewUrl1, setPreviewUrl1] = useState<string | null>(null);
  const [pendingFile2, setPendingFile2] = useState<File | null>(null);
  const [previewUrl2, setPreviewUrl2] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<SareeFormData>({
    name: "",
    price: "",
    originalPrice: "",
    type: "Saree",
    imageUrl: "",
    secondaryImageUrl: "",
    description: "",
    fabric: "100% Pure Mulberry Silk",
    blouseIncluded: true,
    color: "",
    featured: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Helper to calculate word count
  const getWordCount = (text: string): number => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  };

  // Helper to safely revoke and reset local preview URLs
  const cleanupPreviews = () => {
    if (previewUrl1 && previewUrl1.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl1);
    }
    if (previewUrl2 && previewUrl2.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl2);
    }
    setPendingFile1(null);
    setPreviewUrl1(null);
    setPendingFile2(null);
    setPreviewUrl2(null);
  };

  useEffect(() => {
    // Check Supabase session first, then local auth flag
    async function verifyAuth() {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setIsAuthenticated(true);
          setCurrentUser(data.session.user.email || "admin@anandamsarees.in");
          loadDashboardData();
          return;
        }
      }

      const auth =
        typeof window !== "undefined" &&
        (localStorage.getItem("anandam_admin_auth") === "true" ||
          localStorage.getItem("virasat_admin_auth") === "true");
      const user =
        typeof window !== "undefined" &&
        (localStorage.getItem("anandam_admin_user") || localStorage.getItem("virasat_admin_user"));

      if (!auth) {
        router.push("/admin/login");
        return;
      }
      setIsAuthenticated(true);
      if (user) setCurrentUser(user);
      loadDashboardData();
    }

    verifyAuth();
  }, [router]);

  const loadDashboardData = async () => {
    setLoading(true);
    const sareesRes = await fetchAllSarees();
    setSarees(sareesRes.data);
    setLoading(false);
  };

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("anandam_admin_auth");
    localStorage.removeItem("anandam_admin_user");
    localStorage.removeItem("virasat_admin_auth");
    localStorage.removeItem("virasat_admin_user");
    router.push("/admin/login");
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    cleanupPreviews();
    setEditingSaree(null);
    setFormData({
      name: "",
      price: "",
      originalPrice: "",
      type: "Saree",
      imageUrl: "",
      secondaryImageUrl: "",
      description: "",
      fabric: "Pure Handloom Silk",
      blouseIncluded: true,
      color: "",
      featured: false,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (saree: Saree) => {
    cleanupPreviews();
    setEditingSaree(saree);
    setFormData({
      name: saree.name,
      price: saree.price,
      originalPrice: saree.originalPrice || "",
      type: saree.type,
      imageUrl: saree.imageUrl,
      secondaryImageUrl: saree.secondaryImageUrl || "",
      description: saree.description || "",
      fabric: saree.fabric || "",
      blouseIncluded: Boolean(saree.blouseIncluded),
      color: saree.color || "",
      featured: Boolean(saree.featured),
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    cleanupPreviews();
    setIsFormModalOpen(false);
    setEditingSaree(null);
  };

  // Validate form with 250-word constraint
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Product name is required.";
    if (!formData.price || Number(formData.price) <= 0) errors.price = "Enter a valid positive price.";
    
    // Valid if either a local photo was selected OR an existing URL exists
    if (!pendingFile1 && !formData.imageUrl.trim()) {
      errors.imageUrl = "Please select Primary Photo (Image 1) or enter URL.";
    }
    if (!formData.type) errors.type = "Please select product category.";

    // 250 word constraint on description
    const wordCount = getWordCount(formData.description);
    if (wordCount > 250) {
      errors.description = `Description exceeds 250 words maximum (currently ${wordCount} words). Please condense.`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Stage Photo 1 locally (DO NOT upload until final submit)
  const handleImage1Select = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl1 && previewUrl1.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl1);
    }

    const localUrl = URL.createObjectURL(file);
    setPendingFile1(file);
    setPreviewUrl1(localUrl);
    setFormErrors((prev) => ({ ...prev, imageUrl: "" }));
  };

  const handleRemoveImage1 = () => {
    if (previewUrl1 && previewUrl1.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl1);
    }
    setPendingFile1(null);
    setPreviewUrl1(null);
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
  };

  // Stage Photo 2 locally (DO NOT upload until final submit)
  const handleImage2Select = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl2 && previewUrl2.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl2);
    }

    const localUrl = URL.createObjectURL(file);
    setPendingFile2(file);
    setPreviewUrl2(localUrl);
  };

  const handleRemoveImage2 = () => {
    if (previewUrl2 && previewUrl2.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl2);
    }
    setPendingFile2(null);
    setPreviewUrl2(null);
    setFormData((prev) => ({ ...prev, secondaryImageUrl: "" }));
  };

  // Save Product (Upload images ONLY NOW when final button is hit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("Please correct the highlighted fields before saving.", "error");
      return;
    }

    setIsSaving(true);

    try {
      let finalImageUrl = formData.imageUrl;
      let finalSecondaryImageUrl = formData.secondaryImageUrl || undefined;
      const oldImagesToClean: string[] = [];

      // 1. Upload Photo 1 only now if a new local file was selected
      if (pendingFile1) {
        const res1 = await uploadSareeImage(pendingFile1);
        if (res1.error || !res1.url) {
          setIsSaving(false);
          showToast(res1.error || "Failed to upload Photo 1.", "error");
          return;
        }
        if (editingSaree && editingSaree.imageUrl && editingSaree.imageUrl !== res1.url) {
          oldImagesToClean.push(editingSaree.imageUrl);
        }
        finalImageUrl = res1.url;
      }

      // 2. Upload Photo 2 only now if a new local file was selected
      if (pendingFile2) {
        const res2 = await uploadSareeImage(pendingFile2);
        if (res2.error || !res2.url) {
          setIsSaving(false);
          showToast(res2.error || "Failed to upload Photo 2.", "error");
          return;
        }
        if (editingSaree && editingSaree.secondaryImageUrl && editingSaree.secondaryImageUrl !== res2.url) {
          oldImagesToClean.push(editingSaree.secondaryImageUrl);
        }
        finalSecondaryImageUrl = res2.url;
      }

      if (editingSaree) {
        // If secondary image was removed completely
        if (!formData.secondaryImageUrl && !pendingFile2 && editingSaree.secondaryImageUrl) {
          oldImagesToClean.push(editingSaree.secondaryImageUrl);
          finalSecondaryImageUrl = undefined;
        }

        const res = await updateSaree(editingSaree.id, {
          name: formData.name,
          price: Number(formData.price),
          originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
          type: formData.type,
          imageUrl: finalImageUrl,
          secondaryImageUrl: finalSecondaryImageUrl,
          description: formData.description,
          fabric: formData.fabric,
          blouseIncluded: formData.blouseIncluded,
          color: formData.color,
          featured: formData.featured,
        });

        setIsSaving(false);
        if (res.error) {
          showToast(res.error, "error");
        } else {
          if (oldImagesToClean.length > 0) {
            deleteStorageImages(oldImagesToClean);
          }
          showToast("Product details updated successfully.");
          cleanupPreviews();
          setIsFormModalOpen(false);
          loadDashboardData();
        }
      } else {
        const res = await createSaree({
          name: formData.name,
          slug: "",
          price: Number(formData.price),
          originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
          type: formData.type,
          imageUrl: finalImageUrl,
          secondaryImageUrl: finalSecondaryImageUrl,
          description: formData.description,
          fabric: formData.fabric,
          blouseIncluded: formData.blouseIncluded,
          color: formData.color,
          featured: formData.featured,
        });

        setIsSaving(false);
        if (res.error) {
          showToast(res.error, "error");
        } else {
          showToast("New product added to catalogue successfully.");
          cleanupPreviews();
          setIsFormModalOpen(false);
          loadDashboardData();
        }
      }
    } catch (err: any) {
      setIsSaving(false);
      showToast(err.message || "Failed to save product.", "error");
    }
  };

  // Delete Saree & its images from Supabase Storage
  const handleDeleteConfirm = async () => {
    if (!isDeletingId) return;
    const target = sarees.find((s) => s.id === isDeletingId);
    const extraUrls: string[] = [];
    if (target?.imageUrl) extraUrls.push(target.imageUrl);
    if (target?.secondaryImageUrl) extraUrls.push(target.secondaryImageUrl);

    const res = await deleteSaree(isDeletingId, extraUrls);
    setIsDeletingId(null);
    if (res.success) {
      showToast("Product and associated photos removed.");
      loadDashboardData();
    } else {
      showToast(res.error || "Failed to remove product.", "error");
    }
  };

  // Filtered products in table
  const filteredSarees = useMemo(() => {
    return sarees.filter((saree) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          saree.name.toLowerCase().includes(q) ||
          saree.type.toLowerCase().includes(q) ||
          saree.fabric?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filterCategory !== "All" && saree.type !== filterCategory) {
        return false;
      }
      return true;
    });
  }, [sarees, searchQuery, filterCategory]);

  if (!isAuthenticated) {
    return null; // Redirecting
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold ${
              toastMessage.type === "success"
                ? "bg-emerald-900 text-emerald-100 border border-emerald-700"
                : "bg-red-900 text-red-100 border border-red-700"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Admin Navbar */}
      <header className="bg-[#241416] text-[#F4E5BD] border-b border-[#D4AF37]/30 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[#D4AF37] bg-[#FDFBF7] flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Anandam"
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <div>
                <span className="font-serif-luxury text-lg font-bold tracking-wider text-[#FDFBF7] block leading-tight">
                  ANANDAM ATELIER
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] block">
                  Management Portal
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="hidden md:inline text-stone-400">
                Logged in as <strong className="text-[#F4E5BD]">{currentUser}</strong>
              </span>

              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#F4E5BD] transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Store</span>
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#722F37] hover:bg-[#8E3B45] text-[#F4E5BD] font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-6">
        {/* Metric Cards Banner (No stock concept) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#EADBCE] shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#722F37]/10 flex items-center justify-center text-[#722F37]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-medium">Total Products in Catalogue</span>
              <strong className="text-xl font-bold text-[#241416] block">{sarees.length}</strong>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EADBCE] shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-[#B8860B]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-medium">Signature Atelier Pieces</span>
              <strong className="text-xl font-bold text-[#241416] block">
                {sarees.filter((s) => s.featured).length}
              </strong>
            </div>
          </div>
        </div>

        {/* PRODUCT CATALOGUE CRUD */}
        <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#EADBCE]">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-grow sm:w-64">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or fabric..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FDFBF7] rounded-lg border border-[#EADBCE] focus:border-[#722F37] focus:outline-none"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="py-1.5 px-3 text-xs bg-[#FDFBF7] rounded-lg border border-[#EADBCE] focus:border-[#722F37]"
                >
                  <option value="All">All Categories</option>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}s
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#722F37] to-[#54151C] hover:from-[#54151C] hover:to-[#380E13] text-[#F4E5BD] font-semibold text-xs tracking-wide shadow-md transition-all active:scale-[0.99]"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Sarees Table (No stock, no tags) */}
            <div className="bg-white rounded-xl border border-[#EADBCE] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F3EA] border-b border-[#EADBCE] text-stone-600 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Photos (Max 2)</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Fabric</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2ECE4]">
                    {filteredSarees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-500">
                          No products found matching current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredSarees.map((saree) => (
                        <tr key={saree.id} className="hover:bg-[#FDFBF7] transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              {/* Image 1 Preview */}
                              <div className="relative w-11 h-14 rounded-md overflow-hidden bg-stone-100 flex-shrink-0 border border-[#EADBCE]">
                                <ImageWithFallback
                                  src={saree.imageUrl}
                                  alt="Image 1"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              {/* Image 2 Preview */}
                              {saree.secondaryImageUrl ? (
                                <div className="relative w-11 h-14 rounded-md overflow-hidden bg-stone-100 flex-shrink-0 border border-[#EADBCE]">
                                  <ImageWithFallback
                                    src={saree.secondaryImageUrl}
                                    alt="Image 2"
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-11 h-14 rounded-md bg-stone-50 border border-dashed border-stone-200 flex items-center justify-center text-[9px] text-stone-400">
                                  No 2nd
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <h4 className="font-serif-luxury font-bold text-stone-900 text-sm line-clamp-1">
                              {saree.name}
                            </h4>
                            {saree.featured && (
                              <span className="inline-block mt-0.5 text-[10px] text-[#B8860B] font-semibold">
                                ★ Signature Piece
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F8F3EA] text-[#722F37] border border-[#EADBCE]">
                              {saree.type}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-bold text-stone-800">
                            ₹{saree.price.toLocaleString("en-IN")}
                          </td>

                          <td className="py-3 px-4 text-stone-600 max-w-xs truncate">
                            {saree.fabric || "—"}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/saree/${saree.slug || saree.id}`}
                                target="_blank"
                                className="p-1.5 text-stone-500 hover:text-[#722F37] hover:bg-[#F8F3EA] rounded-md transition-colors"
                                title="View on Store"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              <button
                                type="button"
                                onClick={() => handleOpenEdit(saree)}
                                className="p-1.5 text-[#B8860B] hover:text-[#722F37] hover:bg-[#F4E5BD]/30 rounded-md transition-colors"
                                title="Edit Product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setIsDeletingId(saree.id)}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
      </main>

      {/* CREATE / EDIT PRODUCT MODAL (Max 2 images, 4 categories, NO tags, NO stock) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div
            className="relative w-full max-w-2xl bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#D4AF37]/50 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#722F37] to-[#54151C] text-[#F4E5BD] flex items-center justify-between border-b border-[#D4AF37]/30">
              <h3 className="font-serif-luxury text-lg font-bold">
                {editingSaree ? "Edit Product Details" : "Add New Product to Catalogue"}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-full text-[#F4E5BD]/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                  }}
                  placeholder="e.g. Royal Crimson Katan Banarasi Saree"
                  className={`w-full px-3.5 py-2 text-sm bg-white rounded-lg border ${
                    formErrors.name ? "border-red-400 focus:ring-red-400" : "border-[#EADBCE] focus:border-[#722F37]"
                  } focus:outline-none`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Price & Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Price in INR (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.price}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        price: e.target.value === "" ? "" : Number(e.target.value),
                      });
                      if (formErrors.price) setFormErrors({ ...formErrors, price: "" });
                    }}
                    placeholder="e.g. 18500"
                    className={`w-full px-3.5 py-2 text-sm bg-white rounded-lg border ${
                      formErrors.price ? "border-red-400" : "border-[#EADBCE] focus:border-[#722F37]"
                    } focus:outline-none`}
                  />
                  {formErrors.price && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Original Price / MRP (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        originalPrice: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    placeholder="e.g. 24000"
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-[#EADBCE] focus:border-[#722F37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Product Type (4 Categories) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ProductType })}
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-[#EADBCE] focus:border-[#722F37] focus:outline-none font-semibold text-[#722F37]"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2 PHOTOS SECTION (Deferred upload until final submit) */}
              <div className="p-4 bg-white rounded-xl border border-[#EADBCE] space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#722F37] uppercase tracking-wide">
                    Product Photographs (Up to 2 Photos)
                  </label>
                  <span className="text-[11px] text-stone-500 font-medium">
                    Photos upload automatically when you click save
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo 1: Primary Image */}
                  <div className="p-3 bg-[#FDFBF7] rounded-lg border border-[#EADBCE] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-800">
                        Primary Image (Image 1) <span className="text-red-500">*</span>
                      </span>
                      {(previewUrl1 || formData.imageUrl) && (
                        <button
                          type="button"
                          onClick={handleRemoveImage1}
                          className="text-[11px] text-red-600 hover:text-red-800 hover:underline font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-stone-100 border border-[#EADBCE] flex items-center justify-center">
                      {previewUrl1 || formData.imageUrl ? (
                        <ImageWithFallback
                          src={previewUrl1 || formData.imageUrl}
                          alt="Primary Photo Preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-[11px] text-stone-400">No photo selected</span>
                      )}
                      {pendingFile1 && (
                        <div className="absolute bottom-2 left-2 right-2 bg-emerald-900/90 text-emerald-100 text-[10px] py-1 px-2 rounded backdrop-blur-sm text-center font-medium shadow">
                          Selected (Uploads on save)
                        </div>
                      )}
                    </div>

                    <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#F8F3EA] hover:bg-[#F2ECE4] text-[#722F37] border border-[#D4AF37]/50 text-xs font-semibold cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#B8860B]" />
                      <span>{pendingFile1 || formData.imageUrl ? "Change Photo 1" : "Choose Photo 1"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImage1Select}
                        disabled={isSaving}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, imageUrl: e.target.value });
                        if (formErrors.imageUrl) setFormErrors({ ...formErrors, imageUrl: "" });
                      }}
                      placeholder="or paste image 1 URL"
                      className="w-full px-2.5 py-1 text-xs bg-white rounded border border-[#EADBCE] focus:border-[#722F37]"
                    />
                    {formErrors.imageUrl && (
                      <p className="text-[11px] text-red-600">{formErrors.imageUrl}</p>
                    )}
                  </div>

                  {/* Photo 2: Secondary Image */}
                  <div className="p-3 bg-[#FDFBF7] rounded-lg border border-[#EADBCE] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-800">
                        Secondary Image (Image 2 - Optional)
                      </span>
                      {(previewUrl2 || formData.secondaryImageUrl) && (
                        <button
                          type="button"
                          onClick={handleRemoveImage2}
                          className="text-[11px] text-red-600 hover:text-red-800 hover:underline font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-stone-100 border border-[#EADBCE] flex items-center justify-center">
                      {previewUrl2 || formData.secondaryImageUrl ? (
                        <ImageWithFallback
                          src={previewUrl2 || formData.secondaryImageUrl}
                          alt="Secondary Photo Preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-[11px] text-stone-400">No secondary photo</span>
                      )}
                      {pendingFile2 && (
                        <div className="absolute bottom-2 left-2 right-2 bg-emerald-900/90 text-emerald-100 text-[10px] py-1 px-2 rounded backdrop-blur-sm text-center font-medium shadow">
                          Selected (Uploads on save)
                        </div>
                      )}
                    </div>

                    <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#F8F3EA] hover:bg-[#F2ECE4] text-[#722F37] border border-[#D4AF37]/50 text-xs font-semibold cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#B8860B]" />
                      <span>{pendingFile2 || formData.secondaryImageUrl ? "Change Photo 2" : "Choose Photo 2"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImage2Select}
                        disabled={isSaving}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="url"
                      value={formData.secondaryImageUrl}
                      onChange={(e) => setFormData({ ...formData, secondaryImageUrl: e.target.value })}
                      placeholder="or paste image 2 URL"
                      className="w-full px-2.5 py-1 text-xs bg-white rounded border border-[#EADBCE] focus:border-[#722F37]"
                    />
                  </div>
                </div>
              </div>

              {/* Fabric & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Fabric & Weave
                  </label>
                  <input
                    type="text"
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    placeholder="e.g. Pure Mulberry Katan Silk"
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-[#EADBCE] focus:border-[#722F37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Color Hue
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g. Crimson Red & Gold"
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-[#EADBCE] focus:border-[#722F37]"
                  />
                </div>
              </div>

              {/* Description with 250 word constraint */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Craftsmanship Description
                  </label>
                  <span
                    className={`text-[11px] ${
                      getWordCount(formData.description) > 250
                        ? "text-red-600 font-bold"
                        : getWordCount(formData.description) > 220
                        ? "text-amber-600 font-medium"
                        : "text-stone-400"
                    }`}
                  >
                    {getWordCount(formData.description)} / 250 words
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (formErrors.description) setFormErrors({ ...formErrors, description: "" });
                  }}
                  placeholder="Describe the intricate zari, motifs, embroidery or occasion suitability (max 250 words)..."
                  className={`w-full px-3.5 py-2 text-sm bg-white rounded-lg border ${
                    formErrors.description ? "border-red-400 focus:ring-red-400" : "border-[#EADBCE] focus:border-[#722F37]"
                  } focus:outline-none resize-none`}
                />
                {formErrors.description && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Toggles (Featured & Blouse Included - Stock removed) */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#722F37] focus:ring-[#722F37]"
                  />
                  <span>Highlight as Signature Atelier Piece</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={formData.blouseIncluded}
                    onChange={(e) =>
                      setFormData({ ...formData, blouseIncluded: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#722F37] focus:ring-[#722F37]"
                  />
                  <span>Blouse / Dupatta Included</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#EADBCE] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-[#722F37] hover:bg-[#54151C] text-[#F4E5BD] text-xs font-semibold shadow transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <div className="w-3.5 h-3.5 border-2 border-[#F4E5BD] border-t-transparent rounded-full animate-spin" />}
                  <span>{isSaving ? "Uploading & Saving..." : editingSaree ? "Update Product" : "Save to Catalogue"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-red-600 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                Remove Product from Catalogue?
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                This item will be permanently deleted from the catalogue. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeletingId(null)}
                className="w-full py-2.5 px-3 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                Keep Product
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="w-full py-2.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
