import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BlogStateService {
  private currentPage: number = 1;
  private currentCategory: string = '';
  private currentKeyword: string = '';

  setCurrentPage(page: number) {
    this.currentPage = page;
  }

  getCurrentPage(): number {
    return this.currentPage;
  }

  setCurrentCategory(category: string) {
    this.currentCategory = category;
  }

  getCurrentCategory(): string {
    return this.currentCategory;
  }

  setCurrentKeyword(keyword: string) {
    this.currentKeyword = keyword;
  }

  getCurrentKeyword(): string {
    return this.currentKeyword;
  }
}
