import { Saree, Inquiry, ProductType } from "@/types/saree";
import { supabase, isSupabaseConfigured } from "./supabase";
import { INITIAL_SAREES } from "./mock-data";
import { compressImage } from "./image-compressor";

const LOCAL_STORAGE_KEY = "anandam_sarees_store_v2";
const LOCAL_INQUIRIES_KEY = "anandam_inquiries_store_v2";

function getLocalSarees(): Saree[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    const items = JSON.parse(stored);
    if (Array.isArray(items)) {
      return items.filter((s: Saree) => !s.id?.startsWith("prod-"));
    }
    return [];
  } catch (err) {
    return [];
  }
}

// Safe localStorage saver that gracefully handles QuotaExceededError
function saveLocalSarees(sarees: Saree[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sarees));
  } catch (err: any) {
    // If QuotaExceededError occurs, clean up large base64 images from items
    try {
      const sanitized = sarees.map((s) => ({
        ...s,
        imageUrl: s.imageUrl?.startsWith("data:")
          ? "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"
          : s.imageUrl,
        secondaryImageUrl: s.secondaryImageUrl?.startsWith("data:")
          ? undefined
          : s.secondaryImageUrl,
      }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
    } catch {
      // Storage fully saturated, ignore silently without throwing
    }
  }
}

function getLocalInquiries(): Inquiry[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LOCAL_INQUIRIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalInquiries(inquiries: Inquiry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_INQUIRIES_KEY, JSON.stringify(inquiries));
  } catch {
    // ignore
  }
}

