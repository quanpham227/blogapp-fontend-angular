import { Post } from '../models/post';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../../app/models/response';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiGetPots = `${environment.apiBaseUrl}/posts`;

  constructor(private http: HttpClient) {}

  getPosts(
    keyword: string,
    categoryId: number,
    page: number,
    limit: number,
  ): Observable<Post[]> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('category_id', categoryId)
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<Post[]>(this.apiGetPots, { params });
  }
  getDetailPost(slug: string): Observable<ApiResponse<Post>> {
    return this.http.get<ApiResponse<Post>>(`${this.apiGetPots}/${slug}`);
  }
  getRecentPosts(page: number, limit: number): Observable<Post[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<Post[]>(`${this.apiGetPots}/recent`, {
      params,
    });
  }
}
