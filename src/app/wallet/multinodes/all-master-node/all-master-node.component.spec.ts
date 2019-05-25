import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllMasterNodeComponent } from './all-master-node.component';

describe('MasterNodeComponent', () => {
  let component: AllMasterNodeComponent;
  let fixture: ComponentFixture<AllMasterNodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllMasterNodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllMasterNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