function mapDbRowToSaree(row: any): Saree {
  let secImg = row.secondary_image_url;
  let secImages: string[] = [];
  if (Array.isArray(row.secondary_images) && row.secondary_images.length > 0) {
    secImages = row.secondary_images;
    if (!secImg) secImg = row.secondary_images[0];
  } else if (typeof row.secondary_images === "string") {
    try {
      const parsed = JSON.parse(row.secondary_images);
      if (Array.isArray(parsed)) {
        secImages = parsed;
        if (!secImg && parsed.length > 0) secImg = parsed[0];
      }
    } catch {
      // ignore
    }
  }

  let sizes: string[] = [];
  if (Array.isArray(row.sizes) && row.sizes.length > 0) {
    sizes = row.sizes;
  } else if (typeof row.sizes === "string" && row.sizes.trim()) {
    try {
      const parsed = JSON.parse(row.sizes);
      if (Array.isArray(parsed)) {
        sizes = parsed;
      } else {
        sizes = row.sizes.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
    } catch {
      sizes = row.sizes.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
  }

  let description = row.description || "";

  // Always parse sizes from description comment — this is the reliable fallback
  // when the Supabase `sizes` column doesn't exist or returns null
  const sizeMatch = description.match(/<!--SIZES:(.*?)-->/);
  if (sizeMatch && sizeMatch[1]) {
    try {
      const parsedSizes = JSON.parse(sizeMatch[1]);
      if (Array.isArray(parsedSizes) && parsedSizes.length > 0) {
        // Description-embedded sizes override DB column if DB column is empty
        if (sizes.length === 0) sizes = parsedSizes;
      }
    } catch {
      // ignore
    }
    description = description.replace(/<!--SIZES:.*?-->/g, "").trim();
  }

  const secImgMatch = description.match(/<!--SEC_IMAGES:(.*?)-->/);
  if (secImgMatch && secImgMatch[1]) {
    try {
      const parsedImages = JSON.parse(secImgMatch[1]);
      if (Array.isArray(parsedImages) && secImages.length === 0) {
        secImages = parsedImages;
        if (!secImg && parsedImages.length > 0) secImg = parsedImages[0];
      }
    } catch {
      // ignore
    }
    description = description.replace(/<!--SEC_IMAGES:.*?-->/g, "").trim();
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug || row.id,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    type: (row.type as ProductType) || "Saree",
    imageUrl: row.image_url,
    secondaryImageUrl: secImg || undefined,
    secondaryImages: secImages.length > 0 ? secImages : undefined,
    sizes: sizes.length > 0 ? sizes : undefined,
    description: description,
    fabric: row.fabric || "",
    length: row.length || "Standard ethnic wear dimensions",
    blouseIncluded: Boolean(row.blouse_included),
    color: row.color || "",
    featured: Boolean(row.featured),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || undefined,
  };
}

function mapSareeToDbRow(saree: Partial<Saree>): Record<string, any> {
  const row: Record<string, any> = {};
  if (saree.name !== undefined) row.name = saree.name;
  if (saree.slug !== undefined) row.slug = saree.slug;
  if (saree.price !== undefined) row.price = saree.price;
  if (saree.originalPrice !== undefined) row.original_price = saree.originalPrice;
  if (saree.type !== undefined) row.type = saree.type;
  if (saree.imageUrl !== undefined) row.image_url = saree.imageUrl;

  if (saree.secondaryImages !== undefined) {
    row.secondary_images = saree.secondaryImages;
  } else if (saree.secondaryImageUrl !== undefined) {
    row.secondary_images = saree.secondaryImageUrl ? [saree.secondaryImageUrl] : [];
  }

  if (saree.sizes !== undefined) {
    row.sizes = saree.sizes;
  }

  let desc = saree.description !== undefined ? saree.description : "";
  // Strip old tags
  desc = desc.replace(/<!--SIZES:.*?-->/g, "").replace(/<!--SEC_IMAGES:.*?-->/g, "").trim();

  // Always embed sizes in description as fallback — this ensures sizes survive
  // even if the Supabase `sizes` column doesn't exist yet
  if (saree.sizes !== undefined) {
    desc += `\n<!--SIZES:${JSON.stringify(saree.sizes)}-->`;
  }
  if (saree.secondaryImages && saree.secondaryImages.length > 0) {
    desc += `\n<!--SEC_IMAGES:${JSON.stringify(saree.secondaryImages)}-->`;
  }

  if (saree.description !== undefined || saree.sizes !== undefined || (saree.secondaryImages && saree.secondaryImages.length > 0)) {
    row.description = desc;
  }

  if (saree.fabric !== undefined) row.fabric = saree.fabric;
  if (saree.length !== undefined) row.length = saree.length;
  if (saree.blouseIncluded !== undefined) row.blouse_included = saree.blouseIncluded;
  if (saree.color !== undefined) row.color = saree.color;
  if (saree.featured !== undefined) row.featured = saree.featured;
  row.updated_at = new Date().toISOString();
  return row;
}

export async function checkStorageBucketExists(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { data, error } = await supabase.storage.getBucket("saree-images");
    return !error && Boolean(data);
  } catch {
    return false;
  }
}

export async function fetchAllSarees(): Promise<{ data: Saree[]; error: string | null }> {
  try {
    const local = getLocalSarees();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("sarees")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase fetchAllSarees error, using local fallback:", error);
        return { data: local, error: null };
      }

      if (data) {
        const dbSarees = data.map(mapDbRowToSaree);
        // Seamlessly merge local products so new products or fallbacks are immediately visible
        const dbIds = new Set(dbSarees.map((s) => s.id));
        const dbSlugs = new Set(dbSarees.map((s) => s.slug));
        const uniqueLocal = local.filter((s) => !dbIds.has(s.id) && !dbSlugs.has(s.slug));
        return { data: [...uniqueLocal, ...dbSarees], error: null };
      }

      return { data: local, error: null };
    }

    return { data: local, error: null };
  } catch (err) {
    console.error("fetchAllSarees error:", err);
    return { data: getLocalSarees(), error: null };
  }
}

export async function fetchSareeById(idOrSlug: string): Promise<{ data: Saree | null; error: string | null }> {
  try {
    if (isSupabaseConfigured && supabase) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      const query = isUuid
        ? supabase.from("sarees").select("*").eq("id", idOrSlug).maybeSingle()
        : supabase.from("sarees").select("*").eq("slug", idOrSlug).maybeSingle();

      const { data, error } = await query;
      if (!error && data) {
        return { data: mapDbRowToSaree(data), error: null };
      }
    }

    const local = getLocalSarees();
    const found = local.find((s) => s.id === idOrSlug || s.slug === idOrSlug) || null;
    return { data: found, error: found ? null : "Product not found in catalogue." };
  } catch {
    const local = getLocalSarees();
    const found = local.find((s) => s.id === idOrSlug || s.slug === idOrSlug) || null;
    return { data: found, error: null };
  }
}

