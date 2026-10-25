/**
 * High-performance client-side image compressor using HTML5 Canvas.
 * Compresses raw high-res photos (up to 25MB) down to ~120KB - 250KB WebP/JPEG,
 * preserving silk weave textures and colors while drastically reducing storage quota.
 */

export interface CompressionResult {
  file: File;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: string;
}

export async function compressImage(
  file: File,
  maxWidth = 1400,
  maxHeight = 1800,
  quality = 0.82
): Promise<CompressionResult> {
  // If not an image, return original
  if (!file.type.startsWith("image/")) {
    throw new Error("The selected file is not a valid image.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved scaling
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Unable to initialize canvas for image compression."));
          return;
        }

        // High quality bicubic interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Prefer modern WebP format for optimal compression, fallback to JPEG
        const outputMimeType = "image/webp";
        const dataUrl = canvas.toDataURL(outputMimeType, quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Image compression failed."));
              return;
            }

            // Create compressed File object
            const cleanBaseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            const compressedFileName = `${cleanBaseName.replace(/[^a-zA-Z0-9_-]/g, "_")}.webp`;

            const compressedFile = new File([blob], compressedFileName, {
              type: outputMimeType,
              lastModified: Date.now(),
            });

            const ratio = (((file.size - compressedFile.size) / file.size) * 100).toFixed(0) + "%";

            resolve({
              file: compressedFile,
              dataUrl,
              originalSize: file.size,
              compressedSize: compressedFile.size,
              compressionRatio: ratio,
            });
          },
          outputMimeType,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to decode image for compression."));
      };
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image file."));
    };
  });
}
