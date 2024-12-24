import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CustomPaginationComponent } from '../../common/custom-pagination/custom-pagination.component';
import { User } from '../../../models/user';
import { Role } from '../../../models/role';
import { debounceTime, distinctUntilChanged, Subject, BehaviorSubject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { SnackbarService } from '../../../services/snackbar.service';
import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import isEqual from 'lodash-es/isEqual';
import { ApiResponse } from '../../../models/response';
import { UserListResponse } from '../../../responses/user/uses-list-response';
import { ConfirmDialogComponent, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UpdateUserAdminComponent } from '../update-user/update-user.admin.component';
import { AuthService } from '../../../services/auth.service';
import { UpdateUserByAdminDTO } from '../../../dtos/user/update.user.admin';
import { UserStatus } from '../../../enums/user-status.enum';

@UntilDestroy()
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, FormsModule, MatTooltipModule, ReactiveFormsModule, FlexLayoutModule, CustomPaginationComponent],
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  userStatus = UserStatus;
  selectedStatus: UserStatus = UserStatus.All;
  selectedRoleId: number = 0;
  token: string | null = '';
  dialogRef: MatDialogRef<any> | null = null;
  currentEditId: number | null = null;

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  keyword: string = '';
  private searchSubject: Subject<string> = this.createDebouncedSubject<string>(300);
  private usersCache: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  private rolesCache: BehaviorSubject<Role[]> = new BehaviorSubject<Role[]>([]);
  confirmDialogRef: MatDialogRef<any> | null = null;
  updateDialogRef: MatDialogRef<UpdateUserAdminComponent> | null = null;

  showClearIcon: boolean = false;

  constructor(
    private snackBar: SnackbarService,
    private userService: UserService,
    private roleService: RoleService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initSearch();
    this.getRoles();
    this.getUsers();
  }

  private createDebouncedSubject<T>(debounceTimeMs: number): Subject<T> {
    return new Subject<T>().pipe(debounceTime(debounceTimeMs), untilDestroyed(this)) as Subject<T>;
  }

  private initSearch() {
    this.searchSubject.pipe(distinctUntilChanged()).subscribe((keyword) => {
      this.keyword = keyword;
      this.currentPage = 1;
      this.getUsers();
    });
  }

  getUsers() {
    const status = this.convertStatus(this.selectedStatus);
    const params = { keyword: this.keyword, status, roleId: this.selectedRoleId, page: this.currentPage - 1, size: this.itemsPerPage };

    this.userService
      .findAllUsers(this.keyword, status, this.selectedRoleId, this.currentPage - 1, this.itemsPerPage)
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
      )
      .subscribe({
        next: (response) => this.handleUserResponse(response),
        error: () => this.snackBar.show('Failed to load users'),
      });
  }

  private handleUserResponse(response: ApiResponse<UserListResponse>) {
    if (response.status === 'OK' && response.data) {
      const { users, totalPages } = response.data;
      if (!isEqual(this.users, users)) {
        this.users = users;
        this.totalPages = totalPages;
        this.usersCache.next(users);
        this.cdr.markForCheck();
      }
    }
  }

  getRoles() {
    if (this.rolesCache.value.length > 0) {
      this.roles = this.rolesCache.value;
      this.cdr.markForCheck();
    } else {
      this.roleService
        .getRoles()
        .pipe(
          untilDestroyed(this),
          distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
        )
        .subscribe({
          next: (response: ApiResponse<Role[]>) => {
            if (response.status === 'OK' && response.data) {
              const newRoles = response.data;
              if (!isEqual(this.roles, newRoles)) {
                this.roles = newRoles;
                this.rolesCache.next(newRoles);
                this.cdr.markForCheck();
              }
            }
          },
          error: (err) => {
            this.snackBar.show('Failed to load roles');
          },
        });
    }
  }

  onStatusChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value as UserStatus;
    this.selectedStatus = value;
    this.currentPage = 1;
    this.getUsers();
  }

  onRoleChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedRoleId = +selectElement.value;
    this.currentPage = 1;
    this.getUsers();
  }

  onSearchEnter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.keyword = target.value;
    this.searchSubject.next(this.keyword);
    this.showClearIcon = this.keyword.length > 0;
  }

  onBlurSearch(): void {
    this.showClearIcon = this.keyword.length > 0;
  }

  clearSearch(event: Event): void {
    this.keyword = '';
    this.showClearIcon = false;
    const input = (event.target as HTMLElement).parentElement?.querySelector('.users-admin__search-input') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.focus();
      this.onSearchEnter({ target: input } as unknown as Event);
    }
    this.currentPage = 1;
    this.getUsers();
  }

  onPageChange(page: number) {
    if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getUsers();
    }
  }

  private convertStatus(status: UserStatus): boolean | null {
    switch (status) {
      case UserStatus.Active:
        return true;
      case UserStatus.Inactive:
        return false;
      default:
        return null;
    }
  }

  blockOrEnableUser(id: number, active: boolean): void {
    if (id === null) {
      this.snackBar.show('User ID is invalid');
      return;
    }
    const dialogData: ConfirmDialogData = {
      title: active ? 'Confirm Enable' : 'Confirm Block',
      message: active ? 'Are you sure you want to enable this user?' : 'Are you sure you want to block this user?',
      confirmText: active ? 'Enable' : 'Block',
      cancelText: 'Cancel',
    };

    import('../shared/confirm-dialog/confirm-dialog.component').then(({ ConfirmDialogComponent }) => {
      this.confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: dialogData,
      });
      this.handleDialogResponseBlockUser(this.confirmDialogRef, id, active);
    });
  }

  private handleDialogResponseBlockUser(dialogRef: MatDialogRef<ConfirmDialogComponent>, id: number, active: boolean): void {
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.userService
            .blockOrEnableUser(id, active)
            .pipe(untilDestroyed(this))
            .subscribe({
              next: (response: ApiResponse<void>) => {
                if (response.status === 'OK') {
                  this.users = this.users.map((user) => {
                    if (user.id === id) {
                      user.isActive = active;
                    }
                    return user;
                  });
                  this.cdr.markForCheck();
                }
              },
              error: () => {
                this.snackBar.show('Failed to update user status');
              },
            });
        }
      },
    });
  }

  editUser(user: User): void {
    this.updateDialogRef = this.dialog.open(UpdateUserAdminComponent, {
      width: '600px',
      data: {
        ...user,
        roleId: user.role.id,
      },
    });

    this.updateDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.token = this.authService.getAccessToken();
        if (this.token) {
          this.userService.updateUserByAdmin(this.token, user.id, new UpdateUserByAdminDTO(result)).subscribe({
            next: (response: ApiResponse<User>) => {
              if (response.status === 'OK') {
                this.getUsers();
              }
            },
            error: (err) => {
              this.snackBar.show('Failed to update user');
            },
          });
        }
      }
    });
  }
  deleteUser(id: number): void {
    if (id === null) {
      this.snackBar.show('Invalid slide ID');
      return;
    }
    const dialogData: ConfirmDialogData = {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this slide?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    };

    import('../shared/confirm-dialog/confirm-dialog.component').then(({ ConfirmDialogComponent }) => {
      this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: dialogData,
      });
      this.handleDialogResponseDelete(this.dialogRef, id);
    });
  }

  private handleDialogResponseDelete(dialogRef: MatDialogRef<ConfirmDialogComponent>, id: number): void {
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.userService
          .deleteUser(id)
          .pipe(untilDestroyed(this))
          .subscribe((response: ApiResponse<any>) => {
            if (response.status === 'OK') {
              this.users = this.users.filter((user) => user.id !== id);
              this.cdr.markForCheck(); // Inform Angular to check for changes
            }
          });
      }
    });
  }
  trackByUserId(index: number, user: User): number {
    return user.id;
  }
}
