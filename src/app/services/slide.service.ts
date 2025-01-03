import { ApiResponse } from '../models/response';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Slide } from '../models/slide';
import { SlideRequest } from '../request/slide.request';
import { SuccessHandlerService } from './success-handler.service';
import { tap, map } from 'rxjs/operators';
import { convertToCamelCase, convertToSnakeCase } from '../utils/case-converter';

@Injectable({
  providedIn: 'root',
})
export class SlideService {
  private apiSlides = `${environment.apiBaseUrl}/slides`;

  constructor(
    private http: HttpClient,
    private successHandlerService: SuccessHandlerService,
  ) {}

  getSlidesForAdmin(): Observable<ApiResponse<Slide[]>> {
    return this.http.get<ApiResponse<Slide[]>>(`${this.apiSlides}/admin`).pipe(
      map((response) => {
        if (response && response.data) {
          response.data = response.data.map((slide) => convertToCamelCase(slide));
        }
        return response;
      }),
    );
  }
  getActiveSlidesForUser(): Observable<ApiResponse<Slide[]>> {
    return this.http.get<ApiResponse<Slide[]>>(`${this.apiSlides}/user`).pipe(
      map((response) => {
        if (response && response.data) {
          response.data = response.data.map((slide) => convertToCamelCase(slide));
        }
        return response;
      }),
    );
  }

  insertSlide(slide: SlideRequest): Observable<ApiResponse<Slide>> {
    const snakeCaseSlide = convertToSnakeCase(slide);
    return this.http.post<ApiResponse<Slide>>(this.apiSlides, snakeCaseSlide).pipe(
      tap((response) => this.successHandlerService.handleApiResponse(response)),
      map((response) => {
        if (response && response.data) {
          response.data = convertToCamelCase(response.data);
        }
        return response;
      }),
    );
  }

  deleteSlide(id: number): Observable<any> {
    return this.http
      .delete<ApiResponse<any>>(`${this.apiSlides}/${id}`)
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }

  getSlideById(id: number): Observable<ApiResponse<Slide>> {
    return this.http.get<ApiResponse<Slide>>(`${this.apiSlides}/${id}`).pipe(
      map((response) => {
        if (response && response.data) {
          response.data = convertToCamelCase(response.data);
        }
        return response;
      }),
    );
  }

  updateSlide(id: number, slide: SlideRequest): Observable<ApiResponse<Slide>> {
    const snakeCaseSlide = convertToSnakeCase(slide);
    return this.http.put<ApiResponse<Slide>>(`${this.apiSlides}/${id}`, snakeCaseSlide).pipe(
      tap((response) => this.successHandlerService.handleApiResponse(response)),
      map((response) => {
        if (response && response.data) {
          response.data = convertToCamelCase(response.data);
        }
        return response;
      }),
    );
  }
  updateSlideOrder(slides: Slide[]): Observable<ApiResponse<void>> {
    return this.http
      .put<ApiResponse<void>>(`${this.apiSlides}/order`, slides)
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }
}
