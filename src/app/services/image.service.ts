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
import { ApiResponse } from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private imageAPI = `${environment.apiBaseUrl}/images`;

  constructor(private http: HttpClient) {}

  getImages(
    keyword: string,
    objectType: string,
    page: number,
    limit: number,
  ): Observable<{
    images: Image[];
    totalPages: number;
    totalFileSizes: number;
  }> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('object_type', objectType)
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<{
      images: Image[];
      totalPages: number;
      totalFileSizes: number;
    }>(this.imageAPI, { params });
  }

  getImageById(id: number): Observable<ApiResponse<Image>> {
    return this.http.get<ApiResponse<Image>>(`${this.imageAPI}/${id}`);
  }
  uploadImage(file: File, objectType: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('object_type', objectType);

    const req = new HttpRequest(
      'POST',
      `${this.imageAPI}/upload/single`,
      formData,
      {
        reportProgress: true, // Báo cáo tiến trình
      },
    );

    return this.http.request(req).pipe(
      map((event) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round((100 * event.loaded) / event.total!);
            return { status: 'progress', message: progress };
          case HttpEventType.Response:
            return (
              event.body ?? { status: 'error', message: 'No response body' }
            );
          default:
            return `Unhandled event: ${event.type}`;
        }
      }),
    );
  }

  deleteImages(ids: number[]): Observable<any> {
    return this.http.request('DELETE', this.imageAPI, { body: ids });
  }
}
