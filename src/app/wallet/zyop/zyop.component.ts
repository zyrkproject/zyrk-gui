import { Component, OnDestroy, OnInit } from '@angular/core';
import { Log } from 'ng2-logger';

import { ModalsService } from '../modals/modals.service';
import { RpcStateService } from '../../core/core.module';
import { FAQ } from '../shared/faq.model';
import { faq } from './faq';
import { 
  IWalletInfo,
  WalletInfo,
  IBitcoinprice,
  bitcoinprice,
  IUnAnonymizeAmount,
  UnAnonymizeAmount
} from '../business-model/entities';
import { ApiEndpoints, message } from '../business-model/enums';
import { WalletService } from '../wallet.service';
import { CalculationsService } from '../calculations.service';

@Component({
  selector: 'wallet-vault',
  templateUrl: './zyop.component.html',
  styleUrls: ['./zyop.component.scss'],
})
export class ZyopComponent implements OnInit, OnDestroy {

  transactionColumns: string[] = ['date', 'type', 'status', 'amount'];
  vaultInitialized: boolean = false;
  faq: Array<FAQ> = faq;
  private log: any = Log.create('vault.component');
  private destroyed: boolean = false;
  walletInfo: IWalletInfo = new WalletInfo();
  unanonymizeInfo: IUnAnonymizeAmount = new UnAnonymizeAmount();
  bitcoinpriceInfo: IBitcoinprice = new bitcoinprice();
  public bitcoinprice;
  balanceInBTC: number;
  pendingInBTC: number;
  balanceInUSD: number;
  pendingInUSD: number;
  BTCbalance: number;
  USDbalance: number;
  BTCpending: number;
  USDpending: number;
  currentCurrency: string;

  constructor(
    private modalsService: ModalsService,
    private _rpcState: RpcStateService,
    private walletServices: WalletService,
    private calculationsService: CalculationsService,
  ) {
    this._rpcState.observe(ApiEndpoints.GetWalletInfo)
      .takeWhile(() => !this.destroyed)
      .subscribe(walletInfo => {
        this.walletInfo = new WalletInfo(walletInfo).toJSON();
        
        this.getBTCBalance();
        this.getUSDBalance();
        this.getBTCPending();
        this.getUSDPending();
      },
        error => this.log.error('Failed to get balance, ', error));
  }

  ngOnInit() {
    const storedState = localStorage.getItem('vaultInitialized');
    this.vaultInitialized = storedState == 'set';
    this.currentCurrency =  this.walletServices.getCurrency();
    this.initialized();
    this.getBitcoinpriceinfo();
  }

  private initialized() {
    this._rpcState.observe('ui:vaultInitialized')
      .takeWhile(() => !this.destroyed)
      .subscribe(status => this.vaultInitialized = status);
  }

  openDeposit(walletType: string) {
    const data: any = {
      forceOpen: true,
      walletType: walletType,
      balance: this.walletInfo.balance,
      amountInUSD: this.balanceInUSD,
      currency: this.currentCurrency,
      modalsService: this.modalsService
    };
    this.modalsService.openxSmall('receive', data);
  }

  openSend(walletType: string) {
    const data: any = {
      forceOpen: true,
      walletType: walletType,
      balance: this.walletInfo.anonymize_vault,
      amountInUSD: this.bitcoinprice.price_usd,
      modalsService: this.modalsService
    };
    this.modalsService.openxSmall('send', data);
  }

  openWithdraw(walletType: string) {
    const data: any = {
      forceOpen: true,
      balance: this.walletInfo.anonymize_vault,
      walletType: walletType,
      modalsService: this.modalsService
    };
    this.modalsService.openxSmall('send', data);
  }

  openAnonymously() {
    const data: any = {
      forceOpen: true,
      walletType: 'anonymouse',
    };
    this.modalsService.openxSmall('receive', data);
  }

  createVault() {
    this.vaultInitialized = true;
    localStorage.setItem('vaultInitialized', 'set');
  }

  private getBitcoinpriceinfo() {
    this.walletServices.getBitcoin(this.bitcoinpriceInfo)
      .subscribe(bitcoinpriceInfos => {
        this.bitcoinprice = bitcoinpriceInfos.coininfo;
        this.balanceInBTC = this.bitcoinprice.price_btc;
        this.balanceInUSD = this.bitcoinprice.price_usd;

        this.getBTCBalance();
        this.getUSDBalance();
        this.getBTCPending();
        this.getUSDPending();
      },
        error => this.log.error(message.bitcoinpriceMessage, error));
  }

  getBTCBalance() {
    this.BTCbalance = this.calculationsService.getCovertedamount(this.walletInfo.anonymize_vault, this.balanceInBTC);
  }
  getUSDBalance() {
    this.USDbalance = this.calculationsService.getCovertedamount(this.walletInfo.anonymize_vault, this.balanceInUSD);
  }
  getBTCPending() {
    this.BTCpending = this.calculationsService.getCovertedamount(this.walletInfo.anonymize_vault_unconfirmed, this.balanceInBTC);
  }
  getUSDPending() {
    this.USDpending = this.calculationsService.getCovertedamount(this.walletInfo.anonymize_vault_unconfirmed, this.balanceInUSD);
  }
  ngOnDestroy(): void {
    this.destroyed = true;
  }


}
