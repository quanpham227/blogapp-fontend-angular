import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Category } from '../models/category';
import { Post } from '../models/post';

@Injectable({
  providedIn: 'root',
})
export class BlogStateService {
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  private articlesSubject = new BehaviorSubject<Post[]>([]);
  private selectedCategorySlugSubject = new BehaviorSubject<string>('');
  private selectedCategoryNameSubject = new BehaviorSubject<string>('');
  private currentPageSubject = new BehaviorSubject<number>(1);
  private totalPagesSubject = new BehaviorSubject<number>(0);

  categories$ = this.categoriesSubject.asObservable();
  articles$ = this.articlesSubject.asObservable();
  selectedCategorySlug$ = this.selectedCategorySlugSubject.asObservable();
  selectedCategoryName$ = this.selectedCategoryNameSubject.asObservable();
  currentPage$ = this.currentPageSubject.asObservable();
  totalPages$ = this.totalPagesSubject.asObservable();

  setCategories(categories: Category[]): void {
    this.categoriesSubject.next(categories);
  }

  setArticles(articles: Post[]): void {
    this.articlesSubject.next(articles);
  }

  setSelectedCategorySlug(slug: string): void {
    this.selectedCategorySlugSubject.next(slug);
  }

  setSelectedCategoryName(name: string): void {
    this.selectedCategoryNameSubject.next(name);
  }

  setCurrentPage(page: number): void {
    this.currentPageSubject.next(page);
  }

  setTotalPages(totalPages: number): void {
    this.totalPagesSubject.next(totalPages);
  }
}
