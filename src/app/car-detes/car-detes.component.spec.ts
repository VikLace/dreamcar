import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarDetesComponent } from './car-detes.component';

describe('CarDetesComponent', () => {
  let component: CarDetesComponent;
  let fixture: ComponentFixture<CarDetesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarDetesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarDetesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
