import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterNodeComponent } from './master-node.component';

describe('MasterNodeComponent', () => {
  let component: MasterNodeComponent;
  let fixture: ComponentFixture<MasterNodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasterNodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
