import { Component, OnInit } from '@angular/core';
import { FAQ } from '../shared/faq.model';
import { faq } from './faq';
import { Router } from '@angular/router';
import { ModalsService } from '../modals/modals.service';
import { WalletService } from '../wallet.service';
import { Log } from 'ng2-logger';
import { RpcStateService } from '../../core/core.module';
import { ApiEndpoints, message } from '../business-model/enums';
import { CalculationsService } from '../calculations.service';
import {
  WalletInfo,
  IWalletInfo,
  IBitcoinprice,
  bitcoinprice
} from '../business-model/entities';
@Component({
  selector: 'app-multinodes',
  templateUrl: './multinodes.component.html',
  styleUrls: ['./multinodes.component.scss']
})
export class MultinodesComponent implements OnInit {
  faq: Array<FAQ> = faq;
  private destroyed: boolean = false;
  transactionColumns: string[] = ['Name', 'Status', 'Active for'];
  private log: any = Log.create('Multinodes.component');
  bitcoinpriceInfo: IBitcoinprice = new bitcoinprice();
  walletInfo: IWalletInfo = new WalletInfo();
  masterNodes: Array<any>;
  masterNodeBalance: number;
  USDmasternodebalance: number;
  BTCmasternodebalance: number;
  balanceInUSD: any;
  balanceInBTC: any;
  currentCurrency: string;
  masterNodeCount: number;
  roi: number;

  constructor(
    private calculationService: CalculationsService,
    private modalsService: ModalsService,
    private router: Router,
    private walletServices: WalletService,
    private _rpcState: RpcStateService) { }

  ngOnInit() {
    this.currentCurrency = this.walletServices.getCurrency();
    this.getBalance();
    this.getwalletinformation();
    this.getMasterNodeCount();
    this.getMyMasterNodes();
  }

 //get wallet informations
  private getwalletinformation() {
    this._rpcState.observe(ApiEndpoints.GetWalletInfo)
      .takeWhile(() => !this.destroyed)
      .subscribe(walletInfo => {
        this.walletInfo = new WalletInfo(walletInfo).toJSON();
        this.walletServices.getBitcoin(this.bitcoinpriceInfo)
          .subscribe(bitcoinpriceInfos => {
            let bitcoinprice = bitcoinpriceInfos.quotes;
            this.balanceInBTC = bitcoinprice.BTC.price;
            this.balanceInUSD = bitcoinprice.USD.price;
          
            this.getBTCBalance();
            this.getUSDBalance();
          }, error => this.log.error(message.bitcoinpriceMessage, error));

      },
        error => this.log.error('Failed to get wallet information, ', error));
  }

  getBTCBalance() {
    this.BTCmasternodebalance = this.calculationService.getCovertedamount(this.masterNodeBalance,this.balanceInBTC);
  }

  getUSDBalance() {
    this.USDmasternodebalance = this.calculationService.getCovertedamount(this.masterNodeBalance, this.balanceInUSD);
  }

  // get balance
  private getBalance() {
    this.walletServices.getBalanceAmount()
      .subscribe(res => {
        console.log(res)
      },
      error => this.log.error('Failed to get balance, ', error));
  }

  private getMasterNodeCount() {
    this._rpcState.observe(ApiEndpoints.Masternode)
      .takeWhile(() => !this.destroyed)
      .subscribe(res => {
        this.masterNodeCount = res;
        this.roi = (262800 * 8.448) / (this.masterNodeCount * 7500) * 100;
        this.roi = Math.round(this.roi*100) / 100;
      },
        error => this.log.error(message.recentTransactionMessage, error));
  }

  private getMyMasterNodes() {
    const timeout = 60000;
    const _call = () => {
      if (this.destroyed) {
        return;
      }

      this.walletServices.getMyMasternode()
        .subscribe(res => {
          let nodes: Array<any> = [];
          for (let node in res) {
            nodes.push(res[node]);
          }

          this.masterNodes = nodes;
          this.masterNodeBalance = 7500 * nodes.length;
          setTimeout(_call, timeout);
        }, error => {
          this.log.error(message.bitcoinpriceMessage, error);
        });
    };

    _call();
  }

  openWithDraw() {
    const data: any = {
      forceOpen: true,
      modalsService: this.modalsService
    };
    this.modalsService.openxSmall('withdrawRewards', data);
  }

  setupNewNode(node: any) {
    const data: any = {
      forceOpen: true,
      modalsService: this.modalsService,
      parentRef: this,
      title: "Start Masternode",
      forStaking: false
    };
    this.modalsService.openSmall('masternodeInfoInput', data);
  }

  showAllMasternodes() {
    this.router.navigate(['./multinodes/all-master-node']);
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
