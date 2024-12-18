import { Injectable } from '@angular/core';
import { PostStatus } from '../enums/post-status.enum';
import { PostVisibility } from '../enums/post-visibility.enum';

@Injectable({
  providedIn: 'root',
})
export class PostEnumService {
  getPostStatus(): typeof PostStatus {
    return PostStatus;
  }

  getPostVisibility(): typeof PostVisibility {
    return PostVisibility;
  }
}
