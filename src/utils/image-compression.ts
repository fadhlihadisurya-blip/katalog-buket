/**
 * Utilitas untuk kompresi gambar di sisi klien sebelum diunggah ke Firestore.
 * Membantu menjaga ukuran dokumen Firestore tetap di bawah 1MB.
 */

export const compressImage = (file: File, maxWidth = 600, maxHeight = 600, quality = 0.6): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Hitung rasio aspek
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal mendapatkan context canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Export ke Base64 dengan kualitas yang ditentukan
        let compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        
        // Validasi ukuran akhir (Base64)
        // Base64 size is roughly 1.33x the binary size
        let sizeInBytes = Math.ceil((compressedBase64.length * 3) / 4);
        
        if (sizeInBytes > 800000) { // 800KB safety limit
          // Coba kompres lagi lebih agresif (600px, kualitas 0.4)
          const backupCanvas = document.createElement('canvas');
          const finalWidth = Math.min(600, canvas.width);
          const finalHeight = (finalWidth / canvas.width) * canvas.height;
          backupCanvas.width = finalWidth;
          backupCanvas.height = finalHeight;
          const backupCtx = backupCanvas.getContext('2d');
          if (backupCtx) {
            backupCtx.drawImage(canvas, 0, 0, finalWidth, finalHeight);
            compressedBase64 = backupCanvas.toDataURL('image/jpeg', 0.4);
            sizeInBytes = Math.ceil((compressedBase64.length * 3) / 4);
            console.log(`Image resized again to ${sizeInBytes} bytes for Firestore compatibility.`);
          }
        }
        
        if (sizeInBytes > 1024 * 1024) { // Absolute 1MB limit for safety
          reject(new Error('Ukuran gambar masih terlalu besar setelah kompresi. Harap pilih foto lain atau perkecil resolusinya.'));
        } else {
          resolve(compressedBase64);
        }
      };
      img.onerror = () => reject(new Error('Gagal memuat gambar untuk dikompres'));
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
  });
};
