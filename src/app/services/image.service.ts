import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpRequest, HttpEvent } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/response';
import { SuccessHandlerService } from './success-handler.service';
import { tap, map } from 'rxjs/operators';
import { convertToCamelCase } from '../utils/case-converter';
import { ImageListResponse } from '../responses/image/image-list-response';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private imageApi = `${environment.apiBaseUrl}/images`;

  constructor(
    private http: HttpClient,
    private successHandlerService: SuccessHandlerService,
  ) {}

  getImages(
    keyword: string,
    objectType: string,
    page: number,
    limit: number,
  ): Observable<ApiResponse<ImageListResponse>> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('object_type', objectType)
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<ApiResponse<ImageListResponse>>(this.imageApi, { params }).pipe(
      map((response) => {
        if (response && response.data) {
          response.data.images = response.data.images.map((image) => convertToCamelCase(image));
        }
        return response;
      }),
    );
  }

  uploadImage(file: File, objectType: string): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('object_type', objectType);

    const req = new HttpRequest('POST', `${this.imageApi}/upload/single`, formData, {
      reportProgress: true,
      responseType: 'json',
    });

    return this.http.request(req);
  }

  deleteImages(ids: number[]): Observable<ApiResponse<any>> {
    return this.http
      .request<ApiResponse<any>>('delete', this.imageApi, { body: ids })
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }

  uploadImages(files: File[], objectType: string): Observable<HttpEvent<any>> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('object_type', objectType);

    const req = new HttpRequest('POST', `${this.imageApi}/upload/multiple`, formData, {
      reportProgress: true,
      responseType: 'json',
    });

    return this.http.request(req);
  }
}
