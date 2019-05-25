import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasternodeInfoInputComponent } from './masternode-info-input.component';

describe('MasternodeInfoInputComponent', () => {
  let component: MasternodeInfoInputComponent;
  let fixture: ComponentFixture<MasternodeInfoInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasternodeInfoInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasternodeInfoInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
