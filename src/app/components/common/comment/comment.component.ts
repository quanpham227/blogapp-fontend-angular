import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommentResponse } from '../../../models/comment';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReplyCommentComponent } from '../comment-reply/comment-reply.component';
import { CommentFormComponent } from '../comment-form/comment-form.component';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ReplyCommentComponent, CommentFormComponent],
})
export class CommentComponent {
  @Input() comment!: CommentResponse;
  @Input() replyForms!: { [key: number]: FormGroup };
  @Input() replyFormVisibility!: { [key: number]: boolean };
  @Input() editingComment!: CommentResponse | null;
  @Input() editCommentForm!: FormGroup;

  @Output() toggleReplyForm = new EventEmitter<number>();
  @Output() editComment = new EventEmitter<CommentResponse>();
  @Output() deleteComment = new EventEmitter<number>();
  @Output() addReply = new EventEmitter<number>();
  @Output() updateComment = new EventEmitter<void>();
  @Output() cancelEdit = new EventEmitter<void>();
  trackByCommentId(index: number, comment: CommentResponse): number {
    return comment.id;
  }
  getRelativeTime(date?: string): string {
    if (!date) {
      return 'Ngày không xác định'; // hoặc bất kỳ giá trị mặc định nào bạn muốn
    }

    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  }
}
