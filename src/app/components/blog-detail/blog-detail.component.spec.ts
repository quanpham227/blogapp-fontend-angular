import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { BlogDetailComponent } from './blog-detail.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PostService } from '../../services/post.service';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../../services/snackbar.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('BlogDetailComponent', () => {
  let component: BlogDetailComponent;
  let fixture: ComponentFixture<BlogDetailComponent>;
  let postServiceMock: any;
  let commentServiceMock: any;
  let authServiceMock: any;
  let snackBarServiceMock: any;

  beforeEach(async () => {
    postServiceMock = {
      getPostBySlug: jest.fn().mockReturnValue(of({ status: 'OK', data: { id: 1, title: 'Test Post', meta: {}, commentCount: 0 } })),
    };

    commentServiceMock = {
      getCommentsByPostId: jest.fn().mockReturnValue(of({ status: 'OK', data: [] })),
      addComment: jest.fn().mockReturnValue(of({ status: 'CREATED', data: { id: 1, content: 'Test Comment' } })),
      replyComment: jest.fn().mockReturnValue(of({ status: 'CREATED', data: { id: 2, content: 'Test Reply' } })),
    };

    authServiceMock = {
      isLoggedIn: jest.fn().mockReturnValue(true),
      getUserId: jest.fn().mockReturnValue(1),
    };

    snackBarServiceMock = {
      show: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, BlogDetailComponent],
      providers: [
        FormBuilder,
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => 'test-slug' }) } },
        { provide: PostService, useValue: postServiceMock },
        { provide: CommentService, useValue: commentServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: SnackbarService, useValue: snackBarServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize data on init', fakeAsync(() => {
    component.ngOnInit(); // Khởi chạy component
    flushMicrotasks(); // Xử lý bất đồng bộ từ `Promise` hoặc `Observable`

    // Kiểm tra các mock service được gọi đúng cách
    expect(postServiceMock.getPostBySlug).toHaveBeenCalledWith('test-slug');
    expect(commentServiceMock.getCommentsByPostId).toHaveBeenCalledWith(component.postId, component.currentPage, component.pageSize);
  }));

  it('should add a comment', fakeAsync(() => {
    // Đặt giá trị cho form thêm bình luận
    component.newCommentForm.setValue({ content: 'Test Comment' });

    // Gọi hàm thêm bình luận
    component.addComment();
    flushMicrotasks(); // Chờ xử lý bất đồng bộ

    // Kiểm tra mock service được gọi đúng cách
    expect(commentServiceMock.addComment).toHaveBeenCalledWith(1, 1, 'Test Comment');

    // Kiểm tra danh sách bình luận được cập nhật
    expect(component.comments.length).toBe(1);
    expect(component.comments[0].content).toBe('Test Comment');
  }));

  it('should reply to a comment', fakeAsync(() => {
    // Thêm comment mẫu
    component.comments = [
      { id: 1, content: 'Parent Comment', postId: 1, userId: 1, fullName: 'User', email: 'user@example.com', replies: [] },
    ];

    // Tạo form trả lời
    component.replyForms[1] = component.fb.group({ content: 'Test Reply' });

    // Gọi hàm trả lời bình luận
    component.addReply(1);
    flushMicrotasks(); // Chờ xử lý bất đồng bộ

    // Kiểm tra mock service được gọi đúng cách
    expect(commentServiceMock.replyComment).toHaveBeenCalledWith(1, 1, 'Test Reply', 1);

    // Kiểm tra danh sách replies được cập nhật
    expect(component.comments[0].replies?.length).toBe(1);
    expect(component.comments[0].replies?.[0].content).toBe('Test Reply');
  }));

  it('should toggle reply form visibility', () => {
    component.toggleReplyForm(1);
    expect(component.replyFormVisibility[1]).toBe(true);
    component.toggleReplyForm(1);
    expect(component.replyFormVisibility[1]).toBe(false);
  });

  it('should check if user is logged in', () => {
    // Trường hợp người dùng đã đăng nhập
    expect(component.checkLoggedIn()).toBe(true);

    // Trường hợp người dùng chưa đăng nhập
    authServiceMock.isLoggedIn.mockReturnValue(false);
    expect(component.checkLoggedIn()).toBe(false);

    // Kiểm tra SnackbarService được gọi
    expect(snackBarServiceMock.show).toHaveBeenCalledWith('Bạn cần đăng nhập để thực hiện hành động này.');
  });
});
