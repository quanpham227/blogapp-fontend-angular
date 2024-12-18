import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { UserService } from '../../services/user.service';
import { SnackbarService } from '../../services/snackbar.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userServiceMock: any;
  let routerMock: any;
  let snackbarMock: any;

  beforeEach(async () => {
    // Mock services
    userServiceMock = {
      register: jest.fn(),
    };
    routerMock = {
      navigate: jest.fn(),
    };
    snackbarMock = {
      show: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent, // Add the standalone component here
        ReactiveFormsModule, // Required for forms
      ],
      providers: [
        provideRouter([]), // Configure routes for testing
        { provide: UserService, useValue: userServiceMock }, // Mock UserService
        { provide: Router, useValue: routerMock }, // Mock Router
        { provide: SnackbarService, useValue: snackbarMock }, // Mock SnackbarService
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should not call register service if form is invalid', () => {
    component.registerForm.controls['fullName'].setValue('');
    component.registerForm.controls['phone'].setValue('');
    component.registerForm.controls['email'].setValue('');
    component.registerForm.controls['password'].setValue('');
    component.registerForm.controls['confirmPassword'].setValue('');
    component.registerForm.controls['terms'].setValue(false);

    component.onSubmit();

    expect(snackbarMock.show).toHaveBeenCalledWith('Please fill out all required fields correctly.');
    expect(userServiceMock.register).not.toHaveBeenCalled();
  });

  it('should call register service on valid form submission', () => {
    component.registerForm.controls['fullName'].setValue('John Doe');
    component.registerForm.controls['phone'].setValue('0123456789');
    component.registerForm.controls['email'].setValue('john@example.com');
    component.registerForm.controls['password'].setValue('Password1!');
    component.registerForm.controls['confirmPassword'].setValue('Password1!');
    component.registerForm.controls['terms'].setValue(true);

    userServiceMock.register.mockReturnValue(of({ status: 'OK' }));

    component.onSubmit();

    expect(userServiceMock.register).toHaveBeenCalledWith({
      fullName: 'John Doe',
      phoneNumber: '0123456789',
      email: 'john@example.com',
      password: 'Password1!',
      retypePassword: 'Password1!',
      facebookAccountId: '',
      googleAccountId: '',
      roleId: 2,
    });
    expect(snackbarMock.show).toHaveBeenCalledWith('Registration successful. Please login to continue.');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should display error on registration failure', () => {
    userServiceMock.register.mockReturnValue(throwError(() => new Error('Error')));

    component.registerForm.controls['fullName'].setValue('John Doe');
    component.registerForm.controls['phone'].setValue('0123456789');
    component.registerForm.controls['email'].setValue('john@example.com');
    component.registerForm.controls['password'].setValue('Password1!');
    component.registerForm.controls['confirmPassword'].setValue('Password1!');
    component.registerForm.controls['terms'].setValue(true);

    component.onSubmit();

    expect(snackbarMock.show).toHaveBeenCalledWith('Registration failed. Please try again.');
    expect(userServiceMock.register).toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
