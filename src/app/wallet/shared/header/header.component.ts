import { Component, Input, OnInit } from '@angular/core';
import { Ng2CsvService } from 'ng2csv';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';

import { FilterService } from '../../transactions/filter.service';
import { RpcService } from '../../../core/rpc/rpc.service';
import { ApiEndpoints, message } from '../../business-model/enums';
import { OverviewComponent } from '../../overview/overview.component';

import { IWalletInfo, WalletInfo, IBitcoinprice, bitcoinprice, INodeinfo, NodeInfo } from '../../business-model/entities';
import { WalletService } from '../../wallet.service';
import { ModalsService } from '../../modals/modals.service';
import { RpcStateService } from '../../../core/core.module';
import { CalculationsService } from '../../calculations.service';
import { SnackbarService } from '../../../core/core.module';
import { Router } from '@angular/router';

@Component({
  selector: 'page-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() navbar: any;
  @Input() overview: any;
  @Input() heading: string;
  @Input() showFilters: boolean;
  @Input() showAddress: boolean;

  USDvaultbalance: number;
  BTCvaultbalance: number;
  USDwalletbalance: number;
  BTCwalletbalance: number;
  balanceInUSD: any = 0;
  balanceInBTC: any = 0;
  transactionColumns: string[] = ['date', 'type', 'status', 'amount'];
  walletInfo: IWalletInfo = new WalletInfo();
  private destroyed: boolean = false;
  public status;
  public currentCurrency: string;
  bitcoinpriceInfo: IBitcoinprice = new bitcoinprice();
  public bitcoinprice;
  private log: any = Log.create(`header.component`);

  constructor(
    private filterService: FilterService,
    private ng2Csv: Ng2CsvService,
    private _rpc: RpcService,
    private modalsService: ModalsService,
    private router: Router,
    private calculationsService: CalculationsService,
    private walletServices: WalletService,
    private flashNotification: SnackbarService,
    private _rpcState: RpcStateService
  ) {
    this._rpcState.observe(ApiEndpoints.GetWalletInfo)
      .takeWhile(() => !this.destroyed)
      .subscribe(walletInfo => {
        this.walletInfo = new WalletInfo(walletInfo).toJSON();
      },
        error => this.log.error(message.walletMessage, error));
  }

  ngOnInit() {
    this.currentCurrency = this.walletServices.getCurrency();
  }

  toggleFilter() {
    this.filterService.toggle();
  }

  openAddress() {
    const data: any = {
      forceOpen: true,
      type: 'add',
      modalsService: this.modalsService,
      parentRef: this
    };
    this.modalsService.openSmall('newAddress', data);
  }

  openSend(walletType: string) {
    const data: any = {
      forceOpen: true,
      walletType: walletType,
      balance: this.walletInfo.balance,
      currency: this.currentCurrency,
      modalsService: this.modalsService
    };

    if (walletType == 'vault') data.balance = this.walletInfo.anonymize_vault;
    
    this.modalsService.openSmall('send', data);
  }

  openReceive(walletType: string) {
    const data: any = {
      forceOpen: true,
      walletType: walletType,
      balance: this.walletInfo.balance,
      currency: this.currentCurrency,
      amountInUSD: this.balanceInUSD,
      modalsService: this.modalsService
    };
    this.modalsService.openSmall('receive', data);
  }

  getBTCBalance() {
    this.BTCwalletbalance = this.calculationsService.getCovertedamount(this.walletInfo.balance,this.balanceInBTC);
  }

  getUSDBalance() {
    this.USDwalletbalance = this.calculationsService.getCovertedamount(this.walletInfo.balance, this.balanceInUSD);
  }

  getBTCVaultBalance() {
    this.BTCvaultbalance = this.calculationsService.getCovertedamount(this.walletInfo.anonymize_vault, this.balanceInBTC);
  }

  getUSDVaultBalance() {    
    this.USDvaultbalance = this.calculationsService.getCovertedamount(this.walletInfo.anonymize_vault, this.balanceInUSD);
  }

  downloadHistory() {
    this.log.d(this.overview);
    this._rpc.call(ApiEndpoints.ListTransactions).subscribe(res => {
      let data = ['Date Category Confirmations Address Amount'];
      data = res.map(a => {
        let date = new Date(a.time * 1000);
        let hours = date.getHours();
        let minutes = "0" + date.getMinutes();
        let seconds = "0" + date.getSeconds();
        let yyyy = date.getFullYear();
        let mm = "0" + date.getMonth();
        let dd = "0" + date.getDay();

        return {
                Date: dd.substr(-2) + '/' + mm.substr(-2) + '/' + yyyy + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2),
                Category: a.category,
                Confirmations: a.confirmations,
                Address: a.address,
                Amount: a.amount
              }
      });

      let currentDate = new Date();
      let yyyy = currentDate.getFullYear();
      let mm = "0" + currentDate.getMonth();
      let dd = "0" + currentDate.getDay();

      this.ng2Csv.download(data, dd.substr(-2) + '-' + mm.substr(-2) + '-' + yyyy + '.csv');
    }, error => {
      this.log.d(message.ListTransactions, error);
    })
  }

}
