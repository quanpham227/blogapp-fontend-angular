import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
interface Tag {
  id: number;
  name: string;
  isEditing: boolean;
  editName: string;
}
@Component({
  selector: 'app-tag-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tag-admin.component.html',
  styleUrls: ['./tag-admin.component.scss'],
})
export class TagAdminComponent {
  tags: Tag[] = [];
  filteredTags: Tag[] = [];
  tagForm: FormGroup;
  searchQuery: string = '';
  isLoading: boolean = false;
  showDeleteModal: boolean = false;
  tagToDelete: Tag | null = null;

  constructor(private fb: FormBuilder) {
    this.tagForm = this.fb.group({
      newTag: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit() {
    this.tags = [
      { id: 1, name: 'Technology', isEditing: false, editName: '' },
      { id: 2, name: 'Programming', isEditing: false, editName: '' },
      { id: 3, name: 'Web Development', isEditing: false, editName: '' },
    ];
    this.filteredTags = [...this.tags];
  }

  filterTags() {
    this.filteredTags = this.tags.filter((tag) => tag.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }

  addTag() {
    if (this.tagForm.valid) {
      this.isLoading = true;
      const newTagName = this.tagForm.controls['newTag'].value;

      setTimeout(() => {
        const newTag: Tag = {
          id: this.tags.length + 1,
          name: newTagName,
          isEditing: false,
          editName: '',
        };

        this.tags.push(newTag);
        this.filterTags();
        this.tagForm.reset();
        this.isLoading = false;
      }, 1000);
    }
  }

  enableEditing(tag: Tag) {
    tag.isEditing = true;
    tag.editName = tag.name;
  }

  updateTag(tag: Tag) {
    if (tag.editName.trim()) {
      tag.name = tag.editName.trim();
      tag.isEditing = false;
      this.filterTags();
    }
  }

  cancelEditing(tag: Tag) {
    tag.isEditing = false;
    tag.editName = '';
  }

  openDeleteModal(tag: Tag) {
    this.tagToDelete = tag;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (this.tagToDelete) {
      this.tags = this.tags.filter((t) => t.id !== this.tagToDelete!.id);
      this.filterTags();
      this.closeDeleteModal();
    }
  }

  cancelDelete() {
    this.closeDeleteModal();
  }

  private closeDeleteModal() {
    this.showDeleteModal = false;
    this.tagToDelete = null;
  }
}
