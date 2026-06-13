/**
 * Validasi file upload foto.
 * Hanya menerima 1 file gambar dengan ekstensi .jpg, .jpeg, .png, atau .gif.
 * Ukuran maksimal dibatasi (misal 5MB) untuk mencegah Denial of Wallet.
 */

export const ALLOWED_EXTENSIONS = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateProductImage = (file: File): ValidationResult => {
  if (!file) {
    return { isValid: false, error: 'File tidak ditemukan.' };
  }

  if (!ALLOWED_EXTENSIONS.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Format file tidak didukung. Gunakan .jpg, .jpeg, .png, atau .gif.' 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `Ukuran file terlalu besar. Maksimal ${MAX_FILE_SIZE / (1024 * 1024)}MB.` 
    };
  }

  return { isValid: true };
};

/**
 * Format currency to IDR
 */
export const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};
