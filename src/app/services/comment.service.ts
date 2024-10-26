import { ApiResponse } from '../models/response';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AddCommentRequest,
  DeleteCommentRequest,
  UpdateCommentRequest,
} from '../request/comment.request';
import { CommentResponse } from '../models/comment';
@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiComments = `${environment.apiBaseUrl}/comments`;

  constructor(private http: HttpClient) {}
  // Lấy danh sách bình luận theo postId
  getCommentsByPostId(
    postId: number,
  ): Observable<ApiResponse<CommentResponse[]>> {
    return this.http.get<ApiResponse<CommentResponse[]>>(
      `${this.apiComments}/post/${postId}`,
    );
  }

  addComment(
    postId: number,
    userId: number,
    content: string,
  ): Observable<ApiResponse<CommentResponse>> {
    return this.http.post<ApiResponse<CommentResponse>>(
      `${this.apiComments}/add`,
      { post_id: postId, user_id: userId, content },
    );
  }
  replyComment(
    commentId: number,
    userId: number,
    content: string,
    parentCommentId: number,
  ): Observable<ApiResponse<CommentResponse>> {
    return this.http.post<ApiResponse<CommentResponse>>(
      `${this.apiComments}/reply`,
      {
        commentId,
        user_id: userId,
        content,
        parent_comment_id: parentCommentId,
      },
    );
  }

  editComment(
    commentId: number,
    userId: number,
    content: string,
  ): Observable<ApiResponse<CommentResponse>> {
    return this.http.put<ApiResponse<CommentResponse>>(
      `${this.apiComments}/edit/${commentId}`,
      { user_id: userId, content },
    );
  }
  deleteComment(commentId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiComments}/delete/${commentId}`,
    );
  }
}
