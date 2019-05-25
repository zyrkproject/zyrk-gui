import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Log } from 'ng2-logger';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { map, catchError } from 'rxjs/operators';
import { IpcService } from '../ipc/ipc.service';
import { environment } from 'environments/environment';

const MAINNET_PORT = environment.zyrk_MainNet_Port;
const TESTNET_PORT = environment.zyrkPort;
const HOSTNAME = environment.zyrkHost;
const RPCUSER = environment.rpcUserName;
const RPCPASSWORD = environment.rpcPassword;

declare global {
  interface Window {
    electron: boolean;
  }
}

@Injectable()
export class RpcService implements OnDestroy {

  private log: any = Log.create('rpc.service');
  private destroyed: boolean = false;

  private hostname: String = HOSTNAME; 
  private port: number = MAINNET_PORT; 
  private username: string = RPCUSER;
  private password: string = RPCPASSWORD;

  public isElectron: boolean = false;

  constructor(
    private _http: HttpClient,
    private _ipc: IpcService
  ) {
    this.isElectron = window.electron;
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  call(method: string, params?: Array<any> | null): Observable<any> {
    if (this.isElectron) {
      return this._ipc.runCommand('rpc-channel', null, method, params).pipe(
        map(response => response && (response.result !== undefined)
                      ? response.result
                      : response
        )
      );
    } else {
      // Running in browser, delete?
      const postData = JSON.stringify({
        method: method,
        params: params,
        id: 1
      });

      const headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', 'Basic ' + btoa(`${this.username}:${this.password}`));
      headers.append('Accept', 'application/json');

      return this._http
        .post(`http://${this.hostname}:${this.port}`, postData, { headers: headers })
        .pipe(
          map((response: any) => response.result),
          catchError(error => Observable.throw(typeof error._body === 'object'
            ? error._body
            : JSON.parse(error._body))
          )
        );
    }
  }

}
