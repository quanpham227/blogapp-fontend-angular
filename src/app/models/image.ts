export interface Image {
  id: number;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  publicId: string;
  fileName: string;
  objectType: string;
  fileType: string;
  fileSize: number;
  isUsed: boolean;
  usageCount: number;
  isTemporary?: boolean; // Thuộc tính tùy chọn để đánh dấu hình ảnh tạm thời
  isUploading?: boolean; // Thuộc tính tùy chọn để đánh dấu hình ảnh đang được tải lên
  uploadProgress?: number;
}
