import { Component, OnInit, OnDestroy, ComponentRef, ViewContainerRef, Output, EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { WalletService } from '../../wallet.service';
import { RpcStateService, SnackbarService } from '../../../core/core.module';

import {
  WalletSendToZyrk,
  IWalletSendToZyrk,
  IPassword,
  encryptpassword,
  IUnAnonymizeAmount,
  UnAnonymizeAmount
} from '../../business-model/entities';
import { wallet } from '../../datamodel/model';
import { Log } from 'ng2-logger';
import { message } from '../../business-model/enums';
import { faBook, faAddressBook } from '@fortawesome/free-solid-svg-icons';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss'],
  // providers: [ModalsService]
})
export class SendComponent implements OnInit, OnDestroy {
  data: any;
  @Output() saveProduct = new EventEmitter();

  private log: any = Log.create(`send to zyrk `);
  private destroyed: boolean = false;
  private modalContainer: ViewContainerRef;

  public amount : number = 0;
  public fees : number = 0;
  public total: number = 0;
  sendToZyrk: IWalletSendToZyrk = new WalletSendToZyrk();
  modal: ComponentRef<Component>;
  public fee:number = 1;
  faBook: any = faBook;
  faAddressBook: any = faAddressBook;
  balance: number;
  amountInUSD: number = 0;
  convertUSD: number = 0;
  todaydate;
  addressLabel: string;
  isAddressSelected: boolean = false;
  walletPassword: string;
  showPassword: boolean = false;
  faEyeSlash: any = faEyeSlash;
  faEye: any = faEye;
  accountData: Array<any> = [];
  unanonymizeToMyWallet: number = 0;
  anonymizeKey: string = '';

  constructor(
    private walletServices: WalletService,
    private _rpcState: RpcStateService,
    private flashNotification: SnackbarService,
    public _dialogRef: MatDialogRef<SendComponent>) {
  }

  ngOnInit() {
    this.unanonymizeToMyWallet = 0;
    this.walletServices.getAllAddresses().subscribe(res => {
      console.log(res);
      for (let key in res.send) {
        this.accountData.push({address: key, name: res.send[key]});
      }
    }, error => {
      this.flashNotification.open(message.GetAllAddresses, 'err');
      this.log.err(message.GetAllAddresses, error);
    })
  }

  setData(data: any) {
    this.data = data;
    this.balance = data.balance;
    this.amountInUSD = data.amountInUSD;
  }

  setAmount() {
    this.sendToZyrk.amount = parseFloat(this.balance.toString());
  }
  sendData() {
    if(this.validateInput()) {
      let walletPasspharse: IPassword = new encryptpassword();
      walletPasspharse.password = this.walletPassword;
      walletPasspharse.stakeOnly = false;
      this.walletServices.walletpassphrase(walletPasspharse).subscribe(response => {
        this.walletServices.SendToZyrk(this.sendToZyrk).subscribe(res => {
          this.saveAddress();
          this.openSuccess('wallet');
        }, error => {
          console.log('send error', error)
          this.flashNotification.open(message.SendAmount, 'err');
          this.log.er(message.SendAmount, error)
        });
      }, err => {
        console.log('send error', err)
        this.flashNotification.open(message.PassphraseNotMatch, 'err');
        this.log.er(message.PassphraseNotMatch, err)
      });
    }
  }

  sendAnonymizeVaultData() {
    if (this.validateInput()) {
      let walletPasspharse: IPassword = new encryptpassword();
      walletPasspharse.password = this.walletPassword;
      walletPasspharse.stakeOnly = false;
      this.walletServices.walletpassphrase(walletPasspharse).subscribe(response => {
        let unanonymizeInfo: IUnAnonymizeAmount = new UnAnonymizeAmount();
        unanonymizeInfo.address = this.sendToZyrk.address;
        unanonymizeInfo.amount = this.sendToZyrk.amount || this.data.balances;
        if (this.anonymizeKey) unanonymizeInfo.address = '';

        this.walletServices.unanonymizeAmount(unanonymizeInfo, this.anonymizeKey).subscribe(res => {
          if (res.includes(':')) {
            this.flashNotification.open(res, 'info');
          } else {
            this.openSuccess('vault', 'send');
          }
        },
          error => {
            this.flashNotification.open(message.SendAmountToVaultMessage, 'err');
            this.log.er(message.SendAmountToVaultMessage, error)
        });
      }, err => {
        this.flashNotification.open(message.PassphraseNotMatch, 'err');
        this.log.er(message.PassphraseNotMatch, err);
      });
    }
  }