export async function createSaree(
  sareeInput: Omit<Saree, "id" | "createdAt">
): Promise<{ data: Saree | null; error: string | null }> {
  try {
    const slug =
      sareeInput.slug ||
      sareeInput.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + `-${Date.now().toString().slice(-4)}`;

    const newSaree: Saree = {
      ...sareeInput,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `saree-${Date.now()}`,
      slug,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const dbPayload = mapSareeToDbRow(newSaree);
      dbPayload.slug = slug;
      dbPayload.created_at = newSaree.createdAt;

      // Only provide ID if it is a valid UUID, otherwise Postgres DEFAULT gen_random_uuid() handles it
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newSaree.id);
      if (isUuid) {
        dbPayload.id = newSaree.id;
      }

      let { data, error } = await supabase.from("sarees").insert(dbPayload).select().single();
      
      // Auto-retry if optional columns don't exist in the current database schema
      if (error && (error.code === "PGRST204" || error.message?.toLowerCase().includes("sizes") || error.message?.toLowerCase().includes("secondary_images") || error.message?.toLowerCase().includes("column"))) {
        delete dbPayload.sizes;
        delete dbPayload.secondary_images;
        delete dbPayload.secondary_image_url;
        const retry = await supabase.from("sarees").insert(dbPayload).select().single();
        data = retry.data;
        error = retry.error;
      }

      if (!error && data) {
        const created = mapDbRowToSaree(data);
        const current = getLocalSarees();
        saveLocalSarees([created, ...current.filter((s) => s.id !== created.id)]);
        return { data: created, error: null };
      }

      // If Supabase insert failed, save to local storage mirror so product is immediately available
      console.warn("Supabase insert notice, saving to local mirror:", error);
      const current = getLocalSarees();
      saveLocalSarees([newSaree, ...current]);
      return { data: newSaree, error: null };
    }

    const current = getLocalSarees();
    saveLocalSarees([newSaree, ...current]);
    return { data: newSaree, error: null };
  } catch (err: any) {
    console.error("createSaree caught exception:", err);
    const local = getLocalSarees();
    const fallbackSaree: Saree = {
      ...sareeInput,
      id: `saree-${Date.now()}`,
      slug: sareeInput.slug || `saree-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    saveLocalSarees([fallbackSaree, ...local]);
    return { data: fallbackSaree, error: null };
  }
}

export async function updateSaree(
  id: string,
  updates: Partial<Saree>
): Promise<{ data: Saree | null; error: string | null }> {
  try {
    if (isSupabaseConfigured && supabase) {
      const dbPayload = mapSareeToDbRow(updates);
      let { data, error } = await supabase
        .from("sarees")
        .update(dbPayload)
        .eq("id", id)
        .select()
        .single();

      if (error && (error.code === "PGRST204" || error.message?.toLowerCase().includes("sizes") || error.message?.toLowerCase().includes("secondary_images") || error.message?.toLowerCase().includes("column"))) {
        delete dbPayload.sizes;
        delete dbPayload.secondary_images;
        delete dbPayload.secondary_image_url;
        const retry = await supabase
          .from("sarees")
          .update(dbPayload)
          .eq("id", id)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (!error && data) {
        const updated = mapDbRowToSaree(data);
        const current = getLocalSarees();
        const idx = current.findIndex((s) => s.id === id);
        if (idx !== -1) {
          current[idx] = updated;
          saveLocalSarees(current);
        }
        return { data: updated, error: null };
      }
    }

    const current = getLocalSarees();
    const index = current.findIndex((s) => s.id === id);
    if (index === -1) {
      return { data: null, error: "The product you wish to edit does not exist." };
    }
    const updatedItem: Saree = {
      ...current[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    current[index] = updatedItem;
    saveLocalSarees(current);
    return { data: updatedItem, error: null };
  } catch {
    return {
      data: null,
      error: "Failed to save product updates. Please try again.",
    };
  }
}

/**
 * Extracts storage relative file path from a Supabase storage URL.
 * Example: https://xyz.supabase.co/storage/v1/object/public/saree-images/products/123.webp
 * Returns: "products/123.webp"
 */
export function extractStoragePath(url: string, bucket = "saree-images"): string | null {
  if (!url || typeof url !== "string") return null;
  try {
    const marker = `/${bucket}/`;
    const index = url.indexOf(marker);
    if (index === -1) return null;
    let path = url.slice(index + marker.length);
    path = path.split("?")[0].split("#")[0];
    return decodeURIComponent(path);
  } catch {
    return null;
  }
}

/**
 * Deletes photos from Supabase Storage bucket to keep free tier storage optimized.
 */
export async function deleteStorageImages(urls: (string | undefined | null)[]): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  const paths: string[] = [];
  for (const u of urls) {
    if (!u) continue;
    const path = extractStoragePath(u, "saree-images");
    if (path && !paths.includes(path)) {
      paths.push(path);
    }
  }

  if (paths.length > 0) {
    try {
      await supabase.storage.from("saree-images").remove(paths);
    } catch (err) {
      console.error("Storage image removal notice:", err);
    }
  }
}

export async function deleteSaree(
  id: string,
  extraImageUrls?: string[]
): Promise<{ success: boolean; error: string | null }> {
  try {
    // 1. Collect all images to delete from Supabase storage bucket
    const imagesToDelete: string[] = extraImageUrls ? [...extraImageUrls] : [];

    const local = getLocalSarees();
    const found = local.find((s) => s.id === id);
    if (found) {
      if (found.imageUrl) imagesToDelete.push(found.imageUrl);
      if (found.secondaryImageUrl) imagesToDelete.push(found.secondaryImageUrl);
      if (Array.isArray(found.secondaryImages)) {
        imagesToDelete.push(...found.secondaryImages);
      }
    }

    if (isSupabaseConfigured && supabase) {
      const { data: dbItem } = await supabase
        .from("sarees")
        .select("image_url, secondary_images")
        .eq("id", id)
        .maybeSingle();

      if (dbItem) {
        if (dbItem.image_url) imagesToDelete.push(dbItem.image_url);
        if (Array.isArray(dbItem.secondary_images)) {
          imagesToDelete.push(...dbItem.secondary_images);
        }
      }

      // Purge storage objects from Supabase bucket
      if (imagesToDelete.length > 0) {
        await deleteStorageImages(imagesToDelete);
      }

      // Delete database row
      await supabase.from("sarees").delete().eq("id", id);
    } else if (imagesToDelete.length > 0) {
      await deleteStorageImages(imagesToDelete);
    }

    const filtered = local.filter((s) => s.id !== id);
    saveLocalSarees(filtered);
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Could not remove product. Please try again." };
  }
}

/**
 * Uploads saree photo with automatic client-side compression.
 * Reduces photos to optimized WebP before uploading to storage.
 */
export async function uploadSareeImage(
  file: File
): Promise<{ url: string | null; error: string | null; compressionInfo?: string }> {
  try {
    // 1. Client-side compression
    const { file: compressedFile, dataUrl, compressionRatio, compressedSize } = await compressImage(file);
    const sizeKb = Math.round(compressedSize / 1024);
    const compressionInfo = `Compressed by ${compressionRatio} to ${sizeKb} KB`;

    // 2. Upload to storage bucket 'saree-images' if configured
    if (isSupabaseConfigured && supabase) {
      const fileName = `${Date.now()}-${compressedFile.name}`;
      const filePath = `products/${fileName}`;

      try {
        const { data, error } = await supabase.storage
          .from("saree-images")
          .upload(filePath, compressedFile, {
            cacheControl: "31536000",
            contentType: "image/webp",
            upsert: true,
          });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from("saree-images")
            .getPublicUrl(data.path);

          return {
            url: publicUrlData.publicUrl,
            error: null,
            compressionInfo,
          };
        }

        console.warn("Supabase storage upload notice, falling back to optimized inline image:", error);
      } catch (uploadErr) {
        console.warn("Supabase storage upload exception, falling back to optimized inline image:", uploadErr);
      }
    }

    // Reliable fallback: use the client-side compressed WebP data URL
    // Ensures product creation never fails if Supabase bucket RLS or connection is unavailable
    if (dataUrl) {
      return {
        url: dataUrl,
        error: null,
        compressionInfo,
      };
    }

    return {
      url: null,
      error: "Failed to process photo. Please try again.",
    };
  } catch (err: any) {
    console.error("uploadSareeImage error:", err);
    return {
      url: null,
      error: err.message || "Unable to compress and upload photo.",
    };
  }
}

export async function submitInquiry(
  inquiry: Omit<Inquiry, "id" | "createdAt" | "status">
): Promise<{ data: Inquiry | null; error: string | null }> {
  try {
    const address = [
      inquiry.customerAddress?.trim(),
      inquiry.customerCity?.trim(),
      inquiry.customerState?.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    const preferences: string[] = [];
    if (inquiry.selectedSize) preferences.push(`Size: ${inquiry.selectedSize}`);
    if (inquiry.preferredBudget) preferences.push(`Budget: ${inquiry.preferredBudget}`);
    if (inquiry.customerCity || inquiry.customerState) {
      preferences.push(
        `Location: ${[inquiry.customerCity, inquiry.customerState].filter(Boolean).join(", ")}`
      );
    }

    let detailedNotes = inquiry.notes?.trim() || "";
    if (preferences.length > 0) {
      const meta = `[${preferences.join(" | ")}]`;
      detailedNotes = detailedNotes ? `${meta} ${detailedNotes}` : meta;
    }

    const cityState = [inquiry.customerCity, inquiry.customerState].filter(Boolean).join(", ") || address;

    const newInquiry: Inquiry = {
      ...inquiry,
      customerAddress: address,
      customerCity: cityState,
      notes: detailedNotes,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `inq-${Date.now()}`,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const dbInquiry = {
        saree_id: inquiry.sareeId,
        saree_name: inquiry.sareeName,
        saree_price: inquiry.sareePrice,
        quantity: inquiry.quantity,
        customer_name: inquiry.customerName,
        customer_phone: inquiry.customerPhone,
        customer_city: cityState || null,
        notes: detailedNotes || null,
        status: "new",
      };

      await supabase.from("inquiries").insert(dbInquiry);
    }

    const list = getLocalInquiries();
    saveLocalInquiries([newInquiry, ...list]);
    return { data: newInquiry, error: null };
  } catch {
    return {
      data: null,
      error: "Unable to log inquiry. You can still message directly via WhatsApp.",
    };
  }
}

export async function fetchInquiries(): Promise<{ data: Inquiry[]; error: string | null }> {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return {
          data: data.map((d: any) => ({
            id: d.id,
            sareeId: d.saree_id,
            sareeName: d.saree_name,
            sareePrice: Number(d.saree_price),
            quantity: d.quantity,
            customerName: d.customer_name,
            customerPhone: d.customer_phone,
            customerAddress: d.customer_city || undefined,
            customerCity: d.customer_city,
            notes: d.notes,
            status: d.status,
            createdAt: d.created_at,
          })),
          error: null,
        };
      }
    }

    return { data: getLocalInquiries(), error: null };
  } catch {
    return { data: getLocalInquiries(), error: null };
  }
}

export async function updateInquiryStatus(
  id: string,
  status: Inquiry["status"]
): Promise<{ success: boolean; error: string | null }> {
  try {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("inquiries").update({ status }).eq("id", id);
    }
    const current = getLocalInquiries();
    const updated = current.map((i) => (i.id === id ? { ...i, status } : i));
    saveLocalInquiries(updated);
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Failed to update status." };
  }
}
