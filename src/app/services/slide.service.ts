import { ApiResponse } from '../models/response';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Slide } from '../models/slide';
import { SlideRequest } from '../request/slide.request';
@Injectable({
  providedIn: 'root',
})
export class SlideService {
  private apiSlides = `${environment.apiBaseUrl}/slides`;

  constructor(private http: HttpClient) {}
  getSlides(): Observable<ApiResponse<Slide[]>> {
    return this.http.get<ApiResponse<Slide[]>>(this.apiSlides);
  }

  insertSlide(slide: SlideRequest): Observable<ApiResponse<Slide>> {
    return this.http.post<ApiResponse<Slide>>(this.apiSlides, slide);
  }

  deleteSlide(id: number): Observable<any> {
    return this.http.delete(`${this.apiSlides}/${id}`);
  }
  getSlideById(id: number): Observable<ApiResponse<Slide>> {
    return this.http.get<ApiResponse<Slide>>(`${this.apiSlides}/${id}`);
  }

  updateSlide(id: number, slide: SlideRequest): Observable<ApiResponse<Slide>> {
    return this.http.put<ApiResponse<Slide>>(`${this.apiSlides}/${id}`, slide);
  }
}
