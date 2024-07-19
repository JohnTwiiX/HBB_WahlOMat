import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IsVerifiedComponent } from './is-verified.component';

describe('IsVerifiedComponent', () => {
  let component: IsVerifiedComponent;
  let fixture: ComponentFixture<IsVerifiedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IsVerifiedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IsVerifiedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
