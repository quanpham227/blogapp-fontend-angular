import { Injectable } from '@angular/core';
import { PostStatus } from '../enums/post-status.enum';
import { PostVisibility } from '../enums/post-visibility.enum';
import { CommentStatus } from '../enums/comment-status.enum';

@Injectable({
  providedIn: 'root',
})
export class CommentEnumService {
  getCommentStatus(): typeof CommentStatus {
    return CommentStatus;
  }
}
