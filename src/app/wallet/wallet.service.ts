
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Log } from 'ng2-logger'
import { RpcService, RpcStateService } from '../core/core.module';
import { 
  TransactionBuilder,
  IWalletSendToZyrk,
  IRecieveZyrkToWallet,
  IAddNode,
  IAddBook,
  TransactionInfo,
  IPassword,
  IBitcoinprice,
  ISetAccount,
  IChangePassword,
  ISavecurrency,
  RecentTransactionInfo,
  IDepostAmount,
  IUnAnonymizeAmount
} from './business-model/entities';
import { ApiEndpoints, typeOfAddresses } from './business-model/enums';
import { Http } from '@angular/http';
@Injectable()
export class WalletService {
  filters: any = {
    watchonly: undefined,
    category: undefined,
    search: undefined,
    type: undefined,
    sort: undefined
  };
  log: any = Log.create('send.service');
  txCount: number = 0;
  private addressCount: number = 0;
  unlockTimeout: number = 5;
  private validWords: string[];
  private _listners = new Subject<any>();

  constructor(private _rpc: RpcService, private rpcState: RpcStateService,private http:Http) {

  }
  public getFeeForAmout (amount: number, address: string): Observable<any> {
    return this._rpc.call(ApiEndpoints.GetFeeForAmount, [amount, address]);
  }
  public getBitcoin (price : IBitcoinprice): Observable<any> {
    return this.http.get(ApiEndpoints.GetBtc).map(response => response.json());  
  }
  public SendToZyrk(wallet : IWalletSendToZyrk): Observable<any> {
    return this._rpc.call(ApiEndpoints.SendToAddress, [wallet.address, wallet.amount, '', '', wallet.subtractFeeFromAmount]);
  }
  public receivedZyrk(receiveZyrk : IRecieveZyrkToWallet): Observable<any> {
    return this.http.get(ApiEndpoints.ReceivedZyrk).map(response => response.json());
  }
  public addNode(adnode : IAddNode): Observable<any> {
    return this._rpc.call(ApiEndpoints.AddNode,[adnode.node,adnode.action]);
  }
  public getBalanceAmount(): Observable<any> {
    return this._rpc.call(ApiEndpoints.GetBalance).map(
      balance => balance);
  }
  public getBlockchainInfo (): Observable<any> {
    return this._rpc.call(ApiEndpoints.Getblockchaininfo).map(
      info => info);
  }
  public getTorstatus(): Observable<any> {
    return this._rpc.call(ApiEndpoints.Torstatus).map(
      status => status);
  }
  public enableTor(enable: string): Observable<any> {
    return this._rpc.call(ApiEndpoints.EnableTor, [enable]);
  }
  public masternodeListConf(): Observable<any> {
    return this._rpc.call(ApiEndpoints.MasternodeListConf).map(
      node => node);
  }
  public masternodeCount(): Observable<any> {
    return this._rpc.call(ApiEndpoints.Masternode, ['count']).map(
      count => count);
  }
  public masternodeEnabledCount(): Observable<any> {
    return this._rpc.call(ApiEndpoints.Masternode, ['count', 'enabled']).map(
      count => count);
  }
  public getMyMasternode(): Observable<any> {
    return this._rpc.call(ApiEndpoints.Masternode, ['list-conf']).map(
      count => count);
  }
  public startMasternode(alias: string): Observable<any> {
    return this._rpc.call(ApiEndpoints.Masternode, ['start-alias', alias]).map(
      count => count);
  }
  public getNewAddress(): Observable<any> {
    return this._rpc.call(ApiEndpoints.Getnewaddress).map(
      address => address);
  }
  public listTransaction(transactions :RecentTransactionInfo): Observable<any> {
    return this._rpc.call(ApiEndpoints.ListTransactions);
  }
  public addressCallBack(addressbook :IAddBook): Observable<any> {
    return this._rpc.call(ApiEndpoints.AddressBook, [addressbook.action,
     addressbook.address, addressbook.label]);
    }
  public validateaddressCallBack(addressbook :IAddBook): Observable<any> {
    return this._rpc.call(ApiEndpoints.ValidadeAddress, [addressbook.address]);
  }  
  public filterAddressList(): Observable<any> {
    return this._rpc.call(ApiEndpoints.Filteraddresses, this.rpc_getParams());
  }
  public receiveZYRKToWallet(setaccount : ISetAccount): Observable<any> {
    return this._rpc.call(ApiEndpoints.Setaccount, [setaccount.address,setaccount.account]);
  }
  public saveCurrency(currency : ISavecurrency) {
    localStorage.setItem('currency', currency.convert);
    return true;    
  }
  public getCurrency() {
    if (!localStorage.getItem('currency')) return 'USD';
    return localStorage.getItem('currency');
  }
  public changepassword(pass : IChangePassword): Observable<any> {
    return this._rpc.call(ApiEndpoints.Walletpassphrasechange, [pass.oldpassphrase, pass.newpassphrase]);
  }
  public listReceivedByAccount(): Observable<any> {
    return this._rpc.call(ApiEndpoints.ListReceivedbyAddress);
  }
  public walletlock(): Observable<any> {
    return this._rpc.call(ApiEndpoints.WalletLock);
  }
  private rpc_getParams() {
    if (typeOfAddresses.Send) {
      return [0, this.addressCount, '0', '',  '2'];
    }  else if (typeOfAddresses.Receive) {
      return [0, this.addressCount, '0', '',  '1'];
    } else {
      return [0, this.addressCount, '0', ''];
    }
  }
  public countTransactions(): void {
    const options = {
      'count': this.txCount,
    };
    Object.keys(this.filters).map(filter => options[filter] = this.filters[filter]);

    this._rpc.call(ApiEndpoints.Filtertransactions, [options])
      .subscribe((txResponse: Array<Object>) => {
        this.log.d(`countTransactions, number of transactions after filter: ${txResponse.length}`);
        this.txCount = txResponse.length;
        return;
      });
  }
  public getAccountAddress(account: string): Observable<any> {
    return this._rpc.call(ApiEndpoints.GetAccountAddress, [account]);
  }
  public listAccounts(): Observable<any> {
    return this._rpc.call(ApiEndpoints.ListAccounts);
  }
  public getAddressesByAccount(account: string): Observable<any> {
    return this._rpc.call(ApiEndpoints.GetAddressesbyAccount, [account]);
  }
  public getallTransaction(transactions :TransactionInfo): Observable<any> {
    return this._rpc.call(ApiEndpoints.GetTransaction,[transactions.txid]);
  }
  public getAllAddresses(): Observable<any> {
    return this._rpc.call(ApiEndpoints.GetAllAddresses);
  }
  public manageAddressbook(action: string, address: string, label: string = '', purpose: string = ''): Observable<any> {
    return this._rpc.call(ApiEndpoints.ManageAddressbook, [
      action,
      address,
      label,
      purpose
    ]);
  }
  public encrptyPassword(encrypt : IPassword): Observable<any>{
    return this._rpc.call(ApiEndpoints.Encryptwallet, [encrypt.password])
  }
  public enableStaking(encrypt : IPassword): Observable<any>{
    return this._rpc.call(ApiEndpoints.Walletpassphrase, [
      encrypt.password,
      0,
      encrypt.stakeOnly
    ])
  } 
  public walletpassphrase(encrypt : IPassword): Observable<any>{
    return this._rpc.call(ApiEndpoints.Walletpassphrase, [
      encrypt.password,
      encrypt.stakeOnly == true ? 0 : this.unlockTimeout,
      encrypt.stakeOnly
    ])
  } 
  public walletpassphrasechange(encrypt : IPassword): Observable<any>{
    return this._rpc.call(ApiEndpoints.Walletpassphrasechange, [
      encrypt.password])
  }
  public unanonymizeAmount(info : IUnAnonymizeAmount, anonymizekey): Observable<any> {
    console.log(info);
    if (info.address) {
      return this._rpc.call(ApiEndpoints.UnAnonymizeAmount, [info.amount, info.address]);
    } else if (anonymizekey) {
      return this._rpc.call(ApiEndpoints.UnAnonymizeAmount, [info.amount, anonymizekey]);
    }
    return this._rpc.call(ApiEndpoints.UnAnonymizeAmount, [info.amount])
  }
 generateMnemonic(success: Function, password?: string) {
  this.log.d(`password: ${password}`);
  const params = ['new', password];

  if (password === undefined || password === '') {
    params.pop();
  }
  this._rpc.call(ApiEndpoints.Mnemonic, params)
    .subscribe(
      response => success(response),
      error => Array(24).fill('error'));
  }
  stop(): void {
    this._rpc.call(ApiEndpoints.StopZyrkd);
  }


validateWord(word: string): boolean {
  if (!this.validWords) {
    this._rpc.call(ApiEndpoints.Mnemonic, ['dumpwords'])
    .subscribe(
      (response: any) => this.validWords = response.words,
      error => this.log.er('validateWord: mnemonic - dumpwords: Error dumping words', error));

    return false;
  }

  return this.validWords.indexOf(word) !== -1;
}

importMnemonic(words: string[], password: string) {
  const params = [words.join(' '), password];
  if (!password) {
    params.pop();
  }
  return this._rpc.call(ApiEndpoints.Extkeygenesisimport, params);
}

generateDefaultAddresses() {
  this._rpc.call('getnewstealthaddress', ['balance transfer']).subscribe(
    (response: any) => this.log.i('generateDefaultAddresses(): generated balance transfer address'),
    error => this.log.er('generateDefaultAddresses: getnewstealthaddress failed'));
  this._rpc.call('getnewaddress', ['initial address']).subscribe(
    (response: any) => this.log.i('generateDefaultAddresses(): generated initial address'),
    error => this.log.er('generateDefaultAddresses: getnewaddress failed'));
}
public sendTransaction(tx: TransactionBuilder) {
  tx.estimateFeeOnly = false;

  this.send(tx)
    .subscribe(
      error => this.rpc_send_failed(error.message, tx.toAddress, tx.amount));
}

public getTransactionFee(tx: TransactionBuilder): Observable<any> {
  tx.estimateFeeOnly = true;
  if (!tx.toAddress) {
    return new Observable((observer) => {
      this.getDefaultStealthAddress()
      .take(1)
      .subscribe(
        (stealthAddress: string) => {
          tx.toAddress = stealthAddress;
          this.send(tx).subscribe(fee => {
            observer.next(fee);
            observer.complete();
          });
        });
    });
  } else {
    return this.send(tx).map(
      fee => fee);
  }
}

public transferBalance(tx: TransactionBuilder) {
  tx.estimateFeeOnly = false;

  this.getDefaultStealthAddress().take(1).subscribe(
    (stealthAddress: string) => {
      this.log.d('got transferBalance, sx' + stealthAddress);
      tx.toAddress = stealthAddress;
      this.send(tx).subscribe(
        // success => this.rpc_send_success(success, stealthAddress, tx.amount),
        error => this.rpc_send_failed(error.message, stealthAddress, tx.amount));
    },
    error => this.rpc_send_failed('transferBalance, Failed to get stealth address')
  );

}

private getDefaultStealthAddress(): Observable<string> {
  return this._rpc.call(ApiEndpoints.ListStealthAddresses, null)
    .map(
      list => list[0]['Stealth Addresses'][0]['Address']);
}

private send(tx: TransactionBuilder): Observable<any> {
  return this._rpc.call(ApiEndpoints.ListTransactions, [tx.input, tx.output, [{
    address: tx.toAddress,
    amount: tx.amount,
    subfee: tx.subtractFeeFromAmount,
    narr: tx.narration
  }], tx.comment, tx.commentTo, tx.ringsize, 64, tx.estimateFeeOnly]);
}

  private rpc_send_success(json: any) {
    this.log.d(`rpc_send_success, succesfully executed transaction with txid ${json}`);

  }

  private rpc_send_failed(message: string, address?: string, amount?: number) {
    this.log.er('rpc_send_failed, failed to execute transaction!');
    this.log.er(message);
    if (message.search('AddBlindedInput') !== -1) {
    }
  }

  public amountDeposit(deposit : IDepostAmount, anonymizekey = ''): Observable<any> {
    return this._rpc.call(ApiEndpoints.AnonymizeAmount, [deposit.amount, anonymizekey]);
  }

  public getPubCoinPack() {
    return this._rpc.call(ApiEndpoints.GetPubCoinPack);
  }

  public getHistoricalData(vs_currency: string, days): Observable<any> {
    return this.http.request(ApiEndpoints.ZYRKHitoryUrl + 'vs_currency=' + vs_currency + '&days=' + days);
  }

  public getMarketData(vs_currency, ids): Observable<any> {
    return this.http.request(ApiEndpoints.GetMarketInfo + 'vs_currency=' + vs_currency + '&ids=' + ids);
  }

  public getGUIVersion(): Observable<any> {
    return this.http.request('https://github.com/ZyrkProject/zyrk-gui/releases/latest');
  }

}
