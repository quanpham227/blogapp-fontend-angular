import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AboutComponent } from './about.component';
import { AboutService } from '../../services/about.service';
import { About } from '../../models/about';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;
  let aboutServiceMock: any;

  beforeEach(async () => {
    aboutServiceMock = {
      getAbout: jest.fn().mockReturnValue(of({ data: {} })),
      updateAbout: jest.fn().mockReturnValue(of({ data: {} })),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, AboutComponent],
      providers: [{ provide: AboutService, useValue: aboutServiceMock }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get about data on init', () => {
    const aboutData: About = {
      id: 1,
      title: 'About Us',
      content: 'Content',
      imageUrl: 'image.jpg',
      address: '123 Street',
      phoneNumber: '123456789',
      email: 'test@example.com',
      workingHours: '9-5',
      facebookLink: 'facebook.com',
      youtube: 'youtube.com',
      visionStatement: 'Vision',
      foundingDate: '2020-01-01',
      ceoName: 'CEO',
    };

    aboutServiceMock.getAbout.mockReturnValue(of({ data: aboutData }));

    component.ngOnInit();

    expect(aboutServiceMock.getAbout).toHaveBeenCalled();
    expect(component.about).toEqual(aboutData);
    expect(component.businessForm.value).toEqual(aboutData);
    expect(component.isLoading).toBe(false);
  });

  it('should handle error on get about data', () => {
    aboutServiceMock.getAbout.mockReturnValue(throwError('error'));

    component.ngOnInit();

    expect(aboutServiceMock.getAbout).toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
  });

  it('should toggle edit mode', () => {
    component.toggleEditMode();
    expect(component.isEditMode).toBe(true);

    component.toggleEditMode();
    expect(component.isEditMode).toBe(false);
  });

  it('should update about data on submit', () => {
    const updatedAbout: About = {
      id: 1,
      title: 'Updated Title',
      content: 'Updated Content',
      imageUrl: 'updated-image.jpg',
      address: '123 Updated Street',
      phoneNumber: '987654321',
      email: 'updated@example.com',
      workingHours: '10-6',
      facebookLink: 'updated-facebook.com',
      youtube: 'updated-youtube.com',
      visionStatement: 'Updated Vision',
      foundingDate: '2021-01-01',
      ceoName: 'Updated CEO',
    };

    component.businessForm.patchValue(updatedAbout);
    aboutServiceMock.updateAbout.mockReturnValue(of({ data: updatedAbout }));

    component.onSubmit();

    expect(aboutServiceMock.updateAbout).toHaveBeenCalledWith(updatedAbout.id, updatedAbout);
    expect(component.about).toEqual(updatedAbout);
    expect(component.isLoading).toBe(false);
    expect(component.isEditMode).toBe(false);
  });

  it('should handle error on update about data', () => {
    component.businessForm.patchValue({ id: 1 });
    aboutServiceMock.updateAbout.mockReturnValue(throwError('error'));

    component.onSubmit();

    expect(aboutServiceMock.updateAbout).toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
  });
});
