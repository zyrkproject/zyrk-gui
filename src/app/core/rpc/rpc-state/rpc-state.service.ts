import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { Subject } from 'rxjs';


import { StateService } from 'app/core/state/state.service';
import { RpcService } from 'app/core/rpc/rpc.service';

@Injectable()
export class RpcStateService extends StateService implements OnDestroy {

  private log: any = Log.create('rpc-state.class');
  private destroyed: boolean = false;

  private _enableState: boolean = true;
  public errorsStateCall: Subject<any> = new Subject<any>();

  constructor(private _rpc: RpcService) {
    super();

    this.registerStateCall('getwalletinfo', 2000);
    this.registerStateCall('getblockchaininfo', 5000);
    this.registerStateCall('getnetworkinfo', 10000);
    this.registerStateCall('masternode', 5000, ['count']);

    this.walletLockedState();
    this.initWalletState();

  }

  stateCall(method: string): void {
    if (!this._enableState) {
      return;
    } else {
      this._rpc.call(method)
      .subscribe(
        response => this.stateCallSuccess(method, response),
        error => this.stateCallError(method, error, false));
    }
  }

  /** Register a state call, executes every X seconds (timeout) */
  registerStateCall(method: string, timeout: number, params?: Array<any> | null): void {
    if (timeout) {
      let firstError = true;
      // loop procedure
      const _call = () => {
        if (this.destroyed) {
          // RpcState service has been destroyed, stop.
          return;
        }
        if (!this._enableState) {
          // re-start loop after timeout - keep the loop going
          setTimeout(_call, timeout);
          return;
        }
        this._rpc.call(method, params)
          .subscribe(
            success => {
              this.stateCallSuccess(method, success);

              // re-start loop after timeout
              setTimeout(_call, timeout);
            },
            error => {
              this.stateCallError(method, error, firstError);

              setTimeout(_call, firstError ? 250 : error.status === 0 ? 500 : 10000);
              firstError = false;
            });
      };

      // initiate loop
      _call();
    }
  }

  setState(state: string, param: any) {
    this.set(state, param)
    return true
  }

  /** Updates the state whenever a state call succeeds */
  private stateCallSuccess(method: string, response: any) {
    // no error
    this.errorsStateCall.next({
      error: false,
      electron: this._rpc.isElectron
    });

    this.set(method, response);
  }

  /** Updates the state when the state call errors */
  private stateCallError(method: string, error: any, firstError: boolean) {
    this.log.er(`stateCallError(): RPC Call ${method} returned an error:`, error);

    // if not first error, show modal
    if (!firstError) {
      this.errorsStateCall.next({
        error: error.target ? error.target : error,
        electron: this._rpc.isElectron
      });
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  // TODO: get rid of these some day..
  private walletLockedState() {
    this.observe('getwalletinfo', 'encryptionstatus')
      .takeWhile(() => !this.destroyed)
      .subscribe(status => {
        this.log.d(' [rm] updating locked state maybe');
        this.set('locked', ['Locked', 'Unlocked, staking only'].includes(status));
      });
  }

  // TODO: get rid of this after improve-router
  private initWalletState() {
    this.observe('getwalletinfo').subscribe(response => {
      this.log.d(response)
      // check if account is active
      if (!!response.hdmasterkeyid) {
        this.set('ui:walletInitialized', true);
      } else {
        this.set('ui:walletInitialized', false);
      }
    }, error => this.log.er('RPC Call returned an error', error));
}
}
