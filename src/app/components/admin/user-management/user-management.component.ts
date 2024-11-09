import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  paginatedUsers: any[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  sortField = 'id';
  sortDirection = 'asc';
  searchTerm = '';
  filterRole = '';
  showModal = false;
  editMode = false;
  userForm: FormGroup;
  selectedUser: any = null;
  showConfirmDialog = false;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['user', Validators.required],
    });
  }

  ngOnInit() {
    this.users = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      status: i % 2 === 0 ? 'active' : 'inactive',
      role: i % 3 === 0 ? 'admin' : 'user',
    }));
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.users.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedUsers = this.users.slice(start, end);
  }

  changePage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  sort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.users.sort((a: any, b: any) => {
      const aValue = a[field];
      const bValue = b[field];
      return this.sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    this.updatePagination();
  }

  filterUsers() {
    let filteredUsers = [...this.users];

    if (this.searchTerm) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchTerm.toLowerCase()),
      );
    }

    if (this.filterRole) {
      filteredUsers = filteredUsers.filter((user) => user.role === this.filterRole);
    }

    this.users = filteredUsers;
    this.currentPage = 1;
    this.updatePagination();
  }

  toggleStatus(user: any) {
    user.status = user.status === 'active' ? 'inactive' : 'active';
  }

  updateUserRole(user: any) {
    console.log(`Updated ${user.name}'s role to ${user.role}`);
  }

  openAddUserModal() {
    this.editMode = false;
    this.userForm.reset({ role: 'user' });
    this.showModal = true;
  }

  editUser(user: any) {
    this.editMode = true;
    this.selectedUser = user;
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.userForm.reset();
    this.selectedUser = null;
  }

  submitForm() {
    if (this.userForm.valid) {
      const userData = this.userForm.value;

      if (this.editMode && this.selectedUser) {
        const index = this.users.findIndex((u) => u.id === this.selectedUser.id);
        this.users[index] = {
          ...this.selectedUser,
          ...userData,
        };
      } else {
        const newUser = {
          id: this.users.length + 1,
          ...userData,
          status: 'active',
        };
        this.users.unshift(newUser);
      }

      this.updatePagination();
      this.closeModal();
    }
  }

  deleteUser(user: any) {
    this.selectedUser = user;
    this.showConfirmDialog = true;
  }

  confirmDelete() {
    if (this.selectedUser) {
      this.users = this.users.filter((u) => u.id !== this.selectedUser.id);
      this.updatePagination();
      this.showConfirmDialog = false;
      this.selectedUser = null;
    }
  }

  cancelDelete() {
    this.showConfirmDialog = false;
    this.selectedUser = null;
  }
}
