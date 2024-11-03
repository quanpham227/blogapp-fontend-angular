import { ApiResponse } from '../models/response';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { CommentResponse } from '../models/comment';
import { SuccessHandlerService } from './success-handler.service';
import { tap } from 'rxjs/operators';
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
  getCommentsByPostId(postId: number): Observable<ApiResponse<CommentResponse[]>> {
    return this.http.get<ApiResponse<CommentResponse[]>>(`${this.apiComments}/post/${postId}`);
  }

  addComment(postId: number, userId: number, content: string): Observable<ApiResponse<CommentResponse>> {
    return this.http
      .post<ApiResponse<CommentResponse>>(`${this.apiComments}/add`, {
        post_id: postId,
        user_id: userId,
        content,
      })
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }
  replyComment(
    commentId: number,
    userId: number,
    content: string,
    parentCommentId: number,
  ): Observable<ApiResponse<CommentResponse>> {
    return this.http
      .post<ApiResponse<CommentResponse>>(`${this.apiComments}/reply`, {
        commentId,
        user_id: userId,
        content,
        parent_comment_id: parentCommentId,
      })
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }

  editComment(commentId: number, userId: number, content: string): Observable<ApiResponse<CommentResponse>> {
    return this.http
      .put<ApiResponse<CommentResponse>>(`${this.apiComments}/edit/${commentId}`, {
        user_id: userId,
        content,
      })
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }
  deleteComment(commentId: number): Observable<ApiResponse<void>> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiComments}/delete/${commentId}`)
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }
}
