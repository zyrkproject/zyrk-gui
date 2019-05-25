import { Component, OnInit, ViewContainerRef, ComponentRef } from '@angular/core';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { SnackbarService } from '../../../core/core.module';
import { WalletService } from '../../wallet.service';
import { IChangePassword, ChangePassword } from '../../business-model/entities';
import { Log } from 'ng2-logger';
import { message } from '../../business-model/enums';
import { MatDialogRef } from '@angular/material';
import {
  IPassword,
  encryptpassword
} from '../../business-model/entities';

@Component({
  selector: 'app-passwordinput',
  templateUrl: './passwordinput.component.html',
  styleUrls: ['./passwordinput.component.scss']
})
export class PasswordInputComponent implements OnInit {
  faEyeSlash: any = faEyeSlash;
  faEye: any = faEye;
  showPassword: boolean = false;
  changePassword: IChangePassword = new ChangePassword();
  reEntryPassword: string;
  private log: any = Log.create('passwordchange.component');
  private destroyed: boolean = false;
  private modalContainer: ViewContainerRef;
  modal: ComponentRef<Component>;
  passphrase:string;
  data: any;
  title: string;

  constructor(
    private walletServices: WalletService,
    private flashNotification: SnackbarService,
    public _dialogRef: MatDialogRef<PasswordInputComponent>) { }

  ngOnInit() {
  }

  setData(data: any) {
    this.data = data;
    this.title = "Unlock wallet for staking";
    if (this.data.title) {
      this.title = this.data.title;
    }
  }

  validatePassword(): boolean {
    if (this.passphrase === null || this.passphrase === undefined) {
      this.flashNotification.open(message.EnterData, 'err')
      return false;
    }
    return true;
  }

  save() {
    if (this.validatePassword()) {
      let walletPassphrase: IPassword = new encryptpassword();
      walletPassphrase.password = this.passphrase;
      walletPassphrase.stakeOnly = false;
      this.walletServices.walletpassphrase(walletPassphrase).subscribe(res => {
          this.data.parentRef.passwordEntered(walletPassphrase);
          this.close();
      }, error => {
        this.flashNotification.open(error.message, 'err')
        this.log.er(message.ChangePasswordMessage, error)
      });

    }
  }

  close(): void {
    this._dialogRef.close();
    // remove and destroy message
    // this.modalContainer.remove();
    // this.modal.destroy();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  passwordLabelText(): string {
    return this.showPassword ? 'Hide' : 'Show';
  }

}
