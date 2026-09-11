/**
 * Reads an image file and returns a compressed JPEG data URL, downscaled so
 * its longest side is at most `maxDimension`. Uploaded photos (e.g. straight
 * from a phone camera) can be several MB raw; storing that many times over
 * in localStorage as base64 easily blows past the browser's storage quota
 * and crashes the app (see ShipmentContext's persist effect). Compressing
 * client-side keeps every stored shipment small and fast to load.
 */
export function compressImage(file: File, maxDimension = 1280, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Gagal membaca file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Gagal memuat gambar."));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Canvas unsupported for some reason - fall back to the original.
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
