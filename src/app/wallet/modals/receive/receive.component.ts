import { Component, OnInit, OnDestroy, ViewContainerRef, ComponentRef } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { RpcStateService, SnackbarService } from '../../../core/core.module';

import { payType, ApiEndpoints, message } from '../../business-model/enums';
import { 
  IRecieveZyrkToWallet,
  RecieveZyrkToWallet,
  DepostAmount,
  IDepostAmount,
  IPassword,
  encryptpassword
} from '../../business-model/entities';
import { Log } from 'ng2-logger';
import { CalculationsService } from '../../calculations.service';
import { WalletService } from '../../wallet.service';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { ClipboardService } from '../../../../../node_modules/ngx-clipboard';

@Component({
  selector: 'app-receive',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss']
})

export class ReceiveComponent implements OnInit, OnDestroy {
  data: any;
  receivedZyrkInfo: Array<any> = [];
  depositToVault: IDepostAmount = new DepostAmount();
  anonymizeKey: string;

  public amount: number = 0;
  public fees: number = 0;;
  public fee: number = 1;
  public total: number = 0;
  private log: any = Log.create(`receive to zyrk `);
  private destroyed: boolean = false;
  private modalContainer: ViewContainerRef;
  modal: ComponentRef<Component>;
  balance: number = 0;
  convertUSD: number = 0;
  walletPassword: string;
  showPassword: boolean = false;
  faEyeSlash: any = faEyeSlash;
  faEye: any = faEye;

  constructor(
    public _dialogRef: MatDialogRef<ReceiveComponent>,
    private calculationsService: CalculationsService,
    private _rpcState: RpcStateService,
    private _clipboardService: ClipboardService,
    private flashNotification: SnackbarService,
    private walletServices: WalletService) {
  }

  ngOnInit() {
    this.getReceivedZyrkToWallet();
    this.generateAnonymizeKey();
  }

  setData(data: any) {
    this.data = data;
    this.balance = data.balance;
  }

  copyToClipBoard(anonymizekey = null): void {
    if (anonymizekey) {
      this.flashNotification.open(anonymizekey + ' has been copied to clipboard.', 'info');
    } else {
      this.flashNotification.open(message.CopiedAddress, 'info');
    }
  }

  private getReceivedZyrkToWallet() {
    this.walletServices.getAllAddresses().subscribe(receivedInfo => {
      this.receivedZyrkInfo.length = 0;
      this.log.d(receivedInfo.recieve);
      for (let key in receivedInfo.receive) {
        this.receivedZyrkInfo.push({account: receivedInfo.receive[key], address: key});
      }
    }, error => {
      this.flashNotification.open(message.ReceiveZYRKtoWallet, 'err');
      this.log.er(message.ReceiveZYRKtoWallet, error)
    });
  }
  depositSuccess() {
    if (this.validateDepositeInput()) {
      let walletPasspharse: IPassword = new encryptpassword();
      walletPasspharse.password = this.walletPassword;
      walletPasspharse.stakeOnly = false;

      this.walletServices.walletpassphrase(walletPasspharse).subscribe(res => {
        this.walletServices.amountDeposit(this.depositToVault, this.anonymizeKey).subscribe(res => {
          this.openSuccess('vault');
        }, error => {
          this.flashNotification.open(message.DepositMessage, 'err');
          this.log.er(message.DepositMessage, error)
        });
      }, err => {
        this.flashNotification.open(message.PassphraseNotMatch, 'err');
        this.log.er(message.PassphraseNotMatch, err);
      });      
    }
  }

  validateDepositeInput(): boolean {
    if (this.depositToVault.amount === 0 || this.depositToVault.amount === undefined) {
      this.flashNotification.open(message.EnterData, 'err');
      this.log.er(message.EnterData, 'error')
      return false;
    }
    return true;
  }

  openSuccess(walletType: string) {
    let data = {};
    if (walletType == 'vault') {
      data = {
        forceOpen: true,
        walletType: walletType,
        amount: this.amount,
        fee: this.fees,
        total: this.total,
        actionType: 'receive',
      };
    } else {
      data = {
        forceOpen: true,
        walletType: walletType,
        amount: this.amount,
        fee: this.fees,
        total: this.total,
        actionType: 'receive',
        parentRef: this
      };
    }
    this.data.modalsService.forceClose();
    this.data.modalsService.openSmall('success', data);
  }

  openShowQR(address) {
    const data: any = {
      forceOpen: true,
      walletType: 'wallet',
      address: address,
      actionType: 'show'
    };
    this.data.modalsService.forceClose();
    this.data.modalsService.openSmall('success', data);
  }

  close(): void {
    this._dialogRef.close();
    this.modalContainer.remove();
    this.modal.destroy();
  }

  public getSendingAmount(event) {
    this.amount = parseInt(event, 10);
    this.convertUSD = this.data.amountInUSD * this.amount;
    this.getFees();
    this.getTotalAmount();
  }

  getFees() {
    this.fees = this.calculationsService.getFee(this.amount, this.fee);
  }

  getTotalAmount() {
    this.total = this.calculationsService.getTotal(this.amount, this.fees);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  passwordLabelText(): string {
    return this.showPassword ? 'Hide' : 'Show';
  }

  onShareAnonymizeKey() {

  }

  generateAnonymizeKey() {
    let walletPasspharse: IPassword = new encryptpassword();
    walletPasspharse.password = this.walletPassword;
    walletPasspharse.stakeOnly = false;
    this.walletServices.getPubCoinPack().subscribe(res => {
      this.anonymizeKey = res[0];
    }, err => {
      this.log.er(message.ReceiveZYRKtoWallet, err);
      this.flashNotification.open(err, 'err');
    });
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
