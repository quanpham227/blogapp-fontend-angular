import { Post } from '../models/post';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../../app/models/response';
import { PostStatus } from '../enums/post-status.enum';
import { PostRequest } from '../request/post.request';
import { SuccessHandlerService } from './success-handler.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiAdminPosts = `${environment.apiBaseUrl}/admin/posts`;
  private apiUserPosts = `${environment.apiBaseUrl}/user/posts`;

  constructor(
    private http: HttpClient,
    private successHandlerService: SuccessHandlerService,
  ) {}

  getPostsForAdmin(
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
    return this.http.get<Post[]>(this.apiAdminPosts, { params });
  }

  getPostsForUser(keyword: string, categorySlug: string, page: number, limit: number): Observable<ApiResponse<Post[]>> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('categorySlug', categorySlug)
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<ApiResponse<Post[]>>(this.apiUserPosts, { params });
  }

  getPostBySlug(slug: string): Observable<ApiResponse<Post>> {
    return this.http.get<ApiResponse<Post>>(`${this.apiUserPosts}/${slug}`);
  }
  getRecentPosts(page: number, limit: number): Observable<Post[]> {
    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    return this.http.get<Post[]>(`${this.apiUserPosts}/recent`, {
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
    >(`${this.apiAdminPosts}/counts`);
  }

  insertPost(post: PostRequest): Observable<any> {
    return this.http
      .post<ApiResponse<Post>>(this.apiAdminPosts, post)
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }
  updatePost(id: number, post: PostRequest): Observable<ApiResponse<Post>> {
    return this.http
      .put<ApiResponse<Post>>(`${this.apiAdminPosts}/${id}`, post)
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }

  getPostById(id: number): Observable<ApiResponse<Post>> {
    return this.http.get<ApiResponse<Post>>(`${this.apiAdminPosts}/details/${id}`);
  }

  deletePost(id: number): Observable<any> {
    return this.http
      .delete<ApiResponse<any>>(`${this.apiAdminPosts}/${id}`)
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }

  deletePosts(ids: number[]): Observable<ApiResponse<any>> {
    return this.http
      .request<ApiResponse<any>>('delete', this.apiAdminPosts, { body: ids })
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }
}
