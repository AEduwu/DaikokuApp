import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CategoryPickerComponent } from './category-picker.component';

describe('CategoryPickerComponent', () => {
  let component: CategoryPickerComponent;
  let fixture: ComponentFixture<CategoryPickerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CategoryPickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
