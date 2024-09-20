export interface Image {
  id: number;
  created_at: string;
  updated_at: string;
  image_url: string;
  public_id: string;
  file_name: string;
  object_type: string;
  file_type: string;
  file_size: number;
  is_used: boolean;
  usage_count: number;
  isTemporary?: boolean; // Thuộc tính tùy chọn để đánh dấu hình ảnh tạm thời
  isUploading?: boolean; // Thuộc tính tùy chọn để đánh dấu hình ảnh đang được tải lên
}
