import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { BlogComponent } from './blog.component';
import { CategoryService } from '../../services/category.service';
import { PostService } from '../../services/post.service';
import { BlogStateService } from '../../services/blog-state.service';
import { HttpStatusService } from '../../services/http-status.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { SnackbarService } from '../../services/snackbar.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CustomPaginationComponent } from '../common/custom-pagination/custom-pagination.component';
import { LazyLoadDirective } from '../../directives/lazy-load.directive';

describe('BlogComponent', () => {
  let component: BlogComponent;
  let fixture: ComponentFixture<BlogComponent>;
  let categoryServiceMock: any;
  let postServiceMock: any;
  let blogStateServiceMock: any;
  let httpStatusServiceMock: any;
  let routerMock: any;
  let activatedRouteMock: any;
  let titleServiceMock: any;
  let metaServiceMock: any;
  let snackBarServiceMock: any;

  beforeEach(async () => {
    categoryServiceMock = {
      getCategories: jest.fn().mockReturnValue(of({ status: 'OK', data: [] })),
    };

    postServiceMock = {
      getPostsForUser: jest.fn().mockReturnValue(of({ status: 'OK', data: { posts: new Array(10).fill({}), totalPages: 2 } })),
    };

    blogStateServiceMock = {
      categories$: of([]),
      articles$: of([]),
      selectedCategorySlug$: of(''),
      selectedCategoryName$: of(''),
      currentPage$: of(1),
      totalPages$: of(2),
      setCategories: jest.fn(),
      setArticles: jest.fn(),
      setSelectedCategorySlug: jest.fn(),
      setSelectedCategoryName: jest.fn(),
      setCurrentPage: jest.fn(),
      setTotalPages: jest.fn(),
    };

    httpStatusServiceMock = {
      pendingRequests$: of(false),
    };

    routerMock = {
      navigate: jest.fn(),
      url: '/blog',
    };

    activatedRouteMock = {
      params: of({}),
      queryParams: of({}),
    };

    titleServiceMock = {
      setTitle: jest.fn(),
    };

    metaServiceMock = {
      updateTag: jest.fn(),
    };

    snackBarServiceMock = {
      show: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        NoopAnimationsModule,
        MatPaginatorModule,
        CustomPaginationComponent,
        LazyLoadDirective,
        BlogComponent,
      ],
      providers: [
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: PostService, useValue: postServiceMock },
        { provide: BlogStateService, useValue: blogStateServiceMock },
        { provide: HttpStatusService, useValue: httpStatusServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Title, useValue: titleServiceMock },
        { provide: Meta, useValue: metaServiceMock },
        { provide: SnackbarService, useValue: snackBarServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get categories on init', () => {
    expect(categoryServiceMock.getCategories).toHaveBeenCalled();
  });

  it('should get posts on init', () => {
    expect(postServiceMock.getPostsForUser).toHaveBeenCalled();
  });

  it('should handle error on get categories', () => {
    categoryServiceMock.getCategories.mockReturnValue(throwError('error'));
    component.getCategories();
    expect(categoryServiceMock.getCategories).toHaveBeenCalled();
  });

  it('should handle error on get posts', () => {
    postServiceMock.getPostsForUser.mockReturnValue(throwError('error'));
    component.getPosts();
    expect(postServiceMock.getPostsForUser).toHaveBeenCalled();
  });

  it('should update form values on category select', () => {
    const event = { code: 'test-code', name: 'test-name' };
    component.onCategorySelect(event);
    expect(blogStateServiceMock.setSelectedCategorySlug).toHaveBeenCalledWith('test-code');
    expect(blogStateServiceMock.setSelectedCategoryName).toHaveBeenCalledWith('test-name');
  });

  it('should clear category', () => {
    component.clearCategory();
    expect(blogStateServiceMock.setSelectedCategorySlug).toHaveBeenCalledWith('');
    expect(blogStateServiceMock.setSelectedCategoryName).toHaveBeenCalledWith('');
  });

  it('should navigate to correct route on page change', () => {
    component.onPageChange(2);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/blog/page', 2]);
  });

  it('should show snackbar on invalid post click', () => {
    component.onPostClick('');
    expect(snackBarServiceMock.show).toHaveBeenCalledWith('Invalid slug');
  });

  it('should navigate to correct route on valid post click', () => {
    component.onPostClick('valid-slug');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/blog/valid-slug']);
  });

  it('should toggle dropdown', () => {
    component.toggleDropdown();
    expect(component.showDropdown).toBe(true);
  });

  it('should limit words and characters in input', () => {
    const event = {
      target: { value: 'This is a test input with extra words and characters' },
    };

    component.limitWords(event, 5, 30); // Giới hạn 5 từ và 30 ký tự

    expect(event.target.value).toBe('This is a test input'); // Kết quả mong đợi
  });
  it('should limit words and characters in input', () => {
    const event = {
      target: { value: 'This is a test input with extra words and characters' },
    };

    component.limitWords(event, 5, 30); // Giới hạn 5 từ và 30 ký tự

    expect(event.target.value).toBe('This is a test input'); // Kết quả mong đợi
  });
  it('should limit characters to maxChars before reaching maxWords', () => {
    const event = { target: { value: 'This input has verylongwordthatexceeds limit' } };
    component.limitWords(event, 10, 20);
    expect(event.target.value).toBe('This input has');
  });
  it('should handle empty input without errors', () => {
    const event = { target: { value: '' } };
    component.limitWords(event, 5, 30);
    expect(event.target.value).toBe('');
  });

  it('should format keyword correctly', () => {
    const formattedKeyword = component['formatKeyword']('test keyword');
    expect(formattedKeyword).toBe('test-keyword');
  });

  it('should toggle clear icon', () => {
    component.searchForm.get('keyword')?.setValue('test');
    component.toggleClearIcon();
    expect(component.showClearIcon).toBe(true);
  });

  it('should reset search form', () => {
    component.resetSearch();
    expect(component.searchForm.value).toEqual({
      keyword: '',
      categorySlug: null,
      selectedCategoryName: '',
      page: 1,
    });
    expect(component.showClearIcon).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/blog']);
  });

  it('should update meta tags', () => {
    component['updateMetaTags']();
    expect(titleServiceMock.setTitle).toHaveBeenCalledWith('PI VINA DANANG - BLOG');
    expect(metaServiceMock.updateTag).toHaveBeenCalledWith({ name: 'description', content: 'This is the blog page of My Website.' });
  });
});
