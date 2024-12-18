import { Post } from '../models/post';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../../app/models/response';
import { PostStatus } from '../enums/post-status.enum';
import { PostRequest } from '../request/post.request';
import { SuccessHandlerService } from './success-handler.service';
import { tap, map } from 'rxjs/operators';
import { convertToCamelCase, convertToSnakeCase } from '../utils/case-converter';
import { PostListResponse } from '../responses/post/post-list-response';

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
    startDate?: string,
    endDate?: string,
  ): Observable<ApiResponse<PostListResponse>> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('categoryId', categoryId)
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status.toString());
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<ApiResponse<PostListResponse>>(this.apiAdminPosts, { params }).pipe(
      map((response) => {
        if (response && response.data) {
          response.data.posts = response.data.posts.map((post) => convertToCamelCase(post));
        }
        return response;
      }),
    );
  }

  getPostsForUser(keyword: string, categorySlug: string, page: number, limit: number): Observable<ApiResponse<PostListResponse>> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('categorySlug', categorySlug)
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<ApiResponse<PostListResponse>>(this.apiUserPosts, { params }).pipe(
      map((response) => {
        if (response && response.data) {
          response.data.posts = response.data.posts.map((post) => convertToCamelCase(post));
        }
        return response;
      }),
    );
  }

  getPostBySlug(slug: string): Observable<ApiResponse<Post>> {
    return this.http.get<ApiResponse<Post>>(`${this.apiUserPosts}/${slug}`).pipe(
      map((response) => {
        if (response && response.data) {
          response.data = convertToCamelCase(response.data);
        }
        return response;
      }),
    );
  }

  getRecentPosts(page: number, limit: number): Observable<ApiResponse<PostListResponse>> {
    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    return this.http.get<ApiResponse<PostListResponse>>(`${this.apiUserPosts}/recent`, { params }).pipe(
      map((response) => {
        if (response && response.data) {
          response.data.posts = response.data.posts.map((post) => convertToCamelCase(post));
        }
        return response;
      }),
    );
  }

  countPostsByStatus(): Observable<
    ApiResponse<{
      [key in PostStatus]: number;
    }>
  > {
    return this.http
      .get<
        ApiResponse<{
          [key in PostStatus]: number;
        }>
      >(`${this.apiAdminPosts}/counts`)
      .pipe(
        map((response) => {
          if (response && response.data) {
            response.data = convertToCamelCase(response.data);
          }
          return response;
        }),
      );
  }

  insertPost(post: PostRequest): Observable<any> {
    const snakeCasePost = convertToSnakeCase(post);
    return this.http
      .post<ApiResponse<Post>>(this.apiAdminPosts, snakeCasePost)
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }

  updatePost(id: number, post: PostRequest): Observable<ApiResponse<Post>> {
    const snakeCasePost = convertToSnakeCase(post);
    return this.http
      .put<ApiResponse<Post>>(`${this.apiAdminPosts}/${id}`, snakeCasePost)
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }

  getPostById(id: number): Observable<ApiResponse<Post>> {
    return this.http.get<ApiResponse<Post>>(`${this.apiAdminPosts}/details/${id}`).pipe(
      map((response) => {
        if (response && response.data) {
          response.data = convertToCamelCase(response.data);
        }
        return response;
      }),
    );
  }
  deleteOrDisablePost(id: number, isPermanent: boolean): Observable<ApiResponse<any>> {
    const url = `${this.apiAdminPosts}/disable/${id}/${isPermanent}`;
    return this.http.delete<ApiResponse<any>>(url).pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }
}
