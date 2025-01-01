import { ApiResponse } from '../models/response';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { CommentResponse } from '../models/comment';
import { SuccessHandlerService } from './success-handler.service';
import { tap, map } from 'rxjs/operators';
import { CommentStatus } from '../enums/comment-status.enum';
import { CommentListResponse } from '../responses/comment/comment-list-response';
import { convertToCamelCase, convertToSnakeCase } from '../utils/case-converter';
@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiComments = `${environment.apiBaseUrl}/comments`;

  constructor(
    private http: HttpClient,
    private successHandlerService: SuccessHandlerService,
  ) {}

  getComments(keyword: string, page: number, limit: number, status?: '' | CommentStatus): Observable<ApiResponse<CommentListResponse>> {
    let params = new HttpParams().set('keyword', keyword).set('page', page.toString()).set('limit', limit.toString());

    if (status) {
      params = params.set('status', status.toString());
    }

    return this.http.get<ApiResponse<CommentListResponse>>(this.apiComments, { params }).pipe(
      map((response) => {
        if (response && response.data) {
          response.data.comments = response.data.comments.map((comment) => convertToCamelCase(comment));
        }
        return response;
      }),
    );
  }

  // Lấy danh sách bình luận theo postId
  getCommentsByPostId(postId: number, page: number, size: number): Observable<ApiResponse<CommentResponse[]>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http.get<ApiResponse<CommentResponse[]>>(`${this.apiComments}/post/${postId}`, { params }).pipe(
      map((response) => {
        if (response && response.data) {
          response.data = response.data.map((comment) => convertToCamelCase(comment));
        }
        return response;
      }),
    );
  }

  addComment(postId: number, userId: number, content: string): Observable<ApiResponse<CommentResponse>> {
    const snakeCaseComment = convertToSnakeCase({ postId, userId, content });
    return this.http.post<ApiResponse<CommentResponse>>(`${this.apiComments}/add`, snakeCaseComment).pipe(
      tap((response) => this.successHandlerService.handleApiResponse(response)),
      map((response) => {
        if (response && response.data) {
          response.data = convertToCamelCase(response.data);
        }
        return response;
      }),
    );
  }
  replyComment(commentId: number, userId: number, content: string, parentCommentId: number): Observable<ApiResponse<CommentResponse>> {
    const snakeCaseComment = convertToSnakeCase({ commentId, userId, content, parentCommentId });
    return this.http.post<ApiResponse<CommentResponse>>(`${this.apiComments}/reply`, snakeCaseComment).pipe(
      tap((response) => this.successHandlerService.handleApiResponse(response)),
      map((response) => {
        if (response && response.data) {
          response.data = convertToCamelCase(response.data);
        }
        return response;
      }),
    );
  }

  editComment(commentId: number, updateCommentDTO: { userId: number; content: string }): Observable<ApiResponse<CommentResponse>> {
    const snakeCaseComment = convertToSnakeCase(updateCommentDTO);
    return this.http.put<ApiResponse<CommentResponse>>(`${this.apiComments}/edit/${commentId}`, snakeCaseComment).pipe(
      tap((response) => this.successHandlerService.handleApiResponse(response)),
      map((response) => {
        if (response && response.data) {
          response.data = convertToCamelCase(response.data);
        }
        return response;
      }),
    );
  }
  updateStatus(commentId: number, status: CommentStatus): Observable<ApiResponse<void>> {
    return this.http
      .put<ApiResponse<void>>(`${this.apiComments}/updateStatus/${commentId}`, { status })
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }
}
