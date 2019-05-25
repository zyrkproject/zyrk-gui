import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterNode1Component } from './master-node1.component';

describe('MasterNode1Component', () => {
  let component: MasterNode1Component;
  let fixture: ComponentFixture<MasterNode1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasterNode1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterNode1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
