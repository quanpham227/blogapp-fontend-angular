// src/app/utils/file-validator.ts

export interface FileValidationResult {
  isValid: boolean;
  message?: string;
}

export function checkFile(
  file: File,
  uploadType: string,
): FileValidationResult {
  // Kiểm tra loại tệp
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      message: 'Chỉ cho phép tải lên các tệp ảnh (JPEG, PNG, GIF).',
    };
  }

  // Kiểm tra kích thước tệp (5MB = 5 * 1024 * 1024 bytes)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      message: 'Kích thước tệp không được vượt quá 5MB.',
    };
  }

  // Kiểm tra tên tệp (không chứa ký tự đặc biệt)
  const fileNamePattern = /^[a-zA-Z0-9_\-\.]+$/;
  if (!fileNamePattern.test(file.name)) {
    return {
      isValid: false,
      message: 'Tên tệp không được chứa ký tự đặc biệt.',
    };
  }

  // Kiểm tra phần mở rộng tệp
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return { isValid: false, message: 'Phần mở rộng tệp không hợp lệ.' };
  }

  // Kiểm tra loại ảnh đã được chọn
  if (!uploadType) {
    return {
      isValid: false,
      message: 'Vui lòng chọn loại ảnh trước khi tải lên.',
    };
  }

  return { isValid: true };
}
