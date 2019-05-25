import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { RpcService } from '../../../core/core.module';
import { Log } from 'ng2-logger';

@Component({
  selector: 'app-masternode-info-input',
  templateUrl: './masternode-info-input.component.html',
  styleUrls: ['./masternode-info-input.component.scss']
})
export class MasternodeInfoInputComponent implements OnInit {

  masternodeInfo: any;
  private log: any = Log.create('masternode-info-input.component');

  constructor(
    public _dialogRef: MatDialogRef<MasternodeInfoInputComponent>,
    private _rpc: RpcService
  ) { }

  ngOnInit() {
    this.masternodeInfo = {
      ip_address: '',
      password: '',
      masternode_key: '',
      aliasName: '',
      transactionHash: '',
      transactionOutput: ''
    }
  }

  close(): void {
    this._dialogRef.close();
  }

  isValid() {
    if (this.masternodeInfo.ip_address == '' || this.masternodeInfo.ip_address == null)       return false;
    if (this.masternodeInfo.password == '' || this.masternodeInfo.password == null)           return false;
    if (this.masternodeInfo.masternode_key == '' || this.masternodeInfo.masternode_key == null) return false;
    return true;  
  }

  start(): void {
    if (this.isValid()) {
      this.log.d(this.masternodeInfo);
      this._rpc.call('setup-new-masternode', [
        this.masternodeInfo.ip_address,
        this.masternodeInfo.password,
        this.masternodeInfo.masternode_key,
        this.masternodeInfo.aliasName,
        this.masternodeInfo.transactionHash,
        this.masternodeInfo.transactionOutput]).subscribe(res => {
      }, err => {});
      this.close();
    }
  }

}
