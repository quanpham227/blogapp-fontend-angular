import { Image } from '../../models/image';

export interface ImageListResponse {
  images: Image[];
  totalPages: number;
  totalFileSizes: number;
}
