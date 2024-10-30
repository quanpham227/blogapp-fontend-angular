import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommentResponse } from '../../../models/comment';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommentFormComponent } from '../comment-form/comment-form.component';

@Component({
  selector: 'app-reply-comment',
  templateUrl: './comment-reply.component.html',
  styleUrl: './comment-reply.component.scss',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, CommentFormComponent],
})
export class ReplyCommentComponent {
  @Input() reply!: CommentResponse;
  @Input() editingComment!: CommentResponse | null;
  @Input() editCommentForm!: FormGroup;

  @Output() editComment = new EventEmitter<CommentResponse>();
  @Output() deleteComment = new EventEmitter<number>();
  @Output() updateComment = new EventEmitter<void>();
  @Output() cancelEdit = new EventEmitter<void>();

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
