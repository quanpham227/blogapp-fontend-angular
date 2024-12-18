import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { UserDetailService } from '../../services/user.details';
import { SnackbarService } from '../../services/snackbar.service';
import { LoginResponse } from '../../responses/user/login.response';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let authServiceMock: any;
  let userDetailServiceMock: any;
  let routerMock: any;
  let snackBarMock: any;

  beforeEach(async () => {
    authServiceMock = {
      getUser: jest.fn(),
      loginWithRecovery: jest.fn(),
      getAccessToken: jest.fn(),
      getRefreshToken: jest.fn(),
      authenticate: jest.fn(),
      user$: of(null),
      setUser: jest.fn(),
    };

    userDetailServiceMock = {
      getUserDetail: jest.fn(),
    };

    routerMock = {
      navigate: jest.fn(),
    };

    snackBarMock = {
      show: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserDetailService, useValue: userDetailServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: SnackbarService, useValue: snackBarMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('validateForm', () => {
    it('should set errorMessage when form is invalid', () => {
      component.loginForm.controls['email'].setValue('');
      component.loginForm.controls['password'].setValue('');
      component.validateForm();
      expect(component.errorMessage).toEqual('Form không hợp lệ');
    });

    it('should clear errorMessage when form is valid', () => {
      component.loginForm.controls['email'].setValue('test@example.com');
      component.loginForm.controls['password'].setValue('password123');
      component.validateForm();
      expect(component.errorMessage).toBeNull();
    });
  });

  describe('login', () => {
    it('should not proceed if the form is invalid', () => {
      component.loginForm.controls['email'].setValue('');
      component.loginForm.controls['password'].setValue('');
      component.login();
      expect(authServiceMock.loginWithRecovery).not.toHaveBeenCalled();
    });

    it('should call loginWithRecovery and navigate on successful login', () => {
      const response: LoginResponse = {
        message: 'Login successful',
        status: 'OK',
        data: {
          tokenType: 'Bearer',
          id: 1,
          username: 'testUser',
          roles: { id: 1, name: 'USER' },
          message: 'Success',
          token: 'mockToken',
          refreshToken: 'mockRefreshToken',
        },
      };

      authServiceMock.loginWithRecovery.mockReturnValue(of(response));
      userDetailServiceMock.getUserDetail.mockReturnValue(of({ status: 'OK', data: { role: { name: 'USER' } } }));

      component.loginForm.controls['email'].setValue('test@example.com');
      component.loginForm.controls['password'].setValue('password123');
      component.login();

      expect(authServiceMock.loginWithRecovery).toHaveBeenCalled();
      expect(userDetailServiceMock.getUserDetail).toHaveBeenCalledWith('mockToken');
      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should set errorMessage on login failure', () => {
      authServiceMock.loginWithRecovery.mockReturnValue(throwError(() => new Error('Login failed')));

      component.loginForm.controls['email'].setValue('test@example.com');
      component.loginForm.controls['password'].setValue('password123');
      component.login();

      expect(authServiceMock.loginWithRecovery).toHaveBeenCalled();
      expect(component.errorMessage).toEqual('Đăng nhập thất bại. Vui lòng thử lại.');
    });
  });

  describe('navigateToDashboard', () => {
    it('should navigate to admin dashboard for ADMIN role', () => {
      component.userResponse = { role: { name: 'ADMIN' } } as any;
      component.navigateToDashboard();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
    });

    it('should navigate to home for USER role', () => {
      component.userResponse = { role: { name: 'USER' } } as any;
      component.navigateToDashboard();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should navigate to home if userResponse is null', () => {
      component.userResponse = null;
      component.navigateToDashboard();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('togglePasswordVisibility', () => {
    it('should toggle the passwordVisible state', () => {
      expect(component.passwordVisible).toBe(false);
      component.togglePasswordVisibility();
      expect(component.passwordVisible).toBe(true);
    });
  });

  describe('navigateToRegister', () => {
    it('should navigate to register page', () => {
      component.navigateToRegister();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/register']);
    });
  });

  describe('loginWithGoogle', () => {
    beforeEach(() => {
      delete (window as any).location;
      (window as any).location = { href: jest.fn() };
    });

    it('should redirect user to Google authentication URL', () => {
      authServiceMock.authenticate.mockReturnValue(of('http://google.com'));
      component.loginWithGoogle();
      expect(authServiceMock.authenticate).toHaveBeenCalledWith('google');
      expect(window.location.href).toBe('http://google.com');
    });
  });

  describe('loginWithFacebook', () => {
    beforeEach(() => {
      delete (window as any).location;
      (window as any).location = { href: jest.fn() };
    });

    it('should redirect user to Facebook authentication URL', () => {
      authServiceMock.authenticate.mockReturnValue(of('http://facebook.com'));
      component.loginWithFacebook();
      expect(authServiceMock.authenticate).toHaveBeenCalledWith('facebook');
      expect(window.location.href).toBe('http://facebook.com');
    });
  });
});
