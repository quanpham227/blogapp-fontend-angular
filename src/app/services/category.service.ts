import { ApiResponse } from '../models/response';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from '../models/category';
import { CategoryRequest } from '../request/category.request';
import { SuccessHandlerService } from './success-handler.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiCategories = `${environment.apiBaseUrl}/categories`;

  constructor(
    private http: HttpClient,
    private successHandlerService: SuccessHandlerService,
  ) {}
  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(this.apiCategories);
  }
  getTopCategoriesByPostCount(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.apiCategories}/top`);
  }

  insertCategory(category: CategoryRequest): Observable<ApiResponse<any>> {
    return this.http
      .post<ApiResponse<Category>>(this.apiCategories, category)
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }

  deleteCategory(id: number): Observable<any> {
    return this.http
      .delete<ApiResponse<any>>(`${this.apiCategories}/${id}`)
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }
  getCategoryById(id: number): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${this.apiCategories}/${id}`);
  }

  updateCategory(id: number, category: CategoryRequest): Observable<ApiResponse<Category>> {
    return this.http
      .put<ApiResponse<Category>>(`${this.apiCategories}/${id}`, category)
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }
}
