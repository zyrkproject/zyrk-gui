import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Log } from 'ng2-logger';

import { ModalsService } from '../modals/modals.service';
import { FAQ } from '../shared/faq.model';
import { faq } from './faq';
import { Router } from '@angular/router';
import { IWalletInfo, WalletInfo, IBitcoinprice, bitcoinprice, INodeinfo, NodeInfo } from '../business-model/entities';
import { WalletService } from '../wallet.service';
import { ApiEndpoints, categories, message } from '../business-model/enums';
import { RpcStateService } from '../../core/core.module';
import { CalculationsService } from '../calculations.service';
import { SnackbarService } from '../../core/core.module';

import { faBtc } from '@fortawesome/free-brands-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { faArrowDown, faArrowUp, faCircle as faCircleSolid, faQuestion, faSync } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'wallet-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, OnDestroy {

  USDvaultbalance: number;
  BTCvaultbalance: number;
  USDwalletbalance: number;
  BTCwalletbalance: number;
  ZYRKpercentage: any;
  balanceInUSD: any;
  balanceInBTC: any;
  
  faCircle: any = faCircle;
  faQuestion: any = faQuestion;
  faSync: any = faSync;
  faCircleSolid: any = faCircleSolid;
  faArrowUp: any = faArrowUp;
  faArrowDown: any = faArrowDown;
  faBtc: any = faBtc;
  faq: Array<FAQ> = faq;
  transactionColumns: string[] = ['date', 'type', 'status', 'amount'];
  walletInfo: IWalletInfo = new WalletInfo();
  private destroyed: boolean = false;
  private log: any = Log.create(`overview.component `);
  public status;
  public currentBlock: number;
  public connections: number;
  public torStatus: string;
  public currentCurrency: string;
  bitcoinpriceInfo: IBitcoinprice = new bitcoinprice();
  getNodeInfo: INodeinfo = new NodeInfo();
  public masterNodes = {}
  public bitcoinprice;
  public monthEarn: number = 0;
  public node: number = 0;
  isActiveNodeCount = 0;
  enabledNodeCount = 0;
  walletLoaded = false;

  // lineChart
  public lineChartData: Array<any> = [
    { data: [0, 0, 0, 0, 0, 0, 0, 0], label: 'ZYRK' }
  ];
  public lineChartLabels: Array<any> = ['Mar', 'Apr', 'May','Jun','Jul','Aug','Sep','Oct'];
  public lineChartOptions: any = {
    responsive: true
  };
  public lineChartColors: Array<any> = [
    {
      backgroundColor: 'rgba(16, 124, 216, 0.3)',
      borderColor: 'rgba(16, 124, 216, 0.5)',
      pointBackgroundColor: 'rgba(16, 124, 216, 0.1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend: boolean = true;
  public lineChartType: string = 'line';

  constructor(
    private modalsService: ModalsService,
    private router: Router,
    private calculationsService: CalculationsService,
    private walletServices: WalletService,
    private flashNotification: SnackbarService,
    private spinner: NgxSpinnerService,
    private _rpcState: RpcStateService
  ) {
    this.spinner.show();
    this._rpcState.observe(ApiEndpoints.GetWalletInfo)
      .takeWhile(() => !this.destroyed)
      .subscribe(walletInfo => {
        if (!this.walletLoaded) {
          this.walletLoaded = true;
          this.getTorstatus();
        }
        this.spinner.hide();
        this.walletInfo = new WalletInfo(walletInfo).toJSON();
        this.walletServices.getBitcoin(this.bitcoinpriceInfo)
          .subscribe(bitcoinpriceInfos => {
            this.bitcoinprice = bitcoinpriceInfos.coininfo;
            this.balanceInBTC = this.bitcoinprice.price_btc;
            this.balanceInUSD = this.bitcoinprice.price_usd;

            this.getBTCBalance();
            this.getUSDBalance();
            this.getBTCVaultBalance();
            this.getUSDVaultBalance();
          }, error => this.log.error(message.bitcoinpriceMessage, error));
      },
        error => this.log.error(message.walletMessage, error));

    this._rpcState.observe(ApiEndpoints.Masternode)
    .takeWhile(() => !this.destroyed)
    .subscribe(NodeInformations => {
      this.isActiveNodeCount = NodeInformations;
      this.walletServices.masternodeEnabledCount()
        .subscribe(count => {
          this.enabledNodeCount = count;
        }, err => {
          this.log.error(err);
        });
    },
      error => this.log.error(error));
  }

  ngOnInit() {
    this.currentCurrency = this.walletServices.getCurrency();
    this._rpcState.registerStateCall(ApiEndpoints.Masternode, 5000, ['count']);
    this._rpcState.registerStateCall(ApiEndpoints.GetNetworkInfo, 5000);

    this.getZYRKChartData();
    this.getTorstatus();
    this.getBlockchainInfo();
    this.getConnections();
  }

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public getZYRKChartData() {
    this.walletServices.getHistoricalData('usd', 7).subscribe(res => {
      let label = [];
      let price = [];
      res = JSON.parse(res.text());
      res.prices.map(t => {
        let date = new Date(t[0]);
        if (label[label.length - 1] != date.getDate().toString()) {
          label.push(date.getDate().toString());
          price.push(t[1]);
        }
      });
      this.lineChartData[0].data = price;
      this.lineChartLabels.length = 0;
      this.lineChartLabels = label;
    })
  }

  public getInteger(num) {
    return Math.floor(num).toString();
  }

  public getFranction(num) {
    if (!parseFloat(num).toString().split('.')[1]) return '0000';
    return parseInt(parseFloat(num).toString().split('.')[1], 10);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

  //refresh the overview screen(price)
  public refresh() {
    this.ngOnInit();
    this.flashNotification.open('Page has been refreshed', 'info');
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

  private getBlockchainInfo() {
    this._rpcState.observe(ApiEndpoints.Getblockchaininfo)
      .takeWhile(() => !this.destroyed)
      .subscribe(res => {
        this.currentBlock = res.blocks;
      }, error => {
        this.log.error(error.message, error); 
    })
  }

  private getTorstatus() {
    this.log.d('tor status', this.torStatus);
    this.walletServices.getTorstatus()
      .subscribe(res => {
        const torEnabled = (res.indexOf("Enabled") > -1);
        this.torStatus = torEnabled ? 'enabled' : 'disabled';
      }, error => {
        this.log.error(error.message, error); 
    })
  }

  private getnodestatus() {
    this._rpcState.observe(ApiEndpoints.Masternode)
      .takeWhile(() => !this.destroyed)
      .subscribe(NodeInformations => {
        this.isActiveNodeCount = NodeInformations;
        this.walletServices.masternodeEnabledCount()
          .subscribe(count => {
            this.enabledNodeCount = count;
          }, err => {
            this.log.error(err);
          });
      },
        error => this.log.error(error));
  }

  private getConnections() {
    this._rpcState.observe(ApiEndpoints.GetNetworkInfo)
      .takeWhile(() => !this.destroyed)
      .subscribe(info => {
        this.connections = info.connections;
      },
        error => this.log.error(error));
  }
  
  openSyncingWallet() {
    const data: any = {
      forceOpen: true,
      modalsService: this.modalsService
    };
    this.modalsService.openSmall('syncingWallet', data);
  }

  openSend(walletType: string) {
    const data: any = {
      forceOpen: true,
      walletType: walletType,
      balance: this.walletInfo.balance,
      amountInUSD: this.bitcoinprice.price_usd,
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

  ngOnDestroy() {
    this.destroyed = true;
  }
}
