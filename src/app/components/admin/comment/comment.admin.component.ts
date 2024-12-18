import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommentResponse } from '../../../models/comment';
import { CommentStatus } from '../../../enums/comment-status.enum';
import { debounceTime, distinctUntilChanged, Subject, BehaviorSubject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SnackbarService } from '../../../services/snackbar.service';
import { CommentService } from '../../../services/comment.service';
import { CommentEnumService } from '../../../utils/comment-enum.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import isEqual from 'lodash-es/isEqual';
import { CommentListResponse } from '../../../responses/comment/comment-list-response';
import { ApiResponse } from '../../../models/response';
import { ConfirmDialogComponent, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog.component';
import { CustomPaginationComponent } from '../../common/custom-pagination/custom-pagination.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AuthService } from '../../../services/auth.service';

@UntilDestroy()
@Component({
  selector: 'comment-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, FlexLayoutModule, CustomPaginationComponent],
  templateUrl: './comment.admin.component.html',
  styleUrls: ['./comment.admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentAdminComponent implements OnInit {
  comments: CommentResponse[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;
  visiblePages: number[] = [];
  keyword: string = '';
  status: CommentStatus | '' = '';
  private searchSubject: Subject<string> = new Subject();
  private pageChangeSubject: Subject<number> = new Subject();
  private statusChangeSubject: Subject<CommentStatus | ''> = new Subject();
  private commentsCache: BehaviorSubject<CommentResponse[]> = new BehaviorSubject<CommentResponse[]>([]);
  dialogRef: MatDialogRef<any> | null = null;
  showClearIcon: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: SnackbarService,
    private commentService: CommentService,
    private commentEnumService: CommentEnumService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {}

  CommentStatus = this.commentEnumService.getCommentStatus();

  ngOnInit(): void {
    this.route.queryParams.pipe(untilDestroyed(this)).subscribe((params) => {
      this.keyword = params['keyword'] || '';
      this.currentPage = +params['page'] || 1;
      this.status = params['status'] || '';
      this.showClearIcon = this.keyword.length > 0;
      this.getComments();
    });

    this.searchSubject.pipe(debounceTime(300), untilDestroyed(this)).subscribe((keyword) => {
      this.keyword = keyword;
      this.updateUrl();
      this.getComments();
    });

    this.pageChangeSubject.pipe(debounceTime(300), distinctUntilChanged(), untilDestroyed(this)).subscribe((page) => {
      this.currentPage = page;
      this.updateUrl();
      this.getComments();
    });

    this.statusChangeSubject.pipe(debounceTime(300), distinctUntilChanged(), untilDestroyed(this)).subscribe((status) => {
      this.status = status;
      this.currentPage = 1;
      this.updateUrl();
      this.getComments();
    });
  }

  getComments() {
    this.commentService
      .getComments(this.keyword, this.currentPage - 1, this.itemsPerPage, this.status)
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
      )
      .subscribe({
        next: (response: ApiResponse<CommentListResponse>) => {
          if (response.status === 'OK' && response.data) {
            const newComments = response.data.comments;
            if (!isEqual(this.comments, newComments)) {
              this.comments = newComments;
              this.commentsCache.next(newComments);
              this.totalPages = response.data.totalPages;
              this.cdr.markForCheck();
            }
          }
        },
        error: (err) => {
          this.snackBar.show('Failed to load comments');
        },
      });
  }

  onPageChange(page: number) {
    if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
      this.pageChangeSubject.next(page);
    }
  }

  onSearchEnter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.keyword = target.value;
    this.searchSubject.next(this.keyword);
    this.showClearIcon = this.keyword.length > 0;
  }

  clearSearch(event: Event): void {
    this.keyword = '';
    this.showClearIcon = false;
    const input = (event.target as HTMLElement).parentElement?.querySelector('.comment-management__search-input') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.focus();
      this.onSearchEnter({ target: input } as unknown as Event);
    }
    this.currentPage = 1;
    this.updateUrl();
    this.getComments();
  }

  onFocusSearch(event: Event): void {
    this.showClearIcon = this.keyword.length > 0;
  }

  onBlurSearch(event: Event): void {
    if (this.keyword.length === 0) {
      this.showClearIcon = false;
    }
  }

  onStatusChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.statusChangeSubject.next(selectElement.value as CommentStatus | '');
  }

  updateCommentStatus(id: number, status: CommentStatus): void {
    if (id === null) {
      this.snackBar.show('Invalid comment ID');
      return;
    }
    const dialogData: ConfirmDialogData = {
      title: 'Confirm Action',
      message: `Are you sure you want to ${status.toLowerCase()} this comment?`,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
    };

    import('../shared/confirm-dialog/confirm-dialog.component').then(({ ConfirmDialogComponent }) => {
      this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: dialogData,
      });
      this.handleDialogResponseUpdateCommentStatus(this.dialogRef, id, status);
    });
  }

  private handleDialogResponseUpdateCommentStatus(
    dialogRef: MatDialogRef<ConfirmDialogComponent>,
    id: number,
    status: CommentStatus,
  ): void {
    dialogRef
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (result) => {
          if (result) {
            this.commentService
              .updateStatus(id, status)
              .pipe(untilDestroyed(this))
              .subscribe({
                next: (response: ApiResponse<void>) => {
                  if (response.status === 'OK') {
                    this.getComments();
                    this.cdr.markForCheck();
                  }
                },
                error: (err) => {
                  this.snackBar.show('Failed to update comment status');
                },
              });
          }
        },
      });
  }

  trackByCommentId(index: number, comment: CommentResponse): number {
    return comment.id;
  }

  updateUrl(): void {
    const currentParams = this.route.snapshot.queryParams;
    const queryParams = {
      keyword: this.keyword || undefined,
      page: this.currentPage > 1 ? this.currentPage : undefined,
      status: this.status || undefined,
    };
    if (!isEqual(currentParams, queryParams)) {
      this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
    }
  }

  toLowerCase(): string {
    return this.keyword.toLowerCase();
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/images/user-profile-default.jpeg';
  }

  async editComment(comment: any): Promise<void> {
    const dialogModule = await import('../update-comment/update-comment-admin.component');
    const dialogRef = this.dialog.open(dialogModule.UpdateCommentAdminComponent, {
      width: '600px',
      data: { comment },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updateCommentDTO = {
          userId: result.userId,
          content: result.content,
        };
        this.commentService.editComment(result.id, updateCommentDTO).subscribe({
          next: (response) => {
            if (response.status === 'OK') {
              this.getComments();
              this.cdr.markForCheck();
            }
          },
          error: (err) => {
            this.snackBar.show('Failed to update comment');
          },
        });
      }
    });
  }
}
