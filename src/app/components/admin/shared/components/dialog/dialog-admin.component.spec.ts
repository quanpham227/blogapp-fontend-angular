import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAdminComponent } from './dialog-admin.component';

describe('DialogAdminComponent', () => {
  let component: DialogAdminComponent;
  let fixture: ComponentFixture<DialogAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
