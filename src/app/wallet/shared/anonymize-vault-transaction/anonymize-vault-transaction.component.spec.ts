import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnonymizeVaultTransactionComponent } from './anonymize-vault-transaction.component';

describe('AnonymizeVaultTransactionComponent', () => {
  let component: AnonymizeVaultTransactionComponent;
  let fixture: ComponentFixture<AnonymizeVaultTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnonymizeVaultTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnonymizeVaultTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
