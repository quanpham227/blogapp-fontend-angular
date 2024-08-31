import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpRequest,
  HttpEventType,
} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Image } from '../models/image';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private imageUrl = `${environment.apiBaseUrl}/images`;

  constructor(private http: HttpClient) {}

  getImages(keyword: string, page: number, limit: number): Observable<Image[]> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<Image[]>(this.imageUrl, { params });
  }

  uploadImage(file: File, objectType: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('object_type', objectType);

    const req = new HttpRequest(
      'POST',
      `${this.imageUrl}/upload/single`,
      formData,
      {
        reportProgress: true, // Báo cáo tiến trình
      },
    );

    return this.http.request(req); // Sử dụng request để theo dõi từng sự kiện
  }
}
