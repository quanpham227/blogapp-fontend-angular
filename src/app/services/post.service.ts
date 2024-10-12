import { Post } from '../models/post';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../../app/models/response';
import { PostStatus } from '../enums/post-status.enum';
import { PostRequest } from '../request/post.request';
import { UpdatePostRequest } from '../request/update-post.request';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiPost = `${environment.apiBaseUrl}/posts`;

  constructor(private http: HttpClient) {}

  getPosts(
    keyword: string,
    categoryId: number,
    page: number,
    limit: number,
    status?: '' | PostStatus,
    createdAt?: string,
  ): Observable<Post[]> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('category_id', categoryId)
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status.toString());
    }
    if (createdAt) {
      params = params.set('created_at', createdAt);
    }
    return this.http.get<Post[]>(this.apiPost, { params });
  }
  getDetailPost(slug: string): Observable<ApiResponse<Post>> {
    return this.http.get<ApiResponse<Post>>(`${this.apiPost}/${slug}`);
  }
  getRecentPosts(page: number, limit: number): Observable<Post[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<Post[]>(`${this.apiPost}/recent`, {
      params,
    });
  }

  countPostsByStatus(): Observable<
    ApiResponse<{
      [key in PostStatus]: number;
    }>
  > {
    return this.http.get<
      ApiResponse<{
        [key in PostStatus]: number;
      }>
    >(`${this.apiPost}/counts`);
  }

  insertPost(post: PostRequest): Observable<any> {
    return this.http.post(this.apiPost, post);
  }
  updatePost(id: number, post: PostRequest): Observable<ApiResponse<Post>> {
    return this.http.put<ApiResponse<Post>>(`${this.apiPost}/${id}`, post);
  }

  getPostById(id: number): Observable<ApiResponse<Post>> {
    return this.http.get<ApiResponse<Post>>(`${this.apiPost}/details/${id}`);
  }
}