  addressSelected() {
    this.isAddressSelected = true;
    this.addressLabel = '';
    this.getSendingAmount(this.amount);
  }

  addressEdited() {
    this.isAddressSelected = false;
  }

  labelSelected(label) {
    this.addressLabel = label;
  }

  labelChanged() {
    if (this.addressLabel == '') {
      this.isAddressSelected = false;
      this.sendToZyrk.address = '';
    }
  }

// validating input
  validateInput(): boolean {
    if (this.data.walletType === 'vault' && this.walletPassword && this.sendToZyrk.address) {
      return true;
    }
    if (this.data.walletType === 'withdraw' && this.walletPassword) {
      return true;
    }
    if (this.sendToZyrk.amount === 0 || this.sendToZyrk.amount === undefined) {
      this.flashNotification.open(message.EnterData, 'err');
      this.log.er(message.EnterData, 'error')
      return false;
    }
    if (this.sendToZyrk.address === null || this.sendToZyrk.address === undefined) {
      this.flashNotification.open(message.EnterData, 'err');
      this.log.er(message.EnterData, 'error')
      return false;
    }
    if (this.walletPassword === undefined) {
      return false;
    }
    return true;
  }

  passwordLabelText(): string {
    return this.showPassword ? 'Hide' : 'Show';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  saveAddress() {
    if (!this.isAddressSelected) {
      this.walletServices.manageAddressbook('add', this.sendToZyrk.address, this.addressLabel).subscribe(res => {
      }, error => {
        this.flashNotification.open(error.message, 'err')
        this.log.er(message.AddressAddedMessage, error)
      });
    } else if (this.isAddressSelected) {
      this.walletServices.manageAddressbook('edit', this.sendToZyrk.address, this.addressLabel).subscribe(res => {
      }, error => {
        this.flashNotification.open(error.message, 'err')
        this.log.er(message.AddressAddedMessage, error)
      });
    }
  }

  openSuccess(walletType: string, actionType = 'send') {
    const data: any = {
      forceOpen: true,
      walletType: walletType,
      amount: this.amount,
      fee: this.fees,
      total: this.total,
      actionType: actionType,
      address: this.sendToZyrk.address
    };

    if (walletType == 'vault' && actionType == 'send') {
      data.amount = this.amount;
      data.total = this.amount;
    }
    this.data.modalsService.forceClose();
    this.data.modalsService.openSmall('success', data);
  }

  close(): void {
    this._dialogRef.close();
    this.modalContainer.remove();
    this.modal.destroy();
  }

  public getSendingAmount(event) {
    if (event) {
      this.amount = event;
    } else {
      this.amount = 0;
      this.fees = 0;
      this.total = 0;
    }
    this.convertUSD = this.amountInUSD * this.amount;
    if (this.amount && this.sendToZyrk.address)  this.getFees();
  }
  
  getFees() {
    if (this.amount && this.sendToZyrk.address) {
      this.walletServices.getFeeForAmout(this.amount, this.sendToZyrk.address).subscribe(res => {
        this.fees = parseInt(res, 10) * 0.00000001;
        this.getTotalAmount();
      }, err => {
        this.flashNotification.open(err.message, 'err');
        this.log.er(message.GetFeeForAmount, err)
      })
    }
  }

  getTotalAmount(){
    if (this.sendToZyrk.subtractFeeFromAmount) {
      this.total = this.amount - this.fees;
    } else {
      this.total = this.amount + this.fees;
    }
  }
  
  ngOnDestroy() {
    this.destroyed = true;
  }

}
