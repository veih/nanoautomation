import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarColunaComponent } from './navbar-coluna.component';

describe('NavbarColunaComponent', () => {
  let component: NavbarColunaComponent;
  let fixture: ComponentFixture<NavbarColunaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarColunaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NavbarColunaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
