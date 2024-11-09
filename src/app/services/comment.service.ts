import { ApiResponse } from '../models/response';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { CommentResponse } from '../models/comment';
import { SuccessHandlerService } from './success-handler.service';
import { tap, map } from 'rxjs/operators';
import { camelCase, mapKeys, snakeCase } from 'lodash';
@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiComments = `${environment.apiBaseUrl}/comments`;

  constructor(
    private http: HttpClient,
    private successHandlerService: SuccessHandlerService,
  ) {}
  // Lấy danh sách bình luận theo postId
  getCommentsByPostId(postId: number, page: number, size: number): Observable<ApiResponse<CommentResponse[]>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http.get<ApiResponse<CommentResponse[]>>(`${this.apiComments}/post/${postId}`, { params }).pipe(
      map((response) => {
        if (response && response.data) {
          response.data = response.data.map((comment) => this.convertToCamelCase(comment));
        }
        return response;
      }),
    );
  }

  addComment(postId: number, userId: number, content: string): Observable<ApiResponse<CommentResponse>> {
    const snakeCaseComment = this.convertToSnakeCase({ postId, userId, content });
    return this.http.post<ApiResponse<CommentResponse>>(`${this.apiComments}/add`, snakeCaseComment).pipe(
      tap((response) => this.successHandlerService.handleApiResponse(response)),
      map((response) => {
        if (response && response.data) {
          response.data = this.convertToCamelCase(response.data);
        }
        return response;
      }),
    );
  }
  replyComment(
    commentId: number,
    userId: number,
    content: string,
    parentCommentId: number,
  ): Observable<ApiResponse<CommentResponse>> {
    const snakeCaseComment = this.convertToSnakeCase({ commentId, userId, content, parentCommentId });
    return this.http.post<ApiResponse<CommentResponse>>(`${this.apiComments}/reply`, snakeCaseComment).pipe(
      tap((response) => this.successHandlerService.handleApiResponse(response)),
      map((response) => {
        if (response && response.data) {
          response.data = this.convertToCamelCase(response.data);
        }
        return response;
      }),
    );
  }

  editComment(commentId: number, userId: number, content: string): Observable<ApiResponse<CommentResponse>> {
    const snakeCaseComment = this.convertToSnakeCase({ commentId, userId, content });
    return this.http.put<ApiResponse<CommentResponse>>(`${this.apiComments}/edit/${commentId}`, snakeCaseComment).pipe(
      tap((response) => this.successHandlerService.handleApiResponse(response)),
      map((response) => {
        if (response && response.data) {
          response.data = this.convertToCamelCase(response.data);
        }
        return response;
      }),
    );
  }
  deleteComment(commentId: number): Observable<ApiResponse<void>> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiComments}/delete/${commentId}`)
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }
  private convertToCamelCase(data: any): CommentResponse {
    return mapKeys(data, (value, key) => camelCase(key)) as CommentResponse;
  }
  private convertToSnakeCase(data: any): any {
    return mapKeys(data, (value, key) => snakeCase(key));
  }
}
