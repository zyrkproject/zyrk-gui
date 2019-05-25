import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { IpcService } from '../ipc/ipc.service';

@Injectable()
export class NotificationService {
  constructor(
    private _ipc: IpcService
  ) {
  }

  public sendNotification(title: string, desc: string) {
    if (window.electron) {
      this.runNotification(title, desc);
    }
  }

  private runNotification(...args: any[]): Observable<any> {
    return this._ipc.runCommand('notification', null, ...args);
  }

}
