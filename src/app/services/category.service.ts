import { ApiResponse } from '../models/response';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from '../models/category';
import { CategoryRequest } from '../request/category.request';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiCategories = `${environment.apiBaseUrl}/categories`;

  constructor(private http: HttpClient) {}
  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(this.apiCategories);
  }
  getTopCategoriesByPostCount(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.apiCategories}/top`);
  }

  insertCategory(category: CategoryRequest): Observable<any> {
    return this.http.post(this.apiCategories, category);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiCategories}/${id}`);
  }
  getCategoryById(id: number): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${this.apiCategories}/${id}`);
  }

  updateCategory(
    id: number,
    category: CategoryRequest,
  ): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(
      `${this.apiCategories}/${id}`,
      category,
    );
  }
}
