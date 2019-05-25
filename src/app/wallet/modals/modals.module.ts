import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QRCodeModule } from 'angular2-qrcode';

import { MaterialModule } from '../../material/material.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ClipboardModule } from 'ngx-clipboard';
import { ModalsComponent } from './modals.component';
import { ModalsService } from './modals.service';
import { SendComponent } from './send/send.component';
import { ReceiveComponent } from './receive/receive.component';
import { SuccessComponent } from './success/success.component';
import { TransactionComponent } from './transaction/transaction.component';
import { MasterNode1Component } from './master-node1/master-node1.component';
import { PasswordchangeComponent } from './passwordchange/passwordchange.component';
import { PasswordInputComponent } from './passwordinput/passwordinput.component';
import { AddaddressComponent } from './addaddress/addaddress.component';
import { SyncingWalletComponent } from './syncing-wallet/syncing-wallet.component';
import { TransactionDetailComponent } from './transaction-detail/transaction-detail.component';
import { MasternodeInfoInputComponent } from './masternode-info-input/masternode-info-input.component';
import { VpsPasswordComponent } from './vps-password/vps-password.component';

@NgModule({
  declarations: [
    ModalsComponent,
    SendComponent,
    ReceiveComponent,
    SuccessComponent,
	  TransactionComponent,
    MasterNode1Component,
    TransactionComponent,
    PasswordchangeComponent,
    PasswordInputComponent,
    AddaddressComponent,
    SyncingWalletComponent,
    TransactionDetailComponent,
    MasternodeInfoInputComponent,
    VpsPasswordComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    MaterialModule,
    FontAwesomeModule,
    ClipboardModule,
    QRCodeModule
  ],
  exports: [
    ModalsComponent
  ],
  providers: [
    ModalsService,
  ],
  entryComponents: [
    ModalsComponent,
    SendComponent,
    ReceiveComponent,
    SuccessComponent,
    MasterNode1Component,
    TransactionComponent,
    SyncingWalletComponent,
    TransactionDetailComponent,
    MasternodeInfoInputComponent,
    VpsPasswordComponent
  ]
})
export class ModalsModule {
}
